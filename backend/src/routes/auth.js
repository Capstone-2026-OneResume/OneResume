const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // 토큰 검증용
const authController = require('../controllers/authController');
const { S3Client } = require('@aws-sdk/client-s3'); // S3 클라이언트
const multer = require('multer');
const multerS3 = require('multer-s3');

// 1. [Security] 로그인한 유저인지 확인하는 미들웨어 정의
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "인증 토큰이 없습니다." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = { id: decoded.userId }; // 컨트롤러에서 req.user.id로 쓸 수 있게 저장
    next();
  } catch (err) {
    return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
  }
};

// 2. [Storage] S3 업로드 설정 (팀장님 s3.js 설정을 기반으로 함)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'oneresume-storage-parkungjung', // 팀장님 버킷 이름
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, `profiles/${Date.now()}_${file.originalname}`); // profiles 폴더에 저장
    },
  }),
});

// [인증번호 관련]
router.post('/send-code', authController.sendCode);
router.post('/verify-code', authController.verifyCode);

// [계정 관련]
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', authController.getMe);

// [프로필 설정]
// authMiddleware로 로그인 확인 -> upload.single로 사진 한 장 S3 업로드 -> 컨트롤러 실행
router.put('/profile-setup', authMiddleware, upload.single('profileImage'), authController.setupProfile);

// [비밀번호 재설정 관련]
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;