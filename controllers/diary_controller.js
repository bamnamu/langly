const sql_db=require('../config/sql_db_connect');
const { correct_grammar } = require('../middlewares/openai_helper');

exports.diary_grammar=async (req, res) =>
{
    const {content}=req.body;
    const { unique_number, nickname } = req.user;
    console.log('nickname from req.user:', nickname);
    console.log('unique_number from req.user:', unique_number);
    const user_unique_number=req.user.unique_number;
    const user_nickname=req.user.nickname;
    try
    {
        const grammar_content=await correct_grammar(content);
        res.status(200).json
        ({
            grammar_csontent: grammar_content
        });
    }
    catch(error)
    {
        console.error('일기 작성 실패:', error);
        console.error('OpenAI API 호출 실패:', error.response?.data || error.message || error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.delete_diary=async (req, res) =>
{
    const {id}=req.params;
    if(!id) return res.status(400).json({error:'ID 없음......'});
    const query='DELETE FROM diary WHERE diary_unique_number=?';
    try
    {
        const [result]=await sql_db.query(query, [id]);
        if(result.affectedRows===0) return res.status(404).json({error: "다이어리 없음....."});
        res.status(200).json({message : "일기 삭제됨 ㅋ"});
    }
    catch(error)
    {
        console.error('일기 삭제 실패...', error);
        res.status(500).json({error: 'Server Error'});
    }
};

exports.save_diary=async(req, res)=>
{
    const {content, correct_grammar } = req.body;
    if (!content) return res.status(400).json({ error: '필수값 없음' });
    const { unique_number, nickname } = req.user;
    const user_unique_number=req.user.unique_number;
    const user_nickname=req.user.nickname;
    const query =
    `
        INSERT INTO diary (user_unique_number, user_nickname, content, grammar_content)
        VALUES (?, ?, ?, ?)
    `;
    try
    {
        const [result] = await sql_db.query(query,
            [
            user_unique_number,
            user_nickname,
            content,
            correct_grammar || null,
        ]);
        res.status(201).json
        ({
            message: 'Diary saved successfully',
            diaryId: result.insertId, // 삽입된 일기의 ID 반환
        });
    }
    catch (error)
    {
        console.error('일기 저장 실패:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.update_diary=async(req, res)=>
{
    const {id}=req.params;
    const {content}=req.body;
    if(!id||!content) return res.status(400).json({error: "id, content중 하나 없음"});
    const query=
    `
        UPDATE diary
        SET content = ?, updated = NOW()
        WHERE diary_unique_number = ?
    `;
    try
    {
        const [result] = await sql_db.query(query, [content, id]);
        if (result.affectedRows===0) return res.status(404).json({ error: '수정할 일기 없음' });
        res.status(200).json({ message: '일기 수정 성공' });
    }
    catch(error)
    {
        console.error('일기 수정 실패:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.get_my_diary=async(req, res)=>
{
    const {unique_number}=req.user;
    if (!unique_number) return res.status(400).json({ error: '유효하지 않은 사용자 정보' });
    const query=
    `
        SELECT *
        FROM diary
        WHERE user_unique_number = ?
        ORDER BY updated DESC
    `;
    try
    {
        const [results]=await sql_db.query(query, [unique_number]); // 사용자 ID로 필터링
        res.status(200).json(results);
    }
    catch (error)
    {
        console.error('사용자 일기 ID 조회 실패:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.get_all_diary = async (req, res) =>
{
    const query = 'SELECT * FROM diary ORDER BY created DESC';
    try
    {
        const [results] = await sql_db.query(query);
        res.status(200).json(results);
    }
    catch (error)
    {
        console.error('모든 일기 조회 실패:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
