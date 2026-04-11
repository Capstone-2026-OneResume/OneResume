import React, { useState } from "react";
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
  // 현재 활성화된 탭 상태 (기본값: 'basic')
  const [activeTab, setActiveTab] = useState('basic');

  const theme = {
    formBg: isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-100",
    tabActive: isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white",
    tabInactive: isDarkMode ? "text-zinc-400 hover:bg-zinc-700" : "text-zinc-500 hover:bg-gray-100",
    titleText: isDarkMode ? "text-zinc-100" : "text-zinc-800",
    labelText: isDarkMode ? "text-zinc-400" : "text-zinc-600",
    inputBg: isDarkMode ? "bg-zinc-700 border-zinc-600 text-zinc-100 focus:ring-blue-500" : "bg-gray-100 border-transparent text-zinc-900 focus:ring-blue-500",
    cardBg: isDarkMode ? "bg-zinc-700/50 border-zinc-600" : "bg-gray-50 border-zinc-200",
    innerInputBg: isDarkMode ? "bg-zinc-800 border-zinc-600 text-zinc-100 focus:ring-blue-500" : "bg-white border-zinc-200 text-zinc-900 focus:ring-blue-500",
  };

  const tabs = [
    { id: 'basic', label: ' 기본 정보', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'links', label: ' 링크/연동', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
    { id: 'edu', label: ' 학력/기술', icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-5.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
    { id: 'projects', label: ' 프로젝트', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  ];

  return (
    <div className={`w-full h-full flex flex-col rounded-[32px] overflow-hidden shadow-2xl border transition-all duration-300 ${theme.formBg}`}>
      
      {/* 1. 상단 탭 메뉴 */}
      <div className="flex p-2 gap-1 border-b border-zinc-700/20 bg-zinc-500/5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${
              activeTab === tab.id ? theme.tabActive : theme.tabInactive
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 2. 가변 입력 영역 (각 탭별 컨텐츠) */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-10 custom-scrollbar">
        
        {activeTab === 'basic' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col items-center">
              <div className={`w-36 h-36 rounded-full overflow-hidden border-4 shadow-inner flex items-center justify-center mb-5 transition-colors ${isDarkMode ? 'bg-zinc-700 border-zinc-600' : 'bg-gray-100 border-white'}`}>
                {formData.profileImageUrl ? (
                  <img src={formData.profileImageUrl} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
              </div>
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-lg text-xs font-bold active:scale-95 transition-all">
                프로필 사진 선택
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-4 flex flex-col gap-2">
                <label className={`pl-1 text-xs font-bold uppercase tracking-widest ${theme.labelText}`}>이름</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} className={`w-full px-5 py-3.5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.inputBg}`} />
              </div>
              <div className="col-span-3 flex flex-col gap-2">
                <label className={`pl-1 text-xs font-bold uppercase tracking-widest ${theme.labelText}`}>성별</label>
                <div className={`relative flex p-1 rounded-2xl border-2 transition-all ${theme.inputBg} h-[53.6px]`}>
                  {/* 슬라이딩 배경 알약 */}
                  <div 
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-md ${
                      formData.gender === 'male' 
                        ? 'left-1 bg-blue-600' 
                        : (formData.gender === 'female' ? 'left-[calc(50%)] bg-pink-500' : 'opacity-0')
                    }`}
                  />
                  
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'gender', value: 'male' } })}
                    className={`relative z-10 flex-1 flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                      formData.gender === 'male' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    남
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'gender', value: 'female' } })}
                    className={`relative z-10 flex-1 flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                      formData.gender === 'female' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    여
                  </button>
                </div>
              </div>
              <div className="col-span-5 flex flex-col gap-2">
                <label className={`pl-1 text-xs font-bold uppercase tracking-widest ${theme.labelText}`}>이메일</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-5 py-3.5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.inputBg}`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between pl-1">
                  <label className={`text-xs font-bold uppercase tracking-widest ${theme.labelText}`}>나이</label>
                  <label className="flex items-center gap-1.5 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="useInternationalAge" 
                      checked={formData.useInternationalAge || false} 
                      onChange={handleChange} 
                      className="w-3.5 h-3.5 rounded border-zinc-600 bg-zinc-700 text-blue-600 focus:ring-offset-zinc-800 transition-all"
                    />
                    <span className={`text-[10px] font-bold ${isDarkMode ? 'text-zinc-500 group-hover:text-zinc-300' : 'text-zinc-400 group-hover:text-zinc-600'} transition-colors`}>만 나이 표시</span>
                  </label>
                </div>
                <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="숫자만 입력" className={`w-full px-5 py-3.5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.inputBg}`} />
              </div>
              <div className="flex flex-col gap-2">
                <label className={`pl-1 text-xs font-bold uppercase tracking-widest ${theme.labelText}`}>전화번호</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="010-0000-0000" className={`w-full px-5 py-3.5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.inputBg}`} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className={`pl-1 text-xs font-bold uppercase tracking-widest ${theme.labelText}`}>서브도메인</label>
              <div className="flex items-center">
                <input type="text" name="subdomain" value={formData.subdomain} onChange={handleChange} className={`flex-1 px-5 py-3.5 border-2 rounded-l-2xl outline-none transition-all focus:ring-2 border-r-0 ${theme.inputBg}`} />
                <span className={`px-5 py-3.5 rounded-r-2xl font-bold text-sm border-2 border-l-0 ${isDarkMode ? 'bg-zinc-700 border-zinc-600 text-zinc-400' : 'bg-gray-200 border-transparent text-zinc-500'}`}>.oneresume.com</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className={`pl-1 text-xs font-bold uppercase tracking-widest ${theme.labelText}`}>한 줄 소개</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" placeholder="나를 가장 잘 표현하는 문장을 적어주세요." className={`w-full px-5 py-3.5 border-2 rounded-2xl outline-none transition-all focus:ring-2 resize-none ${theme.inputBg}`} />
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col gap-2">
              <label className={`pl-1 text-xs font-bold uppercase tracking-widest ${theme.labelText}`}>GitHub 연동</label>
              <div className="flex gap-3">
                <input type="text" name="githubUrl" value={formData.githubUrl} onChange={handleChange} placeholder="GitHub URL 또는 아이디" className={`flex-1 px-5 py-3.5 border-2 rounded-2xl outline-none transition-all focus:ring-2 ${theme.inputBg}`} />
                {formData.githubUrl && (
                  <button type="button" onClick={handleGithubSync} className="bg-zinc-800 dark:bg-blue-600 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg active:scale-95">동기화</button>
                )}
              </div>
              <p className="text-[10px] text-zinc-500 ml-1">레포지토리 목록과 기술 스택을 자동으로 가져옵니다.</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className={`pl-1 text-xs font-bold uppercase tracking-widest ${theme.labelText}`}>기술 블로그</label>
              <input type="text" name="blogUrl" value={formData.blogUrl} onChange={handleChange} placeholder="https://velog.io/@username" className={`w-full px-5 py-3.5 border-2 rounded-2xl outline-none transition-all focus:ring-2 ${theme.inputBg}`} />
            </div>
          </div>
        )}

        {activeTab === 'edu' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className={`pl-1 text-xs font-bold uppercase tracking-widest ${theme.labelText}`}>학교</label>
                <input type="text" name="school" value={formData.school} onChange={handleChange} className={`w-full px-5 py-3.5 border-2 rounded-2xl outline-none transition-all focus:ring-2 ${theme.inputBg}`} />
              </div>
              <div className="flex flex-col gap-2">
                <label className={`pl-1 text-xs font-bold uppercase tracking-widest ${theme.labelText}`}>전공</label>
                <input type="text" name="major" value={formData.major} onChange={handleChange} className={`w-full px-5 py-3.5 border-2 rounded-2xl outline-none transition-all focus:ring-2 ${theme.inputBg}`} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className={`pl-1 text-xs font-bold uppercase tracking-widest ${theme.labelText}`}>학점 (GPA)</label>
              <input type="text" name="gpa" value={formData.gpa} onChange={handleChange} placeholder="4.5 / 4.5" className={`w-full px-5 py-3.5 border-2 rounded-2xl outline-none transition-all focus:ring-2 ${theme.inputBg}`} />
            </div>
            <div className="flex flex-col gap-2">
              <label className={`pl-1 text-xs font-bold uppercase tracking-widest ${theme.labelText}`}>핵심 기술 스택</label>
              <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, TypeScript (쉼표로 구분)" className={`w-full px-5 py-3.5 border-2 rounded-2xl outline-none transition-all focus:ring-2 ${theme.inputBg}`} />
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className={`text-sm font-bold uppercase tracking-widest ${theme.labelText}`}>프로젝트 목록 ({formData.projects.length})</h3>
              <button type="button" onClick={addProject} className="text-blue-500 text-xs font-black hover:underline">+ 항목 추가</button>
            </div>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="projects-list">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-5">
                    {formData.projects.map((project, index) => {
                      const draggableId = project.id ? String(project.id) : `fallback-${index}`;
                      return (
                        <Draggable key={draggableId} draggableId={draggableId} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`p-6 rounded-3xl border-2 transition-all ${
                                snapshot.isDragging ? "shadow-2xl scale-[1.02] border-blue-500 bg-white dark:bg-zinc-700" : theme.cardBg
                              }`}
                            >
                              <div {...provided.dragHandleProps} className="flex justify-center mb-4 cursor-grab active:cursor-grabbing opacity-30 hover:opacity-100 transition-opacity">
                                <div className="w-10 h-1 bg-zinc-400 rounded-full"></div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <input type="text" name="name" value={project.name} onChange={(e) => handleProjectChange(index, e)} placeholder="프로젝트 이름" className={`w-full px-4 py-2.5 border rounded-xl outline-none transition-all focus:ring-2 text-sm ${theme.innerInputBg}`} />
                                <input type="text" name="period" value={project.period} onChange={(e) => handleProjectChange(index, e)} placeholder="2023.01 ~ 2023.06" className={`w-full px-4 py-2.5 border rounded-xl outline-none transition-all focus:ring-2 text-sm ${theme.innerInputBg}`} />
                              </div>
                              <input type="text" name="techStack" value={project.techStack} onChange={(e) => handleProjectChange(index, e)} placeholder="사용 기술 (Tech Stack)" className={`w-full px-4 py-2.5 border rounded-xl outline-none transition-all focus:ring-2 text-sm mb-4 ${theme.innerInputBg}`} />
                              <textarea name="description" value={project.description} onChange={(e) => handleProjectChange(index, e)} rows="3" placeholder="상세 설명을 적어주세요." className={`w-full px-4 py-2.5 border rounded-xl outline-none transition-all focus:ring-2 text-sm resize-none ${theme.innerInputBg}`} />
                              <div className="flex justify-end mt-3">
                                <button type="button" onClick={() => removeProject(index)} className="text-red-500 text-[10px] font-bold uppercase tracking-tighter opacity-60 hover:opacity-100">✕ Remove</button>
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
          </div>
        )}
      </div>

      {/* 3. 하단 고정 액션 바 */}
      <div className="p-8 border-t border-zinc-700/20 bg-zinc-500/5">
        <form onSubmit={handleSubmit}>
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xl py-5 rounded-[24px] shadow-2xl shadow-blue-600/30 transition-all transform hover:-translate-y-1.5 active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            <span>이력서 저장</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResumeForm;