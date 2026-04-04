// 메인
import { API_BASE_URL } from "./config";
import React, { useState, useRef, useEffect } from "react";
import ResumeForm from "./components/ResumeForm";
import ResumePreview from "./components/ResumePreview";
import Signup from "./components/Signup";
import Login from "./components/Login";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

function App() {

  const [formData, setFormData] = useState({
    username: "", //	사용자 이름
    email: "", //	이메일 필드 추가
    subdomain: "", //	서브도메인 추가
				profileImageUrl:	"", //	프로필 이미지 URL 추가
    bio: "", //	자기소개 필드 추가
    githubUrl: "", //	GitHub URL 필드 추가
    blogUrl: "", //	블로그 URL 필드 추가
    resumeTitle: "개발자 이력서", //	이력서 제목 필드 추가
    school: "", //	학교명
    major: "", //	전공
    gpa: "", //	학점
    skills: "", //	기술 스택
    projects: [
      { id: "init-1", name: "", description: "", role: "", techStack: "", period: "" } //	초기 프로젝트 하나는 빈 값으로 시작 (사용자가 추가하기 전까지는 빈 프로젝트로 유지)
    ],
  });

  const [isSubdomainMode, setIsSubdomainMode] = useState(false);
  const [loading, setLoading] = useState(true);
		const [isDarkMode, setIsDarkMode] = useState(false); //	다크 모드 상태 추가
		const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
		const [authMode, setAuthMode] = useState('login');
  const resumeRef = useRef(); //	PDF 변환 시 참조할 이력서 미리보기 영역
		const mapUserDataToFields = (user) => {
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
      // 저장된 프로젝트가 있으면 불러오고, 없으면 빈 입력창 하나 노출
      projects: resume.projects?.length > 0
        ? resume.projects.map((p, i) => ({ ...p, id: `db-${p.id || i}` }))
        : [{ id: "init-1", name: "", description: "", role: "", techStack: "", period: "" }],
    };
  };

  useEffect(() => {
			const checkAuth = async () => {
				const token = localStorage.getItem("oneresume-token"); // 브라우저에서 토큰 꺼내기
    const host = window.location.hostname;
    const parts = host.split('.');
				const isS3 = host.includes('s3-website');
    const subdomain = (parts.length > 1 && !isS3 && parts[0] !== 'www' && parts[0] !== 'localhost') ? parts[0] : null;

				// 만약 서브도메인 모드라면 (누가 내 이력서를 보러 온 거라면)
    if (subdomain) {
      await fetchUserData(subdomain); // 해당 서브도메인으로 사용자 데이터 불러오기
						setLoading(false);
						return;
				}

				// 관리자 모드(localhost)라면 로그인 체크
				if (token) {
					try {
						// 벡엔드에 토큰 보내서 유저 정보 가져오기
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
							setIsLoggedIn(true);
						}
					} catch (error) {
						console.error("세션 만료:", error);
						localStorage.removeItem("oneresume-token"); //	유효하지 않은 토큰은 제거
						setIsLoggedIn(false);
						}
    } else {
					setIsLoggedIn(false);
				}

				// 테마 설정 불러오기
				const savedTheme = localStorage.getItem("oneresume-theme");
				if (savedTheme) setIsDarkMode(savedTheme === "true");

				setLoading(false);
			};

				checkAuth();
			}, []);

			useEffect(() => { //페이지 이탈( 새로고침/닫기 ) 방지 알림 로직 
				const handleBeforeUnload = (e) => {
					// 편집 모드(로그인 상태)이고, 누군가의 이력서를 보는 서브도메인 모드가 아닐 때만 작동
					if (isLoggedIn && !isSubdomainMode) {
						e.preventDefault();
						e.returnValue = ""; // 브라우저 표준 경고창 유도
					}
				};

				window.addEventListener("beforeunload", handleBeforeUnload);
				return () => {
					window.removeEventListener("beforeunload", handleBeforeUnload);
				};
			}, [isLoggedIn, isSubdomainMode]);

			// 공유 링크 복사 함수
			const copyShareLink = () => {
				const currentSubdomain = formData.subdomain.trim();
				if (!currentSubdomain) {
					toast.error("서브도메인을 먼저 설정하고 저장해주세요");
					return;
				}
				const host = window.location.hostname;
				const protocol = window.location.protocol;
				//로컬 환경이나 S3 환경에 맞춰 유동적으로 URL 생성
				//나중에 정식 도메인 연결 시 `${protocol}//${currentSubdomain}.oneresume.com` 형태로 고정 가능
				const shareUrl = `${protocol}//${currentSubdomain}.${host}`;
				navigator.clipboard.writeText(shareUrl).then(() => {
					toast.success("링크가 복사되었습니다");
				}).catch((err) => {
					console.error("복사 실패:", err);
					toast.error("링크 복사에 실패했습니다.");
				});
			};

			// 가입/로그인 성공 시 호출되는 콜백
			const handleAuthSuccess = (data) => {
				if (data.token) { //	백엔드에서 발급한 토큰이 있다면
					localStorage.setItem("oneresume-token", data.token); // 토큰 저장
				}

				const loadedData = mapUserDataToFields(data.user);
				setFormData(loadedData);
				setIsLoggedIn(true); // 로그인 상태로 전환
			};

			// 로그아웃 (테스트용으로 해더 등에 붙이세요)
			const handleLogout = () => {
				localStorage.removeItem("oneresume-token");
				setIsLoggedIn(false);
				setAuthMode('login');
				toast.success("로그아웃 되었습니다.");
			};

			// 다크 모드 토글 및 저장 함수
  const toggleDarkMode = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme); // 화면 상태 변경
    localStorage.setItem("oneresume-theme", newTheme.toString()); // 브라우저에 저장
  };

  const fetchUserData = async (subdomain) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/${subdomain}`);
      const user = response.data;

      if (user) {
        const resume = user.resumes[0] || {};
        const eduParts = resume.education ? resume.education.split(" | ") : [];
        
        setFormData({
          username: user.username || "",
          email: user.email || "",
          subdomain: user.subdomain || "",
          bio: user.bio || "",
										profileImageUrl: user.profileImageUrl || "", //	프로필 이미지 URL도 상태에 반영
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

		const handleImageUpload = async (e) => {
				const file = e.target.files[0];
				if (!file) return;

				if (file.size > 5 * 1024 * 1024) { // 5MB 제한
					toast.error("파일 크기는 5MB를 초과할 수 없습니다.");
					return;
				}

				const uploadToast = toast.loading("이미지를 업로드하는 중입니다...");
				const uploadData = new FormData();
				uploadData.append("profileImage", file);
				
				try {
const response = await fetch(`${API_BASE_URL}/api/upload`, {
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
      e.target.value = null; // 똑같은 사진 다시 올릴 수 있게 인풋 초기화
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
      let repos = []; // 전체 레포지토리를 담을 빈 바구니
      let page = 1;
      let keepFetching = true; // 데이터를 계속 가져올지 결정하는 플래그

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
        toast.error("공개된 레포지토리가 없습니다.", { id: loadingToast });
        return;
      }

      // 3. 가져온 전체 데이터 매핑 (수정했던 null 방어막 유지)
      const fetchedProjects = repos.map((repo, index) => ({
								id: `github-${repo.id || index}-${Date.now()}`, //	고유 ID (깃허브 ID + 타임스탬프)
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

						toast.success(`연동 성공 ${repos.length}개의 프로젝트를 가져왔습니다.`, { id: loadingToast });
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
			if	(!result.destination) return; // 드롭 위치가 유효하지 않으면 무시
			const items = Array.from(formData.projects);
			const [reorderedItem] = items.splice(result.source.index, 1); // 드래그한 아이템 제거
			items.splice(result.destination.index, 0, reorderedItem); // 드롭 위치에 아이템 삽입
			setFormData({ ...formData, projects: items }); // 상태 업데이트
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
				toast.error("서브도메인을 입력해주세요");
				return; 
			}
			if (forbiddenSubdomains.includes(currentSubdomain)) {
				toast.error(`'${currentSubdomain}'은(는) 사용할 수 없는 단어입니다.`);
				return;
			}
			const savingToast = toast.loading("데이터 저장 중...");

    fetch(`${API_BASE_URL}/api/save-resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
							toast.success("성공적으로 저장 및 퍼블리싱 되었습니다.", { id: savingToast });
							localStorage.removeItem("oneresume-profile-image"); // DB저장이 끝났으니까 임시 사진 데이터 삭제.
						})
						// 저장 성공 시 로컬스토리지 비우기 (서브도메인 모드에서는 DB에서 불러온 데이터가 최신이므로 저장하지 않음)
      // localStorage.removeItem("oneresume-draft");
      .catch((err) => { 
							console.error("에러:", err);
							toast.error("저장 중 오류가 발생했습니다.", { id: savingToast });
  });
	};

  if (loading) return <div className="text-center py-20">데이터를 불러오는 중...</div>;

  return (
			<div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
				<Toaster
				position="top-center"
				reverseOrder={false}
				toastOptions={{
					style: {
						borderRadius: '16px', // 모서리를 조금 더 부드럽게
      padding: '16px 24px', // 내부 여백을 넓혀서 키움
      fontSize: '1.1rem',   // 글자 크기를 키움
      maxWidth: '500px',    // 알림창 가로 최대 길이 확장
      fontWeight: '600',    // 글씨를 살짝 굵게 처리
						background: isDarkMode ? '#1e293b' : '#ffffff',
						color: isDarkMode ? '#f8fafc' : '#1e293b',
						boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
					},
				}}
				/>
				
      <header className="text-center mb-12 relative print:hidden">
        <h1 className="text-4xl font-black text-slate-800 mb-2">OneResume</h1>
        <p className="text-slate-500 font-medium text-lg">
          {isSubdomainMode ? `${formData.username}님의 브랜드 페이지` : "통합 이력서 관리를 위한 정밀 데이터 구축"}
        </p>

								{ /*	다크 모드 토글과 PDF 다운로드 버튼 섹션 */}
								<div className="flex items-center justify-center gap-4 mt-6">
									<button
										onClick={toggleDarkMode}
										// 다크 모드 토글 버튼 스타일링 (상태에 따라 색상 변경)
            className={`font-bold py-2 px-6 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
              isDarkMode 
                ? "bg-slate-800 hover:bg-slate-900 text-white border border-slate-700" // 다크 모드일 때 (어두운 버튼)
                : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-200" // 라이트 모드일 때 (환하고 깔끔한 흰색 버튼)
            }`}
          >
											{isDarkMode ? "☀️ 라이트 모드" : "🌙 다크 모드"}
										</button>

										{/* 링크 복사 버튼 */}
										<button
										onClick={copyShareLink}
										className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2"
										>
											<span>링크 복사</span>
										</button>

        <button
          onClick={downloadPDF}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          <span>PDF로 내보내기</span>
        </button>

						{ /* 로그아웃 버튼 */}
						{isLoggedIn && (
							<button onClick={handleLogout} className="bg-red-500 text-white font-bold py-2 px-6 rounded-full shadow-lg">
								로그아웃
							</button>
						)}
				</div>
  </header>

{isSubdomainMode ? (
        // 누군가의 이력서를 보러 온 모드 (서브도메인)
        <div className="mx-auto">
          <ResumePreview formData={formData} ref={resumeRef} isDarkMode={isDarkMode} />
        </div>
      ) : isLoggedIn ? (
        // 관리자 모드: 로그인 성공했을 때 (이력서 편집창)
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
          />
          <ResumePreview formData={formData} ref={resumeRef} isDarkMode={isDarkMode} />
        </div>
      ) : (
        // 관리자 모드: 로그인 안 했을 때 (로그인/회원가입창)
        <div className="flex items-center justify-center min-h-[50vh]">
          {authMode === 'login' ? (
            <Login onSuccess={handleAuthSuccess} onSwitch={() => setAuthMode('signup')} isDarkMode={isDarkMode} />
          ) : (
            <Signup onSuccess={handleAuthSuccess} onSwitch={() => setAuthMode('login')} isDarkMode={isDarkMode} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;