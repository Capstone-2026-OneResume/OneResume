// 메인
import React, { useState, useRef, useEffect } from "react";
import ResumeForm from "./components/ResumeForm";
import ResumePreview from "./components/ResumePreview";
import axios from "axios";

function App() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    subdomain: "",
    bio: "",
    githubUrl: "",
    blogUrl: "",
    resumeTitle: "개발자 이력서",
    school: "",
    major: "",
    gpa: "",
    skills: "",
    projects: [
      { id: "init-1", name: "", description: "", role: "", techStack: "", period: "" } //	초기 프로젝트 하나는 빈 값으로 시작 (사용자가 추가하기 전까지는 빈 프로젝트로 유지)
    ],
  });

  const [isSubdomainMode, setIsSubdomainMode] = useState(false);
  const [loading, setLoading] = useState(true);
		const [isDarkMode, setIsDarkMode] = useState(false); //	다크 모드 상태 추가
  const resumeRef = useRef(); //	PDF 변환 시 참조할 이력서 미리보기 영역

  useEffect(() => {
    const host = window.location.hostname;
    const parts = host.split('.');
    const subdomain = (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') ? parts[0] : null;

    if (subdomain) {
      fetchUserData(subdomain);
    } else {
					//	서브도메인이 없을 때는 로컬 스토리지에서 임시 데이터와 테마 설정을 불러옵니다.
					const savedData = localStorage.getItem("oneresume-draft");
					const savedTheme = localStorage.getItem("oneresume-theme");

					if (savedData) {
						setFormData(JSON.parse(savedData));
					}

					if (savedTheme) {
						setIsDarkMode(savedTheme === "true");
					}

					setIsSubdomainMode(false);
					setLoading(false);
    }
  }, []);

		useEffect(() => { //	사용자가 서브도메인 모드가 아닐 때만 로컬 스토리지에 데이터를 저장합니다. (서브도메인 모드에서는 DB에서 불러온 데이터가 최신이므로 저장하지 않음)
			if (!isSubdomainMode && !loading) {
				localStorage.setItem("oneresume-draft", JSON.stringify(formData));
				localStorage.setItem("oneresume-theme", isDarkMode.toString());
			}
		}, [formData, isDarkMode, isSubdomainMode, loading]);

  const fetchUserData = async (subdomain) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/user/${subdomain}`);
      const user = response.data;

      if (user) {
        const resume = user.resumes[0] || {};
        const eduParts = resume.education ? resume.education.split(" | ") : [];
        
        setFormData({
          username: user.username || "",
          email: user.email || "",
          subdomain: user.subdomain || "",
          bio: user.bio || "",
          githubUrl: user.githubUrl || "",
          blogUrl: user.blogUrl || "",
          resumeTitle: resume.title || "개발자 이력서",
          school: eduParts[0] || "",
          major: eduParts[1] || "",
          gpa: eduParts[2] || "",
          skills: resume.skills || "",
          projects: resume.projects?.length > 0
            ? resume.projects.map((p, i) => ({ ...p, id: `db-${i}` })) //	프로젝트마다 고유 ID 추가 (렌더링 최적화용)
            : [{ id: "init-1", name: "", description: "", role: "", techStack: "", period: "" }],
        });
        setIsSubdomainMode(true);
      } 
    } catch (err) {
      console.error("데이터 로드 에러:", err);
      setIsSubdomainMode(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGithubSync = async () => {
    let url = formData.githubUrl.trim();
    if (!url) {
      alert("GitHub 링크 또는 아이디를 먼저 입력해주세요!");
      return;
    }
    
    let username = url;
    if (url.includes("github.com/")) {
      const splitUrl = url.split("github.com/")[1];
      username = splitUrl.split("/")[0];
    }

    try {
      alert(`--- [${username}]님의 GitHub 전체 데이터를 호출합니다 ---`);
      let repos = []; // 전체 레포지토리를 담을 빈 바구니
      let page = 1;
      let keepFetching = true; // 데이터를 계속 가져올지 결정하는 플래그

      // 사용자에게 로딩 중임을 알려줍니다.
      alert(`${username}님의 전체 프로젝트 데이터를 불러오는 중입니다. 프로젝트가 많은 경우 수 초가 걸릴 수 있습니다...`);

      // 데이터를 다 가져올 때까지 반복합니다.
      while (keepFetching) {
        // per_page=100 (깃허브 API 최대치)로 설정하여 한 페이지당 최대한 많이 가져옵니다.
        // sort=updated를 유지하여 최근 업데이트 순으로 데이터를 누적합니다.
        const response = await axios.get(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=100&page=${page}`
        );
        
        if (response.data.length === 0) {
          keepFetching = false; // 더 이상 데이터가 없으면 탈출
        } else {
          repos = [...repos, ...response.data]; // 데이터를 배열에 누적
          page++; // 다음 페이지
        }

        // 무한루프 방지 안전장치: 실제 배포 시에는 제거하거나 더 늘려야 합니다.
        // (깃허브 API 호출 한도를 지키기 위해 안전하게 10페이지까지만)
        if (page > 10) keepFetching = false; 
      }

      if (repos.length === 0) {
        alert("공개된 레포지토리가 없습니다.");
        return;
      }

      // 3. 가져온 전체 데이터 매핑 (수정했던 null 방어막 유지)
      const fetchedProjects = repos.map((repo, index) => ({
								id: `github-${repo.id || index}-{Date.now()}`, //	고유 ID (깃허브 ID + 타임스탬프)
        name: repo.name || "",
        description: repo.description || "GitHub에서 자동 연동된 프로젝트입니다.",
        role: "Developer",
        techStack: repo.language || "", //	대표 언어를 기술 스택으로 간단히 매핑
        period: `${(repo.created_at || "").substring(0, 7)} ~ ${(repo.updated_at || "").substring(0, 7)}`
      }));

      // 4. 기술 스택 추출 (중복 제거)
      const repoLanguages = repos.map(r => r.language).filter(Boolean);
      const languages = [...new Set(repoLanguages)].join(", ");

      // 5. 상태 업데이트
      setFormData(prev => ({
        ...prev,
        skills: prev.skills ? `${prev.skills}, ${languages}` : languages,
        projects: fetchedProjects //	기존 프로젝트와 합칩니다. (원하는 경우 기존 프로젝트를 제거할 수도 있습니다)
      }));

      alert(`GitHub 연동 성공[${username}]님의 전체 프로젝트 ${fetchedProjects.length}개를 모두 가져왔습니다.`);
    } catch (error) {
      console.error("GitHub 연동 에러:", error);
      alert(`GitHub 데이터를 불러오는 데 실패했습니다. 아이디가 [${username}]이 맞는지 확인해주세요. API 호출 제한일 수도 있습니다.`);
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
  };

  const removeProject = (index) => {
    const newProjects = formData.projects.filter((_, i) => i !== index);
    setFormData({ ...formData, projects: newProjects });
  };

		const handleDragEnd = (result) => {
			if	(!result.destination) return; // 드롭 위치가 유효하지 않으면 무시

			const items = Array.from(formData.projects);
			const [reorderedItem] = items.splice(result.source.index, 1); // 드래그한 아이템 제거
			items.splice(result.destination.index, 0, reorderedItem); // 드롭 위치에 아이템 삽입

			setFormData({ ...formData, projects: items }); // 상태 업데이트
		};

  const downloadPDF = () => {
    window.print();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/api/save-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => alert(data.message))
						// 저장 성공 시 로컬스토리지 비우기 (서브도메인 모드에서는 DB에서 불러온 데이터가 최신이므로 저장하지 않음)
      // localStorage.removeItem("oneresume-draft");
      .catch((err) => console.error("에러:", err));
  };

  if (loading) return <div className="text-center py-20">데이터를 불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <header className="text-center mb-12 relative print:hidden">
        <h1 className="text-4xl font-black text-slate-800 mb-2">OneResume</h1>
        <p className="text-slate-500 font-medium text-lg">
          {isSubdomainMode ? `${formData.username}님의 브랜드 페이지` : "통합 이력서 관리를 위한 정밀 데이터 구축"}
        </p>

								{ /*	다크 모드 토글과 PDF 다운로드 버튼 섹션 */}
								<div className="flex items-center justify-center gap-4 mt-6">
									<button
										onClick={() => setIsDarkMode(!isDarkMode)}
										// 다크 모드 토글 버튼 스타일링 (상태에 따라 색상 변경)
            className={`font-bold py-2 px-6 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
              isDarkMode 
                ? "bg-slate-800 hover:bg-slate-900 text-white border border-slate-700" // 다크 모드일 때 (어두운 버튼)
                : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-200" // 라이트 모드일 때 (환하고 깔끔한 흰색 버튼)
            }`}
          >
											{isDarkMode ? "☀️ 라이트 모드" : "🌙 다크 모드"}
										</button>

        <button
          onClick={downloadPDF}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          <span>PDF로 내보내기</span>
        </button>
								</div>
      </header>

      <div className={`max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-center gap-10 ${isSubdomainMode ? 'justify-center' : ''}`}>
        {!isSubdomainMode && (
          <ResumeForm
            formData={formData}
            handleChange={handleChange}
            handleProjectChange={handleProjectChange}
            addProject={addProject}
            removeProject={removeProject}
            handleSubmit={handleSubmit}
            handleGithubSync={handleGithubSync}
												handleDragEnd={handleDragEnd}
          />
        )}
        <div className={isSubdomainMode ? "mx-auto" : ""}>
          <ResumePreview formData={formData} ref={resumeRef} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
}

export default App;