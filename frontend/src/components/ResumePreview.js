import React from "react";
import { GitHubCalendar } from "react-github-calendar";

const ResumePreview = React.forwardRef(({ formData, isDarkMode }, ref) => {
  
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

  // 다크모드 여부에 따라 변하는 색상 테마 딕셔너리 (zinc 계열 통일)
  const theme = {
    container: isDarkMode ? "bg-zinc-800 border-zinc-700 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900",
    name: isDarkMode ? "text-white" : "text-zinc-900",
    bio: isDarkMode ? "text-zinc-400" : "text-zinc-500",
    link: isDarkMode ? "text-blue-400" : "text-blue-600",
    sectionTitle: isDarkMode ? "text-zinc-200 border-zinc-700" : "text-zinc-800 border-zinc-800",
    textMain: isDarkMode ? "text-zinc-200" : "text-zinc-800",
    textSub: isDarkMode ? "text-zinc-400" : "text-zinc-600",
    divider: isDarkMode ? "border-zinc-700" : "border-zinc-200",
    skillBg: isDarkMode ? "bg-zinc-700 text-zinc-200 border-zinc-700" : "bg-zinc-100 text-zinc-700 border-zinc-200",
    boxBg: isDarkMode ? "bg-zinc-900/50 border-zinc-700 text-zinc-300" : "bg-gray-50 border-zinc-200 text-zinc-700",
    timelineLine: isDarkMode ? "border-zinc-700" : "border-zinc-300",
    timelineDot: isDarkMode ? "bg-zinc-500" : "bg-zinc-800",
  };

  // 실제 깃허브의 오리지널 잔디 색상표 (Hex Code)
  const calendarTheme = {
    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  };

  return (
    <div
      ref={ref}
      className={`shadow-2xl border-t-[12px] border-t-blue-600 w-[210mm] min-h-[297mm] p-[20mm] text-left flex flex-col box-border overflow-hidden transition-all duration-300 rounded-b-[40px] ${theme.container}`}
      style={{ wordBreak: "break-all" }}
    >
      {/* 헤더 */}
      <div className={`border-b-2 pb-8 mb-10 text-center transition-colors duration-300 ${theme.divider}`}>

        { /* 프로필 사진 렌더링 영역 */ }
        {formData.profileImageUrl && (
          <div className="flex justify-center mb-8">
            <div className={`p-1 rounded-full border-4 ${isDarkMode ? 'border-zinc-700' : 'border-zinc-100'} shadow-xl`}>
              <img
                src={`${formData.profileImageUrl}?v=${new Date().getTime()}`}
                alt="프로필"
                crossOrigin="anonymous"
                className="w-40 h-40 rounded-full object-cover"
              />
            </div>
          </div>
        )}

        <h2 className={`text-5xl font-black mb-3 tracking-tight transition-colors duration-300 ${theme.name}`}>
          {formData.username || "이름 없음"}
        </h2>
        {formData.bio && (
          <p className={`text-xl font-medium mb-6 transition-colors duration-300 ${theme.bio}`}>{formData.bio}</p>
        )}
        
        <div className={`flex justify-center items-center gap-6 text-sm font-semibold transition-colors duration-300 ${theme.textSub}`}>
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {formData.email || "Email"}
          </span>
          
          {formData.githubUrl && (
            <>
              <span className="opacity-30">|</span>
              <a href={formData.githubUrl} target="_blank" rel="noopener noreferrer" className={`hover:text-blue-500 transition-colors duration-300 flex items-center gap-1.5 ${theme.link}`}>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </a>
            </>
          )}
          {formData.blogUrl && (
            <>
              <span className="opacity-30">|</span>
              <a href={formData.blogUrl} target="_blank" rel="noopener noreferrer" className={`hover:text-blue-500 transition-colors duration-300 flex items-center gap-1.5 ${theme.link}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Blog
              </a>
            </>
          )}
        </div>
      </div>

      {/* 본문 영역 */}
      <div className="space-y-10">
        
        {/* 학력 섹션 */}
        {(formData.school || formData.major) && (
          <section>
            <h3 className={`text-xs uppercase tracking-[0.2em] font-black mb-4 border-b-2 pb-1.5 transition-colors duration-300 ${theme.sectionTitle}`}>
              Education
            </h3>
            <div className="flex justify-between items-end px-1">
              <div>
                <p className={`text-xl font-bold transition-colors duration-300 ${theme.textMain}`}>{formData.school || "학교명"}</p>
                <p className={`text-base font-medium transition-colors duration-300 ${theme.textSub}`}>{formData.major || "전공"}</p>
              </div>
              {formData.gpa && (
                <p className={`font-bold transition-colors duration-300 ${theme.bio}`}>GPA: {formData.gpa} / 4.5</p>
              )}
            </div>
          </section>
        )}

        {/* 기술 스택 섹션 */}
        {formData.skills && (
          <section>
            <h3 className={`text-xs uppercase tracking-[0.2em] font-black mb-4 border-b-2 pb-1.5 transition-colors duration-300 ${theme.sectionTitle}`}>
              Skills
            </h3>
            <div className="flex flex-wrap gap-2.5 px-1">
              {formData.skills.split(",").map((s, i) => (
                <span key={i} className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-colors duration-300 ${theme.skillBg}`}>
                  {s.trim()}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* GitHub 잔디밭 섹션 */}
        {githubUsername && (
          <section>
            <h3 className={`text-xs uppercase tracking-[0.2em] font-black mb-5 border-b-2 pb-1.5 transition-colors duration-300 ${theme.sectionTitle}`}>
              Contributions
            </h3>
            <div className={`flex justify-center p-8 border-2 rounded-[32px] overflow-x-auto custom-scrollbar transition-colors duration-300 ${theme.boxBg}`}>
              <GitHubCalendar 
                username={githubUsername} 
                blockSize={12} 
                blockMargin={4} 
                fontSize={12} 
                colorScheme={isDarkMode ? "dark" : "light"}
                theme={calendarTheme}
              />
            </div>
          </section>
        )}

        {/* 프로젝트 섹션 */}
        <section>
          <h3 className={`text-xs uppercase tracking-[0.2em] font-black mb-6 border-b-2 pb-1.5 transition-colors duration-300 ${theme.sectionTitle}`}>
            Projects & Experience
          </h3>
          <div className="space-y-10 px-1">
            {formData.projects.map((project, index) => (
              (project.name || project.description) && (
                <div key={index} className={`relative pl-8 border-l-4 transition-colors duration-300 ${theme.timelineLine}`}>
                  <div className={`absolute w-4 h-4 rounded-full -left-[10px] top-1.5 border-4 ${isDarkMode ? 'bg-blue-500 border-zinc-800' : 'bg-blue-600 border-white'} shadow-md transition-colors duration-300`}></div>
                  
                  <div className="flex justify-between items-baseline mb-2">
                    <h4 className={`text-2xl font-black tracking-tight transition-colors duration-300 ${theme.textMain}`}>{project.name || "프로젝트 명"}</h4>
                    <span className={`text-sm font-bold uppercase tracking-tighter transition-colors duration-300 ${theme.bio}`}>{project.period}</span>
                  </div>
                  
                  {project.techStack && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">Tech</span>
                      <p className={`text-sm font-bold transition-colors duration-300 ${theme.link}`}>{project.techStack}</p>
                    </div>
                  )}
                  
                  <p className={`whitespace-pre-wrap text-base leading-relaxed transition-colors duration-300 font-medium ${theme.textMain}`}>
                    {project.description}
                  </p>
                </div>
              )
            ))}
            
            {/* 비어있을 때 안내 문구 */}
            {formData.projects.length === 1 && !formData.projects[0].name && !formData.projects[0].description && (
              <p className={`text-base italic font-medium transition-colors duration-300 ${theme.textSub}`}>멋진 프로젝트 경험을 추가해 보세요!</p>
            )}
          </div>
        </section>
        
      </div>
    </div>
  );
});

export default ResumePreview;