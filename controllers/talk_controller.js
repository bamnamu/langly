const sql_db=require('../config/sql_db_connect');
const { audio_to_text, correct_grammar, generate_reply, generate_tts, translate }=require('../middlewares/openai_helper');
const path = require('path');

const talk_process=async(req, res)=>
{
    try
    {
        const audiopath=req.file?path.resolve(__dirname, '../', req.file.path) : null;
        if(!audiopath) return res.status(400).json({error : "음성 파일 없음...."});
        const audio_text=await audio_to_text(audiopath);
        console.log('음성 텍스트', audio_text);
        const grammar_result=await correct_grammar(audio_text);
        console.log(grammar_result);
        const reply_result=await generate_reply(grammar_result.corrected, grammar_result.language);
        console.log(reply_result);
        const audio_url=await generate_tts(reply_result, grammar_result.language);
        const korean=await translate(reply_result);
        return res.status(200).json({original: audio_text, rely: reply_result, audio : audio_url, trans : korean, grammar: grammar_result});
    }
    catch(error)
    {
        console.log('오류 발생');
        return res.status(500).json({error: '오디오 처리중 오류....'});
    }
};

module.exports = { talk_process };