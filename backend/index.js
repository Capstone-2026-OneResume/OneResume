const { PrismaClient } = require('@prisma/client');
const express = require('express');
const cors = require('cors');

// Prisma Client 초기화 (Prisma 7에서는 별도 설정 없이도 config.ts를 참조합니다)
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

const app = express();
const port = 5000;

// 미들웨어 설정
app.use(cors()); 
app.use(express.json());

// 1. 서버 상태 확인용 루트 경로
app.get('/', (req, res) => {
  res.send('OneResume 백엔드 서버가 아주 잘 돌아가고 있습니다! 🚀');
});

// 2. 이력서 저장 API (테스트용)
app.post('/api/save-resume', (req, res) => {
  const { name, email, education, skills } = req.body;
  
  console.log('--- 새로운 이력서 데이터 접수 ---');
  console.log('이름:', name);
  console.log('이메일:', email);
  console.log('학력:', education);
  console.log('기술:', skills);

  res.json({
    message: `${name}님의 이력서(학력: ${education}) 데이터가 서버에 잘 전달되었습니다!`
  });
});

// 3. 서브도메인 기반 유저 데이터 조회 API (핵심!)
app.get('/api/user/:subdomain', async (req, res) => {
  const { subdomain } = req.params;

  try {
    const userData = await prisma.user.findUnique({
      where: { subdomain: subdomain },
      include: {
        resumes: {
          include: { projects: true }
        }
      }
    });

    if (!userData) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json(userData);
  } catch (error) {
    console.error('사용자 조회 중 오류 발생:', error);
    res.status(500).json({ message: 'DB 조회 실패', error: error.message });
  }
});

// 서버 실행 및 데이터베이스 연결 확인
app.listen(port, async () => {
  console.log(`-----------------------------------------------`);
  console.log(`서버 실행 중: http://localhost:${port}`);
  
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