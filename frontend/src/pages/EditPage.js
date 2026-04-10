import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ResumeForm from "../components/ResumeForm";
import ResumePreview from "../components/ResumePreview";
import toast from "react-hot-toast";
import useResume from "../hooks/useResume";
import PageLayout from "../components/PageLayout";

function EditPage({ isDarkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const resumeRef = useRef();
  
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
    handleSubmit,
  } = useResume();

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
    toast.success("PDF 출력을 시작합니다");
    setTimeout(() => window.print(), 1000);
  };

  if (loading) return (
    <PageLayout isDarkMode={isDarkMode}>
      <div className="h-full flex items-center justify-center animate-pulse text-slate-500 font-bold text-xl">
        데이터를 불러오는 중...
      </div>
    </PageLayout>
  );

  return (
    <PageLayout isDarkMode={isDarkMode} noPadding={true}>
      {/* 1. 상단 바 (고정 높이) */}
      <header className={`h-[72px] min-h-[72px] px-6 border-b flex items-center justify-between z-20 transition-colors duration-300 print:hidden ${
        isDarkMode ? 'bg-zinc-900/80 border-zinc-800 backdrop-blur-md' : 'bg-white/80 border-zinc-200 backdrop-blur-md'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <span className="font-black text-xl">O</span>
          </div>
          <h1 className={`text-xl font-black tracking-tighter hidden md:block ${isDarkMode ? 'text-white' : 'text-zinc-800'}`}>OneResume</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleDarkMode}
            className={`p-2.5 rounded-xl transition-all active:scale-95 border ${
              isDarkMode 
                ? "bg-zinc-800 border-zinc-700 text-yellow-400 hover:bg-zinc-700" 
                : "bg-gray-50 border-zinc-200 text-zinc-600 hover:bg-white"
            }`}
            title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          
          <div className="h-6 w-[1px] bg-zinc-700/20 mx-1 hidden sm:block"></div>

          <button onClick={copyShareLink} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all active:scale-95 flex items-center gap-2">
            <span>링크 복사</span>
          </button>
          <button onClick={downloadPDF} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all active:scale-95 flex items-center gap-2">
            <span>PDF</span>
          </button>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all active:scale-95">
            로그아웃
          </button>
        </div>
      </header>

      {/* 2. 메인 컨텐츠 (화면 꽉 채움) */}
      <main className="flex-1 flex overflow-hidden w-full">
        
        {/* 왼쪽: 입력 폼 (독립 스크롤) */}
        <div className={`w-full lg:w-1/2 h-full overflow-y-auto custom-scrollbar p-6 lg:p-10 border-r transition-colors duration-300 ${
          isDarkMode ? 'border-zinc-800 bg-zinc-900/30' : 'border-zinc-200 bg-gray-50/30'
        }`}>
          <div className="max-w-[720px] mx-auto">
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
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {/* 오른쪽: 미리보기 (독립 스크롤) */}
        <div className={`hidden lg:flex lg:w-1/2 h-full overflow-y-auto custom-scrollbar bg-zinc-500/5 items-start justify-center p-10`}>
          <div className="w-full flex justify-center origin-top transform scale-[0.8] xl:scale-90 2xl:scale-100 transition-all duration-500">
            <ResumePreview formData={formData} ref={resumeRef} isDarkMode={isDarkMode} />
          </div>
        </div>

      </main>
    </PageLayout>
  );
}

export default EditPage;