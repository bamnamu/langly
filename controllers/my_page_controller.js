const sql_db=require('../config/sql_db_connect');

exports.get_word = async (req, res) => {
    const { language } = req.body;

    // 입력값 유효성 확인
    if (!language || typeof language !== 'string') return res.status(400).json({ error: '유효하지 않은 언어 입력입니다.' });
    const user_unique_number = req.user.unique_number;
    try {
        // DB에서 데이터 조회
        const [rows] = await sql_db.query(
            `SELECT word_unique_number, word, meaning, created 
             FROM word 
             WHERE language = ? AND user_unique_number = ? 
             ORDER BY created DESC`,
            [language, user_unique_number]
        );
        // 결과 반환
        res.status(200).json({ words: rows });
    } catch (error) {
        console.error('단어 조회 실패:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.save_word = async (req, res) => {
    const { word, meaning, language } = req.body;

    // 입력값 유효성 검사
    if (!word || typeof word !== 'string') {
        return res.status(400).json({ error: '유효하지 않은 단어 입력입니다.' });
    }
    if (!meaning || typeof meaning !== 'string') {
        return res.status(400).json({ error: '유효하지 않은 뜻 입력입니다.' });
    }
    if (!language || typeof language !== 'string') {
        return res.status(400).json({ error: '유효하지 않은 언어 입력입니다.' });
    }

    try {
        const user_unique_number = req.user.unique_number; // 토큰에서 사용자 ID 가져오기

        // DB에 단어 삽입
        await sql_db.query(
            `INSERT INTO word (user_unique_number, word, meaning, language) VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE meaning = VALUES(meaning);`,
            [user_unique_number, word, meaning, language]
        );

        res.status(200).json({ message: '단어 저장 성공!' });
    } catch (error) {
        console.error('단어 저장 실패:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.delete_word = async (req, res) => {
    const { word_id } = req.params; // URL 경로 매개변수에서 word_id 가져오기

    // 입력값 유효성 검사
    if (!word_id || isNaN(word_id)) {
        return res.status(400).json({ error: '유효하지 않은 단어 ID입니다.' });
    }

    try {
        const user_unique_number = req.user.unique_number; // 토큰에서 사용자 ID 가져오기

        // DB에서 단어 삭제
        const [result] = await sql_db.query(
            `DELETE FROM word WHERE word_unique_number = ? AND user_unique_number = ?`,
            [word_id, user_unique_number]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '단어를 찾을 수 없거나 삭제 권한이 없습니다.' });
        }

        res.status(200).json({ message: '단어 삭제 성공!' });
    } catch (error) {
        console.error('단어 삭제 실패:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.save_sentence = async (req, res) => {
    const { sentence, meaning, language } = req.body;

    // 입력값 유효성 검사
    if (!sentence || typeof sentence !== 'string') {
        return res.status(400).json({ error: '유효하지 않은 문장 입력입니다.' });
    }
    if (!meaning || typeof meaning !== 'string') {
        return res.status(400).json({ error: '유효하지 않은 뜻 입력입니다.' });
    }
    if (!language || typeof language !== 'string') {
        return res.status(400).json({ error: '유효하지 않은 언어 입력입니다.' });
    }

    try {
        const user_unique_number = req.user.unique_number; // 토큰에서 사용자 ID 가져오기

        // DB에 문장 삽입
        await sql_db.query(
            `INSERT INTO sentence (user_unique_number, sentence, meaning, language) VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE meaning = VALUES(meaning);`,
            [user_unique_number, sentence, meaning, language]
        );

        res.status(200).json({ message: '문장 저장 성공!' });
    } catch (error) {
        console.error('문장 저장 실패:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.get_sentences = async (req, res) => {
    const { language } = req.body;

    // 입력값 유효성 확인
    if (!language || typeof language !== 'string') {
        return res.status(400).json({ error: '유효하지 않은 언어 입력입니다.' });
    }

    try {
        const user_unique_number = req.user.unique_number; // 토큰에서 사용자 ID 가져오기

        // DB에서 데이터 조회
        const [rows] = await sql_db.query(
            `SELECT sentence, meaning, created 
             FROM sentence 
             WHERE language = ? AND user_unique_number = ? 
             ORDER BY created DESC`,
            [language, user_unique_number]
        );

        res.status(200).json({ sentences: rows });
    } catch (error) {
        console.error('문장 조회 실패:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.delete_sentence = async (req, res) => {
    const { sentence_id } = req.params; // URL 경로 매개변수에서 sentence_id 가져오기

    // 입력값 유효성 검사
    if (!sentence_id || isNaN(sentence_id)) {
        return res.status(400).json({ error: '유효하지 않은 문장 ID입니다.' });
    }

    try {
        const user_unique_number = req.user.unique_number; // 토큰에서 사용자 ID 가져오기

        // DB에서 문장 삭제
        const [result] = await sql_db.query(
            `DELETE FROM sentence WHERE sentence_unique_number = ? AND user_unique_number = ?`,
            [sentence_id, user_unique_number]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '문장을 찾을 수 없거나 삭제 권한이 없습니다.' });
        }

        res.status(200).json({ message: '문장 삭제 성공!' });
    } catch (error) {
        console.error('문장 삭제 실패:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
