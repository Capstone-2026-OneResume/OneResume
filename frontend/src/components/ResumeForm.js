import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const ResumeForm = ({
  formData,
  handleChange,
  handleProjectChange,
  addProject,
  removeProject,
  handleSubmit,
  handleGithubSync,
  handleDragEnd,
  handleImageUpload,
  isDarkMode
}) => {
  // 다크모드 조건부 스타일 클래스 변수
  const formBg = isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100";
  const titleText = isDarkMode ? "text-white" : "text-slate-800";
  const labelText = isDarkMode ? "text-slate-400" : "text-slate-600";
  // 인풋 배경 slate-800
  const inputBg = isDarkMode ? "bg-slate-800 border-slate-700 text-white focus:ring-blue-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-emerald-500";
  const divider = isDarkMode ? "border-slate-800" : "border-slate-200";
  const addBtn = isDarkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700" : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200";
  const cardBg = isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200";
  const innerInputBg = isDarkMode ? "bg-slate-900 border-slate-700 text-white focus:ring-blue-500" : "bg-white border-slate-200 text-slate-900 focus:ring-emerald-500";

  return (
    <form onSubmit={handleSubmit} className={`p-8 rounded-3xl shadow-xl w-full max-w-2xl border transition-colors duration-300 print:hidden ${formBg}`}>
      <h2 className={`text-2xl font-bold mb-6 ${titleText}`}>이력서 정보 입력</h2>

      {/* 프로필 사진 업로드 영역 */}
      <div className="flex flex-col items-center mb-8">
        <div className={`w-32 h-32 rounded-full overflow-hidden border-4 shadow-md flex items-center justify-center mb-4 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          {formData.profileImageUrl ? (
            <img
              src={formData.profileImageUrl}
              alt="프로필 미리보기"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>사진 없음</span>
          )}
        </div>
        <label className="cursor-pointer bg-slate-800 hover:bg-slate-900 transition-colors text-white px-5 py-2 rounded-full shadow-sm text-sm font-semibold active:scale-95">
          프로필 사진 선택
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      {/* 기본 정보 영역 */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-semibold mb-1 ${labelText}`}>이름</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} className={`w-full p-3 border rounded-xl focus:outline-none transition-all focus:ring-2 ${inputBg}`} />
          </div>
          <div>
            <label className={`block text-sm font-semibold mb-1 ${labelText}`}>이메일</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full p-3 border rounded-xl focus:outline-none transition-all focus:ring-2 ${inputBg}`} />
          </div>
        </div>
        
        {/* 서브도메인 입력 */}
        <div>
          <label className={`block text-sm font-semibold mb-1 ${labelText}`}>서브도메인 (영문/숫자)</label>
          <div className="flex items-center">
            <input type="text" name="subdomain" value={formData.subdomain} onChange={handleChange} placeholder="user-id" className={`w-full p-3 border rounded-l-xl focus:outline-none transition-all focus:ring-2 border-r-0 ${inputBg}`} />
            <span className={`p-3 rounded-r-xl font-medium border border-l-0 ${isDarkMode ? 'bg-slate-700 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>.oneresume.com</span>
          </div>
        </div>
        
        {/* 한 줄 소개 (Bio) 입력 */}
        <div>
          <label className={`block text-sm font-semibold mb-1 ${labelText}`}>한 줄 소개 (Bio)</label>
          <input type="text" name="bio" value={formData.bio} onChange={handleChange} placeholder="성장을 멈추지 않는 개발자입니다." className={`w-full p-3 border rounded-xl focus:outline-none transition-all focus:ring-2 ${inputBg}`} />
        </div>
      </div>

      <hr className={`my-8 ${divider}`} />

      {/* 링크 및 GitHub 연동 영역 */}
      <div className="space-y-4 mb-8">
        <h3 className={`text-lg font-bold mb-4 ${titleText}`}>링크 & 자동 연동</h3>
        
        <div className="relative">
          <label className={`block text-sm font-semibold mb-1 ${labelText}`}>GitHub 링크 (또는 아이디)</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              name="githubUrl" 
              value={formData.githubUrl} 
              onChange={handleChange} 
              placeholder="https://github.com/username"
              className={`w-full p-3 border rounded-xl focus:outline-none transition-all focus:ring-2 ${inputBg}`} 
            />
            {formData.githubUrl && (
              <button 
                type="button" 
                onClick={handleGithubSync}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl transition-all whitespace-nowrap shadow-md active:scale-95 border border-slate-700"
              >
                연동
              </button>
            )}
          </div>
        </div>
        
        <div>
          <label className={`block text-sm font-semibold mb-1 ${labelText}`}>기술 블로그 링크</label>
          <input type="text" name="blogUrl" value={formData.blogUrl} onChange={handleChange} className={`w-full p-3 border rounded-xl focus:outline-none transition-all focus:ring-2 ${inputBg}`} />
        </div>
      </div>

      <hr className={`my-8 ${divider}`} />

      {/* 학력 및 스킬 영역 */}
      <div className="space-y-4 mb-8">
        <h3 className={`text-lg font-bold mb-4 ${titleText}`}>학력 및 기술 스택</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-semibold mb-1 ${labelText}`}>학교</label>
            <input type="text" name="school" value={formData.school} onChange={handleChange} className={`w-full p-3 border rounded-xl focus:outline-none transition-all focus:ring-2 ${inputBg}`} />
          </div>
          <div>
            <label className={`block text-sm font-semibold mb-1 ${labelText}`}>전공</label>
            <input type="text" name="major" value={formData.major} onChange={handleChange} className={`w-full p-3 border rounded-xl focus:outline-none transition-all focus:ring-2 ${inputBg}`} />
          </div>
          <div>
            <label className={`block text-sm font-semibold mb-1 ${labelText}`}>학점</label>
            <input type="text" name="gpa" value={formData.gpa} onChange={handleChange} className={`w-full p-3 border rounded-xl focus:outline-none transition-all focus:ring-2 ${inputBg}`} />
          </div>
        </div>
        <div>
          <label className={`block text-sm font-semibold mb-1 ${labelText}`}>기술 스택 (쉼표로 구분)</label>
          <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, MySQL" className={`w-full p-3 border rounded-xl focus:outline-none transition-all focus:ring-2 ${inputBg}`} />
        </div>
      </div>

      <hr className={`my-8 ${divider}`} />

      {/* 프로젝트 및 경험 (Drag & Drop) */}
      <div className="mb-8">
        <h3 className={`text-lg font-bold mb-4 ${titleText}`}>주요 프로젝트 및 경험</h3>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="projects-list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                
                {formData.projects.map((project, index) => {
                  const draggableId = project.id ? String(project.id) : `fallback-${index}`;
                  
                  return (
                    <Draggable key={draggableId} draggableId={draggableId} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-6 rounded-2xl border transition-all ${
                            snapshot.isDragging 
                              ? `shadow-2xl scale-[1.02] z-50 ${isDarkMode ? 'bg-slate-700 border-blue-500' : 'bg-white border-emerald-500'}` 
                              : cardBg
                          }`}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className={`flex justify-center mb-4 cursor-grab active:cursor-grabbing hover:text-emerald-500 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                            </svg>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className={`block text-xs font-bold mb-1 ${labelText}`}>프로젝트 이름</label>
                              <input type="text" name="name" value={project.name} onChange={(e) => handleProjectChange(index, e)} className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${innerInputBg}`} />
                            </div>
                            <div>
                              <label className={`block text-xs font-bold mb-1 ${labelText}`}>진행 기간</label>
                              <input type="text" name="period" value={project.period} onChange={(e) => handleProjectChange(index, e)} placeholder="2023.01 ~ 2023.06" className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${innerInputBg}`} />
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className={`block text-xs font-bold mb-1 ${labelText}`}>사용 기술 (Tech Stack)</label>
                            <input type="text" name="techStack" value={project.techStack} onChange={(e) => handleProjectChange(index, e)} className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${innerInputBg}`} />
                          </div>
                          <div className="mb-4">
                            <label className={`block text-xs font-bold mb-1 ${labelText}`}>상세 설명</label>
                            <textarea name="description" value={project.description} onChange={(e) => handleProjectChange(index, e)} rows="3" className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 resize-none ${innerInputBg}`}></textarea>
                          </div>
                          <div className="flex justify-end">
                            <button type="button" onClick={() => removeProject(index)} className="text-red-500 text-sm font-bold hover:text-red-600 transition-colors">
                              ✕ 삭제
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <button type="button" onClick={addProject} className={`mt-6 w-full font-bold py-3 rounded-xl transition-all border border-dashed ${addBtn}`}>
          + 프로젝트 추가
        </button>
      </div>

      <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg py-4 rounded-2xl shadow-lg transition-all active:scale-95">
        이력서 저장 및 퍼블리싱
      </button>
    </form>
  );
};

export default ResumeForm;