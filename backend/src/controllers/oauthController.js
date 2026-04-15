const axios = require('axios');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// 1. [KAKAO] 로그인 페이지로 리다이렉트
exports.kakaoLogin = (req, res) => {
    const redirectUri = encodeURIComponent(process.env.KAKAO_REDIRECT_URI);
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code`;
    res.redirect(kakaoAuthUrl);
};

// 2. [KAKAO] 콜백 처리
exports.kakaoCallback = async (req, res) => {
    const { code } = req.query;
    // FRONTEND_URL 끝의 슬래시 제거 로직
    const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, "");

    if (!code) return res.redirect(`${frontendUrl}/login?error=no_code`);

    try {
        // [A] 인가 코드를 Access Token으로 교환
        const tokenRes = await axios.post('https://kauth.kakao.com/oauth/token', null, {
            params: {
                grant_type: 'authorization_code',
                client_id: process.env.KAKAO_CLIENT_ID,
                client_secret: process.env.KAKAO_CLIENT_SECRET, // 클라이언트 시크릿 추가!
                redirect_uri: process.env.KAKAO_REDIRECT_URI,
                code,
            },
            headers: { 'Content-type': 'application/x-www-form-urlencoded;charset=utf-8' }
        });

        const accessToken = tokenRes.data.access_token;

        // [B] 사용자 정보 가져오기
        const userRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const kakaoUser = userRes.data;
        const socialId = String(kakaoUser.id);
        const email = kakaoUser.kakao_account?.email || `kakao_${socialId}@oneresume.temp`;
        const nickname = kakaoUser.properties?.nickname || '카카오 사용자';

        // [C] DB 확인 및 유저 생성
        let user = await prisma.user.findUnique({
            where: { socialId }
        });

        if (!user) {
            // 신규 유저: 임시 서브도메인 부여 및 isProfileComplete: false 설정
            user = await prisma.user.create({
                data: {
                    email,
                    username: nickname,
                    socialId,
                    provider: 'KAKAO',
                    subdomain: `kakao-${socialId.slice(-5)}${Math.floor(Math.random() * 1000)}`, // 중복 방지용 임시 도메인
                    isProfileComplete: false,
                    isVerified: true
                }
            });
        }

        // [D] JWT 토큰 발급
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // [E] 프론트엔드 콜백 페이지로 리다이렉트 (토큰 전달)
        res.redirect(`${frontendUrl}/oauth/callback?token=${token}`);

    } catch (error) {
        console.error('Kakao Auth Error:', error.response?.data || error.message);
        res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
};

// 3. [NAVER] 로그인 페이지로 리다이렉트
exports.naverLogin = (req, res) => {
    const state = Math.random().toString(36).substring(7); // 보안용 state 값
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.NAVER_CLIENT_ID}&redirect_uri=${process.env.NAVER_REDIRECT_URI}&state=${state}`;
    res.redirect(naverAuthUrl);
};

// 4. [NAVER] 콜백 처리
exports.naverCallback = async (req, res) => {
    const { code, state } = req.query;
    const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, "");

    if (!code) return res.redirect(`${frontendUrl}/login?error=no_code`);

    try {
        // [A] 인가 코드를 Access Token으로 교환
        const tokenRes = await axios.get('https://nid.naver.com/oauth2.0/token', {
            params: {
                grant_type: 'authorization_code',
                client_id: process.env.NAVER_CLIENT_ID,
                client_secret: process.env.NAVER_CLIENT_SECRET,
                code,
                state,
            }
        });

        const accessToken = tokenRes.data.access_token;

        // [B] 사용자 정보 가져오기
        const userRes = await axios.get('https://openapi.naver.com/v1/nid/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const naverUser = userRes.data.response; // 네이버는 response 객체 안에 정보가 있음
        const socialId = naverUser.id;
        const email = naverUser.email;
        const nickname = naverUser.nickname || '네이버 사용자';

        // [C] DB 확인 및 유저 생성
        let user = await prisma.user.findUnique({
            where: { socialId }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    username: nickname,
                    socialId,
                    provider: 'NAVER',
                    subdomain: `naver-${socialId.slice(-5)}${Math.floor(Math.random() * 1000)}`,
                    isProfileComplete: false,
                    isVerified: true
                }
            });
        }

        // [D] JWT 토큰 발급
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.redirect(`${frontendUrl}/oauth/callback?token=${token}`);

    } catch (error) {
        console.error('Naver Auth Error:', error.response?.data || error.message);
        res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
};
