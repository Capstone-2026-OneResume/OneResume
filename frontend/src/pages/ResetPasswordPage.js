import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";
import { PWD_REGEX, ValidationItem } from '../components/PasswordValidation';

function ResetPasswordPage({ isDarkMode }) {
  const { token } = useParams(); // URL에서 토큰 추출
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 실시간 유효성 검사 상태
  const [validations, setValidations] = useState({
    length: false,
    upper: false,
    number: false,
    special: false,
    match: false,
  });

  // 비밀번호가 바뀔 때마다 체크 (Signup.js 로직 이식)
  useEffect(() => {
    setValidations({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
      match: password.length > 0 && password === confirmPassword,
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
		
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 최종 보안 검사
    if (!PWD_REGEX.test(password)) {
      toast.error("비밀번호 보안 정책을 확인해주세요.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("비밀번호를 변경 중입니다...");

    try {
      await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        token,
        newPassword: password,
      });

      toast.success("비밀번호가 성공적으로 변경되었습니다!", { id: loadingToast });
      // 변경 성공 후 로그인 페이지로 이동
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "비밀번호 재설정 실패", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center font-sans px-4 ${isDarkMode ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className={`max-w-md w-full p-8 rounded-3xl shadow-2xl border transition-all duration-300 ${
        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
      }`}>
        <h2 className={`text-2xl font-black mb-2 text-center ${isDarkMode ? "text-white" : "text-slate-800"}`}>
          새 비밀번호 설정
        </h2>
        <p className={`text-center text-sm mb-8 font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          새로운 비밀번호를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-bold mb-2 ml-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              새 비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
														className={getInputBorderClass(password, validations.length && validations.upper && validations.number && validations.special)}
              placeholder="••••••••"
              required
            />
            {/* 비밀번호 인디케이터 UI */}
            <div className="grid grid-cols-2 gap-2 mt-3 px-1">
              <ValidationItem isValid={validations.length} text="8자 이상" isDirty={password.length > 0} />
              <ValidationItem isValid={validations.upper} text="대문자 포함" isDirty={password.length > 0} />
              <ValidationItem isValid={validations.number} text="숫자 포함" isDirty={password.length > 0} />
              <ValidationItem isValid={validations.special} text="특수문자 포함" isDirty={password.length > 0} />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-bold mb-2 ml-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              비밀번호 확인
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
														className={getInputBorderClass(confirmPassword, validations.match)}
              placeholder="••••••••"
              required
            />
            <div className="mt-2 ml-1">
              <ValidationItem isValid={validations.match} text="비밀번호 일치" isDirty={confirmPassword.length > 0} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !Object.values(validations).every((v) => v)}
            className={`w-full py-4 rounded-xl font-black text-lg shadow-xl transition-all active:scale-95 ${
              Object.values(validations).every((v) => v)
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-slate-300 text-slate-500 cursor-not-allowed opacity-50"
            }`}
          >
            비밀번호 변경하기
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;