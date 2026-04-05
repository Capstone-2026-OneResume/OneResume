// 이력서 편집 화면 (ResumeForm, ResumePreview를 포함)
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ResumeForm from "../components/ResumeForm";
import ResumePreview from "../components/ResumePreview";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";

function EditPage() {
  const navigate = useNavigate();
  const resumeRef = useRef();
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [formData, setFormData] = useState({
    username: "", email: "", subdomain: "", profileImageUrl: "", bio: "",
    githubUrl: "", blogUrl: "", resumeTitle: "개발자 이력서", school: "",
    major: "", gpa: "", skills: "",
    projects: [{ id: "init-1", name: "", description: "", role: "", techStack: "", period: "" }],
  });

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
        : [{ id: "init-1", name: "", description: "", role: "", techStack: "", period: "" }],
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("oneresume-token");
      if (!token) {
        toast.error("로그인이 필요합니다.");
        navigate("/");
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.user) {
          const loadedData = mapUserDataToFields(response.data.user);
          const savedImage = localStorage.getItem("oneresume-profile-image");
          if(savedImage) {
            loadedData.profileImageUrl = savedImage;
          }
          setFormData(loadedData);
        }
      } catch (error) {
        console.error("세션 만료:", error);
        localStorage.removeItem("oneresume-token");
        navigate("/");
      }

      const savedTheme = localStorage.getItem("oneresume-theme");
      if (savedTheme) setIsDarkMode(savedTheme === "true");
      setLoading(false);
    };
    checkAuth();
  }, [mapUserDataToFields, navigate]);

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
    toast.success("로그아웃 되었습니다.");
    navigate("/");
  };

  const toggleDarkMode = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("oneresume-theme", newTheme.toString());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("파일 크기는 5MB를 초과할 수 없습니다.");
      return;
    }

    const uploadToast = toast.loading("이미지를 업로드하는 중입니다...");
    const uploadData = new FormData();
    uploadData.append("profileImage", file);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/resume/upload`, {
        method: "POST",
        body: uploadData, 
      });
      const data = await response.json();
      if (response.ok) {
        setFormData({ ...formData, profileImageUrl: data.imageUrl });
        localStorage.setItem("oneresume-profile-image", data.imageUrl);
        toast.success("프로필 사진이 성공적으로 등록되었습니다", { id: uploadToast });
      } else {
        toast.error(data.message || "업로드에 실패했습니다.", { id: uploadToast });
      }
    } catch (error) {
      console.error("업로드 에러:", error);
      toast.error("서버와 통신 중 에러가 발생했습니다.", { id: uploadToast });
    } finally {
      e.target.value = null;
    }
  };

  const handleGithubSync = async () => {
    let url = formData.githubUrl.trim();
    if (!url) {
      toast.error("GitHub 링크 또는 아이디를 먼저 입력해주세요!");
      return;
    }
    
    let username = url;
    if (url.includes("github.com/")) {
      const splitUrl = url.split("github.com/")[1];
      username = splitUrl.split("/")[0];
    }

    const loadingToast = toast.loading(`${username}님의 데이터를 가져오는 중...`);

    try {
      let repos = [];
      let page = 1;
      let keepFetching = true;

      while (keepFetching) {
        const response = await axios.get(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=100&page=${page}`
        );
        if (response.data.length === 0) {
          keepFetching = false;
        } else {
          repos = [...repos, ...response.data];
          page++;
        }
        if (page > 10) keepFetching = false; 
      }

      if (repos.length === 0) {
        toast.error("공개된 레포지토리가 없습니다.", { id: loadingToast });
        return;
      }

      const fetchedProjects = repos.map((repo, index) => ({
        id: `github-${repo.id || index}-${Date.now()}`,
        name: repo.name || "",
        description: repo.description || "GitHub에서 자동 연동된 프로젝트입니다.",
        role: "Developer",
        techStack: repo.language || "",
        period: `${(repo.created_at || "").substring(0, 7)} ~ ${(repo.updated_at || "").substring(0, 7)}`
      }));

      const repoLanguages = repos.map(r => r.language).filter(Boolean);
      const languages = [...new Set(repoLanguages)].join(", ");

      setFormData(prev => ({
        ...prev,
        skills: prev.skills ? `${prev.skills}, ${languages}` : languages,
        projects: fetchedProjects
      }));

      toast.success(`연동 성공! ${repos.length}개의 프로젝트를 가져왔습니다.`, { id: loadingToast });
    } catch (error) {
      console.error("GitHub 연동 에러:", error);
      toast.error("데이터를 불러오지 못했습니다. 아이디를 확인해주세요.", { id: loadingToast });
    }
  };

  const handleProjectChange = (index, e) => {
    const { name, value } = e.target;
    const newProjects = [...formData.projects];
    newProjects[index][name] = value;
    setFormData({ ...formData, projects: newProjects });
  };

  const addProject = () => {
    setFormData({
      ...formData,
      projects: [...formData.projects, { id: `manual-${Date.now()}`, name: "", description: "", role: "", techStack: "", period: "" }]
    });
    toast.success("새 프로젝트 블록이 추가되었습니다.");
  };

  const removeProject = (index) => {
    const newProjects = formData.projects.filter((_, i) => i !== index);
    setFormData({ ...formData, projects: newProjects });
    toast("항목이 삭제되었습니다.", { icon: '🗑️'});
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(formData.projects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFormData({ ...formData, projects: items });
  };

  const downloadPDF = () => {
    toast.success("PDF 출력을 시작합니다");
    setTimeout(() => window.print(), 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentSubdomain = formData.subdomain.trim().toLowerCase();
    if (!currentSubdomain) {
      toast.error("서브도메인을 입력해주세요");
      return;
    }
    const isValidFormat = /^[a-z0-9]+$/.test(currentSubdomain);
    if (!isValidFormat) {
      toast.error("서브도메인은 영문 소문자와 숫자만 사용할 수 있습니다.");
      return;
    }
    const forbiddenSubdomains = ['www', 'api', 'admin', 'root', 'localhost', 'dev', 'test', 'master', 'main'];
    if (forbiddenSubdomains.includes(currentSubdomain)) {
      toast.error(`'${currentSubdomain}'은(는) 사용할 수 없는 단어입니다.`);
      return;
    }

    const savingToast = toast.loading("데이터 저장 중...");

    fetch(`${API_BASE_URL}/api/resume/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        toast.success("성공적으로 저장 및 퍼블리싱 되었습니다.", { id: savingToast });
        localStorage.removeItem("oneresume-profile-image"); 
      })
      .catch((err) => { 
        console.error("에러:", err);
        toast.error("저장 중 오류가 발생했습니다.", { id: savingToast });
      });
  };

  if (loading) return <div className="text-center py-20">데이터를 불러오는 중...</div>;

  return (
    <div className={`min-h-screen py-12 px-4 font-sans ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
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