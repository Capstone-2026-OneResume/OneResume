import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

const OAuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleCallback = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');
            const error = params.get('error');

            if (error) {
                toast.error("소셜 로그인에 실패했습니다.");
                navigate('/');
                return;
            }

            if (token) {
                // 1. 토큰 저장
                localStorage.setItem('oneresume-token', token);

                try {
                    // 2. 유저 정보 확인 (온보딩 여부 체크용)
                    const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    const { user } = response.data;

                    if (user.isProfileComplete) {
                        toast.success(`${user.username}님, 환영합니다!`);
                        navigate('/edit');
                    } else {
                        toast.success("거의 다 됐어요! 프로필을 완성해주세요.");
                        navigate('/setup-profile');
                    }
                } catch (err) {
                    console.error("User Info Fetch Error:", err);
                    toast.error("로그인 세션 확인 중 오류가 발생했습니다.");
                    navigate('/');
                }
            } else {
                navigate('/');
            }
        };

        handleCallback();
    }, [location, navigate]);

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-white">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-black animate-pulse">로그인 중입니다...</h2>
            <p className="mt-2 text-zinc-500 font-bold">잠시만 기다려주세요.</p>
        </div>
    );
};

export default OAuthCallback;
