import React from "react";

const ResumePreview = React.forwardRef(({ formData }, ref) => {
  return (
    <div
      ref={ref}
      className="bg-white shadow-2xl border-t-[12px] border-slate-800 w-[210mm] min-h-[297mm] p-[20mm] text-left flex flex-col box-border overflow-hidden"
      style={{ wordBreak: "break-all" }}
    >
      {/* 헤더 (이름, 이메일, 링크) */}
      <div className="border-b-2 border-slate-200 pb-6 mb-8 text-center">
        <h2 className="text-4xl font-black text-slate-900 mb-2">
          {formData.username || "이름 없음"}
        </h2>
        {formData.bio && (
          <p className="text-lg text-slate-500 font-medium mb-4">{formData.bio}</p>
        )}
        
        <div className="flex justify-center items-center gap-4 text-slate-600 text-sm">
          <span>{formData.email || "Email"}</span>
          
          {formData.githubUrl && (
            <>
              <span className="text-slate-300">|</span>
              <a href={formData.githubUrl} className="text-blue-600 hover:underline">GitHub</a>
            </>
          )}
          {formData.blogUrl && (
            <>
              <span className="text-slate-300">|</span>
              <a href={formData.blogUrl} className="text-blue-600 hover:underline">Blog</a>
            </>
          )}
        </div>
      </div>

      {/* 본문 영역 */}
      <div className="space-y-8">
        
        {/* 학력 섹션 */}
        {(formData.school || formData.major) && (
          <section>
            <h3 className="text-sm uppercase tracking-widest text-slate-800 font-black mb-3 border-b border-slate-800 pb-1">
              Education
            </h3>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-lg font-bold text-slate-800">{formData.school}</p>
                <p className="text-slate-600">{formData.major}</p>
              </div>
              {formData.gpa && (
                <p className="text-slate-500 font-medium">학점: {formData.gpa}</p>
              )}
            </div>
          </section>
        )}

        {/* 기술 스택 섹션 (조건문 다이어트 완료) */}
        {formData.skills && (
          <section>
            <h3 className="text-sm uppercase tracking-widest text-slate-800 font-black mb-3 border-b border-slate-800 pb-1">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {formData.skills.split(",").map((s, i) => (
                <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm font-semibold border border-slate-200">
                  {s.trim()}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 프로젝트 섹션 (조건문 다이어트 완료) */}
        <section>
          <h3 className="text-sm uppercase tracking-widest text-slate-800 font-black mb-4 border-b border-slate-800 pb-1">
            Projects & Experience
          </h3>
          <div className="space-y-6">
            {formData.projects.map((project, index) => (
              (project.name || project.description) && (
                <div key={index} className="relative pl-4 border-l-2 border-slate-300">
                  <div className="absolute w-2 h-2 bg-slate-800 rounded-full -left-[5px] top-1.5"></div>
                  
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-lg font-bold text-slate-800">{project.name || "프로젝트 명"}</h4>
                    <span className="text-sm text-slate-500 font-medium">{project.period}</span>
                  </div>
                  
                  {project.techStack && (
                    <p className="text-sm text-blue-600 font-semibold mb-2">{project.techStack}</p>
                  )}
                  
                  <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {project.description}
                  </p>
                </div>
              )
            ))}
            
            {/* 비어있을 때 안내 문구 */}
            {formData.projects.length === 1 && !formData.projects[0].name && !formData.projects[0].description && (
              <p className="text-slate-400 text-sm italic">프로젝트 경험을 추가해주세요.</p>
            )}
          </div>
        </section>
        
      </div>
    </div>
  );
});

export default ResumePreview;