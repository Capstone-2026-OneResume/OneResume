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

		// 실시간 유효성 검사 상태
		const [validations, setValidations] = useState({
			length: false,
			upper: false,
			number: false,
			special: false,
			match: false
		});

		//비밀번호가 바뀔 때마다 체크
		useEffect(() => {
			setValidations({
				length: password.length >= 8,
				upper: /[A-Z]/.test(password),
				number: /\d/.test(password),
				special: /[@$!%*?&]/.test(password),
				match: password.length > 0 && password === confirmPassword
			});
		}, [password, confirmPassword]);

		// 입력창 테두리 및 배경색 제어 함수
const getInputBorderClass = (value, isValidSection) => {
    const baseClass = "w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-200 focus:ring-2 ";
    const bgClass = isDarkMode ? "bg-slate-900 text-white placeholder-slate-500 " : "bg-white text-slate-800 placeholder-slate-400 ";
    
    if (value.length > 0) {
      return baseClass + bgClass + (
        isValidSection 
          ? // 성공
            "border-emerald-400 focus:border-emerald-400 focus:ring-emerald-400/20" 
          : // 실패
            "border-red-400 focus:border-red-400 focus:ring-red-400/20"
      );
    }
    // 초기 상태
    return baseClass + bgClass + (isDarkMode ? "border-slate-700" : "border-slate-200");
  };

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
			// 가입 전 최종 보안 체크
			if (!PWD_REGEX.test(password)) {
				toast.error("비밀번호 보안 정책을 확인해주세요.");
				return;
			}
    const loading = toast.loading("회원가입 중...");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, { email, password, subdomain });
      toast.success("OneResume에 오신 걸 환영합니다", { id: loading });
      if (onSuccess) onSuccess(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "가입 실패", { id: loading });
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
          <div className="space-y-5 animate-fade-in">
            <div>
              <label className={`block text-sm font-bold mb-2 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>비밀번호</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={getInputBorderClass(password, validations.length && validations.upper && validations.number && validations.special)}
                placeholder="••••••••"
              />
														{ /* 비밀번호 인디케이터 UI */ }
														<div className="grid grid-cols-2 gap-x-2 gap-y-2 mt-3 px-1">
															<ValidationItem isValid={validations.length} text="8자 이상" isDirty={password.length > 0} />
															<ValidationItem isValid={validations.upper} text="대문자 포함" isDirty={password.length > 0} />
															<ValidationItem isValid={validations.number} text="숫자 포함" isDirty={password.length > 0} /> 
															<ValidationItem isValid={validations.special} text="특수문자 포함" isDirty={password.length > 0} /> 
            </div>
										</div>
            <div>
													<label className={`block text-sm font-bold mb-2 ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>비밀번호 확인</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
																			className={getInputBorderClass(confirmPassword, validations.match)}
                  placeholder="••••••••"
                />
																<div className="mt-2 mt-1">
																	<ValidationItem isValid={validations.match} text="비밀번호 일치" isDirty={confirmPassword.length > 0} />
																	</div>
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
            <button 
												onClick={handleFinalSignup}
												disabled={!Object.values(validations).every(v => v)} // 보안 미충족 시 비활성화
												className={`w-full py-4 rounded-xl font-black text-lg shadow-xl transition-all active:scale-95 ${
												Object.values(validations).every(v => v)
												? 'bg-emerald-500 text-white hover:bg-emerald-600'
												: 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-50'
												}`}
												>
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