require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth');
const resumeRoutes = require('./src/routes/resume');
const prisma = require('./src/config/prisma');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';

const app = express();
const port = 5000;

app.set('trust proxy', 1);

// [Security] Helmet 적용
// 기본적으로 XSS, 클릭재킹(Clickjacking) 등을 방어하는 헤더를 추가.
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. CORS 설정
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

// [Security] Rate Limiting 설정
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 20, // 1분당 최대 요청 횟수
		handler: (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // 인증 정보 포함 시 필수
    res.status(429).json({
      message: "너무 많은 요청이 감지되었습니다. 1분 후 다시 시도해주세요."
    });
  },
  standardHeaders: true, // 응답 헤더에 RateLimit 정보를 포함
  legacyHeaders: false, // 이전 방식의 헤더는 사용 안 함
});

// 모든 요청에 대해 리미터 적용
app.use(limiter);

// 미들웨어 설정
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