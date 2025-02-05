const sql_db = require('./sql_db_connect');
require('dotenv').config();

const init_sql_db=async ()=>
{
    try
    {
        await sql_db.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.SQL_NAME}\``);
        console.log("DB 존재");
        await sql_db.query(`USE \`${process.env.SQL_NAME}\``);
        console.log("DB 선택 성공");

        const create_user_table = 
        `
            CREATE TABLE IF NOT EXISTS users
            (
                unique_number INT AUTO_INCREMENT PRIMARY KEY,
                id VARCHAR(255) NOT NULL,
                nickname VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                last_login_date DATE DEFAULT NULL,
                straight_days INT DEFAULT 0
            );
        `;
    await sql_db.query(create_user_table);
    console.log('users 테이블 존재');
    const create_diary_table =
    `
        CREATE TABLE IF NOT EXISTS diary
        (
            diary_unique_number INT AUTO_INCREMENT PRIMARY KEY,
            user_unique_number INT NOT NULL,
            user_nickname VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            emotion ENUM('happy', 'sad', 'angry', 'love') DEFAULT 'happy',
            created DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_unique_number) REFERENCES users(unique_number) ON DELETE CASCADE
        );
    `;
    await sql_db.query(create_diary_table);
    console.log('diary 테이블 존재');
    const create_word_table =
    `
        CREATE TABLE IF NOT EXISTS word
        (
            word_unique_number INT AUTO_INCREMENT PRIMARY KEY,
            user_unique_number INT NOT NULL,
            word varchar(255) NOT NULL,
            meaning varchar(255) NOT NULL,
            language ENUM('japanese', 'spanish', 'english'),
            created DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_unique_number) REFERENCES users(unique_number) ON DELETE CASCADE,
            UNIQUE(user_unique_number, word)
        );
    `;
    await sql_db.query(create_word_table);
    console.log('word 테이블 존재');
    const create_senentce_table =
    `
        CREATE TABLE IF NOT EXISTS sentence
        (
            sentence_unique_number INT AUTO_INCREMENT PRIMARY KEY,
            user_unique_number INT NOT NULL,
            sentence TEXT NOT NULL,
            meaning TEXT NOT NULL,
            language ENUM('japanese', 'spanish', 'english'),
            created DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_unique_number) REFERENCES users(unique_number) ON DELETE CASCADE,
            UNIQUE(user_unique_number, sentence(255))
        );
    `;
    await sql_db.query(create_senentce_table);
    console.log('sentence 테이블 존재');
    }
    catch (err)
    {
        console.error('DB 초기화 실패:', err.stack);
    }
};

module.exports = init_sql_db;
