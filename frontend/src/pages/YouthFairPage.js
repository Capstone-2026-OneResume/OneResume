import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  Sparkles, 
  Cpu, 
  Shield, 
  Gamepad2, 
  Bot, 
  Smartphone, 
  QrCode, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  Award, 
  Sun,
  Moon
} from "lucide-react";
import { API_BASE_URL } from "../config";

const CATEGORIES = [
  { id: "인공지능(AI)", label: "인공지능 & 머신러닝", icon: Bot, color: "from-blue-500 to-indigo-600" },
  { id: "정보보안", label: "화이트해커 & 사이버보안", icon: Shield, color: "from-emerald-500 to-teal-600" },
  { id: "게임개발", label: "게임 엔진 & 가상현실", icon: Gamepad2, color: "from-purple-500 to-pink-600" },
  { id: "로봇/IoT", label: "로봇 & 스마트 모빌리티", icon: Cpu, color: "from-amber-500 to-orange-600" },
  { id: "웹/앱개발", label: "글로벌 웹 & 모바일 앱", icon: Smartphone, color: "from-cyan-500 to-blue-600" },
];

const QUICK_TAGS = [
  "친구들과 게임할 때 전략 오더 내리기",
  "새벽까지 숏폼/트렌드 영상 찾아보기",
  "상상한 아이디어나 그림 끄적이기",
  "기계 분해하거나 꿀팁 찾아보기",
  "친구들 고민 잘 들어주고 팩폭하기"
];

const SCAN_LOGS = [
  "참가자 잠재 성향 데이터 정밀 파싱 중...",
  "2036 차세대 글로벌 IT 채용 트렌드 분석 중...",
  "OneResume 시그니처 환골탈태 자연어 변환 엔진 가동...",
  "마스터 포트폴리오 아키텍처 빌드 완료!"
];

