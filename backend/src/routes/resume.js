const express = require('express');
const router = express.Router();
const multer = require('multer');
const resumeController = require('../controllers/resumeController');

// 파일 업로드 설정 (메모리 스토리지 사용)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 용량 제한
});

// [커리어넷 검색]
router.get('/search', resumeController.searchCareerNet);

// [이미지 업로드]
router.post('/upload', upload.single('profileImage'), resumeController.uploadImage);

// [데이터 조회]
router.get('/user/:subdomain', resumeController.getUserBySubdomain);

// [이력서 저장]
router.post('/save', resumeController.saveResume);

module.exports = router;