const sql_db=require('../config/sql_db_connect');
const {generate_word_pairs, generate_sentence} =require('../middlewares/openai_helper');

exports.generate_five_word=async(req, res)=>
{
    const {language}=req.body;
    if (!language||typeof language !== 'string') return res.status(400).json({ error: '유효하지 않은 언어 입력입니다.' });
    try
    {
        const five_word=await generate_word_pairs(language);
        res.status(200).json
        ({
            five_word
        });
    }
    catch(error)
    {
        console.error('5개 단어 생성 실패.....:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.generate_today_sentence=async(req, res)=>
{
    console.log("AHAH");
    const {language}=req.body;
    if (!language||typeof language !== 'string') return res.status(400).json({ error: '유효하지 않은 언어 입력입니다.' });
    try
    {
        const sentence=await generate_sentence(language);
        res.status(200).json
        ({
            sentence
        });
    }
    catch(error)
    {
        console.error('문장 생성 실패......', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};