export default function YouthFairPage({ isDarkMode, toggleDarkMode }) {
  const [step, setStep] = useState("input"); // 'input' | 'scanning' | 'result'
  const [name, setName] = useState("");
  const [interest, setInterest] = useState("");
  const [category, setCategory] = useState("인공지능(AI)");
  const [result, setResult] = useState(null);
  const [loadingLogIndex, setLoadingLogIndex] = useState(0);
  const [showQrModal, setShowQrModal] = useState(false);

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

  // 스캔 시작 핸들러
  const handleStartScan = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("이름(또는 닉네임)을 입력해주세요!");
      return;
    }
    if (!interest.trim()) {
      toast.error("나만의 특기나 관심사를 한 줄 입력해주세요!");
      return;
    }

    setStep("scanning");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/youth-career-scan`, {
        name: name.trim(),
        interest: interest.trim(),
        itCategory: category
      }, { timeout: 20000 });

      // 자연스러운 스캔 연출을 위해 최소 2.5초 대기
      setTimeout(() => {
        setResult(response.data);
        setStep("result");
      }, 2500);

    } catch (err) {
      console.error("스캔 실패:", err);
      toast.error("스캔 중 일시적인 지연이 발생했습니다. 안전 모드로 결과를 생성합니다.");
      setTimeout(() => {
        setResult({
          name: name.trim(),
          targetJob: `2036 차세대 ${category} 테크 리드`,
          category: category,
          fitScore: 96,
          originalInterest: interest.trim(),
          transformedSkill: `일상 속 몰입 경험("${interest.trim()}")을 바탕으로 한 심층 데이터 탐색 및 사용자 중심 문제 해결 역량`,
          coreStrengths: ["직관적 통찰력", "자기주도 몰입도", "시스템 최적화 감각"],
          virtualProjects: [
            {
              title: `Project ${category} Vanguard (2034)`,
              description: "차세대 분산 아키텍처 기반의 초저지연 사용자 맞춤형 인터랙션 엔진 구축"
            },
            {
              title: "Neural-Sync Optimizer (2036)",
              description: "복합 사용자 행동 패턴을 분석하여 시스템 처리 속도를 400% 향상시킨 글로벌 서비스 리드"
            }
          ],
          evalComment: `${name.trim()} 님의 고유한 관심사는 10년 뒤 ${category} 분야에서 가장 차별화된 문제 해결 무기가 될 것입니다. 탁월한 몰입 잠재력을 지니고 있어 2036년 글로벌 IT 업계를 이끌 핵심 인재로 강력히 추천합니다.`
        });
        setStep("result");
      }, 2500);
    }
  };

  const handleReset = () => {
    setName("");
    setInterest("");
    setResult(null);
    setStep("input");
  };

  // 현재 브라우저의 전체 URL 기반 QR 링크 (또는 결과 확인용 파라미터)
  const currentShareUrl = window.location.href;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentShareUrl)}`;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
      
      {/* 최상단 네비게이션 헤더 */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between transition-colors ${
        isDarkMode ? "bg-zinc-950/80 border-zinc-800" : "bg-white/80 border-zinc-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-lg">
            1
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight">OneResume</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                한남대 컴공 대표 부스
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">2026 대덕구 청소년 진로직업 박람회 특별관</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {step === "result" && (
            <button
              onClick={handleReset}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                isDarkMode 
                  ? "bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-300" 
                  : "bg-white border-zinc-300 hover:bg-zinc-100 text-zinc-700"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              다음 참가자
            </button>
          )}

          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg border transition ${
              isDarkMode 
                ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-amber-400" 
                : "bg-white border-zinc-200 hover:bg-zinc-100 text-zinc-600"
            }`}
            title="테마 전환"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 메인 컨테이너 */}
      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12">

        {/* STEP 1: 입력 폼 */}
        {step === "input" && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                AI Career Scanner 2036
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                내 사소한 특기가 <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">연봉 1억 스펙</span>으로?!
              </h1>
              <p className={`text-sm md:text-base max-w-lg mx-auto ${isDarkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                내가 좋아하는 것 딱 하나만 적어보세요. OneResume의 AI 엔진이 10년 뒤 당신의 마스터 이력서로 완벽하게 변환해 드립니다.
              </p>
            </div>

            <form onSubmit={handleStartScan} className={`p-6 md:p-8 rounded-2xl border shadow-xl space-y-6 ${
              isDarkMode ? "bg-zinc-900/70 border-zinc-800 shadow-zinc-950/50" : "bg-white border-zinc-200 shadow-zinc-200/50"
            }`}>
              
              {/* 이름 입력 */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  1. 내 이름 (또는 닉네임)
                </label>
                <input
                  type="text"
                  placeholder="예: 김철수, 캡틴박"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-base outline-none transition ${
                    isDarkMode 
                      ? "bg-zinc-950 border-zinc-800 focus:border-emerald-500 text-white placeholder-zinc-600" 
                      : "bg-zinc-50 border-zinc-200 focus:border-emerald-500 text-zinc-900 placeholder-zinc-400"
                  }`}
                  maxLength={15}
                />
              </div>

              {/* IT 분야 선택 칩 */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  2. 가장 관심 가는 IT/SW 분야 (1개 선택)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition duration-200 ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10"
                            : isDarkMode
                            ? "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                            : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300"
                        }`}
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-tr ${cat.color} text-white shadow`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold leading-tight">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 관심사/특기 입력 */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  3. 내 평소 찐 관심사 / 특기 / 취미 (솔직하게!)
                </label>
                <input
                  type="text"
                  placeholder="예: 친구들이랑 롤 할 때 오더 내리기, 밤새 릴스 보기, 그림 그리기"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-base outline-none transition ${
                    isDarkMode 
                      ? "bg-zinc-950 border-zinc-800 focus:border-emerald-500 text-white placeholder-zinc-600" 
                      : "bg-zinc-50 border-zinc-200 focus:border-emerald-500 text-zinc-900 placeholder-zinc-400"
                  }`}
                  maxLength={60}
                />

                {/* 퀵 태그 추천 */}
                <div className="pt-2">
                  <p className="text-[11px] text-zinc-500 mb-2">💡 뭘 써야 할지 모르겠다면 눌러보세요:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_TAGS.map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setInterest(tag)}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                          isDarkMode
                            ? "bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
                            : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300"
                        }`}
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 제출 버튼 */}
              <button
                type="submit"
                className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25 active:scale-[0.99] transition duration-200"
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
                2036 마스터 이력서 스캔 시작
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: 스캐너 애니메이션 화면 */}
        {step === "scanning" && (
          <div className="py-16 text-center space-y-8 animate-fade-in">
            {/* 스캐너 중앙 펄스 그래픽 */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border border-teal-500/40 animate-pulse" />
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center shadow-2xl backdrop-blur-md">
                <Bot className="w-12 h-12 text-emerald-400 animate-bounce" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-black tracking-tight">
                AI 심층 분석 엔진 가동 중...
              </h2>
              <p className="text-xs md:text-sm font-mono text-emerald-500 animate-pulse">
                {SCAN_LOGS[loadingLogIndex]}
              </p>
            </div>

            {/* 터미널 로그 박스 */}
            <div className={`max-w-md mx-auto p-4 rounded-xl border text-left font-mono text-xs space-y-1.5 shadow-inner ${
              isDarkMode ? "bg-zinc-950 border-zinc-800 text-zinc-400" : "bg-zinc-900 border-zinc-800 text-zinc-300"
            }`}>
              <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-800 text-[10px] text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                <span>ONERESUME_ENGINE_V1.8.2</span>
              </div>
              {SCAN_LOGS.slice(0, loadingLogIndex + 1).map((log, idx) => (
                <p key={idx} className="flex items-center gap-1.5 text-zinc-400">
                  <span className="text-emerald-400">✓</span> {log}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: 스캔 결과 리포트 화면 */}
        {step === "result" && result && (
          <div className="animate-fade-in space-y-6">

            {/* 마스터 프로필 카드 */}
            <div className={`p-6 md:p-8 rounded-2xl border shadow-2xl space-y-6 relative overflow-hidden ${
              isDarkMode ? "bg-zinc-900/90 border-zinc-800" : "bg-white border-zinc-200"
            }`}>
              
              {/* 상단 장식 그라데이션 */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

              {/* 프로필 헤더 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      2036 FUTURE TALENT
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      ID: #{Math.floor(100000 + Math.random() * 900000)}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
                    {result.name}
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      후보자
                    </span>
                  </h2>
                  <p className="text-sm font-semibold text-emerald-500 mt-1">
                    🎯 목표 직무: {result.targetJob}
                  </p>
                </div>

                {/* 매칭 적합도 뱃지 */}
                <div className={`px-5 py-3 rounded-xl border flex items-center gap-3 self-start md:self-auto ${
                  isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                }`}>
                  <Award className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-400">AI 직무 적합도</p>
                    <p className="text-2xl font-black text-emerald-400 leading-none">
                      {result.fitScore}<span className="text-sm font-bold text-zinc-400">%</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 🔥 핵심: Before & After 역량 환골탈태 섹션 */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  OneResume AI 핵심 역량 환골탈태
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Before */}
                  <div className={`p-4 rounded-xl border space-y-1.5 ${
                    isDarkMode ? "bg-zinc-950/70 border-zinc-800 text-zinc-400" : "bg-zinc-50 border-zinc-200 text-zinc-600"
                  }`}>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500">
                      BEFORE (내가 적은 일상 표현)
                    </span>
                    <p className="text-sm font-medium italic">
                      "{result.originalInterest}"
                    </p>
                  </div>

                  {/* After */}
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1.5 shadow-sm">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      AFTER (AI 마스터 이력서 문장)
                    </span>
                    <p className="text-sm font-bold text-emerald-500 dark:text-emerald-400 leading-relaxed">
                      {result.transformedSkill}
                    </p>
                  </div>
                </div>
              </div>

              {/* 핵심 보유 역량 태그 */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  핵심 도출 역량 키워드
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.coreStrengths?.map((strength, idx) => (
                    <span 
                      key={idx} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                        isDarkMode 
                          ? "bg-zinc-800 border-zinc-700 text-zinc-200" 
                          : "bg-zinc-100 border-zinc-200 text-zinc-800"
                      }`}
                    >
                      ⚡ {strength}
                    </span>
                  ))}
                </div>
              </div>

              {/* 2036 가상 리드 프로젝트 2건 */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  2036 미래 가상 프로젝트 이력
                </p>
                <div className="space-y-2.5">
                  {result.virtualProjects?.map((proj, idx) => (
                    <div 
                      key={idx}
                      className={`p-3.5 rounded-xl border ${
                        isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                      }`}
                    >
                      <p className="text-xs font-bold text-zinc-200 dark:text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                        {proj.title}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 헤드헌터 총평 */}
              <div className={`p-4 rounded-xl border border-dashed ${
                isDarkMode ? "bg-zinc-950/40 border-zinc-800 text-zinc-300" : "bg-zinc-50/60 border-zinc-300 text-zinc-700"
              }`}>
                <p className="text-xs font-bold text-emerald-500 mb-1">
                  💬 수석 테크 헤드헌터 심사위원 총평:
                </p>
                <p className="text-xs leading-relaxed">
                  "{result.evalComment}"
                </p>
              </div>

              {/* 공식 인증 워터마크 */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>Verified by OneResume Career Engine</span>
                <span>Hannam Univ. Computer Eng.</span>
              </div>
            </div>

            {/* 하단 액션 버튼 그룹 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setShowQrModal(true)}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition"
              >
                <QrCode className="w-4 h-4" />
                내 스마트폰으로 결과 저장 (QR)
              </button>

              <button
                onClick={handleReset}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition ${
                  isDarkMode 
                    ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800" 
                    : "bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                새로운 친구 스캔하기
              </button>
            </div>

            {/* OneResume 서비스 홍보 브릿지 배너 */}
            <div className={`p-5 rounded-xl border ${
              isDarkMode ? "bg-zinc-900/50 border-zinc-800 text-zinc-400" : "bg-white border-zinc-200 text-zinc-600"
            }`}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    OneResume은 어떤 서비스인가요?
                  </h4>
                  <p className="text-xs leading-relaxed">
                    대학생·개발자가 되어 취업할 때, 마스터 이력서 하나만 작성해 두면 
                    <strong className="text-emerald-500"> 사람인·잡코리아 등의 취업 포털에 AI가 1초 만에 자동완성</strong>해 주는 
                    'Zero-Touch' 차세대 취업 지원 플랫폼입니다.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* QR 코드 모달 */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-xs w-full p-6 rounded-2xl border shadow-2xl text-center space-y-4 animate-scale-in ${
            isDarkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
          }`}>
            <h3 className="font-bold text-base">스마트폰 카메라로 스캔하세요!</h3>
            <p className="text-xs text-zinc-400">
              QR 코드를 찍으면 모바일 화면으로 즉시 연결되어 스크린샷 저장이 가능합니다.
            </p>

            <div className="p-4 bg-white rounded-xl inline-block shadow-md">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="w-48 h-48 mx-auto"
              />
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 푸터 크레딧 */}
      <footer className="text-center py-8 text-[11px] text-zinc-500 space-y-1">
        <p>2026 대덕구 청소년 진로직업 박람회 | 한남대학교 컴퓨터공학과 대표 부스</p>
        <p className="font-mono">Created by 박정웅 (Team OneResume)</p>
      </footer>

    </div>
  );
}
