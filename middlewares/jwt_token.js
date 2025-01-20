const jwt=require('jsonwebtoken');

const authenticate=(req, res, next) =>
{
    const token = req.headers.authorization?.split(' ')[1];
    if(!token) return res.status(401).json({error: '토큰이 없음....'});
    try
    {
        const decoded=jwt.verify(token, process.env.JWT_SECRET); // 토큰 검증
        req.user=decoded;
        const new_token=jwt.sign //새 토큰 발급
        (
                {unique_number: decoded.unique_number, nickname: decoded.nickname},
                process.env.JWT_SECRET,
                { expiresIn: '1h'}
        );
        res.setHeader('Authorization', `Bearer ${new_token}`);
        next();
    }
    catch(err)
    {
        if(err.name==='TokenExpiredError') return res.status(401).json({error:'토큰이 만료됨.....'})
        console.error('JWT 검증 실패...', err);
        return res.status(403).json({error: '권한이 없는 토큰....'});
    }
}

module.exports={authenticate};