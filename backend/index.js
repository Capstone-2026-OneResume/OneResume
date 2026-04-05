require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth');
const resumeRoutes = require('./src/routes/resume');
const prisma = require('./src/config/prisma');

const app = express();
const port = 5000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 분리한 라우터들을 메인 서버에 연결해주는 길 안내 표지판
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);

// 서버 실행 및 데이터베이스 연결 확인
app.listen(port, '0.0.0.0',  async () => {
  console.log(`-----------------------------------------------`);
  console.log(`서버 실행 중: http://0.0.0.0:${port}`);
  
  try {
    // 명시적으로 연결 확인
    await prisma.$connect();
    console.log(`데이터베이스 연결 성공!`);
    console.log(`-----------------------------------------------`);
  } catch (e) {
    console.error(`데이터베이스 연결 실패`);
    console.error(`에러 내용:`, e.message);
    console.log(`-----------------------------------------------`);
  }
});