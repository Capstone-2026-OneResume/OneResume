import React from "react";

function ResumeForm({ formData, handleChange, handleProjectChange, addProject, removeProject, handleSubmit, handleGithubSync }) {
  return (
    <div className="w-full lg:w-[500px] bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-h-[80vh] overflow-y-auto custom-scrollbar">
      <h2 className="text-xl font-bold mb-6 text-slate-800 border-l-4 border-blue-600 pl-3">
        정보 입력
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 기본 정보 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1">이름</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="홍길동" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1">개인 도메인 (ID)</label>
            <div className="flex">
              <input type="text" name="subdomain" value={formData.subdomain} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-l-xl outline-none focus:ring-2 focus:ring-blue-500 " placeholder="hong" />
              <span className="inline-flex items-center px-3 rounded-r-xl border border-l-0 border-slate-300 bg-slate-50 text-slate-500 text-sm font-medium whitespace-nowrap">
                .oneresume.com
              </span>
            </div>
          </div>
        </div>
        
        <div className="col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-1">이메일</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="abc@example.com" />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">한 줄 자기소개</label>
          <input type="text" name="bio" value={formData.bio} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="성장을 멈추지 않는 프론트엔드 개발자" />
        </div>

        {/* 링크 정보 */}
										<div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">GitHub 링크 또는 ID</label>
            <div className="relative flex items-center">
              <input 
                type="text" 
                name="githubUrl" 
                value={formData.githubUrl} 
                onChange={handleChange} 
                className="w-full p-3 pr-24 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="PARKUNGJUNG" 
              />
              {formData.githubUrl.trim() && (
                <button 
                  type="button" 
                  onClick={handleGithubSync}
                  className="absolute right-2 top-2 bg-slate-800 hover:bg-slate-900 text-white p-2 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all active:scale-95 shadow"
                >
                  연동
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">블로그 링크</label>
            <input type="text" name="blogUrl" value={formData.blogUrl} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="velog.io/..." />
          </div>
        </div>

        {/* 학력 및 기술 (3단 분리 적용) */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">최종 학력</label>
          <div className="grid grid-cols-3 gap-2">
            <input type="text" name="school" value={formData.school} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="학교명" />
            <input type="text" name="major" value={formData.major} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="전공" />
            <input type="text" name="gpa" value={formData.gpa} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="학점 (예: 4.0/4.5)" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">보유 기술 (쉼표로 구분)</label>
          <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="React, Node.js, AWS" />
        </div>

        {/* 동적 프로젝트 추가 영역 */}
        <div className="pt-4 border-t border-slate-200 mt-6">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-bold text-slate-700">주요 프로젝트</label>
            <button type="button" onClick={addProject} className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors">
              + 프로젝트 추가
            </button>
          </div>

          {formData.projects.map((project, index) => (
            <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 relative">
              {formData.projects.length > 1 && (
                <button type="button" onClick={() => removeProject(index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 text-sm font-bold">
                  ✕ 삭제
                </button>
              )}
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">프로젝트명</label>
                  <input type="text" name="name" value={project.name} onChange={(e) => handleProjectChange(index, e)} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="OneResume" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">진행 기간</label>
                  <input type="text" name="period" value={project.period} onChange={(e) => handleProjectChange(index, e)} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="2026.03 - 2026.06" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">담당 역할 및 사용 기술</label>
                  <input type="text" name="techStack" value={project.techStack} onChange={(e) => handleProjectChange(index, e)} className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="프론트엔드 (React, Tailwind)" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">상세 내용 및 성과</label>
                <textarea name="description" value={project.description} onChange={(e) => handleProjectChange(index, e)} rows="3" className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm" placeholder="사용자 이력서 생성 기능 구현..."></textarea>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all mt-4">
          이력서 중앙 저장소로 전송
        </button>
      </form>
    </div>
  );
}

export default ResumeForm;