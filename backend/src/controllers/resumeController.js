const axios = require('axios');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const prisma = require('../config/prisma');
const s3 = require('../config/s3');

// 커리어넷 API 키 (환경 변수에서 로드)
const CAREERNET_API_KEY = process.env.CAREERNET_API_KEY;

// [0] 커리어넷 학교/전공 검색 프록시 API
exports.searchCareerNet = async (req, res) => {
    try {
        const { type, keyword } = req.query; // type: SCHOOL or MAJOR
        console.log(`🔍 [CareerNet Search] Type: ${type}, Keyword: ${keyword}`);

        if (!keyword || keyword.length < 2) {
            return res.status(400).json({ message: "검색어는 2자 이상 입력해주세요." });
        }

        // 커리어넷 API 명세: SCHOOL은 searchSchulNm, MAJOR는 searchTitle 사용
        const isSchool = type === 'SCHOOL';
        const searchParam = isSchool ? 'searchSchulNm' : 'searchTitle';
        const url = `https://www.career.go.kr/cnet/openapi/getOpenApi?apiKey=${CAREERNET_API_KEY}&svcType=api&svcCode=${type}&contentType=json&gubun=univ_list&${searchParam}=${encodeURIComponent(keyword)}`;
        
        console.log(`🔗 Request URL: ${url}`);
        const response = await axios.get(url);
        
        // 데이터 구조 로깅
        console.log("📦 Response Data Summary:", JSON.stringify(response.data).substring(0, 200) + "...");

        res.status(200).json(response.data);
    } catch (error) {
        console.error("❌ 커리어넷 API 호출 에러:", error.response?.data || error.message);
        res.status(500).json({ message: "커리어넷 서버와 통신 중 오류가 발생했습니다." });
    }
};

// [1] 프로필 이미지 S3 직접 업로드 API
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "파일이 전달되지 않았습니다." });
        }

        const encodedName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
        const fileName = `profiles/${Date.now()}_${encodedName}`;
        const bucketName = process.env.S3_BUCKET_NAME.trim();

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        });

        await s3.send(command);
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
                    include: { 
                        projects: true,
                        workExperiences: true,
                        certifications: true
                    }
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

// [3] 이력서 저장 API
exports.saveResume = async (req, res) => {
    try {
        const {
            username, email, subdomain, bio, githubUrl, blogUrl, profileImageUrl,
            age, gender, phone, address, addressDetail, useInternationalAge,
            resumeTitle, school, major, gpa, skills, projects,
            militaryStatus, militaryPeriod, militaryClass,
            selfIntroGrowth, selfIntroCharacter, selfIntroMotivation,
            workExperiences, certifications
        } = req.body;

        if (!email || !subdomain) {
            return res.status(400).json({ message: "이메일과 개인 도메인은 필수 입력 사항입니다." });
        }

        const parsedAge = age ? parseInt(age, 10) : null;

        const forbiddenWords = ['admin', 'api', 'www', 'mail', 'master', 'root', 'help', 'login', '너임마청년']
        if (forbiddenWords.includes(subdomain.toLowerCase())) {
            return res.status(400).json({
                message: "해당 도메인은 부적절합니다. 다른 도메인을 입력해주세요."
            });
        }

        const educationArr = [school, major, gpa].filter(Boolean);
        const educationString = educationArr.length > 0 ? educationArr.join(" | ") : null;

        const validProjects = Array.isArray(projects) 
            ? projects.filter(p => p.name || p.description).map(p => ({
                    name: p.name || "",
                    period: p.period || "",
                    role: p.role || "",
                    techStack: p.techStack || "",
                    description: p.description || ""
                }))
            : [];

        const validWorkExperiences = Array.isArray(workExperiences)
            ? workExperiences.filter(w => w.companyName).map(w => ({
                    companyName: w.companyName || "",
                    department: w.department || "",
                    role: w.role || "",
                    jobDescription: w.jobDescription || "",
                    period: w.period || "",
                    isCurrent: w.isCurrent || false
                }))
            : [];

        const validCertifications = Array.isArray(certifications)
            ? certifications.filter(c => c.name).map(c => ({
                    type: c.type || "CERT",
                    name: c.name || "",
                    issuer: c.issuer || "",
                    date: c.date || "",
                    score: c.score || ""
                }))
            : [];

        console.log(`--- [${username}]님의 데이터 저장 시작 ---`);

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
                phone: phone || null,
                address: address || null,
                addressDetail: addressDetail || null,
                useInternationalAge: useInternationalAge ?? false
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
                phone: phone || null,
                address: address || null,
                addressDetail: addressDetail || null,
                useInternationalAge: useInternationalAge ?? false
            }
        });

        const resumeData = {
            title: resumeTitle || "프론트엔드 개발자 이력서",
            education: educationString,
            skills: skills || "",
            militaryStatus: militaryStatus || null,
            militaryPeriod: militaryPeriod || null,
            militaryClass: militaryClass || null,
            selfIntroGrowth: selfIntroGrowth || null,
            selfIntroCharacter: selfIntroCharacter || null,
            selfIntroMotivation: selfIntroMotivation || null,
        };

        const existingResume = await prisma.resume.findFirst({
            where: { userId: user.id }
        });

        if (existingResume) {
            await prisma.resume.update({
                where: { id: existingResume.id },
                data: {
                    ...resumeData,
                    projects: {
                        deleteMany: {},
                        create: validProjects
                    },
                    workExperiences: {
                        deleteMany: {},
                        create: validWorkExperiences
                    },
                    certifications: {
                        deleteMany: {},
                        create: validCertifications
                    }
                }
            });
        } else {
            await prisma.resume.create({
                data: {
                    ...resumeData,
                    userId: user.id,
                    projects: { create: validProjects },
                    workExperiences: { create: validWorkExperiences },
                    certifications: { create: validCertifications }
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