const express = require('express');
const mypagecontroller=require('../controllers/my_page_controller.js');
const { authenticate } = require('../middlewares/jwt_token');

const router = express.Router();

router.post('/get_my_word', authenticate, mypagecontroller.get_word);
router.post("/save_word", authenticate, mypagecontroller.save_word);
router.delete("/delete_word/:word_id", authenticate, mypagecontroller.delete_word);
router.post('/save_sentence', authenticate, mypagecontroller.save_sentence);
router.post('/get_my_sentence', authenticate, mypagecontroller.get_sentences);
router.delete('/delete_sentence/:sentence_id', authenticate, mypagecontroller.delete_sentence);

module.exports = router;
