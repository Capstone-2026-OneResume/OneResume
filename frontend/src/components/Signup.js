import { API_BASE_URL } from "../config";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PWD_REGEX, ValidationItem } from '../components/PasswordValidation';

const Signup = ({ onSuccess, onSwitch, isDarkMode }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [step, setStep] = useState(0); 

  const [validations, setValidations] = useState({
    length: false,
    upper: false,
    number: false,
    special: false,
    match: false
  });

  useEffect(() => {
    setValidations({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
      match: password.length > 0 && password === confirmPassword
    });
  }, [password, confirmPassword]);

  const theme = {
    cardBg: isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-100',
    titleText: isDarkMode ? 'text-zinc-100' : 'text-zinc-800',
    labelText: isDarkMode ? 'text-zinc-400' : 'text-zinc-600',
    inputBg: isDarkMode ? 'bg-zinc-700 border-zinc-600 text-zinc-100' : 'bg-gray-100 border-transparent text-zinc-800',
    subText: isDarkMode ? 'text-zinc-500' : 'text-neutral-400'
  };

  const getInputBorderClass = (value, isValidSection) => {
    const baseClass = "w-full px-5 py-3.5 rounded-[24px] border-2 outline-none transition-all duration-200 focus:ring-2 ";
    const bgClass = isDarkMode ? "bg-zinc-700 text-zinc-100 placeholder-zinc-500 " : "bg-gray-100 text-zinc-800 placeholder-zinc-400 ";
    
    if (value.length > 0) {
      return baseClass + bgClass + (
        isValidSection ? "border-emerald-400 focus:border-emerald-400 focus:ring-emerald-400/20" : "border-red-400 focus:border-red-400 focus:ring-red-400/20"
      );
    }
    return baseClass + bgClass + (isDarkMode ? "border-transparent" : "border-transparent");
  };

  const handleSendCode = async () => {
    const loading = toast.loading("인증번호를 발송 중입니다...");
    try {
      await axios.post(`${API_BASE_URL}/api/auth/send-code`, { email });
      toast.success("메일함을 확인해주세요", { id: loading });
      if (!subdomain && email.includes('@')) {
        const suggested = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        setSubdomain(suggested);
      }
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

  const getSubdomainError = (val) => {
    if (!val) return null;
    if (!/^[a-z0-9]+$/.test(val)) return "영문 소문자와 숫자만 사용 가능합니다.";
    const forbidden = ['admin', 'api', 'www', 'mail', 'master', 'root', 'help', 'login', 'dev', 'test', 'support'];
    if (forbidden.includes(val.toLowerCase())) return "사용할 수 없는 도메인입니다.";
    if (val.length < 3) return "3자 이상 입력해주세요.";
    return null;
  };

  const handleFinalSignup = async () => {
    const subError = getSubdomainError(subdomain);
    if (subError) { toast.error(subError); return; }
    if (!PWD_REGEX.test(password)) { toast.error("비밀번호 보안 정책을 확인해주세요."); return; }
    const loading = toast.loading("회원가입 중...");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, { email, password, subdomain });
      toast.success("OneResume에 오신 걸 환영합니다", { id: loading });
      if (onSuccess) onSuccess(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "가입 실패", { id: loading });
    }
  };

  return (
    <div className={`relative w-full max-w-[440px] rounded-[40px] shadow-sm border p-8 md:p-10 flex flex-col gap-5 transition-all duration-300 ${theme.cardBg}`}>
      <div className="text-center space-y-2">
        <h2 className={`text-3xl font-extrabold leading-tight ${theme.titleText}`}>OneResume 가입</h2>
        <p className={`text-xs font-medium ${theme.labelText}`}>통합 이력서 관리를 위한 첫 단계</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className={`pl-1 text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>이메일</label>
          <input 
            type="email" 
            value={email}
            disabled={step > 0}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-5 py-3.5 rounded-[24px] outline-none transition-all focus:ring-2 focus:ring-blue-500 font-medium text-sm ${theme.inputBg}`}
            placeholder="example@gmail.com"
          />
        </div>

        {step === 0 && (
          <button onClick={handleSendCode} className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-[32px] font-bold text-base shadow-lg transition-all active:scale-95">
            인증번호 받기
          </button>
        )}

        {step === 1 && (
          <div className="animate-fade-in space-y-3">
            <label className={`pl-1 text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>인증번호 6자리</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`flex-1 px-5 py-3.5 rounded-[24px] outline-none transition-all focus:ring-2 focus:ring-blue-500 font-medium text-sm ${theme.inputBg}`}
                placeholder="000000"
              />
              <button onClick={handleVerifyCode} className={`px-6 py-3.5 rounded-[24px] font-bold text-sm transition-all whitespace-nowrap ${isDarkMode ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'bg-zinc-800 text-white hover:bg-black'}`}>
                확인
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col gap-1.5">
              <label className={`pl-1 text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>비밀번호</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={getInputBorderClass(password, validations.length && validations.upper && validations.number && validations.special)}
                placeholder="••••••••"
              />
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-2 px-1">
                <ValidationItem isValid={validations.length} text={password.length > 0 && !validations.length ? "8자 미만" : "8자 이상"} isDirty={password.length > 0} />
                <ValidationItem isValid={validations.upper} text={password.length > 0 && !validations.upper ? "대문자 미포함" : "대문자 포함"} isDirty={password.length > 0} />
                <ValidationItem isValid={validations.number} text={password.length > 0 && !validations.number ? "숫자 미포함" : "숫자 포함"} isDirty={password.length > 0} /> 
                <ValidationItem isValid={validations.special} text={password.length > 0 && !validations.special ? "특수문자 미포함" : "특수문자 포함"} isDirty={password.length > 0} /> 
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className={`pl-1 text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>비밀번호 확인</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={getInputBorderClass(confirmPassword, validations.match)}
                placeholder="••••••••"
              />
              <div className="mt-1 px-1">
                <ValidationItem isValid={validations.match} text={confirmPassword.length > 0 && !validations.match ? "비밀번호 불일치" : "비밀번호 일치"} isDirty={confirmPassword.length > 0} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 mb-0.5 ml-1">
                <label className={`text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>개인 도메인</label>
                <div className="group relative flex items-center">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] font-serif font-bold italic cursor-help transition-colors ${isDarkMode ? 'border-zinc-600 text-zinc-500' : 'border-zinc-300 text-zinc-400'}`}>i</div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-zinc-800 text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl pointer-events-none">
                    <p className="leading-relaxed text-center">나만의 고유한 웹 주소입니다.<br/>가입 후 이 주소를 통해 이력서를 볼 수 있습니다.</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-800"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  className={`flex-1 px-5 py-3.5 rounded-l-[24px] outline-none transition-all focus:ring-2 focus:ring-blue-500 font-medium text-sm ${theme.inputBg}`}
                  placeholder="my-domain"
                />
                <span className={`px-4 py-3.5 rounded-r-[24px] font-bold text-sm border-l-0 ${isDarkMode ? 'bg-zinc-700 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>.oneresume.com</span>
              </div>
              <div className="mt-1 ml-1 min-h-[16px]">
                {getSubdomainError(subdomain) ? (
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-tighter animate-pulse">⚠️ {getSubdomainError(subdomain)}</p>
                ) : subdomain ? (
                  <p className="text-[10px] font-bold text-blue-500 dark:text-blue-400 tracking-tighter">✨ 내 주소: <span className="underline font-medium">{subdomain.toLowerCase()}.oneresume.com</span></p>
                ) : (
                  <p className={`text-[9px] font-medium ${theme.labelText}`}>나만의 고유한 이력서 주소를 설정하세요.</p>
                )}
              </div>
            </div>

            <button 
              onClick={handleFinalSignup}
              disabled={!Object.values(validations).every(v => v)}
              className={`w-full py-3.5 rounded-[32px] font-bold text-base shadow-lg transition-all active:scale-95 mt-2 ${Object.values(validations).every(v => v) ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-zinc-300 text-zinc-500 cursor-not-allowed opacity-50'}`}
            >
              가입하고 시작하기 →
            </button>
          </div>
        )}
      </div>

      <div className="text-center mt-1 border-t pt-5 border-zinc-700/20">
        <button onClick={onSwitch} className={`text-[11px] font-bold uppercase tracking-tighter ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
          이미 계정이 있으신가요? <span className="text-blue-600 dark:text-blue-400 hover:underline ml-1">로그인</span>

        </button>
      </div>
    </div>
  );
};

export default Signup;