import { API_BASE_URL } from "./config";
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

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
      
      // 부모(App.js)에게 토큰과 유저 정보를 넘겨줌.
      if (onSuccess) onSuccess(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "로그인 실패", { id: loading });
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500 ${
    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
  }`;

  return (
    <div className={`max-w-md w-full p-8 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
      <h2 className={`text-2xl font-black mb-6 text-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>OneResume 로그인</h2>
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-500 mb-1 ml-1">이메일</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="example@gmail.com" required />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-500 mb-1 ml-1">비밀번호</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" required />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-700 shadow-lg transition-all active:scale-95">
          로그인
        </button>
      </form>
      <div className="mt-6 text-center">
        <button onClick={onSwitch} className="text-sm text-slate-400 hover:text-blue-500 hover:underline">
          아직 계정이 없으신가요? 회원가입
        </button>
      </div>
    </div>
  );
};

export default Login;