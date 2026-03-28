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

// 2. 이력서 저장 API (DB 연동 완료)
app.post('/api/save-resume', async (req, res) => {
  try {
    // 프론트엔드에서 보낸 데이터 구조 분해 할당
    const {
      username, email, subdomain, bio, githubUrl, blogUrl,
      resumeTitle, school, major, gpa, skills, projects
    } = req.body;

    // 1) 필수 값 체크 (이메일과 서브도메인은 고유값이므로 필수)
    if (!email || !subdomain) {
      return res.status(400).json({ message: "이메일과 개인 도메인은 필수 입력 사항입니다." });
    }

				// 2) 서브도메인 예약어(금지어) 차단 로직
				const forbiddenWords = ['admin', 'api', 'www', 'mail', 'master', 'root', 'help', 'login', '너임마청년']
				if (forbiddenWords.includes(subdomain.toLowerCase())) {
					return res.status(400).json({
						message: "해당 도메인은 부적절합니다. 다른 도메인을 입력해주세요."
					});
				}

    // 3) 3칸으로 쪼개진 학력 데이터를 DB 저장을 위해 하나로 결합
    // 예: "한남대학교 | 컴퓨터공학과 | 4.0/4.5"
    const educationArr = [school, major, gpa].filter(Boolean);
    const educationString = educationArr.length > 0 ? educationArr.join(" | ") : null;

    // 3) 프로젝트 배열에서 이름이나 설명이 있는 '유효한' 프로젝트만 필터링
    const validProjects = Array.isArray(projects) 
      ? projects.filter(p => p.name || p.description).map(p => ({
          name: p.name || "",
          period: p.period || "",
          role: p.role || "",
          techStack: p.techStack || "",
          description: p.description || ""
        }))
      : [];

    console.log(`--- [${username}]님의 데이터 저장 시작 ---`);

    // 4) User 데이터 저장 (upsert: 이메일 기준. 있으면 수정, 없으면 생성)
    const user = await prisma.user.upsert({
      where: { email: email },
      update: {
        username: username || "",
        subdomain: subdomain,
        bio: bio || "",
        githubUrl: githubUrl || "",
        blogUrl: blogUrl || ""
      },
      create: {
        email: email,
        password: "temp_password_123", // 로그인 기능 전까지 사용할 임시 비밀번호
        username: username || "이름 없음",
        subdomain: subdomain,
        bio: bio || "",
        githubUrl: githubUrl || "",
        blogUrl: blogUrl || ""
      }
    });

    // 5) 해당 유저의 기존 이력서가 있는지 확인
    const existingResume = await prisma.resume.findFirst({
      where: { userId: user.id }
    });

    if (existingResume) {
      // 6-A) 기존 이력서가 있으면 -> 내용 업데이트 및 프로젝트 덮어쓰기 (기존 프로젝트 삭제 후 재생성)
      await prisma.resume.update({
        where: { id: existingResume.id },
        data: {
          title: resumeTitle || "프론트엔드 개발자 이력서",
          education: educationString,
          skills: skills || "",
          projects: {
            deleteMany: {}, // 기존 프로젝트 싹 지우기
            create: validProjects // 새로 넘어온 프로젝트들 만들기
          }
        }
      });
    } else {
      // 6-B) 기존 이력서가 없으면 -> 이력서와 프로젝트 새로 생성
      await prisma.resume.create({
        data: {
          userId: user.id,
          title: resumeTitle || "프론트엔드 개발자 이력서",
          education: educationString,
          skills: skills || "",
          projects: {
            create: validProjects
          }
        }
      });
    }

    console.log(`--- [${username}]님의 데이터 DB 저장 성공! ---`);
    res.status(200).json({ message: "이력서가 DB에 성공적으로 저장되었습니다! 🚀" });

  } catch (error) {
    console.error("이력서 저장 중 에러 발생:", error);
    
    // 이메일이나 서브도메인이 중복될 때 발생하는 Prisma 에러 처리
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        message: "이미 사용 중인 이메일이거나 개인 도메인입니다. 다른 값을 입력해주세요." 
      });
    }

    res.status(500).json({ message: "서버 저장 중 오류가 발생했습니다." });
  }
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