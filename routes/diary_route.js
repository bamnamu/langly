const express = require('express');
const { authenticate } = require('../middlewares/jwt_token');
const diarycontroller = require('../controllers/diary_controller');
const { route } = require('./auth_route');

const router = express.Router();
router.post('/grammar', authenticate, diarycontroller.diary_grammar);
router.get('/diary_db', diarycontroller.get_all_diary);
router.delete('/delete/:id', authenticate, diarycontroller.delete_diary);
router.post('/save', authenticate, diarycontroller.save_diary);
router.put('/update/:id', authenticate, diarycontroller.update_diary);
router.get('/user_diary', authenticate, diarycontroller.get_my_diary);

module.exports = router;
