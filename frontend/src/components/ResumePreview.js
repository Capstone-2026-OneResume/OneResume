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

  // 다크모드 여부에 따라 변하는 색상 테마 딕셔너리
const theme = {
    container: isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-800",
    name: isDarkMode ? "text-slate-100" : "text-slate-900",
    bio: isDarkMode ? "text-slate-400" : "text-slate-500",
    link: isDarkMode ? "text-blue-400" : "text-blue-600",
    sectionTitle: isDarkMode ? "text-slate-200 border-slate-600" : "text-slate-800 border-slate-800",
    textMain: isDarkMode ? "text-slate-200" : "text-slate-800",
    textSub: isDarkMode ? "text-slate-400" : "text-slate-600",
    divider: isDarkMode ? "border-slate-700" : "border-slate-200",
    skillBg: isDarkMode ? "bg-slate-800 text-slate-200 border-slate-700" : "bg-slate-100 text-slate-700 border-slate-200",
    boxBg: isDarkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700",
    timelineLine: isDarkMode ? "border-slate-700" : "border-slate-300",
    timelineDot: isDarkMode ? "bg-slate-500" : "bg-slate-800",
  };

		// 실제 깃허브의 오리지널 잔디 색상표 (Hex Code)
		const calendarTheme = {
    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  };

  return (
    <div
      ref={ref}
      className={`shadow-2xl border-t-[12px] w-[210mm] min-h-[297mm] p-[20mm] text-left flex flex-col box-border overflow-hidden transition-colors duration-500 ${theme.container}`}
      style={{ wordBreak: "break-all" }}
    >
      {/* 헤더 */}
      <div className={`border-b-2 pb-6 mb-8 text-center transition-colors duration-500 ${theme.divider}`}>

							{ /* 프로필 사진 렌더링 영역 추가 */ }
							{formData.profileImageUrl && (
								<div className="flex justify-center mb-6">
								<img
								src={formData.profileImageUrl}
								alt="프로필"
								className="w-36 h-36 rounded-full object-cover border-4 border-slate-200 shadow-md"
								/>
								</div>
							)}

        <h2 className={`text-4xl font-black mb-2 transition-colors duration-500 ${theme.name}`}>
          {formData.username || "이름 없음"}
        </h2>
        {formData.bio && (
          <p className={`text-lg font-medium mb-4 transition-colors duration-500 ${theme.bio}`}>{formData.bio}</p>
        )}
        
        <div className={`flex justify-center items-center gap-4 text-sm transition-colors duration-500 ${theme.textSub}`}>
          <span>{formData.email || "Email"}</span>
          
          {formData.githubUrl && (
            <>
              <span className="opacity-50">|</span>
              <a href={formData.githubUrl} className={`hover:underline transition-colors duration-500 ${theme.link}`}>GitHub</a>
            </>
          )}
          {formData.blogUrl && (
            <>
              <span className="opacity-50">|</span>
              <a href={formData.blogUrl} className={`hover:underline transition-colors duration-500 ${theme.link}`}>Blog</a>
            </>
          )}
        </div>
      </div>

      {/* 본문 영역 */}
      <div className="space-y-8">
        
        {/* 학력 섹션 */}
        {(formData.school || formData.major) && (
          <section>
            <h3 className={`text-sm uppercase tracking-widest font-black mb-3 border-b pb-1 transition-colors duration-500 ${theme.sectionTitle}`}>
              Education
            </h3>
            <div className="flex justify-between items-end">
              <div>
                <p className={`text-lg font-bold transition-colors duration-500 ${theme.textMain}`}>{formData.school}</p>
                <p className={`transition-colors duration-500 ${theme.textSub}`}>{formData.major}</p>
              </div>
              {formData.gpa && (
                <p className={`font-medium transition-colors duration-500 ${theme.bio}`}>학점: {formData.gpa}</p>
              )}
            </div>
          </section>
        )}

        {/* 기술 스택 섹션 */}
        {formData.skills && (
          <section>
            <h3 className={`text-sm uppercase tracking-widest font-black mb-3 border-b pb-1 transition-colors duration-500 ${theme.sectionTitle}`}>
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {formData.skills.split(",").map((s, i) => (
                <span key={i} className={`px-3 py-1 rounded-md text-sm font-semibold border transition-colors duration-500 ${theme.skillBg}`}>
                  {s.trim()}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* GitHub 잔디밭 섹션 */}
        {githubUsername && (
          <section>
            <h3 className={`text-sm uppercase tracking-widest font-black mb-4 border-b pb-1 transition-colors duration-500 ${theme.sectionTitle}`}>
              Contributions
            </h3>
            <div className={`flex justify-center p-6 border rounded-xl overflow-x-auto custom-scrollbar transition-colors duration-500 ${theme.boxBg}`}>
              { /* react-github-calendar 라이브러리를 사용하여 깃허브 잔디밭을 렌더링. 다크모드 여부에 따라 색상 테마 적용 */ }
              <GitHubCalendar 
                username={githubUsername} 
                blockSize={12} 
                blockMargin={4} 
                fontSize={12} 
                colorScheme={isDarkMode ? "dark" : "light"}
																theme={calendarTheme} /*오리지널 테마*/
              />
            </div>
          </section>
        )}

        {/* 프로젝트 섹션 */}
        <section>
          <h3 className={`text-sm uppercase tracking-widest font-black mb-4 border-b pb-1 transition-colors duration-500 ${theme.sectionTitle}`}>
            Projects & Experience
          </h3>
          <div className="space-y-6">
            {formData.projects.map((project, index) => (
              (project.name || project.description) && (
                <div key={index} className={`relative pl-4 border-l-2 transition-colors duration-500 ${theme.timelineLine}`}>
                  <div className={`absolute w-2 h-2 rounded-full -left-[5px] top-1.5 transition-colors duration-500 ${theme.timelineDot}`}></div>
                  
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className={`text-lg font-bold transition-colors duration-500 ${theme.textMain}`}>{project.name || "프로젝트 명"}</h4>
                    <span className={`text-sm font-medium transition-colors duration-500 ${theme.bio}`}>{project.period}</span>
                  </div>
                  
                  {project.techStack && (
                    <p className={`text-sm font-semibold mb-2 transition-colors duration-500 ${theme.link}`}>{project.techStack}</p>
                  )}
                  
                  <p className={`whitespace-pre-wrap text-sm leading-relaxed transition-colors duration-500 opacity-90 ${theme.textMain}`}>
                    {project.description}
                  </p>
                </div>
              )
            ))}
            
            {/* 비어있을 때 안내 문구 */}
            {formData.projects.length === 1 && !formData.projects[0].name && !formData.projects[0].description && (
              <p className={`text-sm italic transition-colors duration-500 ${theme.textSub}`}>프로젝트 경험을 추가해주세요.</p>
            )}
          </div>
        </section>
        
      </div>
    </div>
  );
});

export default ResumePreview;