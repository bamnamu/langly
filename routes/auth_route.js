const express=require('express');
const {users, register, login}=require('../controllers/auth_controller');
const router=express.Router();

router.get('/users', users);
router.post('/register', register);
router.post('/login', login);
module.exports=router;