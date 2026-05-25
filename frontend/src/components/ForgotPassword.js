import { API_BASE_URL } from "../config";
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPassword = ({ onSwitch, isDarkMode }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("비밀번호 재설정 메일을 발송 중입니다...");

    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      toast.success("메일이 발송되었습니다. 확인해주세요!", { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || "메일 발송 실패", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    titleText: isDarkMode ? 'text-white' : 'text-zinc-800',
    subText: isDarkMode ? 'text-slate-400' : 'text-zinc-600',
    labelText: isDarkMode ? 'text-slate-300' : 'text-zinc-500',
    inputBg: isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-gray-100 border-transparent text-zinc-800',
  };

  const inputBaseClass = `w-full px-6 py-4 rounded-[48px] outline-none transition-all font-semibold text-base ${theme.inputBg} focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 border-2 border-transparent`;

  return (
    <div className="w-full max-w-md mx-auto space-y-10">
      <div className="space-y-3 text-center lg:text-left">
        <h2 className={`text-4xl font-black tracking-tight ${theme.titleText}`}>비밀번호 찾기</h2>
        <p className={`text-base lg:text-lg font-bold break-keep ${theme.subText}`}>가입하신 이메일을 통해 링크를 전송합니다.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-7">
        <div className="space-y-2">
          <label className={`block text-[14px] font-black uppercase tracking-widest ml-2 ${theme.labelText}`}>이메일 주소</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className={inputBaseClass} 
            placeholder="example@gmail.com" 
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[48px] font-black text-xl shadow-2xl shadow-blue-600/30 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
        >
          {loading ? "발송 중..." : "재설정 링크 보내기 →"}
        </button>
      </form>

      <div className="text-center pt-10 border-t border-zinc-500/10">
        <button onClick={onSwitch} className="text-xs font-black text-blue-600 hover:underline tracking-wider uppercase">로그인 화면으로 돌아가기</button>
      </div>
    </div>
  );
};

export default ForgotPassword;