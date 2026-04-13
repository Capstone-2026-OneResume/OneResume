import React from "react";
import { GitHubCalendar } from "react-github-calendar";
import { Mail, Phone, MapPin, User, Globe } from "lucide-react";

// Lucide에서 Github 아이콘을 찾을 수 없는 경우를 위한 수동 정의
const GithubIcon = ({ size = 14, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const ResumePreview = React.forwardRef(({ 
  formData, 
  isDarkMode, 
  paneWidth = 50, 
  focusedPage, 
  setFocusedPage,
  containerHeight = 0,
  scale = 1.0,
  marginTop = 0
}, ref) => {
  
  const getGithubUsername = (url) => {
    if (!url) return null;
    let username = url.trim();
    if (username.includes("github.com/")) {
      const splitUrl = username.split("github.com/")[1];
      username = splitUrl.split("/")[0];
    }
    return username;
  };

  const githubUsername = getGithubUsername(formData.githubUrl);

  const theme = {
    container: isDarkMode ? "bg-zinc-800 text-zinc-100" : "bg-white text-zinc-900",
    name: isDarkMode ? "text-white" : "text-zinc-900",
    bio: isDarkMode ? "text-zinc-400" : "text-zinc-500",
    divider: isDarkMode ? "border-zinc-700" : "border-zinc-200",
    sectionTitle: isDarkMode ? "text-zinc-200 border-zinc-700" : "text-zinc-800 border-zinc-800",
    textMain: isDarkMode ? "text-zinc-200" : "text-zinc-800",
    textSub: isDarkMode ? "text-zinc-400" : "text-zinc-600",
    infoIcon: isDarkMode ? "text-zinc-500" : "text-zinc-400",
    skillBg: isDarkMode ? "bg-zinc-700 text-zinc-200" : "bg-zinc-100 text-zinc-700",
    boxBg: isDarkMode ? "bg-zinc-900/50 border-zinc-700" : "bg-gray-50 border-zinc-200",
    timelineLine: isDarkMode ? "border-zinc-700" : "border-zinc-300",
    link: isDarkMode ? "text-blue-400" : "text-blue-600",
  };

  const calendarTheme = {
    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  };

  const cols = paneWidth > 75 ? 4 : (paneWidth > 55 ? 3 : (paneWidth > 30 ? 2 : 1));

  // 1열이 되면 자동으로 확대 모드 해제
  React.useEffect(() => {
    if (cols === 1 && focusedPage !== null) {
      setFocusedPage(null);
    }
  }, [cols, focusedPage, setFocusedPage]);

  const handlePageClick = (pageNumber) => {
    if (focusedPage === pageNumber) setFocusedPage(null);
    else if (cols > 1) setFocusedPage(pageNumber);
  };

  // 링크 클릭 시 확대 이벤트 방지 함수
  const handleLinkClick = (e) => {
    e.stopPropagation(); // 부모의 handlePageClick이 실행되지 않게 함
  };

  const pages = [];
  pages.push({ id: 1, content: (
    <>
      <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
      <div className={`border-b-2 pb-10 mb-10 ${theme.divider}`}>
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <h2 className={`text-5xl font-black mb-3 tracking-tighter ${theme.name}`}>{formData.username || "이름 없음"}</h2>
            <p className={`text-xl font-bold mb-6 ${theme.bio}`}>{formData.bio || "한 줄 소개가 없습니다."}</p>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {formData.email && (
                <div className="flex items-center gap-2">
                  <Mail size={14} className={theme.infoIcon} />
                  <span className={`text-sm font-bold ${theme.textMain}`}>{formData.email}</span>
                </div>
              )}
              {formData.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className={theme.infoIcon} />
                  <span className={`text-sm font-bold ${theme.textMain}`}>{formData.phone}</span>
                </div>
              )}
              {formData.address && (
                <div className="flex items-center gap-2 col-span-2">
                  <MapPin size={14} className={theme.infoIcon} />
                  <span className={`text-sm font-bold ${theme.textMain}`}>
                    {formData.address}
                    {formData.addressDetail && ` ${formData.addressDetail}`}
                  </span>
                </div>
              )}
              {(formData.age || formData.gender) && (
                <div className="flex items-center gap-2">
                  <User size={14} className={theme.infoIcon} />
                  <span className={`text-sm font-bold ${theme.textMain}`}>
                    {formData.age ? (formData.useInternationalAge ? `만 ${formData.age}세` : `${formData.age}세`) : ""}
                    {formData.gender && ` (${formData.gender === 'male' ? '남' : '여'})`}
                  </span>
                </div>
              )}
              {formData.githubUrl && (
                <div className="flex items-center gap-2">
                  <GithubIcon size={14} className={theme.infoIcon} />
                  <a href={formData.githubUrl} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick} className={`text-sm font-bold hover:underline ${theme.link}`}>GitHub</a>
                </div>
              )}
              {formData.blogUrl && (
                <div className="flex items-center gap-2">
                  <Globe size={14} className={theme.infoIcon} />
                  <a href={formData.blogUrl} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick} className={`text-sm font-bold hover:underline ${theme.link}`}>Blog</a>
                </div>
              )}
            </div>
          </div>
          {formData.profileImageUrl && (
            <div className="ml-8 shrink-0">
              <img src={formData.profileImageUrl} alt="프로필" className="w-36 h-44 object-cover rounded-2xl shadow-xl border-2 border-zinc-100" />
            </div>
          )}
        </div>
      </div>

      <section className="mb-12">
        <h3 className={`text-sm uppercase tracking-widest font-black mb-5 border-b-2 pb-1 inline-block ${theme.sectionTitle}`}>Education</h3>
        <div className="flex justify-between items-start mt-2">
          <div>
            <p className={`text-2xl font-black ${theme.textMain}`}>{formData.school || "학교 정보 없음"}</p>
            <p className={`text-lg font-bold mt-1 ${theme.textSub}`}>{formData.major}</p>
          </div>
          {formData.gpa && (
            <div className={`px-4 py-2 rounded-xl border-2 font-black text-blue-600 ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
              GPA: {formData.gpa}
            </div>
          )}
        </div>
      </section>

      <section>
        <h3 className={`text-sm uppercase tracking-widest font-black mb-5 border-b-2 pb-1 inline-block ${theme.sectionTitle}`}>Technical Skills</h3>
        <div className="flex flex-wrap gap-2.5 mt-2">
          {formData.skills ? formData.skills.split(",").map((s, i) => (
            <span key={i} className={`px-4 py-1.5 rounded-xl text-sm font-black transition-all ${theme.skillBg} hover:scale-105`}>{s.trim()}</span>
          )) : <p className="text-sm opacity-40">기술 스택을 입력해주세요.</p>}
        </div>
      </section>
      <div className="absolute bottom-8 right-10 text-[10px] opacity-30 font-bold tracking-tighter italic">PAGE 01</div>
    </>
  )});

  if (githubUsername || formData.projects.length > 0) {
    pages.push({ id: 2, content: (
      <>
        {githubUsername && (
          <section className="mb-10">
            <h3 className={`text-xs uppercase tracking-widest font-black mb-5 border-b-2 pb-1 ${theme.sectionTitle}`}>Contributions</h3>
            <div className={`flex justify-center p-6 border rounded-2xl ${theme.boxBg}`}>
              <GitHubCalendar username={githubUsername} blockSize={10} blockMargin={4} fontSize={10} colorScheme={isDarkMode ? "dark" : "light"} theme={calendarTheme} />
            </div>
          </section>
        )}
        <section>
          <h3 className={`text-xs uppercase tracking-widest font-black mb-6 border-b-2 pb-1 ${theme.sectionTitle}`}>Experience</h3>
          <div className="space-y-8">
            {formData.projects.slice(0, 2).map((project, index) => (
              <div key={index} className={`relative pl-6 border-l-2 ${theme.timelineLine}`}>
                <div className="absolute w-3 h-3 rounded-full -left-[7px] top-1.5 bg-blue-600"></div>
                <h4 className={`text-xl font-bold ${theme.textMain}`}>{project.name}</h4>
                <p className={`text-sm mb-2 text-blue-500 font-bold`}>{project.techStack}</p>
                <p className={`text-sm whitespace-pre-wrap ${theme.textSub}`}>{project.description}</p>
              </div>
            ))}
          </div>
        </section>
        <div className="absolute bottom-4 right-8 text-[10px] opacity-30 font-bold tracking-tighter italic">PAGE 02</div>
      </>
    )});
  }

  if (formData.projects.length > 2) {
    pages.push({ id: 3, content: (
      <>
        <section>
          <h3 className={`text-xs uppercase tracking-widest font-black mb-6 border-b-2 pb-1 ${theme.sectionTitle}`}>Projects continued</h3>
          <div className="space-y-8">
            {formData.projects.slice(2, 5).map((project, index) => (
              <div key={index} className={`relative pl-6 border-l-2 ${theme.timelineLine}`}>
                <div className="absolute w-3 h-3 rounded-full -left-[7px] top-1.5 bg-blue-600"></div>
                <h4 className={`text-xl font-bold ${theme.textMain}`}>{project.name}</h4>
                <p className={`text-sm mb-2 text-blue-500 font-bold`}>{project.techStack}</p>
                <p className={`text-sm whitespace-pre-wrap ${theme.textSub}`}>{project.description}</p>
              </div>
            ))}
          </div>
        </section>
        <div className="absolute bottom-4 right-8 text-[10px] opacity-30 font-bold tracking-tighter italic">PAGE 03</div>
      </>
    )});
  }

  pages.push({ id: 4, content: (
    <>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl">
          <span className="text-4xl font-black">O</span>
        </div>
        <h3 className={`text-3xl font-black mb-4 ${theme.name}`}>감사합니다!</h3>
        <p className={`text-lg mb-10 ${theme.bio}`}>제 이력서를 끝까지 봐주셔서 감사합니다.</p>
        <div className={`p-8 border-2 border-dashed rounded-[40px] ${theme.boxBg}`}>
          <p className="text-sm font-bold uppercase tracking-widest mb-4 opacity-50">Contact Info</p>
          <p className={`text-2xl font-black mb-2 ${theme.textMain}`}>{formData.email}</p>
          {formData.blogUrl && (
            <a href={formData.blogUrl} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick} className={`text-lg font-bold hover:underline ${theme.link}`}>{formData.blogUrl}</a>
          )}
        </div>
      </div>
      <div className="absolute bottom-4 right-8 text-[10px] opacity-30 font-bold tracking-tighter italic">PAGE 04</div>
    </>
  )});

  const gap = 8;
  const pageW = 210;
  const pageH = 297;
  const rows = Math.ceil(pages.length / cols);
  const canvasW = `${cols * pageW + (cols - 1) * gap}mm`;
  const canvasH = `${rows * pageH + (rows - 1) * gap}mm`;

  let translateX = "0px";
  let translateY = "0px";
  let zoomScale = 1;

  if (focusedPage) {
    const pageIndex = pages.findIndex(p => p.id === focusedPage);
    const col = pageIndex % cols;
    const row = Math.floor(pageIndex / cols);
    
    const tx = (col * (pageW + gap)) + (pageW / 2);
    const ty = (row * (pageH + gap)) + (pageH / 2);
    
    const canvasCenterX = (cols * pageW + (cols - 1) * gap) / 2;

    translateX = `${canvasCenterX - tx}mm`;
    
    // 수학적 정밀 계산: 컨테이너 중앙(viewportCenterInMm)에서 페이지 중앙(ty)까지의 거리 계산
    // 1mm = 3.7795275591px (96dpi 기준)
    const factor = 3.7795275591;
    const viewportCenterInMm = (containerHeight / 2) / (scale * factor);
    const topMarginInMm = marginTop / (scale * factor);
    
    translateY = `${viewportCenterInMm - ty - topMarginInMm}mm`; 
    zoomScale = 1.0; 
  }

  return (
    <div ref={ref} className="relative flex items-center justify-center transition-all duration-700 ease-in-out" style={{ width: canvasW, height: canvasH }}>
      <div 
        className="relative w-full h-full transition-all duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{ transform: `translate(${translateX}, ${translateY}) scale(${zoomScale})` }}
      >
        {pages.map((page, index) => {
          const isFocused = focusedPage === page.id;
          const isAnyFocused = focusedPage !== null;
          const col = index % cols;
          const row = Math.floor(index / cols);
          const left = `${col * (pageW + gap)}mm`;
          const top = `${row * (pageH + gap)}mm`;

          return (
            <div 
              key={page.id} 
              className={`absolute w-[210mm] h-[297mm] p-[20mm] shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer rounded-[2mm] flex flex-col ${theme.container} ${isFocused ? 'z-[100] !opacity-100 scale-[1.0]' : isAnyFocused ? 'opacity-20 blur-md scale-[0.9]' : 'hover:scale-[1.03] hover:z-50'}`}
              style={{ left, top }}
              onClick={() => handlePageClick(page.id)}
            >
              {page.content}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default ResumePreview;