const { PutObjectCommand } = require('@aws-sdk/client-s3');
const prisma = require('../config/prisma');
const s3 = require('../config/s3');

// [1] 프로필 이미지 S3 직접 업로드 API
exports.uploadImage = async (req, res) => {
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
        const fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;

        console.log("✅ 이미지 S3 직접 업로드 성공:", fileUrl);
        res.status(200).json({ imageUrl: fileUrl });

    } catch (error) {
        console.error("❌ S3 직접 업로드 에러:", error);
        res.status(500).json({ message: "S3 업로드 중 에러가 발생했습니다." });
    }
};

// [2] 서브도메인으로 사용자 데이터 조회 API
exports.getUserBySubdomain = async (req, res) => {
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
        const { password: _, ...safeUser } = user;
        res.status(200).json(safeUser);
    } catch (error) {
        console.error("데이터 로드 에러:", error);
        res.status(500).json({ message: "데이터를 불러오는 중 서버 오류가 발생했습니다." });
    }
};

// [3] 이력서 저장 API (DB 연동 완료)
exports.saveResume = async (req, res) => {
    try {
        // 프론트엔드에서 보낸 데이터 구조 분해 할당
        const {
            username, email, subdomain, bio, githubUrl, blogUrl, profileImageUrl,
            age, gender, phone,
            resumeTitle, school, major, gpa, skills, projects
        } = req.body;

        // 1) 필수 값 체크 (이메일과 서브도메인은 고유값이므로 필수)
        if (!email || !subdomain) {
            return res.status(400).json({ message: "이메일과 개인 도메인은 필수 입력 사항입니다." });
        }

        // age를 숫자로 변환 (값이 있을 때만)
        const parsedAge = age ? parseInt(age, 10) : null;

        // 2) 서브도메인 예약어(금지어) 차단 로직
        const forbiddenWords = ['admin', 'api', 'www', 'mail', 'master', 'root', 'help', 'login', '너임마청년']
        if (forbiddenWords.includes(subdomain.toLowerCase())) {
            return res.status(400).json({
                message: "해당 도메인은 부적절합니다. 다른 도메인을 입력해주세요."
            });
        }

        // 3) 3칸으로 쪼개진 학력 데이터를 DB 저장을 위해 하나로 결합
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

        // 5) User 데이터 저장 (upsert)
        const user = await prisma.user.upsert({
            where: { email: email },
            update: {
                username: username || "",
                subdomain: subdomain,
                bio: bio || "",
                profileImageUrl: profileImageUrl || "",
                githubUrl: githubUrl || "",
                blogUrl: blogUrl || "",
                age: parsedAge,
                gender: gender || null,
                phone: phone || null
            },
            create: {
                email: email,
                password: "temp_password_123",
                username: username || "이름 없음",
                subdomain: subdomain,
                bio: bio || "",
                profileImageUrl: profileImageUrl || "",
                githubUrl: githubUrl || "",
                blogUrl: blogUrl || "",
                age: parsedAge,
                gender: gender || null,
                phone: phone || null
            }
        });

        // 6) 이력서 및 프로젝트 저장/업데이트 로직
        const existingResume = await prisma.resume.findFirst({
            where: { userId: user.id }
        });

        if (existingResume) {
            await prisma.resume.update({
                where: { id: existingResume.id },
                data: {
                    title: resumeTitle || "프론트엔드 개발자 이력서",
                    education: educationString,
                    skills: skills || "",
                    projects: {
                        deleteMany: {},
                        create: validProjects
                    }
                }
            });
        } else {
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
        if (error.code === 'P2002') {
            return res.status(400).json({ 
                message: "이미 사용 중인 이메일이거나 개인 도메인입니다. 다른 값을 입력해주세요." 
            });
        }
        res.status(500).json({ message: "서버 저장 중 오류가 발생했습니다." });
    }
};