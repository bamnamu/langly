const sql_db=require('../config/sql_db_connect');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

exports.users = async (req, res) =>
{
    try
    {
        const [results] = await sql_db.query('SELECT * FROM users');
        res.status(200).json({users:results});
    }
    catch(err)
    {
        res.status(500).json({error:err.message});
    }
};

exports.register = async (req, res) =>
{
    const {id, password, nickname}=req.body;
    try
    {
        const salt=await bcrypt.genSalt(10);
        const hash_password=await bcrypt.hash(password, salt);
        const query =`
            INSERT INTO users (id, password, nickname)
            VALUES (?, ?, ?)
            `;
        await sql_db.query(query, [id, hash_password, nickname]);
        res.status(201).json({message : "회원가입완료"});
    }
    catch(err)
    {
        if(err.code=='ER_DUP_ENTRY') return res.status(400).json({ message: '같은 닉네임 있음....' });
        res.status(500).json({ error: err.message });
    }
}

exports.login= async (req, res) =>
{
    const {id, password} = req.body;
    try
    {
        const [results] = await sql_db.query('SELECT * FROM users WHERE id = ?', [id]);
        if (results.length === 0) return res.status(404).json({ message: '그런 사람 없습니다.....' });
        const user = results[0];
        const login_match = await bcrypt.compare(password, user.password);
        if (!login_match) return res.status(400).json({ message: '비밀번호 틀림' });
        const today = new Date().toISOString().split('T')[0];
        let straight_days = user.straight_days;
        if (user.last_login_date)
        {
            const last_date = new Date(user.last_login_date);
            const diff = Math.floor((new Date(today) - last_date) / (1000 * 60 * 60 * 24));
            if(diff===1) straight_days+=1;
            else if(diff>2) straight_days=1;
        }
        else straight_days = 1;
        const update_query = 'UPDATE users SET last_login_date = ?, straight_days = ? WHERE id = ?';
        await sql_db.query(update_query, [today, straight_days, id]);

        const token = jwt.sign
        (
            { unique_number: user.unique_number, nickname: user.nickname },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.status(200).json({ message: '로그인 완료', token, straight_days });
    }
    catch (err)
    {
        res.status(500).json({ error: err.message });
    }
};