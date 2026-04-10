// 로그인과 회원가입을 담당 (기본 메인 화면)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Login";
import Signup from "../components/Signup";
import PageLayout from "../components/PageLayout";

function AuthPage({ isDarkMode, toggleDarkMode }) {
  const [authMode, setAuthMode] = useState('login');
  const navigate = useNavigate();
		const [rememberMe, setRememberMe] = useState(false); // 로그인 유지 체크박스 상태 (로그인 컴포넌트로 전달)
		const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 이미 로그인된 토큰이 있다면 편집 페이지로 강제 이동
    const token = localStorage.getItem("oneresume-token") || sessionStorage.getItem("oneresume-token");
    if (token) {
      navigate('/edit');
    } else {
					setIsChecking(false);
				}
			}, [navigate]);

			if (isChecking) {
				return (
					<div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-zinc-900' : 'bg-gray-50'}`}>
						{/* 간단한 로딩 텍스트나 빈 화면 */}
						<div className="animate-pulse text-slate-500 font-bold text-xl">OneResume Loading...</div>
					</div>
				);
			}

  // 가입/로그인 성공 시 호출되는 콜백
  const handleAuthSuccess = (data) => {
    if (data.token) {
					const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("oneresume-token", data.token); // 토큰 저장
    }
    
    // 프로필 설정 완료 여부에 따른 리다이렉트 분기 (Login.js와 정합성 유지)
    if (data.user && data.user.isProfileComplete) {
      navigate('/edit');
    } else {
      navigate('/setup-profile');
    }
  };

  return (
    <PageLayout isDarkMode={isDarkMode}>
      <header className="text-center mb-12 relative print:hidden">
        <h1 className={`text-5xl font-black mb-3 tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-800'}`}>OneResume</h1>
        <p className={`font-medium text-lg ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
          통합 이력서 관리를 위한 정밀 데이터 구축
        </p>

        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={toggleDarkMode}
            className={`font-bold py-2.5 px-8 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2 border ${
              isDarkMode 
                ? "bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700" 
                : "bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-200"
            }`}
          >
            {isDarkMode ? "☀️ 라이트 모드" : "🌙 다크 모드"}
          </button>
        </div>
      </header>

      <div className="flex items-center justify-center w-full">
        {authMode === 'login' ? (
          <Login onSuccess={handleAuthSuccess}
																	onSwitch={() => setAuthMode('signup')}
																	isDarkMode={isDarkMode}
																	rememberMe={rememberMe}
																	setRememberMe={setRememberMe}
																/>
        ) : (
          <Signup onSuccess={handleAuthSuccess}
																		onSwitch={() => setAuthMode('login')}
																		isDarkMode={isDarkMode}
																/>
        )}
      </div>
    </PageLayout>
  );
}

export default AuthPage;