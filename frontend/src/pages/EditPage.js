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
  const [totalPages, setTotalPages] = useState(1);
  const [windowSize, setWindowSize] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  // ... (window resize effect remains the same) ...

  // --- 네비게이션 핸들러 (무한 루프) ---
  const handlePrevPage = (e) => {
    e.stopPropagation();
    setFocusedPage(prev => (prev === 1 ? totalPages : prev - 1));
  };

  const handleNextPage = (e) => {
    e.stopPropagation();
    setFocusedPage(prev => (prev === totalPages ? 1 : prev + 1));
  };

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
    if (newWidth > 20 && newWidth < 85) setLeftWidth(newWidth);
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
    formData, loading, handleChange, handleProjectChange, handleImageUpload, handleGithubSync,
    addProject, removeProject, handleWorkChange, addWork, removeWork, handleCertChange,
    addCert, removeCert, handleDragEnd, auditContent, handleSubmit
  } = useResume();

  const copyShareLink = () => {
    const currentSubdomain = formData.subdomain?.trim();
    if (!currentSubdomain) { toast.error("서브도메인을 먼저 설정해주세요"); return; }
    const shareUrl = `${window.location.protocol}//${currentSubdomain}.${window.location.hostname}`;
    navigator.clipboard.writeText(shareUrl).then(() => toast.success("링크 복사 완료!"));
  };

  const downloadPDF = () => {
    toast.success("PDF 출력을 준비합니다.");
    setTimeout(() => window.print(), 500);
  };

  if (loading) return <PageLayout isDarkMode={isDarkMode}><div className="h-full flex items-center justify-center animate-pulse text-slate-500 font-bold text-xl">데이터 로딩 중...</div></PageLayout>;

  // --- 동적 스케일 계산 ---
  const leftPanePixelWidth = (leftWidth / 100) * windowSize.width;
  const dynamicFormZoom = Math.min(1.4, Math.max(0.75, leftPanePixelWidth / 800));
  
  const getScale = () => {
    const a4HeightPx = 1122.52;
    if (focusedPage) return (windowSize.height - 76) / a4HeightPx;
    return windowSize.height < 950 ? 0.38 : 0.44;
  };

  const baseScale = getScale();
  const transitionClass = isResizing 
    ? "transition-none" 
    : "transition-all duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)]";

  return (
    <PageLayout isDarkMode={isDarkMode} noPadding={true}>
      <header className={`h-14 px-6 border-b flex items-center justify-between z-20 print:hidden ${isDarkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-zinc-200'}`}>
        <div className="flex items-center gap-3"><div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg font-black">O</div><h1 className={`text-base font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-zinc-800'}`}>OneResume</h1></div>
        <div className="flex items-center gap-3"><ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} /><button onClick={copyShareLink} className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs">링크 복사</button><button onClick={downloadPDF} className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs">PDF</button><button onClick={() => { localStorage.clear(); navigate("/"); }} className="bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs">로그아웃</button></div>
      </header>

      <main className="h-[calc(100vh-56px)] flex overflow-hidden w-full relative print:hidden">
        <div 
          style={{ width: `${leftWidth}%` }} 
          className={`h-full overflow-y-auto custom-scrollbar p-6 border-r ${transitionClass} ${
            isDarkMode ? 'border-zinc-800 bg-zinc-900/30' : 'border-zinc-200 bg-gray-50/30'
          }`}
        >
          <div className="w-full mx-auto pb-10 origin-top-left" style={{ zoom: dynamicFormZoom }}>
            <ResumeForm
              formData={formData} handleChange={handleChange} handleProjectChange={handleProjectChange}
              addProject={addProject} removeProject={removeProject} handleWorkChange={handleWorkChange}
              addWork={addWork} removeWork={removeWork} handleCertChange={handleCertChange}
              addCert={addCert} removeCert={removeCert} handleSubmit={handleSubmit}
              handleGithubSync={handleGithubSync} handleDragEnd={handleDragEnd}
              handleImageUpload={handleImageUpload} auditContent={auditContent}
              isDarkMode={isDarkMode} paneWidth={leftPanePixelWidth}
            />
          </div>
        </div>

        <div onMouseDown={startResizing} className="relative w-1 cursor-col-resize z-50 flex-shrink-0 group"><div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/30 transition-colors" /></div>

        <div 
          style={{ width: `${100 - leftWidth}%` }} 
          className={`hidden lg:flex h-full overflow-hidden relative items-center justify-center ${transitionClass} ${
            isDarkMode ? 'bg-[#09090b]' : 'bg-[#f4f4f5]'
          }`}
        >
          {focusedPage && (
            <div className="absolute inset-0 z-[100] pointer-events-none flex flex-col items-center justify-between p-6 animate-fade-in">
              <div className="w-full flex justify-end pointer-events-auto">
                <button onClick={() => setFocusedPage(null)} className="w-12 h-12 bg-black/60 hover:bg-black/80 backdrop-blur-2xl text-white rounded-xl flex items-center justify-center transition-all shadow-2xl active:scale-90 border border-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="w-full flex justify-between items-center px-2">
                <button onClick={handlePrevPage} className="pointer-events-auto w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-90 border border-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={handleNextPage} className="pointer-events-auto w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-90 border border-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>

              <div className="pointer-events-auto flex items-center gap-4 bg-black/60 backdrop-blur-2xl px-6 py-3 rounded-[24px] border border-white/10 shadow-2xl mb-4">
                <button onClick={() => setFocusedPage(null)} className="flex items-center gap-2 text-white font-black text-xs pr-4 border-r border-white/20 hover:text-blue-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  전체 보기
                </button>
                <span className="text-white/80 font-black text-xs italic tracking-widest pl-2">
                  PAGE {String(focusedPage).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
                </span>
              </div>
            </div>
          )}

          <div className={`w-full h-full flex justify-center items-start ${focusedPage ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`}>
            <div 
              className={`${transitionClass} transform-gpu flex items-center justify-center shrink-0`} 
              style={{ transform: `scale(${baseScale})`, transformOrigin: 'top center', marginTop: '40px', marginBottom: '80px' }}
            >
              <ResumePreview formData={formData} ref={resumeRef} isDarkMode={isDarkMode} paneWidth={100 - leftWidth} focusedPage={focusedPage} setFocusedPage={setFocusedPage} setTotalPages={setTotalPages} containerHeight={windowSize.height - 56} scale={baseScale} marginTop={40} />
            </div>
          </div>
        </div>
      </main>

      <div className="hidden print:block bg-white relative"><ResumePreview formData={formData} isDarkMode={false} printMode={true} /></div>
    </PageLayout>
  );
}

export default EditPage;