import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";
import { PWD_REGEX, ValidationItem } from '../components/PasswordValidation';
import PageLayout from "../components/PageLayout";

function ResetPasswordPage({ isDarkMode }) {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [validations, setValidations] = useState({
    length: false,
    upper: false,
    number: false,
    special: false,
    match: false,
  });

  useEffect(() => {
    setValidations({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
      match: password.length > 0 && password === confirmPassword,
    });
  }, [password, confirmPassword]);

  const theme = {
    cardBg: isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-100',
    titleText: isDarkMode ? 'text-zinc-100' : 'text-zinc-800',
    labelText: isDarkMode ? 'text-zinc-400' : 'text-zinc-600',
    inputBg: isDarkMode ? 'bg-zinc-700 border-zinc-600 text-zinc-100' : 'bg-gray-100 border-transparent text-zinc-800',
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
		
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!PWD_REGEX.test(password)) { toast.error("비밀번호 보안 정책을 확인해주세요."); return; }
    if (password !== confirmPassword) { toast.error("비밀번호가 일치하지 않습니다."); return; }

    setLoading(true);
    const loadingToast = toast.loading("비밀번호를 변경 중입니다...");

    try {
      await axios.post(`${API_BASE_URL}/api/auth/reset-password`, { token, newPassword: password });
      toast.success("비밀번호가 성공적으로 변경되었습니다!", { id: loadingToast });
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "비밀번호 재설정 실패", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout isDarkMode={isDarkMode}>
      <div className={`relative w-full max-w-[440px] rounded-[40px] shadow-sm border p-8 md:p-10 flex flex-col gap-5 transition-all duration-300 ${theme.cardBg}`}>
        <div className="text-center space-y-2">
          <h2 className={`text-3xl font-extrabold leading-tight ${theme.titleText}`}>새 비밀번호 설정</h2>
          <p className={`text-xs font-medium ${theme.labelText}`}>새로운 비밀번호를 입력해주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className={`pl-1 text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>새 비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={getInputBorderClass(password, validations.length && validations.upper && validations.number && validations.special)}
              placeholder="••••••••"
              required
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
              required
            />
            <div className="mt-1 px-1">
              <ValidationItem isValid={validations.match} text={confirmPassword.length > 0 && !validations.match ? "비밀번호 불일치" : "비밀번호 일치"} isDirty={confirmPassword.length > 0} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !Object.values(validations).every((v) => v)}
            className={`w-full py-3.5 rounded-[32px] font-bold text-base shadow-lg transition-all active:scale-95 mt-2 ${Object.values(validations).every((v) => v) ? "bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white" : "bg-zinc-300 text-zinc-500 cursor-not-allowed opacity-50"}`}
          >
            비밀번호 변경하기 →
          </button>
        </form>
      </div>
    </PageLayout>
  );
}

export default ResetPasswordPage;