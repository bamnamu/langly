const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/jwt_token');
const { talk_process } = require('../controllers/talk_controller');
const upload = require('../config/multer');

router.post('/talk_process', authenticate, upload.single('audio'), talk_process);
module.exports = router;
