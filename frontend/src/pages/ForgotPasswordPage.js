import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

function ForgotPasswordPage({ isDarkMode }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("비밀번호 재설정 메일을 발송 중입니다...");

    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      toast.success("메일이 발송되었습니다.", { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || "메일 발송에 실패했습니다.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    cardBg: isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-100',
    titleText: isDarkMode ? 'text-zinc-100' : 'text-zinc-800',
    labelText: isDarkMode ? 'text-zinc-400' : 'text-zinc-600',
    inputBg: isDarkMode ? 'bg-zinc-700 border-zinc-600 text-zinc-100' : 'bg-gray-100 border-transparent text-zinc-800',
  };

  return (
    <PageLayout isDarkMode={isDarkMode}>
      <div className={`relative w-full max-w-[440px] rounded-[40px] shadow-sm border p-8 md:p-10 flex flex-col gap-5 transition-all duration-300 ${theme.cardBg}`}>
        <div className="text-center space-y-2">
          <h2 className={`text-3xl font-extrabold leading-tight ${theme.titleText}`}>비밀번호 찾기</h2>
          <p className={`text-xs font-medium ${theme.labelText}`}>
            가입하신 이메일 주소를 입력하시면<br/>비밀번호 재설정 링크를 보내드립니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-[32px] font-bold text-base shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "발송 중..." : "재설정 링크 보내기 →"}
          </button>
        </form>

        <div className="text-center mt-1 border-t pt-5 border-zinc-700/20">
          <Link to="/" className={`text-[11px] font-bold uppercase tracking-tighter text-blue-600 dark:text-blue-400 hover:underline`}>
            로그인 화면으로 돌아가기
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}

export default ForgotPasswordPage;