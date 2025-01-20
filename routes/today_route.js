const express = require('express');
const { authenticate } = require('../middlewares/jwt_token.js');
const todaywordcontroller = require('../controllers/today_controller.js');
const { route } = require('./auth_route.js');

const router = express.Router();

router.post('/generate_five_word', authenticate, todaywordcontroller.generate_five_word);
router.post('/generate_sentence', authenticate, todaywordcontroller.generate_today_sentence);

module.exports = router;