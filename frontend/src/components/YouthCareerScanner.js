import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../config";

const CATEGORIES = [
  { id: "인공지능(AI)", label: "인공지능 / AI" },
  { id: "정보보안", label: "정보보안 / 해킹" },
  { id: "게임개발", label: "게임 / 메타버스" },
  { id: "로봇/IoT", label: "로봇 / 자율주행" },
  { id: "웹/앱개발", label: "웹 / 모바일 앱" },
];

const QUICK_TAGS = [
  "게임할 때 전략 세우고 브리핑하기",
  "새벽까지 숏폼 영상 트렌드 찾아보기",
  "상상한 아이디어나 그림 끄적이기",
  "기계 분해하거나 꿀팁 찾아보기",
  "친구들 고민 들어주고 팩폭하기"
];

const SCAN_LOGS = [
  "관심사 데이터 심층 분석 중...",
  "2036년 미래 IT 직무 매칭 중...",
  "학생 맞춤형 이력서 문장 생성 중...",
  "리포트 생성 완료"
];

export default function YouthCareerScanner({ isDarkMode, onBackToLogin }) {
  const [step, setStep] = useState("input"); // 'input' | 'scanning' | 'result'
  const [name, setName] = useState("");
  const [interest, setInterest] = useState("");
  const [category, setCategory] = useState("인공지능(AI)");
  const [result, setResult] = useState(null);
  const [loadingLogIndex, setLoadingLogIndex] = useState(0);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);

  // URL Query 파라미터(id 또는 data)로부터 모바일 QR 공유 결과 복원
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const scanId = searchParams.get('id');
    const encodedData = searchParams.get('data');

    // 1) 초경량 ID 방식 조회 (API 호출)
    if (scanId) {
      axios.get(`${API_BASE_URL}/api/ai/youth-career-scan/${scanId}`, { timeout: 10000 })
        .then((res) => {
          if (res.data && res.data.name && res.data.targetJob) {
            setResult(res.data);
            setName(res.data.name);
            setInterest(res.data.originalInterest || '');
            setCategory(res.data.category || '인공지능(AI)');
            setStep('result');
            setIsSharedView(true);
          }
        })
        .catch((err) => {
          console.error('스캔 결과 조회 실패:', err);
        });
      return;
    }

    // 2) 하위 호환용 Data 파라미터 복원
    if (encodedData) {
      try {
        const jsonStr = decodeURIComponent(escape(atob(encodedData)));
        const parsedResult = JSON.parse(jsonStr);
        if (parsedResult && parsedResult.name && parsedResult.targetJob) {
          setResult(parsedResult);
          setName(parsedResult.name);
          setInterest(parsedResult.originalInterest || '');
          setCategory(parsedResult.category || '인공지능(AI)');
          setStep('result');
          setIsSharedView(true);
        }
      } catch (e) {
        console.error('공유 데이터 디코딩 실패:', e);
      }
    }
  }, []);

  useEffect(() => {
    let interval;
    if (step === "scanning") {
      setLoadingLogIndex(0);
      interval = setInterval(() => {
        setLoadingLogIndex((prev) => (prev < SCAN_LOGS.length - 1 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleStartScan = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("이름을 입력해주세요.");
      return;
    }
    if (!interest.trim()) {
      toast.error("관심사나 특기를 입력해주세요.");
      return;
    }

    setStep("scanning");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/youth-career-scan`, {
        name: name.trim(),
        interest: interest.trim(),
        itCategory: category
      }, { timeout: 25000 });

      setResult(response.data);
      setStep("result");

    } catch (err) {
      console.error("스캔 실패:", err);
      toast.error("일시적인 네트워크 지연이 발생했습니다. 다시 시도해 주세요.");
      setStep("input");
    }
  };

  const handleReset = () => {
    setName("");
    setInterest("");
    setResult(null);
    setStep("input");
    setIsSharedView(false);
    if (window.location.search) {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  };

  const theme = {
    titleText: isDarkMode ? 'text-white' : 'text-zinc-800',
    subText: isDarkMode ? 'text-zinc-400' : 'text-zinc-500',
    labelText: isDarkMode ? 'text-zinc-300' : 'text-zinc-600',
    inputBg: isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-zinc-500' : 'bg-gray-100 border-transparent text-zinc-800 placeholder-zinc-400',
    cardBg: isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-zinc-200 text-zinc-900',
    boxBg: isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50 border-gray-200'
  };

  const inputBaseClass = `w-full px-5 py-3.5 rounded-[32px] outline-none transition-all font-semibold text-sm ${theme.inputBg} focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 border`;

  // QR 코드용 모바일 결과 다이렉트 확인 링크 (초경량 ID 단축 URL)
  const getShareUrl = () => {
    if (!result) return window.location.href;
    const baseUrl = window.location.origin + window.location.pathname;
    if (result.id) {
      return `${baseUrl}?mode=scanner&id=${result.id}`;
    }
    try {
      const jsonStr = JSON.stringify(result);
      const base64Data = btoa(unescape(encodeURIComponent(jsonStr)));
      return `${baseUrl}?mode=scanner&data=${base64Data}`;
    } catch (e) {
      return window.location.href;
    }
  };
  const currentShareUrl = getShareUrl();
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentShareUrl)}`;

  return (
    <div className="w-full max-w-xl mx-auto py-2">

      {/* 상단 네비게이션 */}
      <div className="flex items-center justify-between mb-5">
        {onBackToLogin ? (
          <button
            type="button"
            onClick={onBackToLogin}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-zinc-300 hover:bg-slate-700' 
                : 'bg-gray-100 border-gray-200 text-zinc-600 hover:bg-gray-200'
            }`}
          >
            ← 로그인으로 이동
          </button>
        ) : <div />}

        <span className="text-[11px] font-medium text-zinc-400">
          대덕구 청소년 진로직업 박람회 특별관
        </span>
      </div>

      {/* STEP 1: 입력 화면 */}
      {step === "input" && (
        <div className="space-y-6">
          <div className="space-y-1.5 text-center lg:text-left">
            <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${theme.titleText}`}>
              2036 커리어 스캐너
            </h2>
            <p className={`text-xs md:text-sm ${theme.subText}`}>
              내가 좋아하는 사소한 습관이나 특기가 10년 뒤 어떤 IT 직무의 무기가 되는지 분석합니다.
            </p>
          </div>

          <form onSubmit={handleStartScan} className="space-y-4">
            {/* 이름 입력 */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-bold ${theme.labelText}`}>
                이름 (또는 닉네임)
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className={inputBaseClass} 
                placeholder="이름 입력" 
                maxLength={15}
                required 
              />
            </div>

            {/* IT 분야 선택 */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-bold ${theme.labelText}`}>
                관심 IT 분야
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`py-2.5 px-3 rounded-2xl border text-center text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                          : isDarkMode
                          ? "bg-slate-800/60 border-slate-700 text-zinc-400 hover:border-slate-600"
                          : "bg-gray-50 border-gray-200 text-zinc-600 hover:bg-gray-100"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 관심사 입력 */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-bold ${theme.labelText}`}>
                평소 찐 관심사 / 특기 / 성격 (솔직하게!)
              </label>
              <input 
                type="text" 
                value={interest} 
                onChange={(e) => setInterest(e.target.value)} 
                className={inputBaseClass} 
                placeholder="예: 발로란트 할 때 브리핑하고 남 탓 안 함, 영상 편집하기" 
                maxLength={80}
                required 
              />

              {/* 빠른 선택 태그 */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_TAGS.map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInterest(tag)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition cursor-pointer ${
                      isDarkMode
                        ? "bg-slate-800/80 border-slate-700 text-zinc-400 hover:text-white"
                        : "bg-gray-100 border-gray-200 text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 시작 버튼 */}
            <button
              type="submit"
              className="w-full py-3.5 mt-3 rounded-[32px] font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-[0.99] transition cursor-pointer"
            >
              커리어 분석 시작
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: 분석 중 화면 */}
      {step === "scanning" && (
        <div className="py-16 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <div className="space-y-1">
            <h3 className={`text-lg font-bold ${theme.titleText}`}>
              맞춤 커리어 심층 분석 중
            </h3>
            <p className="text-xs font-mono text-blue-500">
              {SCAN_LOGS[loadingLogIndex]}
            </p>
          </div>
        </div>
      )}

      {/* STEP 3: 결과 화면 */}
      {step === "result" && result && (
        <div className="space-y-4">
          {isSharedView && (
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-blue-400">
                📱 <strong>{result.name}</strong> 님의 커리어 스캔 결과입니다!
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="shrink-0 text-xs font-bold px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
              >
                나도 해보기
              </button>
            </div>
          )}

          <div className={`p-6 md:p-7 rounded-[32px] border space-y-5 ${theme.cardBg}`}>
            
            {/* 상단 프로필 헤더 (적합도 % 삭제, 깔끔한 직무 강조) */}
            <div className="pb-4 border-b border-zinc-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                2036 맞춤 IT 직무
              </span>
              <h3 className="text-xl md:text-2xl font-black mt-0.5">
                {result.name}
              </h3>
              <p className="text-sm md:text-base font-bold text-blue-600 dark:text-blue-400 mt-1">
                {result.targetJob}
              </p>
            </div>

            {/* 1. 왜 이 직무와 찰떡인가? (특기와의 연계 이유) */}
            {result.whyFit && (
              <div className={`p-4 rounded-2xl border space-y-1.5 ${theme.boxBg}`}>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  왜 이 직무가 나에게 딱 맞을까요?
                </span>
                <p className="text-xs md:text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed font-medium">
                  {result.whyFit}
                </p>
              </div>
            )}

            {/* 2. 이력서 문장 변환 */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-400">
                이력서 전문 역량 변환
              </span>

              <div className="p-4 rounded-2xl border-2 border-blue-500/30 bg-blue-500/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    내가 쓴 내용: "{result.originalInterest}"
                  </span>
                </div>
                <p className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-white leading-relaxed">
                  {result.transformedSkill}
                </p>
              </div>
            </div>

            {/* 3. 핵심 역량 키워드 */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-zinc-400">
                도출된 핵심 강점
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.coreStrengths?.map((strength, idx) => (
                  <span 
                    key={idx} 
                    className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-zinc-200' 
                        : 'bg-gray-100 border-gray-200 text-zinc-700'
                    }`}
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>

            {/* 4. 가상 프로젝트 이력 */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-400">
                2036 추천 프로젝트 이력
              </span>
              <div className="space-y-2">
                {result.virtualProjects?.map((proj, idx) => (
                  <div key={idx} className={`p-3 rounded-2xl border space-y-1 ${theme.boxBg}`}>
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100">
                      {proj.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. 멘토 조언 */}
            {result.advice && (
              <div className={`p-3.5 rounded-2xl border ${theme.boxBg}`}>
                <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-0.5">
                  멘토의 한마디:
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {result.advice}
                </p>
              </div>
            )}

            {/* 워터마크 */}
            <div className="pt-2 flex items-center justify-between text-[10px] text-zinc-400">
              <span>OneResume Career Engine</span>
              <span>한남대학교 컴퓨터공학과</span>
            </div>
          </div>

          {/* 하단 액션 버튼 */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowQrModal(true)}
              className="py-3 px-3 rounded-[32px] font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition cursor-pointer"
            >
              휴대폰으로 저장 (QR)
            </button>

            <button
              onClick={handleReset}
              className={`py-3 px-3 rounded-[32px] font-bold text-xs border transition cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-zinc-300 hover:bg-slate-700' 
                  : 'bg-white border-gray-300 text-zinc-700 hover:bg-gray-100'
              }`}
            >
              다른 내용으로 해보기
            </button>
          </div>
        </div>
      )}

      {/* QR 모달 */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-xs w-full p-5 rounded-[28px] border shadow-xl text-center space-y-3 ${theme.cardBg}`}>
            <h4 className="font-bold text-sm">휴대폰 카메라로 스캔하세요</h4>
            <p className="text-xs text-zinc-400">
              화면을 열어 캡처하거나 저장할 수 있습니다.
            </p>

            <div className="p-2.5 bg-white rounded-xl inline-block border">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-40 h-40 mx-auto"
              />
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-[32px] bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
