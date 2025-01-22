const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();
const fs=require('fs');
const ffmpeg = require('fluent-ffmpeg');
const mime = require('mime-types');
const path= require('path');
const google_tts = require('google-tts-api');

const configuration = new Configuration
({
    apiKey: process.env.OPENAI_API,
});

const openai = new OpenAIApi(configuration);

const correct_grammar = async (content) => {
    try {
        // 시스템 프롬프트: AI가 반드시 지켜야 할 규칙을 명시
        const systemPrompt = `
당신은 문장 교정 도우미입니다.

아래 규칙을 꼭 지키세요:

1. 문법상 어색하거나 틀린 부분만 수정하고, 원문 언어(영어, 일본어 등)는 그대로 유지합니다. 원문 언어는 영어, 일본어, 스페인어중 하나입니다. (한국어로 번역 금지)
2. 수정 이유는 반드시 한국어로 작성합니다.
3. "문장부호(마침표, 쉼표, 물음표 등)를 수정 이유로 제시하지 않는다"는 점을 특히 주의하세요.
   - 일본어에서 마침표, 물음표, 구두점 사용 여부만으로 수정 이유를 작성하지 마십시오.
   - 대소문자 변경만으로도 수정 이유를 작성하지 마십시오.
4. 회화적 표현에서 자주 쓰이는 문장부호(마침표, 물음표, 쉼표 등)는 틀린 것으로 보지 않습니다.
5. 출력 형식: 아래 JSON 형태를 그대로 반환하세요.
   {
       "language": "언어코드",
       "corrected": "수정된 전체 문장(원문의 언어로, 문장부호 포함)",
       "explanations": "수정 전 'XXX'는 'YYY'로 바꿔야 합니다. 그 이유는 '한국어 설명'이기 때문입니다."
   }
6. 수정할 부분이 없는 경우, 원문을 그대로 "corrected"에 쓰고, "explanations"는 "수정할 부분이 없습니다." 정도로 간단히 작성하세요.
`;

        // 사용자 프롬프트: 실제 교정할 문장만 전달
        const userPrompt = `
문장:
"${content}"
        `.trim();

        // ChatCompletion API 호출
        const response = await openai.createChatCompletion({
            model: 'gpt-4-turbo', // 사용 모델
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
        });

        // GPT 응답을 받아 JSON 파싱
        const gpt_text = response.data.choices[0].message.content.trim();

        let parsed;
        try {
            parsed = JSON.parse(gpt_text);
        } catch (err) {
            console.error('JSON 파싱 실패, GPT 응답:', gpt_text);
            throw new Error('GPT가 유효한 JSON을 반환하지 않았습니다.');
        }

        return parsed;
    } catch (error) {
        console.error('OpenAI API 호출 실패:', error);
        throw new Error('문법 교정 실패');
    }
};

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
        - 다시 한번 강조하지만, 단어는 ${language}이여야함.

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

        위 형식을 정확히 따르며, 어떠한 추가 키도 넣지 말고, 
        JSON 객체 외부에는 그 어떤 텍스트도 출력하지 마세요.

        ### 요구 사항:
        - "word_pairs" 키 아래에 반드시 5개의 단어-뜻 쌍이 포함될 것.
        - 추가적인 키나 중첩 구조는 포함하지 않을 것.
        - JSON 형식에 맞게 정확히 반환할 것.
        
        `.trim();
        const response=await openai.createChatCompletion
        ({
            model: 'gpt-4-turbo',
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
        const prompt=`
        Generate five sentence in ${language} and provide its meaning in Korean.
        다섯 문장은 ${language}로 해주세요.
        번역은 무조건 한국어로 해주세요.
        Return them in the following JSON format only (do not include anything else):
            {
                "sentences": [
                    {
                        "sentence": "sentence1",
                        "meaning": "meaning1"
                    },
                    // ... more sentences
                ]
            }`;
        const response=await openai.createChatCompletion
        ({
            model: 'gpt-4-turbo',
            messages:
            [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: prompt }
            ],
        });
        const result_text = response?.data?.choices?.[0]?.message?.content?.trim();
        const parsed = JSON.parse(result_text);
        return parsed;
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

const generate_reply=async(content, language)=>
{
    try
    {
        const prompt=`
        다음은 사용자의 질문입니다:
        "${content}"

        위 질문에 대해 간결하고 친근하고 대화에 적절한 대답을 작성해주세요.
        답변은 "${language}"으로 작성해주세요.
        답변하는 언어는  반드시 무조건 영어(en), 일본어(ja), 스페인어(es) 중 하나입니다.
        강조합니다. 답변은 "${language}"와 같은 언어로 작성해주세요.
        답변만 반환하고, 입력 내용을 반복하지 마세요.
        입력에 대한 설명을 하지 마세요.
        답변에 입력에 대한 내용을 들어가게 하지 마세요.
        `;
        const response=await openai.createChatCompletion
        ({
            model: 'gpt-4-turbo',
            messages:
            [
                { role: 'system', content: 'You are a helpful teacher that answers questions in Korean.' },
                { role: 'user', content: prompt },
            ],
        });
        return response.data.choices[0].message.content.trim();
    }
    catch(error)
    {
        console.error('답변 생성 실패:', error.message);
        throw new Error('답변 생성 실패');
    }
};

const generate_tts=async(text, language)=>
{
    try
    {
        const url=google_tts.getAudioUrl
        (text,
            {
                lang: language,
                slow: false,
                host: 'https://translate.google.com',
            }
        );
        return url;
    }
    catch(error)
    {
        console.error('tts 생성실패...');
        throw new Error('tts 생성 실패')
    }
};

const translate=async(content)=>
{
    try
    {
        const prompt=`
        ${content}를 한국어로 번역해줘.
        다른 부연 설명없이, 번역만
        번역을 한국어 회화처럼 자연스럽게 해줘`;
        const response=await openai.createChatCompletion
        ({
            model: 'gpt-4-turbo',
            messages:
            [
                { role: 'system', content: 'You are a helpful teacher that answers questions in Korean.' },
                { role: 'user', content: prompt },
            ],
        });
        return response.data.choices[0].message.content.trim();
    }
    catch(error)
    {
        console.error('번역 실패:', error.message);
        throw new Error('번역 실패');
    }
};
    
module.exports=
{
    correct_grammar,
    generate_word_pairs,
    generate_sentence,
    audio_to_text,
    generate_reply,
    generate_tts,
    translate
};