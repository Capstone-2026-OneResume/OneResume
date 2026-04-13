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
  isDarkMode,
  isCompact = false // 컴팩트 모드 추가
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
      
      {/* 1. 상단 탭 메뉴 - 컴팩트 대응 */}
      <div className={`flex p-2 gap-1 border-b border-zinc-700/20 bg-zinc-500/5 ${isCompact ? 'py-1' : ''}`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-all ${
              isCompact ? 'py-2' : 'py-3'
            } ${activeTab === tab.id ? theme.tabActive : theme.tabInactive}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 2. 가변 입력 영역 - 컴팩트 모드에서 패딩 및 간격 축소 */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${isCompact ? 'p-6' : 'p-8 lg:p-10'}`}>
        
        {activeTab === 'basic' && (
          <div className={`${isCompact ? 'space-y-5' : 'space-y-8'} animate-fade-in`}>
            <div className="flex flex-col items-center">
              <div className={`${isCompact ? 'w-24 h-24 mb-3' : 'w-36 h-36 mb-5'} rounded-full overflow-hidden border-4 shadow-inner flex items-center justify-center transition-all ${isDarkMode ? 'bg-zinc-700 border-zinc-600' : 'bg-gray-100 border-white'}`}>
                {formData.profileImageUrl ? (
                  <img src={formData.profileImageUrl} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className={`${isCompact ? 'h-8 w-8' : 'h-12 w-12'} text-zinc-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
              </div>
              <label className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg font-bold active:scale-95 transition-all ${isCompact ? 'px-4 py-1.5 text-[10px]' : 'px-6 py-2 text-xs'}`}>
                프로필 사진 선택
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>

            <div className={`grid grid-cols-12 ${isCompact ? 'gap-4' : 'gap-6'}`}>
              <div className="col-span-4 flex flex-col gap-1.5">
                <label className={`pl-1 text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>이름</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.inputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
              </div>
              <div className="col-span-3 flex flex-col gap-1.5">
                <label className={`pl-1 text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>성별</label>
                <div className={`relative flex p-1 rounded-2xl border-2 transition-all ${theme.inputBg} ${isCompact ? 'h-[44px]' : 'h-[53.6px]'}`}>
                  <div 
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-md ${
                      formData.gender === 'male' 
                        ? 'left-1 bg-blue-600' 
                        : (formData.gender === 'female' ? 'left-[calc(50%)] bg-pink-500' : 'opacity-0')
                    }`}
                  />
                  <button type="button" onClick={() => handleChange({ target: { name: 'gender', value: 'male' } })} className={`relative z-10 flex-1 flex items-center justify-center text-sm font-bold transition-colors duration-300 ${formData.gender === 'male' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>남</button>
                  <button type="button" onClick={() => handleChange({ target: { name: 'gender', value: 'female' } })} className={`relative z-10 flex-1 flex items-center justify-center text-sm font-bold transition-colors duration-300 ${formData.gender === 'female' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>여</button>
                </div>
              </div>
              <div className="col-span-5 flex flex-col gap-1.5">
                <label className={`pl-1 text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>이메일</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.inputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
              </div>
            </div>

            <div className={`grid grid-cols-2 ${isCompact ? 'gap-4' : 'gap-6'}`}>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between pl-1">
                  <label className={`text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>나이</label>
                  <label className="flex items-center gap-1.5 cursor-pointer group">
                    <input type="checkbox" name="useInternationalAge" checked={formData.useInternationalAge || false} onChange={handleChange} className="w-3 h-3 rounded border-zinc-600 bg-zinc-700 text-blue-600 transition-all" />
                    <span className={`text-[9px] font-bold ${isDarkMode ? 'text-zinc-500 group-hover:text-zinc-300' : 'text-zinc-400 group-hover:text-zinc-600'} transition-colors`}>만 나이</span>
                  </label>
                </div>
                <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="숫자만" className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.inputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={`pl-1 text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>전화번호</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="010-0000-0000" className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.inputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={`pl-1 text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>서브도메인</label>
              <div className="flex items-center">
                <input type="text" name="subdomain" value={formData.subdomain} onChange={handleChange} className={`flex-1 px-5 border-2 rounded-l-2xl outline-none transition-all focus:ring-2 border-r-0 ${theme.inputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
                <span className={`px-5 font-bold text-sm border-2 border-l-0 ${isDarkMode ? 'bg-zinc-700 border-zinc-600 text-zinc-400' : 'bg-gray-200 border-transparent text-zinc-500'} ${isCompact ? 'py-2.5' : 'py-3.5'}`}>.oneresume.com</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={`pl-1 text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>한 줄 소개</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows={isCompact ? "2" : "3"} placeholder="나를 가장 잘 표현하는 문장을 적어주세요." className={`w-full px-5 border-2 rounded-2xl outline-none transition-all focus:ring-2 resize-none ${theme.inputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
            </div>
          </div>
        )}

        {/* ... (다른 탭들도 동일한 로직으로 컴팩트하게 조절됨) ... */}
        {activeTab === 'links' && (
          <div className={`${isCompact ? 'space-y-5' : 'space-y-8'} animate-fade-in`}>
            <div className="flex flex-col gap-1.5">
              <label className={`pl-1 text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>GitHub 연동</label>
              <div className="flex gap-3">
                <input type="text" name="githubUrl" value={formData.githubUrl} onChange={handleChange} placeholder="GitHub URL 또는 아이디" className={`flex-1 px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.inputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
                {formData.githubUrl && (
                  <button type="button" onClick={handleGithubSync} className={`bg-zinc-800 dark:bg-blue-600 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 ${isCompact ? 'px-5 py-2 text-xs' : 'px-8 py-3.5'}`}>동기화</button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={`pl-1 text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>기술 블로그</label>
              <input type="text" name="blogUrl" value={formData.blogUrl} onChange={handleChange} placeholder="https://velog.io/@username" className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.inputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
            </div>
          </div>
        )}

        {activeTab === 'edu' && (
          <div className={`${isCompact ? 'space-y-5' : 'space-y-8'} animate-fade-in`}>
            <div className={`grid grid-cols-2 ${isCompact ? 'gap-4' : 'gap-6'}`}>
              <div className="flex flex-col gap-1.5">
                <label className={`pl-1 text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>학교</label>
                <input type="text" name="school" value={formData.school} onChange={handleChange} className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.inputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={`pl-1 text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>전공</label>
                <input type="text" name="major" value={formData.major} onChange={handleChange} className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.inputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={`pl-1 text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>학점 (GPA)</label>
              <input type="text" name="gpa" value={formData.gpa} onChange={handleChange} placeholder="4.5 / 4.5" className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.inputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={`pl-1 text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>기술 스택</label>
              <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js" className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.inputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className={`${isCompact ? 'space-y-4' : 'space-y-6'} animate-fade-in`}>
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className={`text-[10px] font-bold uppercase tracking-widest ${theme.labelText}`}>프로젝트 ({formData.projects.length})</h3>
              <button type="button" onClick={addProject} className="text-blue-500 text-[10px] font-black hover:underline">+ 추가</button>
            </div>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="projects-list">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className={`${isCompact ? 'space-y-3' : 'space-y-5'}`}>
                    {formData.projects.map((project, index) => (
                      <Draggable key={project.id || `fallback-${index}`} draggableId={String(project.id || `fallback-${index}`)} index={index}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} className={`rounded-3xl border-2 transition-all ${isCompact ? 'p-4' : 'p-6'} ${snapshot.isDragging ? "shadow-2xl scale-[1.02] border-blue-500 bg-white dark:bg-zinc-700" : theme.cardBg}`}>
                            <div {...provided.dragHandleProps} className={`flex justify-center mb-3 cursor-grab active:cursor-grabbing opacity-30 hover:opacity-100`}>
                              <div className="w-10 h-1 bg-zinc-400 rounded-full"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <input type="text" name="name" value={project.name} onChange={(e) => handleProjectChange(index, e)} placeholder="이름" className={`w-full px-4 py-2 border rounded-xl outline-none transition-all focus:ring-2 text-xs ${theme.innerInputBg}`} />
                              <input type="text" name="period" value={project.period} onChange={(e) => handleProjectChange(index, e)} placeholder="기간" className={`w-full px-4 py-2 border rounded-xl outline-none transition-all focus:ring-2 text-xs ${theme.innerInputBg}`} />
                            </div>
                            <textarea name="description" value={project.description} onChange={(e) => handleProjectChange(index, e)} rows={isCompact ? "2" : "3"} placeholder="상세 설명" className={`w-full px-4 py-2 border rounded-xl outline-none transition-all focus:ring-2 text-xs resize-none ${theme.innerInputBg}`} />
                            <div className="flex justify-end mt-2">
                              <button type="button" onClick={() => removeProject(index)} className="text-red-500 text-[9px] font-bold uppercase tracking-tighter opacity-60 hover:opacity-100">✕ Remove</button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
      </div>

      {/* 3. 하단 고정 액션 바 - 컴팩트 대응 */}
      <div className={`border-t border-zinc-700/20 bg-zinc-500/5 ${isCompact ? 'p-5' : 'p-8'}`}>
        <form onSubmit={handleSubmit}>
          <button type="submit" className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[24px] shadow-2xl shadow-blue-600/30 transition-all transform hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 group ${isCompact ? 'py-3.5 text-lg' : 'py-5 text-xl'}`}>
            <span>저장하기</span>
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