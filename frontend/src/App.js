import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// 페이지 컴포넌트 불러오기
import AuthPage from "./pages/AuthPage";
import EditPage from "./pages/EditPage";
import UserResumePage from "./pages/UserResumePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function App() {
  // 브라우저 접속 주소 확인 (서브도메인 판별)
  const host = window.location.hostname;
  const parts = host.split('.');
  const isS3 = host.includes('s3-website');
  const subdomain = (parts.length > 1 && !isS3 && parts[0] !== 'www' && parts[0] !== 'localhost') ? parts[0] : null;

  // 전역 다크모드 상태 관리
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 첫 로딩 시 로컬스토리지에서 테마 불러오기
  useEffect(() => {
    const savedTheme = localStorage.getItem("oneresume-theme") === "true";
    setIsDarkMode(savedTheme);
  }, []);

  // 테마 토글 함수 (자식 컴포넌트들에게 전달할 용도)
  const toggleDarkMode = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("oneresume-theme", newTheme.toString());
  };

  return (
    <>
      {/* 알림창 (isDarkMode 상태에 따라 실시간으로 스타일 변경) */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: '16px',
            padding: '16px 24px',
            fontSize: '1.1rem',
            maxWidth: '500px',
            fontWeight: '600',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            // 실시간 isDarkMode 상태 반영
            background: isDarkMode ? '#1e293b' : '#ffffff', // slate-800 : white
            color: isDarkMode ? '#f8fafc' : '#1e293b',      // slate-50 : slate-800
            border: isDarkMode ? '1px solid #334155' : '1px solid #f1f5f9', // slate-700 : slate-100
           },
          success: {
            duration: 3000,
            theme: { primary: '#10b981' },
          },
          error: {
            duration: 4000,
            theme: { primary: '#ef4444' },
          },
        }}
      />

      {subdomain ? (
        // 1. 사용자 이력서 페이지 (서브도메인 접속)
        <UserResumePage subdomain={subdomain} isDarkMode={isDarkMode} />
      ) : (
        // 2. 관리자 모드 라우팅
        <Router>
          <Routes>
            {/* 각 페이지에 isDarkMode와 필요 시 toggleDarkMode 전달 */}
            <Route path="/" element={<AuthPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route 
              path="/edit" 
              element={<EditPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} 
            />
            <Route 
              path="/forgot-password" 
              element={<ForgotPasswordPage isDarkMode={isDarkMode} />} 
            />
            <Route 
              path="/reset-password/:token" 
              element={<ResetPasswordPage isDarkMode={isDarkMode} />} 
            />
          </Routes>
        </Router>
      )}
    </>
  );
}

export default App;