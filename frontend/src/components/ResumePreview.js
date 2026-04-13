import React from "react";
import { GitHubCalendar } from "react-github-calendar";

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
      <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
      <div className={`border-b-2 pb-8 mb-10 text-center ${theme.divider}`}>
        {formData.profileImageUrl && (
          <div className="flex justify-center mb-8">
            <img src={formData.profileImageUrl} alt="프로필" className="w-32 h-32 rounded-full object-cover border-4 border-zinc-200 shadow-lg" />
          </div>
        )}
        <h2 className={`text-4xl font-black mb-2 ${theme.name}`}>{formData.username || "이름 없음"}</h2>
        <p className={`text-lg font-medium mb-4 ${theme.bio}`}>{formData.bio}</p>
        <div className={`flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-xs font-bold ${theme.textSub}`}>
          {formData.email && <span>{formData.email}</span>}
          {formData.phone && (
            <div className="flex items-center gap-4">
              <span className="opacity-30">|</span>
              <span>{formData.phone}</span>
            </div>
          )}
          {formData.age && (
            <div className="flex items-center gap-4">
              <span className="opacity-30">|</span>
              <span>
                {formData.useInternationalAge ? `만 ${formData.age}세` : `${formData.age}세`}
                {formData.gender && ` (${formData.gender === 'male' ? '남' : '여'})`}
              </span>
            </div>
          )}          {formData.githubUrl && (
            <div className="flex items-center gap-4">
              <span className="opacity-30">|</span>
              <a href={formData.githubUrl} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick} className={`hover:underline ${theme.link}`}>GitHub</a>
            </div>
          )}
          {formData.blogUrl && (
            <div className="flex items-center gap-4">
              <span className="opacity-30">|</span>
              <a href={formData.blogUrl} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick} className={`hover:underline ${theme.link}`}>Blog</a>
            </div>
          )}
        </div>
        </div>      <section className="mb-10">
        <h3 className={`text-xs uppercase tracking-widest font-black mb-4 border-b-2 pb-1 ${theme.sectionTitle}`}>Education</h3>
        <div className="flex justify-between items-end">
          <div><p className={`text-xl font-bold ${theme.textMain}`}>{formData.school}</p><p className={`text-base font-medium ${theme.textSub}`}>{formData.major}</p></div>
          {formData.gpa && <p className="font-bold text-blue-500">GPA: {formData.gpa}</p>}
        </div>
      </section>
      <section>
        <h3 className={`text-xs uppercase tracking-widest font-black mb-4 border-b-2 pb-1 ${theme.sectionTitle}`}>Skills</h3>
        <div className="flex flex-wrap gap-2">
          {formData.skills?.split(",").map((s, i) => (
            <span key={i} className={`px-3 py-1 rounded-full text-xs font-bold ${theme.skillBg}`}>{s.trim()}</span>
          ))}
        </div>
      </section>
      <div className="absolute bottom-4 right-8 text-[10px] opacity-30 font-bold tracking-tighter italic">PAGE 01</div>
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