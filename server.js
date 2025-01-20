// 서버 진입점, 여기서 서버가 시작함

const express=require('express'); // express js 사용
const morgan = require('morgan'); // 요청 로그를 출력하기 위해 morgan 사용
const body_parser=require('body-parser');
require('dotenv').config(); // env파일을 사용하기 위해 사용
const sql_db=require('./config/sql_db_connect');
const sql_init=require('./config/sql_db_init');
const auth_route=require('./routes/auth_route');
const diary_route = require('./routes/diary_route');
const today_route=require('./routes/today_route');
const talk_route=require('./routes/talk_route');
const app=express();

app.use(body_parser.json());
app.use(morgan('tiny'));
sql_init();
app.use('/auth', auth_route);
app.use('/diary', diary_route);
app.use('/today', today_route);
app.use('/talk', talk_route);

app.get('/', (req, res) =>
{
    res.send('Langly 서버입니다');
});

app.get('/db', (req, res) =>
{
    sql_db.query('SELECT NOW() AS `current_time`', (err, results) => {
        if(err)
        {
            console.error('쿼리 실패:', err.stack);
            return res.status(500).send('데이터베이스 연결 오류');
        }
        res.send(`현재 시간: ${results[0].current_time}`);
    });
});


const SERVER_PORT=process.env.SERVER_PORT || 3000;
app.listen(SERVER_PORT, () =>
{
    console.log('Server is running on http://3.35.11.220:3000');
});