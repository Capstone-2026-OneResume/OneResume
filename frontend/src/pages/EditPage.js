import React, { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ResumeForm from "../components/ResumeForm";
import ResumePreview from "../components/ResumePreview";
import toast from "react-hot-toast";
import useResume from "../hooks/useResume";
import PageLayout from "../components/PageLayout";
import ThemeToggle from "../components/ThemeToggle";

function EditPage({ isDarkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const resumeRef = useRef();
  
  const [leftWidth, setLeftWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [focusedPage, setFocusedPage] = useState(null);
  const [windowSize, setWindowSize] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  // 리사이즈 최적화 (Throttle/Debounce 대신 requestAnimationFrame 활용으로 부드럽게)
  useEffect(() => {
    let animationFrameId;
    const handleResize = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      });
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) setLeftWidth(newWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const {
    formData,
    loading,
    handleChange,
    handleProjectChange,
    handleImageUpload,
    handleGithubSync,
    addProject,
    removeProject,
    handleDragEnd,
    auditContent, // AI 함수 가져오기
    handleSubmit
    } = useResume();


  const getPageIds = () => {
    const ids = [1]; // 기본 페이지 1
    const totalProjects = formData.projects.length;
    const hasGithub = formData.githubUrl?.trim();
    
    // 프로젝트나 깃허브 정보가 있으면 프로젝트 페이지들 추가
    if (hasGithub || totalProjects > 0) {
      ids.push(2); // 첫 번째 프로젝트 페이지
      
      // 2개 초과인 경우 추가 페이지들 계산 (ResumePreview 로직과 동일하게 3개씩 끊기)
      const extraProjects = totalProjects - 2;
      if (extraProjects > 0) {
        const extraPages = Math.ceil(extraProjects / 3);
        for (let i = 0; i < extraPages; i++) {
          ids.push(3 + i);
        }
      }
    }
    
    // 맨 마지막 "감사합니다" 페이지 추가
    ids.push(ids.length + 1);
    return ids;
  };

  const handlePrevPage = (e) => {
    e.stopPropagation();
    const ids = getPageIds();
    const currentIndex = ids.indexOf(focusedPage);
    const prevIndex = (currentIndex - 1 + ids.length) % ids.length;
    setFocusedPage(ids[prevIndex]);
  };

  const handleNextPage = (e) => {
    e.stopPropagation();
    const ids = getPageIds();
    const currentIndex = ids.indexOf(focusedPage);
    const nextIndex = (currentIndex + 1) % ids.length;
    setFocusedPage(ids[nextIndex]);
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => { window.removeEventListener("beforeunload", handleBeforeUnload); };
  }, []);

  const copyShareLink = () => {
    const currentSubdomain = formData.subdomain.trim();
    if (!currentSubdomain) {
      toast.error("서브도메인을 먼저 설정하고 저장해주세요");
      return;
    }
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    const shareUrl = `${protocol}//${currentSubdomain}.${host}`;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => toast.success("링크가 복사되었습니다"))
        .catch(() => handleLegacyCopy(shareUrl));
    } else {
      handleLegacyCopy(shareUrl);
    }
  };

  const handleLegacyCopy = (text) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success("링크가 복사되었습니다");
    } catch (err) {
      console.error("복사 실패:", err);
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("oneresume-token");
    sessionStorage.removeItem("oneresume-token");
    toast.success("로그아웃 되었습니다.");
    navigate("/");
  };

  const downloadPDF = () => {
    // 1. 인쇄 시작 알림
    toast.success("PDF 출력을 준비합니다. 'PDF로 저장'을 선택해주세요.");
    
    // 2. 잠시 대기 후 인쇄창 실행 (UI가 정리될 시간)
    setTimeout(() => {
      window.print();
    }, 500);
  };

  if (loading) return (
    <PageLayout isDarkMode={isDarkMode}>
      <div className="h-full flex items-center justify-center animate-pulse text-slate-500 font-bold text-xl">
        데이터를 불러오는 중...
      </div>
    </PageLayout>
  );

  // 화면 높이에 따른 동적 스케일링 (이력서 미리보기용)
  const getScale = () => {
    const headerHeight = 56;
    const a4HeightPx = 1122.52; // 297mm를 96dpi 기준으로 환산한 정밀한 높이

    if (focusedPage) {
      const padding = 20; // 여백을 최소화(상하 10px씩)
      const availableHeight = windowSize.height - headerHeight - padding;
      // 화면 높이에 A4가 딱 맞게 차도록 계산
      return availableHeight / a4HeightPx;
    }
    
    // 일반 그리드 뷰 배율
    if (windowSize.height < 950) return 0.38; 
    if (windowSize.width > 1536) return 0.54;
    if (windowSize.width > 1280) return 0.50;
    return 0.44;
  };

  // 입력 폼 전용 줌 배율 (scale 대신 zoom 사용으로 훨씬 부드러움)
  const getFormZoom = () => {
    if (windowSize.height >= 1000) return 1.0;
    if (windowSize.height < 650) return 0.75;
    if (windowSize.height < 800) return 0.82;
    if (windowSize.height < 950) return 0.90;
    return 1.0;
  };

  const baseScale = getScale();
  const formZoom = getFormZoom();
  const isLaptop = windowSize.height < 950;
  const currentMarginTop = isLaptop ? 20 : 40;

  return (
    <PageLayout isDarkMode={isDarkMode} noPadding={true}>
      <header className={`h-14 min-h-[56px] px-6 border-b flex items-center justify-between z-20 transition-colors duration-300 print:hidden ${
        isDarkMode ? 'bg-zinc-900/80 border-zinc-800 backdrop-blur-md' : 'bg-white/80 border-zinc-200 backdrop-blur-md'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
            <span className="font-black text-base">O</span>
          </div>
          <h1 className={`text-base font-black tracking-tighter hidden md:block ${isDarkMode ? 'text-white' : 'text-zinc-800'}`}>OneResume</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
          <div className="h-5 w-[1px] bg-zinc-700/20 mx-1 hidden sm:block"></div>
          <button onClick={copyShareLink} className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95">링크 복사</button>
          <button onClick={downloadPDF} className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95">PDF</button>
          <button onClick={handleLogout} className="bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95">로그아웃</button>
        </div>
      </header>

      <main className="h-[calc(100vh-56px)] flex overflow-hidden w-full relative print:hidden">
        <div 
          style={{ width: `${leftWidth}%` }}
          className={`h-full overflow-y-auto custom-scrollbar p-4 lg:p-6 border-r transition-none ${
            isDarkMode ? 'border-zinc-800 bg-zinc-900/30' : 'border-zinc-200 bg-gray-50/30'
          }`}
        >
          {/* 폼의 너비 제한을 풀고 와이드하게 사용 */}
          <div className="w-full max-w-[1100px] mx-auto pb-10 px-4" style={{ zoom: formZoom }}>
            <ResumeForm
              formData={formData}
              handleChange={handleChange}
              handleProjectChange={handleProjectChange}
              addProject={addProject}
              removeProject={removeProject}
              handleSubmit={handleSubmit}
              handleGithubSync={handleGithubSync}
              handleDragEnd={handleDragEnd}
              handleImageUpload={handleImageUpload}
              auditContent={auditContent} // AI 함수 전달
              isDarkMode={isDarkMode}
              isCompact={isLaptop || formZoom < 1.0}
            />
          </div>
        </div>

        <div onMouseDown={startResizing} className="relative w-1 group cursor-col-resize z-50 flex-shrink-0">
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/30 transition-colors" />
          <div className="absolute inset-y-0 left-0 w-[1px] bg-zinc-800 transition-colors group-hover:bg-blue-500" />
        </div>

        <div 
          style={{ width: `${100 - leftWidth}%` }}
          className={`hidden lg:flex h-full overflow-hidden custom-scrollbar relative items-center justify-center transition-none ${
            isDarkMode ? 'bg-[#09090b]' : 'bg-[#f4f4f5]'
          }`}
        >
          {/* 그리드 뷰일 때는 items-start, 확대 시에는 items-center로 정확한 중앙 정렬 */}
          <div className={`w-full h-full flex justify-center items-start ${focusedPage ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`}>
            {isResizing && <div className="absolute inset-0 z-40" />}

            {focusedPage && (
              <>
                <button onClick={handlePrevPage} className="absolute left-10 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center group z-50 transition-all duration-300 active:scale-90">
                  <div className="absolute inset-0 bg-zinc-800/20 backdrop-blur-md border border-white/10 rounded-full group-hover:bg-blue-600/20 group-hover:border-blue-500/30 transition-all" />
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 text-white/50 group-hover:text-blue-400 group-hover:-translate-x-0.5 transition-all"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button onClick={handleNextPage} className="absolute right-10 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center group z-50 transition-all duration-300 active:scale-90">
                  <div className="absolute inset-0 bg-zinc-800/20 backdrop-blur-md border border-white/10 rounded-full group-hover:bg-blue-600/20 group-hover:border-blue-500/30 transition-all" />
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 text-white/50 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </>
            )}

            {focusedPage && (
              <button onClick={() => setFocusedPage(null)} className="absolute right-8 top-8 w-12 h-12 rounded-full flex items-center justify-center group z-50 transition-all duration-300 active:scale-90">
                <div className="absolute inset-0 bg-zinc-800/20 backdrop-blur-md border border-white/10 rounded-full group-hover:bg-red-500/20 group-hover:border-red-500/30 transition-all" />
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 text-white/50 group-hover:text-red-400 transition-all"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            )}

            {focusedPage && (
              <button onClick={() => setFocusedPage(null)} className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full flex items-center gap-2 group z-50 transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl">
                <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full group-hover:bg-zinc-800 transition-all" />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 text-blue-400"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                <span className="relative z-10 text-white font-bold text-sm tracking-tight">그리드 뷰</span>
              </button>
            )}

            <div 
              className="transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform-gpu flex items-center justify-center shrink-0"
              style={{ 
                transform: `scale(${baseScale})`, 
                transformOrigin: 'top center', // 기준점을 위쪽으로 고정하여 팅김 방지
                marginTop: `${currentMarginTop}px`,
                marginBottom: '80px'
              }}
            >
              <ResumePreview 
                formData={formData} 
                ref={resumeRef} 
                isDarkMode={isDarkMode} 
                paneWidth={100 - leftWidth}
                focusedPage={focusedPage}
                setFocusedPage={setFocusedPage}
                containerHeight={windowSize.height - 56} // 정확한 뷰포트 높이 전달
                scale={baseScale} // 현재 스케일 전달
                marginTop={currentMarginTop} // 여백 값 전달
              />
            </div>
          </div>
        </div>
      </main>

      {/* 🖨️ 인쇄 전용 영역 (static 흐름으로 변경하여 밀림 방지) */}
      <div className="hidden print:block bg-white relative">
        <ResumePreview 
          formData={formData} 
          isDarkMode={false} 
          printMode={true} 
        />
      </div>
    </PageLayout>
  );
}

export default EditPage;