import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Signup = ({ onSuccess, isDarkMode }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [step, setStep] = useState(0); // 0: 메일입력, 1: 인증번호, 2: 정보입력

  // 1. 인증번호 발송
  const handleSendCode = async () => {
    const loading = toast.loading("인증번호를 발송 중입니다...");
    try {
      await axios.post('http://localhost:5000/api/auth/send-code', { email });
      toast.success("메일함을 확인해주세요", { id: loading });
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "발송 실패", { id: loading });
    }
  };

  // 2. 인증번호 확인
  const handleVerifyCode = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/verify-code', { email, code });
      toast.success("인증되었습니다! 가입 정보를 입력하세요.");
      setStep(2);
    } catch (err) {
      toast.error("인증번호가 틀렸습니다.");
    }
  };

  // 3. 최종 회원가입
  const handleFinalSignup = async () => {
    const loading = toast.loading("회원가입 처리 중...");
    try {
      await axios.post('http://localhost:5000/api/auth/signup', { email, password, subdomain });
      toast.success("OneResume에 오신 걸 환영합니다", { id: loading });
      onSuccess({ email, subdomain }); // 부모(App.js)로 가입 데이터 전달
    } catch (err) {
      toast.error(err.response?.data?.message || "가입 중 오류 발생", { id: loading });
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500 ${
    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
  }`;

  return (
    <div className={`max-w-md w-full p-8 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
      <h2 className={`text-2xl font-black mb-6 text-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>OneResume 가입</h2>

      <div className="space-y-5">
        {/* 이메일 입력 */}
        <div>
          <label className="block text-sm font-bold text-slate-500 mb-1 ml-1">이메일</label>
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
          <button onClick={handleSendCode} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg">
            인증번호 받기
          </button>
        )}

        {/* 인증번호 확인 */}
        {step === 1 && (
          <div className="animate-fade-in space-y-3">
            <label className="block text-sm font-bold text-slate-500 mb-1 ml-1">인증번호 6자리</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={inputClass}
                placeholder="000000"
              />
              <button onClick={handleVerifyCode} className="bg-slate-800 text-white px-5 py-3 rounded-xl font-bold hover:bg-black">
                확인
              </button>
            </div>
          </div>
        )}

        {/* 비밀번호 & 도메인 설정 */}
        {step === 2 && (
          <div className="animate-slide-up space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1 ml-1">비밀번호</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="8자 이상 입력"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-1 ml-1">개인 도메인</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  className={`${inputClass} text-right`}
                  placeholder="my-domain"
                />
                <span className="font-bold text-slate-400">.oneresume.dev</span>
              </div>
            </div>
            <button onClick={handleFinalSignup} className="w-full bg-emerald-500 text-white py-4 rounded-xl font-black text-lg hover:bg-emerald-600 shadow-xl transition-all active:scale-95">
              가입하고 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;