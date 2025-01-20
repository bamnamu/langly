const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();
const fs=require('fs');

const configuration = new Configuration
({
    apiKey: process.env.OPENAI_API,
});

const openai = new OpenAIApi(configuration);

const correct_grammar=async(content)=>
{
    try
    {
        const response = await openai.createChatCompletion
        ({
            model: 'gpt-4o-mini',
            messages:
            [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: `Correct the grammar of the following text:\n"${content}"` }
            ],
        });
        return response.data.choices[0].message.content.trim();
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
        const response=await openai.createChatCompletion
        ({
            model: 'gpt-4o-mini',
            messages:
            [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: `Generate 5 word-meaning pairs in ${language}. Only return them in format the result as "word - meaning in ${language} - korean meaning", one pair per line.` }
            ],
        });
        const wordPairsText = response?.data?.choices?.[0]?.message?.content?.trim();
        if(!wordPairsText) throw new Error('OpenAI API 응답이 예상과 다름.....');
        const wordPairs = wordPairsText.split('\n').map((line) =>
        {
            const [word, meaning, korean_meaning]=line.split(' - ').map((x) => x.trim());
            if (!word||!meaning||!korean_meaning)
            {
                throw new Error(`응답 형식 오류: "${line}"`);
            }
            return { word, meaning, korean_meaning };
        });

        return wordPairs;
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

const audio_to_text=async(auido_filepath)=>
{
    try
    {
        const audiofile=fs.createReadStream(auido_filepath);
        const response=await openai.createTranscription(audiofile, 'whisper-1');
        return response.data.text.trim();
    }
    catch(error)
    {
        console.error('호출 실패.....');
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