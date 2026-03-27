// 메인
import React, { useState, useRef, useEffect } from "react";
import ResumeForm from "./components/ResumeForm";
import ResumePreview from "./components/ResumePreview";
import axios from "axios";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
				subdomain: "",
				bio: "",
				githubUrl: "",
				blogUrl: "",
				resumeTitle: "개발자 이력서",
    education: "",
    skills: "",
				projects: [
					{ name: "", description: "", role: "", techStack: "", period: "" } // 프로젝트 동적 배열
				],
    // summary: "",
    // experience: "",
  });

		const [isSubdomainMode, setIsSubdomainMode] = useState(false);
		const [loading, setLoading] = useState(true);
  const resumeRef = useRef();

		useEffect(() => {
			// 1. 서브도메인 판별 로직
			const host = window.location.hostname;
			const parts = host.split('.');

			// localhost 테스트 시: leader.localhost:3000 ->  parts는 ['leader', 'localhost']
			// 배포 시: leader.oneresume.com -> parts는 ['leader', 'oneresume', 'com']
			const subdomain = (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost' ) ? parts[0] : null;

			if (subdomain) {
				fetchUserData(subdomain);
			} else {
				setIsSubdomainMode(false);
				setLoading(false);
			}
		}, []);

		// 2. DB에서 유저 데이터 가져오기 (서브도메인용)
		const fetchUserData = async (subdomain) => {
			try {
				//EC2 배포  IP 주소 사용
				const response = await axios.get(`http://3.38.246.44:5000/api/user/${subdomain}`);
				const user = response.data;

				if (user) {
					//  DB 데이터 구조를 현재 From 데이터 형식에 맞게 매핑
					const resume = user.resumes[0] || {};
					setFormData({
						name: user.username || "",
						email: user.email || "",
						subdomain: user.subdomain || "",
						bio: user.bio || "",
						githubUrl: user.githubUrl || "",
						blogUrl: user.blogUrl || "",
						resumeTitle: resume.title || "이력서",
						education: resume.education || "", //DB 설계에 따라 보완 필요.
						skills: resume.projects?.length > 0
						? resume.projects
						: [{ name: "", description: "", role: "", techStack: "", period: "" }],
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

		// 동적 프로젝트 입력 핸들러
		const handleProjectChange = (index, e) => {
			const { name, value } = e.target;
			const newProjects = [...formData.projects];
			newProjects[index][name] = value;
			setFormData({ ...formData, projects: newProjects });
		};

		// 프로젝트 간 추가
		const addProject = () => {
			setFormData({
				...formData,
				projects: [...formData.projects, { name: "", description: "", role: "",techStack: "", period: "" }]
			});
		};

		// 프로젝트 간 삭제
		const removeproject = (index) => {
			const newProjects = formData.projects.filter((_, i) => i !== index);
			setFormData({ ...formData, projects: newProjects });
		};

  const downloadPDF = () => {
    window.print();
  };

		// 서버로 전송
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/api/save-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => alert(data.message))
      .catch((err) => console.error("에러:", err));
  };

		if (loading) return <div className="text-center py-20">데이터를 불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <header className="text-center mb-12 relative print:hidden">
        <h1 className="text-4xl font-black text-slate-800 mb-2">OneResume</h1>
        <p className="text-slate-500 font-medium text-lg">
          {isSubdomainMode ? `${formData.name}님의 브랜드 페이지` : "통합 이력서 관리를 위한 정밀 데이터 구축"}
        </p>
        <button
          onClick={downloadPDF}
          className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2 mx-auto"
        >
          <span>PDF로 내보내기</span>
        </button>
      </header>

      <div className={`max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-center gap-10 ${isSubdomainMode ? 'justify-center' : ''}`}>
							{/* 서브도메인 모드가 아닐 때만 입력 폼을 보여줌 */}
							{!isSubdomainMode && (
        <ResumeForm
          formData={formData}
          handleChange={handleChange}
										handleProjectChange={handleProjectChange}
										addProject={addProject}
										removeproject={removeproject}
          handleSubmit={handleSubmit}
        />
							)}

							{/* 미리보기는 항상 보여주되, 서브도메인 모드면 중앙에 배치 */}
							<div className={isSubdomainMode ? "mx-auto" : ""}>
        <ResumePreview formData={formData} ref={resumeRef} />
      </div>
    </div>
		</div>
  );
}

export default App;