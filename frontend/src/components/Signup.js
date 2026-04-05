import { API_BASE_URL } from "../config";
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Signup = ({ onSuccess, onSwitch, isDarkMode }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [step, setStep] = useState(0); 

  const handleSendCode = async () => {
    const loading = toast.loading("인증번호를 발송 중입니다...");
    try {
      await axios.post(`${API_BASE_URL}/api/auth/send-code`, { email });
      toast.success("메일함을 확인해주세요", { id: loading });
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "발송 실패", { id: loading });
    }
  };

  const handleVerifyCode = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/verify-code`, { email, code });
      toast.success("인증되었습니다! 가입 정보를 입력하세요.");
      setStep(2);
    } catch (err) {
      toast.error("인증번호가 틀렸습니다.");
    }
  };

  const handleFinalSignup = async () => {
    const loading = toast.loading("회원가입 처리 중...");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, { email, password, subdomain });
      toast.success("OneResume에 오신 걸 환영합니다", { id: loading });
      if (onSuccess) onSuccess(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "가입 중 오류 발생", { id: loading });
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
      <h2 className={`text-2xl font-black mb-8 text-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>OneResume 가입</h2>

      <div className="space-y-5">
        <div>
          <label className={`block text-sm font-bold mb-2 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>이메일</label>
          <input 
            type="email" 
            value={email}
            disabled={step > 0}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="example@gmail.com"
          />
        </div>

        {step === 0 && (
          <button onClick={handleSendCode} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95">
            인증번호 받기
          </button>
        )}

        {step === 1 && (
          <div className="animate-fade-in space-y-3">
            <label className={`block text-sm font-bold mb-1 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>인증번호 6자리</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={inputClass}
                placeholder="000000"
              />
              <button onClick={handleVerifyCode} className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-800 text-white hover:bg-black'}`}>
                확인
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className={`block text-sm font-bold mb-2 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>비밀번호</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="8자 이상 입력"
              />
            </div>
            <div>
              <label className={`block text-sm font-bold mb-2 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>개인 도메인</label>
              <div className="flex items-center">
                <input 
                  type="text" 
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  className={`flex-1 p-3 rounded-l-xl border border-r-0 focus:outline-none focus:ring-2 transition-all ${inputClass}`}
                  placeholder="my-domain"
                />
                <span className={`p-3 rounded-r-xl font-bold border border-l-0 ${isDarkMode ? 'bg-slate-700 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                  .oneresume.com
                </span>
              </div>
            </div>
            <button onClick={handleFinalSignup} className="w-full bg-emerald-500 text-white py-4 rounded-xl font-black text-lg hover:bg-emerald-600 shadow-xl transition-all active:scale-95">
              가입하고 시작하기
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 text-center border-t pt-6 border-slate-700/30">
        <button onClick={onSwitch} className={`text-sm font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          이미 계정이 있으신가요? <span className="text-blue-500 hover:underline font-bold ml-1">로그인</span>
        </button>
      </div>
    </div>
  );
};

export default Signup;