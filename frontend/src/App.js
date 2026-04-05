import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// 페이지 컴포넌트 불러오기 (pages 폴더를 꼭 만들어주세요!)
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
		const savedTheme = localStorage.getItem("oneresume-theme") === "true";

  return (
    <>
      {/* 알림창은 어떤 페이지에서든 떠야 하므로 최상단에 위치 */}
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
												// 다크모드일 때
												background: savedTheme ? '#1e293b' : '#ffffff', // slate-800 : white
            color: savedTheme ? '#f8fafc' : '#1e293b',      // slate-50 : slate-800
            border: savedTheme ? '1px solid #334155' : '1px solid #f1f5f9', // slate-700 : slate-100
											},
          // 성공/에러 아이콘 테마도 맞춤 설정 가능
          success: {
            duration: 3000,
            theme: {
              primary: '#10b981', // emerald-500
            },
          },
          error: {
            duration: 4000,
            theme: {
              primary: '#ef4444', // red-500
            },
          },
        }}
      />

      {subdomain ? (
        // 1. 누군가 내 서브도메인(예: giyoung.oneresume.com)으로 들어왔을 때
        <UserResumePage subdomain={subdomain} />
      ) : (
        // 2. 관리자 모드 (localhost 또는 메인 도메인)로 들어왔을 때 라우팅
        <Router>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/edit" element={<EditPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          </Routes>
        </Router>
      )}
    </>
  );
}

export default App;