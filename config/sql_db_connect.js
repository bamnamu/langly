const mysql = require('mysql2/promise');
require('dotenv').config();

// 데이터베이스 연결 생성
const sql_db = mysql.createPool
({
    host: process.env.SQL_ENDPOINT,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    port: process.env.SQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

sql_db.getConnection()
  .then(() => console.log('SQL DB 연결 성공'))
  .catch((err) => console.error('SQL DB 연결 실패:', err.stack));

module.exports = sql_db;
