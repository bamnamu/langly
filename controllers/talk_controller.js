const sql_db=require('../config/sql_db_connect');
const { audio_to_text, correct_grammar, generate_sentence }=require('../middlewares/openai_helper');
const path = require('path');

const talk_process=async(req, res)=>
{
    try
    {
        const audiopath=req.file?req.file.path:null;
        if(!audiopath) return res.status(400).json({error : "음성 파일 없음...."});
        const audio_text=await audio_to_text(audiopath);
        console.log('음성 텍스트', audio_text);
    }
    catch(error)
    {
        console.log('오류 발생');
        return res.status(500).json({error: '오디오 처리중 오류....'});
    }
};

module.exports = { talk_process };