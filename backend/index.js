require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const bcrypt	= require('bcrypt');
const nodemailer = require('nodemailer');

// Prisma Client 초기화 (Prisma 7에서는 별도 설정 없이도 config.ts를 참조합니다)
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

const app = express();
const port = 5000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// S3 클라이언트 설정
const s3 = new S3Client({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
});

// S3 버킷 이름이 정확히 들어오는지 터미널에서 확인하기 위한 로그
console.log("타겟 S3 버킷 이름:", process.env.S3_BUCKET_NAME);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 용량 제한
});

// 메일 전송을 위한 Nodemailer 설정
const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_USER, //	이메일 주소
			pass: process.env.EMAIL_PASS, //	앱 비밀번호 (2FA 설정된 계정의 경우)
		},
	});

	// 임시 인증 데이터 저장소 (서버 메모리 사용)
	// 유저가 인증에 성공했는지 잠시 기억해두는 장부.
	const verificationStore = new Map();

	// 인증번호 발송
app.post('/api/auth/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "이메일을 입력해주세요." });

    // 6자리 랜덤 숫자 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 장부에 '미인증' 상태로 저장 (5분 뒤 만료 등으로 확장 가능)
    verificationStore.set(email, { code, isVerified: false });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '[OneResume] 회원가입 인증번호입니다.',
      text: `안녕하세요! OneResume입니다. 인증번호 6자리는 [${code}] 입니다.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 [메일발송 성공] ${email} : ${code}`);
    res.status(200).json({ message: "인증번호가 발송되었습니다." });
  } catch (error) {
    console.error("메일 발송 에러:", error);
    res.status(500).json({ message: "메일 발송 중 서버 오류가 발생했습니다." });
  }
});

// 인증번호 검증
app.post('/api/auth/verify-code', async (req, res) => {
  const { email, code } = req.body;
  const storedData = verificationStore.get(email);

  if (storedData && storedData.code === code) {
    // 번호가 맞으면 장부에 '인증 완료'라고 표시
    verificationStore.set(email, { ...storedData, isVerified: true });
    return res.status(200).json({ message: "이메일 인증에 성공했습니다!" });
  }

  res.status(400).json({ message: "인증번호가 틀렸거나 만료되었습니다." });
});

// 최종 회원가입 (비밀번호 암호화 저장)
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, subdomain } = req.body;

    // 장부에서 이 사람이 인증을 마쳤는지 확인
    const storedData = verificationStore.get(email);
    if (!storedData || !storedData.isVerified) {
      return res.status(400).json({ message: "이메일 인증을 먼저 완료해주세요." });
    }

    // 중복 체크
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { subdomain }] }
    });
    if (existingUser) {
      return res.status(409).json({ message: "이미 사용 중인 이메일 또는 도메인입니다." });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // DB 저장
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        subdomain,
        isVerified: true,
        provider: "LOCAL"
      }
    });

    // 가입 완료 후 임시 장부에서 삭제
    verificationStore.delete(email);

    console.log(`✅ [가입완료] ${email}`);
    res.status(201).json({ message: "OneResume 회원이 되신 것을 축하합니다!" });
  } catch (error) {
    console.error("가입 에러:", error);
    res.status(500).json({ message: "가입 처리 중 오류가 발생했습니다." });
  }
});

// 프로필 이미지 S3 직접 업로드 API (multer로 메모리에 저장된 파일을 AWS SDK로 직접 S3에 업로드)
app.post('/api/upload', upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "파일이 전달되지 않았습니다." });
    }

    // 파일 이름을 UTF-8로 인코딩하여 S3에 저장 (한글 파일명 깨짐 방지)
    const encodedName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    const fileName = `profiles/${Date.now()}_${encodedName}`;
    const bucketName = process.env.S3_BUCKET_NAME.trim();

    // S3에 업로드할 명령어 생성 (파일 버퍼와 MIME 타입 포함)
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: req.file.buffer, // multer로 메모리에 저장된 파일 버퍼
      ContentType: req.file.mimetype,
    });

    // S3에 파일 업로드 실행
    await s3.send(command);

    // 업로드된 파일의 공개 URL 생성 (버킷이 퍼블릭 액세스 허용되어 있다고 가정)
    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    console.log("✅ 이미지 S3 직접 업로드 성공:", fileUrl);
    res.status(200).json({ imageUrl: fileUrl });

  } catch (error) {
    console.error("❌ S3 직접 업로드 에러:", error);
    res.status(500).json({ message: "S3 업로드 중 에러가 발생했습니다." });
  }
});

// 서브도메인으로 사용자 데이터 조회 API
app.get('/api/user/:subdomain', async (req, res) => {
	try {
		const { subdomain } = req.params;
		const user = await prisma.user.findUnique({
			where: { subdomain },
			include: {
				resumes: {
					include: { projects: true }
				}
			}
		});
		if (!user) {
			return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
		}
		console.log("DB에서 불러온 유저 정보:", user.username, user.profileImageUrl);
		res.status(200).json(user);
	} catch (error) {
		console.error("데이터 로드 에러:", error);
		res.status(500).json({ message: "데이터를 불러오는 중 서버 오류가 발생했습니다." });
	}
});

// 이력서 저장 API (DB 연동 완료)
app.post('/api/save-resume', async (req, res) => {
  try {
    // 프론트엔드에서 보낸 데이터 구조 분해 할당
    const {
      username, email, subdomain, bio, githubUrl, blogUrl, profileImageUrl,
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

    // 4) 프로젝트 배열에서 이름이나 설명이 있는 '유효한' 프로젝트만 필터링
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

    // 5) User 데이터 저장 (upsert: 이메일 기준. 있으면 수정, 없으면 생성)
    const user = await prisma.user.upsert({
      where: { email: email },
      update: {
        username: username || "",
        subdomain: subdomain,
        bio: bio || "",
								profileImageUrl: profileImageUrl || "", // 프로필 이미지 URL도 업데이트
        githubUrl: githubUrl || "",
        blogUrl: blogUrl || ""
      },
      create: {
        email: email,
        password: "temp_password_123", // 로그인 기능 전까지 사용할 임시 비밀번호
        username: username || "이름 없음",
        subdomain: subdomain,
        bio: bio || "",
								profileImageUrl: profileImageUrl || "", // 프로필 이미지 URL도 저장
        githubUrl: githubUrl || "",
        blogUrl: blogUrl || ""
      }
    });

    // 6) 해당 유저의 기존 이력서가 있는지 확인
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