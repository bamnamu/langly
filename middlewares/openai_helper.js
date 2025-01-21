const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();
const fs=require('fs');
const ffmpeg = require('fluent-ffmpeg');
const mime = require('mime-types');
const { resolve } = require('path');

const configuration = new Configuration
({
    apiKey: process.env.OPENAI_API,
});

const openai = new OpenAIApi(configuration);

const correct_grammar=async(content)=>
{
    try
    {
        const prompt = `
        다음 문장을 문법에 맞게 수정하고, 수정한 이유를 간단히 설명해주세요.
        모든 설명은 한국어로 작성해주세요.
        아래 JSON 형식 그대로(키 이름까지 동일)만 반환해주세요:
        {
            "corrected": "수정된 전체 문장(문장부호 포함)",
            "explanations":
            [
                {
                    "original": "수정 전 단어(또는 구/문장)",
                    "corrected": "수정 후 단어(또는 구/문장)",
                    "reason": "수정 이유"
                }
            ]
        }
        문장:
        "${content}"
        `.trim();
        const response = await openai.createChatCompletion
        ({
            model: 'gpt-4o-mini',
            messages:
            [
                { role: 'system', content: 'You are a helpful assistant that corrects grammar.' },
                { role: 'user', content: prompt }
            ],
        });
        const gpt_text = response.data.choices[0].message.content.trim();
        let parsed;
        try
        {
            parsed = JSON.parse(gpt_text);
        }
        catch (err)
        {
            console.error('JSON 파싱 실패, GPT 응답:', gpt_text);
            throw new Error('GPT가 유효한 JSON을 반환하지 않았습니다.');
        }
        return parsed;
    }
    catch(error)
    {
        console.error('OpenAI API 호출 실패:', error);
        throw new Error('문법 교정 실패');
    }
}

const generate_word_pairs=async(language)=>
{
    try
    {
        if(!language || typeof language !=='string') throw new Error('유효하지 않은 입력임....');
        const prompt = `다음 요구 사항을 충족하는 5개의 무작위 단어-뜻 쌍을 생성해줘.
        - 단어는 ${language}이어야 하고, 뜻은 한국어로 작성할 것.
        - 만약 일본어라면, 단어 뒤에 괄호로 히라가나 발음을 추가할 것.
        - 반드시 아래의 JSON 형식을 준수할 것. 예시를 참고하여 정확히 작성할 것.
        - 한 번 나온 단어는 가급적 쓰지 말 것

        ### 예시:
        {
            "word_pairs": [
                {
                    "word": "愛 (あい)",
                    "korean_meaning": "사랑"
                },
                {
                    "word": "月 (つき)",
                    "korean_meaning": "달"
                },
                {
                    "word": "友達 (ともだち)",
                    "korean_meaning": "친구"
                },
                {
                    "word": "本 (ほん)",
                    "korean_meaning": "책"
                },
                {
                    "word": "学校 (がっこう)",
                    "korean_meaning": "학교"
                }
            ]
        }

        ### 요구 사항:
        - "word_pairs" 키 아래에 반드시 5개의 단어-뜻 쌍이 포함될 것.
        - 추가적인 키나 중첩 구조는 포함하지 않을 것.
        - JSON 형식에 맞게 정확히 반환할 것.
        `.trim();
        const response=await openai.createChatCompletion
        ({
            model: 'gpt-4o-mini',
            messages:
            [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: prompt }
            ],
        });
        const gpt_text = response.data.choices[0].message.content.trim();
        let parsed;
        try
        {
            parsed = JSON.parse(gpt_text);
        }
        catch (err)
        {
            console.error('JSON 파싱 실패, GPT 응답:', gpt_text);
            throw new Error('GPT가 유효한 JSON을 반환하지 않았습니다.');
        }
        return parsed;
    }
    catch(error)
    {
        console.error('단어-뜻 생성 중 오류 발생:', error.message);
        throw new Error('단어-뜻 생성 실패: ' + error.message);
    }
};

const generate_sentence=async(language)=>
{
    try
    {
        if(!language||typeof language!=='string') throw new Error('이 언어는 모루겠어요.....');
        const response=await openai.createChatCompletion
        ({
            model: 'gpt-4o-mini',
            messages:
            [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: `Generate a sentence in ${language} and provide its meaning in Korean. Only return them in format the result as "sentence: [sentence in ${language}] - meaning: [Korean meaning]"` }
            ],
        });
        const resultText = response?.data?.choices?.[0]?.message?.content?.trim();
        const [sentencePart, meaningPart] = resultText.split(' - meaning: ');
        const sentence = sentencePart.replace('sentence: ', '').trim();
        const meaning = meaningPart.trim();
        if (!sentence || !meaning) throw new Error('응답 형식 오류: 예상된 형식과 다릅니다.');
        return {sentence, meaning};
    }
    catch(error)
    {
        throw new Error('문장 생성 실패: ' + error.message);
    }
};

const audio_to_text=async(audio_filepath)=>
{
    try
    {
        const audiofile=fs.createReadStream(audio_filepath);
        const response=await openai.createTranscription(audiofile, 'whisper-1');
        return response.data.text.trim();
    }
    catch(error)
    {
        console.error('호출 실패.....', error.response?.data || error.message);
        throw new Error('음성 텍스트 변경 실패');
    }
};

module.exports=
{
    correct_grammar,
    generate_word_pairs,
    generate_sentence,
    audio_to_text
};