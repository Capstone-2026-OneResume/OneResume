import { API_BASE_URL } from "../config";
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from "react-router-dom";

const Login = ({ onSuccess, onSwitch, isDarkMode }) => {
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

        {/* 비밀번호 찾기 링크 추가 */}
        <div className="text-right">
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