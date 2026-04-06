import { API_BASE_URL } from "../config";
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from "react-router-dom";

const Login = ({ onSuccess, onSwitch, isDarkMode, rememberMe, setRememberMe }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const loading = toast.loading("로그인 중...");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      const { user } = response.data;
      toast.success(`${user.username}님, 반갑습니다`, { id: loading });
      
      if (onSuccess) onSuccess(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "로그인 실패", { id: loading });
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500 ${
    isDarkMode 
      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
      : 'bg-white border-slate-200 text-slate-800'
  }`;

  return (
    <div className={`max-w-md w-full p-8 rounded-3xl shadow-2xl transition-all duration-300 border ${
      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
    }`}>
      <h2 className={`text-3xl font-black mb-8 text-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>OneResume</h2>
      
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className={`block text-sm font-bold mb-2 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>이메일</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="example@gmail.com" required />
        </div>
        <div>
          <label className={`block text-sm font-bold mb-2 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>비밀번호</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" required />
        </div>

        {/* 로그인 상태 유지 & 비밀번호 찾기 링크 추가 */}
<div className="flex items-center justify-between px-1">
          <label className="flex items-center cursor-pointer group">
            <div className="relative">
              {/* 실제 데이터 처리를 위한 숨겨진 체크박스 */}
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only peer"
              />
              {/* 둥근 네모 커스텀 UI */}
              <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center
                ${isDarkMode 
                  ? 'bg-slate-800 border-slate-600 peer-checked:bg-blue-600 peer-checked:border-blue-600 group-hover:border-slate-500' 
                  : 'bg-white border-slate-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 group-hover:border-slate-400'
                }`}>
                {/* 체크 표시 (✓) */}
                <svg 
                  className={`w-3.5 h-3.5 text-white transition-transform duration-200 ${
                    rememberMe ? 'scale-100' : 'scale-0'
                  }`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth="4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <span className={`ml-2.5 text-sm font-semibold transition-colors ${
              isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-700'
            }`}>
              로그인 유지
            </span>
          </label>
          <Link to="/forgot-password" className="text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors">
            비밀번호를 잊으셨나요?
          </Link>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-700 shadow-lg transition-all active:scale-95">
          로그인
        </button>
      </form>

      <div className="mt-8 text-center">
        <button onClick={onSwitch} className={`text-sm font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          아직 계정이 없으신가요? <span className="text-blue-500 hover:underline font-bold ml-1">회원가입</span>
        </button>
      </div>
    </div>
  );
};

export default Login;