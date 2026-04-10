import { API_BASE_URL } from "../config";
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, Link } from "react-router-dom";

const Login = ({ onSuccess, onSwitch, isDarkMode, rememberMe, setRememberMe }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const loading = toast.loading("로그인 중...");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      const { user, token } = response.data;

      localStorage.setItem('token', token);
      toast.success(`${user.username}님, 반갑습니다`, { id: loading });
      
      if (onSuccess) {
        onSuccess(response.data);
      }

      // 프로필 설정 완료 여부에 따른 리다이렉트 분기
      if (user.isProfileComplete) {
        navigate('/edit');
      } else {
        navigate('/setup-profile');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "로그인 실패", { id: loading });
    }
  };

  const theme = {
    cardBg: isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-100',
    titleText: isDarkMode ? 'text-zinc-100' : 'text-zinc-800',
    labelText: isDarkMode ? 'text-zinc-400' : 'text-zinc-600',
    inputBg: isDarkMode ? 'bg-zinc-700 border-zinc-600 text-zinc-100' : 'bg-gray-100 border-transparent text-zinc-800',
    subText: isDarkMode ? 'text-zinc-500' : 'text-neutral-400'
  };

  return (
    <div className={`relative w-full max-w-[440px] rounded-[40px] shadow-sm border p-8 md:p-10 flex flex-col gap-5 transition-all duration-300 ${theme.cardBg}`}>
      <div className="text-center space-y-2">
        <div className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-1">
          <span className="text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest">Welcome Back</span>
        </div>
        <h2 className={`text-3xl font-extrabold leading-tight ${theme.titleText}`}>OneResume</h2>
        <p className={`text-xs font-medium ${theme.labelText}`}>통합 이력서 관리를 위한 정밀 데이터 구축</p>
      </div>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className={`pl-1 text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>이메일</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className={`w-full px-5 py-3.5 rounded-[24px] outline-none transition-all focus:ring-2 focus:ring-blue-500 font-medium text-sm ${theme.inputBg}`} 
            placeholder="example@gmail.com" 
            required 
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={`pl-1 text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>비밀번호</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className={`w-full px-5 py-3.5 rounded-[24px] outline-none transition-all focus:ring-2 focus:ring-blue-500 font-medium text-sm ${theme.inputBg}`} 
            placeholder="••••••••" 
            required 
          />
        </div>

        <div className="flex items-center justify-between px-1">
          <label className="flex items-center cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-4 h-4 rounded-md border-2 transition-all duration-200 flex items-center justify-center
                ${isDarkMode 
                  ? 'bg-zinc-700 border-zinc-600 peer-checked:bg-blue-600 peer-checked:border-blue-600' 
                  : 'bg-white border-zinc-300 peer-checked:bg-blue-600 peer-checked:border-blue-600'
                }`}>
                <svg className={`w-3 h-3 text-white transition-transform duration-200 ${rememberMe ? 'scale-100' : 'scale-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <span className={`ml-2 text-[11px] font-bold uppercase tracking-tighter ${theme.labelText}`}>로그인 유지</span>
          </label>
          <Link to="/forgot-password" virtual-link="true" className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-tighter">
            비밀번호 찾기
          </Link>
        </div>

        <button type="submit" className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-[32px] font-bold text-base shadow-lg shadow-blue-700/10 transition-all transform hover:-translate-y-1 active:scale-95 mt-2">
          로그인 →
        </button>
      </form>

      <div className="text-center mt-1 flex flex-col gap-3">
        <button onClick={onSwitch} className={`text-[11px] font-bold uppercase tracking-tighter ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
          아직 계정이 없으신가요? <span className="text-blue-600 dark:text-blue-400 hover:underline ml-1">회원가입 하기</span>
        </button>
        
        <div className={`text-[9px] uppercase leading-3 tracking-tighter ${theme.subText}`}>
          By continuing, you agree to our <span className="text-zinc-600 dark:text-zinc-300 font-bold underline cursor-pointer">Terms of Service</span> and <br/>
          <span className="text-zinc-600 dark:text-zinc-300 font-bold underline cursor-pointer">Privacy Policy</span>.
        </div>
      </div>
    </div>
  );
};

export default Login;