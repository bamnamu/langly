const express = require('express');
const router = express.Router();
const { talk_process } = require('../controllers/talk_controller');
const multer = require('multer');

const upload=multer({ dest:'uploads/'});
router.post('/talk_process', upload.single('audio'), talk_process);
module.exports = router;
