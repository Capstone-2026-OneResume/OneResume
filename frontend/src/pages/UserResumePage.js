// 남들이 내 서브도메인으로 들어왔을 때 보여줄 결과 화면
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import ResumePreview from "../components/ResumePreview";
import { API_BASE_URL } from "../config";
import toast from "react-hot-toast";

function UserResumePage({ subdomain }) {
  const resumeRef = useRef();
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState(null);

  const mapUserDataToFields = useCallback((user) => {
    const resume = user.resumes?.[0] || {};
    const eduParts = resume.education ? resume.education.split(" | ") : [];
    return {
      username: user.username || "",
      email: user.email || "",
      subdomain: user.subdomain || "",
      bio: user.bio || "",
      profileImageUrl: user.profileImageUrl || "",
      githubUrl: user.githubUrl || "",
      blogUrl: user.blogUrl || "",
      resumeTitle: resume.title || "개발자 이력서",
      school: eduParts[0] || "",
      major: eduParts[1] || "",
      gpa: eduParts[2] || "",
      skills: resume.skills || "",
      projects: resume.projects?.length > 0
        ? resume.projects.map((p, i) => ({ ...p, id: `db-${p.id || i}` }))
        : [],
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/resume/user/${subdomain}`);
        if (response.data) {
          setFormData(mapUserDataToFields(response.data));
        }
      } catch (err) {
        console.error("데이터 로드 에러:", err);
        toast.error("이력서를 찾을 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    
    const savedTheme = localStorage.getItem("oneresume-theme");
    if (savedTheme) setIsDarkMode(savedTheme === "true");
  }, [subdomain, mapUserDataToFields]);

  const toggleDarkMode = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("oneresume-theme", newTheme.toString());
  };

  const downloadPDF = () => {
    toast.success("PDF 출력을 시작합니다");
    setTimeout(() => window.print(), 1000);
  };

  if (loading) return <div className="text-center py-20">데이터를 불러오는 중...</div>;
  if (!formData) return <div className="text-center py-20 text-xl font-bold">존재하지 않는 페이지입니다.</div>;

  return (
    <div className={`min-h-screen py-12 px-4 font-sans ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <header className="text-center mb-12 relative print:hidden">
        <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>OneResume</h1>
        <p className="text-slate-500 font-medium text-lg">{formData.username}님의 브랜드 페이지</p>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={toggleDarkMode}
            className={`font-bold py-2 px-6 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
              isDarkMode ? "bg-slate-800 hover:bg-slate-900 text-white border border-slate-700" : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-200"
            }`}
          >
            {isDarkMode ? "☀️ 라이트 모드" : "🌙 다크 모드"}
          </button>
          <button onClick={downloadPDF} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2">
            <span>PDF로 내보내기</span>
          </button>
        </div>
      </header>

      <div className="mx-auto">
        <ResumePreview formData={formData} ref={resumeRef} isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}

export default UserResumePage;