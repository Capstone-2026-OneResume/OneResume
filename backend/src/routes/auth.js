const express = require('express');
const router = express.Router();
// 로직이 담긴 컨트롤러를 불러옴.
const authController = require('../controllers/authController');

// [인증번호 관련]
router.post('/send-code', authController.sendCode);
router.post('/verify-code', authController.verifyCode);

// [계정 관련]
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', authController.getMe);

// [비밀번호 재설정 관련]
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;