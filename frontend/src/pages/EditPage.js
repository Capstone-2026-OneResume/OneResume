import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ResumeForm from "../components/ResumeForm";
import ResumePreview from "../components/ResumePreview";
import toast from "react-hot-toast";
import useResume from "../hooks/useResume";

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

  // 페이지 이탈 방지 경고
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => { window.removeEventListener("beforeunload", handleBeforeUnload); };
  }, []);

  // 복사 기능 함수 (legacy 지원 포함)
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

  // PDF 출력 함수
  const downloadPDF = () => {
    toast.success("PDF 출력을 시작합니다");
    setTimeout(() => window.print(), 1000);
  };

  if (loading) return <div className="text-center py-20">데이터를 불러오는 중...</div>;

  return (
    <div className={`min-h-screen py-12 px-4 font-sans transition-all duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <header className="text-center mb-12 relative print:hidden">
        <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>OneResume</h1>
        <p className="text-slate-500 font-medium text-lg">통합 이력서 관리를 위한 정밀 데이터 구축</p>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={toggleDarkMode}
            className={`font-bold py-2 px-6 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
              isDarkMode ? "bg-slate-800 hover:bg-slate-900 text-white border border-slate-700" : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-200"
            }`}
          >
            {isDarkMode ? "☀️ 라이트 모드" : "🌙 다크 모드"}
          </button>
          <button onClick={copyShareLink} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2">
            <span>링크 복사</span>
          </button>
          <button onClick={downloadPDF} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2">
            <span>PDF로 내보내기</span>
          </button>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all active:scale-95">
            로그아웃
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-center gap-10">
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
        <ResumePreview formData={formData} ref={resumeRef} isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}

export default EditPage;