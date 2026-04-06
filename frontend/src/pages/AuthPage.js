// 로그인과 회원가입을 담당 (기본 메인 화면)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Login";
import Signup from "../components/Signup";

function AuthPage({ isDarkMode, toggleDarkMode }) {
  const [authMode, setAuthMode] = useState('login');
  const navigate = useNavigate();
		const [rememberMe, setRememberMe] = useState(false); // 로그인 유지 체크박스 상태 (로그인 컴포넌트로 전달)

  useEffect(() => {
    // 이미 로그인된 토큰이 있다면 편집 페이지로 강제 이동
    const token = localStorage.getItem("oneresume-token") || sessionStorage.getItem("oneresume-token");
    if (token) {
      navigate('/edit');
    }
			}, [navigate]);

  // 가입/로그인 성공 시 호출되는 콜백
  const handleAuthSuccess = (data) => {
    if (data.token) {
					const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("oneresume-token", data.token); // 토큰 저장
    }
    navigate('/edit'); // 성공 시 편집 페이지로 이동!
  };

  return (
    <div className={`min-h-screen py-12 px-4 font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <header className="text-center mb-12 relative print:hidden">
        <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>OneResume</h1>
        <p className="text-slate-500 font-medium text-lg">
          통합 이력서 관리를 위한 정밀 데이터 구축
        </p>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={toggleDarkMode}
            className={`font-bold py-2 px-6 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
              isDarkMode 
                ? "bg-slate-800 hover:bg-slate-900 text-white border border-slate-700" 
                : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-200"
            }`}
          >
            {isDarkMode ? "☀️ 라이트 모드" : "🌙 다크 모드"}
          </button>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[50vh]">
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
    </div>
  );
}

export default AuthPage;