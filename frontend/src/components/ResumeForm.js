
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import DaumPostcode from "react-daum-postcode";

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
  auditContent, // AI 분석 함수 추가
  isDarkMode,
  isCompact = false
		
}) => {
  // 현재 활성화된 탭 상태
  const [activeTab, setActiveTab] = useState('basic');
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [schoolResults, setSchoolResults] = useState([]);
  const [majorResults, setMajorResults] = useState([]);
  const [showSchoolList, setShowSchoolList] = useState(false);
  const [showMajorList, setShowMajorList] = useState(false);

  // AI 피드백 모달 관련 상태
  const [aiFeedback, setAiFeedback] = useState(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiAudit = async (fieldName, content, context) => {
    setIsAiLoading(true);
    const result = await auditContent(fieldName, content, context);
    if (result) {
      setAiFeedback({ ...result, targetField: fieldName });
      setIsAiModalOpen(true);
    }
    setIsAiLoading(false);
  };

  const applyAiRefinement = (text) => {
    if (aiFeedback.targetField === 'bio') {
      handleChange({ target: { name: 'bio', value: text } });
    } else if (aiFeedback.targetField.startsWith('project-')) {
      const index = parseInt(aiFeedback.targetField.split('-')[1]);
      handleProjectChange(index, { target: { name: 'description', value: text } });
    }
    setIsAiModalOpen(false);
  };

  const handleAddressComplete = (data) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") extraAddress += data.bname;
      if (data.buildingName !== "") extraAddress += extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    handleChange({ target: { name: "address", value: fullAddress } });
    setIsAddressOpen(false);
  };

  // 학교 검색
  const searchSchool = async (keyword) => {
    if (!keyword || keyword.length < 2) {
      setSchoolResults([]);
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/resume/search?type=SCHOOL&keyword=${encodeURIComponent(keyword)}`);
      const data = await response.json();
      const list = data.dataSearch?.content || [];
      setSchoolResults(list);
      setShowSchoolList(true);
    } catch (error) {
      console.error("학교 검색 에러:", error);
    }
  };

  // 전공 검색
  const searchMajor = async (keyword) => {
    if (!keyword || keyword.length < 2) {
      setMajorResults([]);
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/resume/search?type=MAJOR&keyword=${encodeURIComponent(keyword)}`);
      const data = await response.json();
      const list = data.dataSearch?.content || [];
      setMajorResults(list);
      setShowMajorList(true);
    } catch (error) {
      console.error("전공 검색 에러:", error);
    }
  };

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
          <div className={`${isCompact ? 'space-y-6' : 'space-y-10'} animate-fade-in`}>
            
            {/* 1. 메인 프로필 카드 */}
            <div className={`p-8 rounded-[32px] border-2 transition-all ${theme.cardBg} shadow-sm relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="flex flex-col items-center shrink-0">
                  <div className={`${isCompact ? 'w-24 h-24' : 'w-32 h-32'} rounded-[24px] overflow-hidden border-4 shadow-2xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-white'}`}>
                    {formData.profileImageUrl ? (
                      <img src={formData.profileImageUrl} alt="프로필" className="w-full h-full object-cover" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className={`${isCompact ? 'h-8 w-8' : 'h-10 w-10'} text-zinc-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <label className="mt-4 cursor-pointer group/upload">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 transition-colors">사진 변경</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>

                <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className={`pl-1 text-[11px] font-black uppercase tracking-wider ${theme.labelText}`}>이름</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="홍길동" className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.innerInputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={`pl-1 text-[11px] font-black uppercase tracking-wider ${theme.labelText}`}>성별</label>
                    <div className={`relative flex p-1 rounded-2xl border-2 transition-all ${theme.innerInputBg} ${isCompact ? 'h-[44px]' : 'h-[53.6px]'}`}>
                      <div 
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-md ${
                          formData.gender === 'male' 
                            ? 'left-1 bg-blue-600' 
                            : (formData.gender === 'female' ? 'left-[calc(50%)] bg-pink-500' : 'opacity-0')
                        }`}
                      />
                      <button type="button" onClick={() => handleChange({ target: { name: 'gender', value: 'male' } })} className={`relative z-10 flex-1 flex items-center justify-center text-xs font-black transition-colors duration-300 ${formData.gender === 'male' ? 'text-white' : 'text-zinc-500 hover:text-zinc-400'}`}>남성</button>
                      <button type="button" onClick={() => handleChange({ target: { name: 'gender', value: 'female' } })} className={`relative z-10 flex-1 flex items-center justify-center text-xs font-black transition-colors duration-300 ${formData.gender === 'female' ? 'text-white' : 'text-zinc-500 hover:text-zinc-400'}`}>여성</button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between pl-1">
                      <label className={`text-[11px] font-black uppercase tracking-wider ${theme.labelText}`}>나이</label>
                      <label className="flex items-center gap-1.5 cursor-pointer group">
                        <input type="checkbox" name="useInternationalAge" checked={formData.useInternationalAge || false} onChange={handleChange} className="w-3.5 h-3.5 rounded-lg border-zinc-400 bg-transparent text-blue-600 transition-all focus:ring-0" />
                        <span className={`text-[10px] font-black ${isDarkMode ? 'text-zinc-500 group-hover:text-zinc-300' : 'text-zinc-400 group-hover:text-zinc-600'}`}>만 나이</span>
                      </label>
                    </div>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="숫자만 입력" className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.innerInputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={`pl-1 text-[11px] font-black uppercase tracking-wider ${theme.labelText}`}>전화번호</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="010-0000-0000" className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.innerInputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
                  </div>
                  <div className="lg:col-span-2 flex flex-col gap-1.5">
                    <label className={`pl-1 text-[11px] font-black uppercase tracking-wider ${theme.labelText}`}>이메일 주소</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@email.com" className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.innerInputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 거주지 정보 카드 */}
            <div className={`p-8 rounded-[32px] border-2 transition-all ${theme.cardBg} shadow-sm`}>
              <div className="flex items-center gap-2 mb-6 opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.labelText}`}>거주지 정보</h4>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className={`pl-1 text-[11px] font-black uppercase tracking-wider ${theme.labelText}`}>주소</label>
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 flex gap-3">
                      <input type="text" value={formData.address || ""} readOnly onClick={() => setIsAddressOpen(true)} placeholder="주소 검색" className={`flex-1 px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 cursor-pointer ${theme.innerInputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
                      <button type="button" onClick={() => setIsAddressOpen(true)} className={`bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-black rounded-2xl transition-all shadow-lg active:scale-95 whitespace-nowrap ${isCompact ? 'px-4 text-[10px]' : 'px-6 text-xs'}`}>검색</button>
                    </div>
                    <input type="text" name="addressDetail" value={formData.addressDetail || ""} onChange={handleChange} placeholder="상세주소 (동, 호수 등)" className={`flex-1 px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.innerInputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. 개인 브랜딩 카드 */}
            <div className={`p-8 rounded-[32px] border-2 transition-all ${theme.cardBg} shadow-sm relative`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 opacity-80">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.labelText}`}>개인 브랜딩</h4>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleAiAudit('bio', formData.bio)}
                  disabled={isAiLoading}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black transition-all duration-300 ${
                    isAiLoading 
                      ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:shadow-lg hover:-translate-y-0.5 active:scale-95'
                  }`}
                >
                  {isAiLoading ? '분석 중...' : 'AI 컨설팅'}
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className={`pl-1 text-[11px] font-black uppercase tracking-wider ${theme.labelText}`}>서브도메인</label>
                  <div className="flex items-center">
                    <input type="text" name="subdomain" value={formData.subdomain} onChange={handleChange} placeholder="your-id" className={`flex-1 px-5 border-2 rounded-l-2xl outline-none transition-all focus:ring-2 border-r-0 ${theme.innerInputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
                    <span className={`px-5 font-black text-xs border-2 border-l-0 ${isDarkMode ? 'bg-zinc-700 border-zinc-600 text-zinc-500' : 'bg-gray-100 border-zinc-200 text-zinc-400'} ${isCompact ? 'py-2.5' : 'py-3.5'}`}>.oneresume.com</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`pl-1 text-[11px] font-black uppercase tracking-wider ${theme.labelText}`}>한 줄 소개</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows={isCompact ? "2" : "3"} placeholder="나를 가장 잘 표현하는 한 문장을 적어주세요." className={`w-full px-5 border-2 rounded-2xl outline-none transition-all focus:ring-2 resize-none ${theme.innerInputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
                </div>
              </div>
            </div>

            {isAddressOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
                <div className={`relative w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl ${isDarkMode ? 'bg-zinc-900 border border-zinc-700' : 'bg-white'}`}>
                  <div className="flex items-center justify-between p-6 border-b border-zinc-700/10">
                    <h3 className={`font-black text-lg ${theme.titleText}`}>주소 검색</h3>
                    <button onClick={() => setIsAddressOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <DaumPostcode onComplete={handleAddressComplete} style={{ height: '450px' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. 링크 및 연동 탭 */}
        {activeTab === 'links' && (
          <div className={`${isCompact ? 'space-y-6' : 'space-y-10'} animate-fade-in`}>
            <div className={`p-8 rounded-[32px] border-2 transition-all ${theme.cardBg} shadow-sm`}>
              <div className="flex items-center gap-2 mb-8 opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.labelText}`}>외부 계정 연동</h4>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col gap-1.5">
                  <label className={`pl-1 text-[11px] font-black uppercase tracking-wider ${theme.labelText}`}>GitHub 연동</label>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input type="text" name="githubUrl" value={formData.githubUrl} onChange={handleChange} placeholder="GitHub URL 또는 아이디" className={`flex-1 px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.innerInputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
                    {formData.githubUrl && (
                      <button type="button" onClick={handleGithubSync} className={`bg-zinc-900 dark:bg-blue-600 text-white font-black rounded-2xl transition-all shadow-lg active:scale-95 whitespace-nowrap ${isCompact ? 'px-6 py-2.5 text-[10px]' : 'px-8 py-3.5 text-xs'}`}>동기화 하기</button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`pl-1 text-[11px] font-black uppercase tracking-wider ${theme.labelText}`}>기술 블로그</label>
                  <input type="text" name="blogUrl" value={formData.blogUrl} onChange={handleChange} placeholder="https://velog.io/@username" className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.innerInputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. 학력 및 기술 탭 */}
        {activeTab === 'edu' && (
          <div className={`${isCompact ? 'space-y-6' : 'space-y-10'} animate-fade-in`}>
            {/* 학력 정보 카드 */}
            <div className={`p-8 rounded-[32px] border-2 transition-all ${theme.cardBg} shadow-sm`}>
              <div className="flex items-center gap-2 mb-8 opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-5.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.labelText}`}>학력 정보</h4>
              </div>

              <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 ${isCompact ? 'gap-5' : 'gap-8'}`}>
                <div className="flex flex-col gap-1.5 relative">
                  <label className={`pl-1 text-[11px] font-black uppercase tracking-wider ${theme.labelText}`}>학교명</label>
                  <input 
                    type="text" 
                    name="school" 
                    value={formData.school} 
                    onChange={(e) => {
                      handleChange(e);
                      searchSchool(e.target.value);
                    }} 
                    onBlur={() => setTimeout(() => setShowSchoolList(false), 200)}
                    onFocus={() => formData.school.length >= 2 && setShowSchoolList(true)}
                    autoComplete="off"
                    placeholder="학교명 입력 (2자 이상)"
                    className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.innerInputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} 
                  />
                  {showSchoolList && (
                    <div className={`absolute top-[calc(100%+8px)] left-0 right-0 z-50 max-h-56 overflow-y-auto rounded-[24px] border-2 shadow-2xl custom-scrollbar ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-100'}`}>
                      {schoolResults.length > 0 ? (
                        schoolResults.map((item, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => {
                              handleChange({ target: { name: 'school', value: item.schoolName } });
                              setShowSchoolList(false);
                            }}
                            className={`px-5 py-3.5 text-sm cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-zinc-700 text-zinc-300' : 'hover:bg-blue-50 text-zinc-700'}`}
                          >
                            <div className="font-black text-xs">{item.schoolName}</div>
                            <div className="text-[10px] opacity-60 mt-0.5">{item.region} | {item.campusName}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-5 py-5 text-[11px] text-center opacity-50 font-bold">검색 결과가 없습니다.</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 relative">
                  <label className={`pl-1 text-[11px] font-black uppercase tracking-wider ${theme.labelText}`}>전공명</label>
                  <input 
                    type="text" 
                    name="major" 
                    value={formData.major} 
                    onChange={(e) => {
                      handleChange(e);
                      searchMajor(e.target.value);
                    }} 
                    onBlur={() => setTimeout(() => setShowMajorList(false), 200)}
                    onFocus={() => formData.major.length >= 2 && setShowMajorList(true)}
                    autoComplete="off"
                    placeholder="전공명 입력 (2자 이상)"
                    className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.innerInputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} 
                  />
                  {showMajorList && (
                    <div className={`absolute top-[calc(100%+8px)] left-0 right-0 z-50 max-h-56 overflow-y-auto rounded-[24px] border-2 shadow-2xl custom-scrollbar ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-100'}`}>
                      {majorResults.length > 0 ? (
                        majorResults.map((item, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => {
                              handleChange({ target: { name: 'major', value: item.majorName } });
                              setShowMajorList(false);
                            }}
                            className={`px-5 py-4 text-xs font-black cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-zinc-700 text-zinc-300' : 'hover:bg-blue-50 text-zinc-700'}`}
                          >
                            {item.majorName}
                          </div>
                        ))
                      ) : (
                        <div className="px-5 py-5 text-[11px] text-center opacity-50 font-bold">검색 결과가 없습니다.</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`pl-1 text-[11px] font-black uppercase tracking-wider ${theme.labelText}`}>학점 (GPA)</label>
                  <input type="text" name="gpa" value={formData.gpa} onChange={handleChange} placeholder="4.5 / 4.5" className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.innerInputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
                </div>
              </div>
            </div>

            {/* 기술 스택 카드 */}
            <div className={`p-8 rounded-[32px] border-2 transition-all ${theme.cardBg} shadow-sm`}>
              <div className="flex items-center gap-2 mb-8 opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.labelText}`}>기술 스택</h4>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={`pl-1 text-[11px] font-black uppercase tracking-wider ${theme.labelText}`}>보유 기술</label>
                <textarea name="skills" value={formData.skills} onChange={handleChange} rows="2" placeholder="사용 가능한 기술을 콤마(,)로 구분하여 입력해주세요. (예: React, Node.js, Python)" className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 resize-none ${theme.innerInputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className={`${isCompact ? 'space-y-6' : 'space-y-10'} animate-fade-in`}>
            {/* 프로젝트 관리 헤더 */}
            <div className={`p-6 rounded-[28px] border-2 transition-all ${theme.cardBg} shadow-sm flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h4 className={`text-[13px] font-black ${theme.titleText}`}>프로젝트 관리</h4>
                  <p className="text-[10px] font-bold opacity-50 uppercase tracking-wider">Total {formData.projects.length} Items</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={addProject} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                새 프로젝트 추가
              </button>
            </div>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="projects-list">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className={`${isCompact ? 'space-y-6' : 'space-y-10'}`}>
                    {formData.projects.map((project, index) => (
                      <Draggable key={project.id || `fallback-${index}`} draggableId={String(project.id || `fallback-${index}`)} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef} 
                            {...provided.draggableProps} 
                            className={`group relative rounded-[40px] border-2 transition-all duration-500 ${
                              snapshot.isDragging 
                                ? "shadow-2xl scale-[1.02] border-blue-500 bg-white dark:bg-zinc-800 z-50" 
                                : `${theme.cardBg} hover:border-zinc-400 dark:hover:border-zinc-500`
                            }`}
                          >
                            {/* 드래그 핸들 & 인덱스 배지 */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div {...provided.dragHandleProps} className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full cursor-grab active:cursor-grabbing" />
                            </div>
                            <div className="absolute -left-3 -top-3 w-10 h-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl flex items-center justify-center font-black text-xs shadow-xl ring-4 ring-white dark:ring-zinc-900">
                              {index + 1}
                            </div>

                            <div className={`p-8 lg:p-10 ${isCompact ? 'pt-10' : 'pt-12'}`}>
                              {/* 1. 기본 정보 그리드 (4열) */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="flex flex-col gap-1.5">
                                  <label className={`pl-1 text-[10px] font-black uppercase tracking-wider ${theme.labelText}`}>프로젝트명</label>
                                  <input type="text" name="name" value={project.name} onChange={(e) => handleProjectChange(index, e)} placeholder="핵심 제목" className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.innerInputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={`pl-1 text-[10px] font-black uppercase tracking-wider ${theme.labelText}`}>진행 기간</label>
                                  <input type="text" name="period" value={project.period} onChange={(e) => handleProjectChange(index, e)} placeholder="2024.01 - 2024.03" className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.innerInputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={`pl-1 text-[10px] font-black uppercase tracking-wider ${theme.labelText}`}>수행 역할</label>
                                  <input type="text" name="role" value={project.role || ""} onChange={(e) => handleProjectChange(index, e)} placeholder="Front-end Developer" className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.innerInputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className={`pl-1 text-[10px] font-black uppercase tracking-wider ${theme.labelText}`}>사용 기술</label>
                                  <input type="text" name="techStack" value={project.techStack || ""} onChange={(e) => handleProjectChange(index, e)} placeholder="React, Tailwind CSS" className={`w-full px-5 rounded-2xl border-2 outline-none transition-all focus:ring-2 ${theme.innerInputBg} ${isCompact ? 'py-2.5 text-sm' : 'py-3.5'}`} />
                                </div>
                              </div>

                              {/* 2. 상세 설명 영역 (와이드) */}
                              <div className="flex flex-col gap-1.5 relative">
                                <div className="flex items-center justify-between mb-1 pl-1">
                                  <label className={`text-[10px] font-black uppercase tracking-wider ${theme.labelText}`}>상세 성과 및 설명</label>
                                  <button 
                                    type="button" 
                                    onClick={() => handleAiAudit(
                                      `project-${index}`, 
                                      project.description, 
                                      `프로젝트명: ${project.name}, 역할: ${project.role}, 기술스택: ${project.techStack}`
                                    )}
                                    disabled={isAiLoading}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black transition-all duration-300 ${
                                      isAiLoading 
                                        ? 'bg-zinc-100 text-zinc-400' 
                                        : 'bg-blue-600 text-white hover:shadow-lg active:scale-95'
                                    }`}
                                  >
                                    {isAiLoading ? '분석 중...' : 'AI 컨설팅'}
                                  </button>
                                </div>
                                <textarea 
                                  name="description" 
                                  value={project.description} 
                                  onChange={(e) => handleProjectChange(index, e)} 
                                  rows={isCompact ? "3" : "5"} 
                                  placeholder="어떤 문제를 해결했고, 어떤 성과를 냈는지 구체적으로 적어주세요." 
                                  className={`w-full px-6 py-4 rounded-[24px] border-2 outline-none transition-all focus:ring-2 resize-none leading-relaxed ${theme.innerInputBg} ${isCompact ? 'text-sm' : ''}`} 
                                />
                              </div>

                              {/* 3. 삭제 버튼 */}
                              <div className="flex justify-end mt-6">
                                <button 
                                  type="button" 
                                  onClick={() => removeProject(index)} 
                                  className="group/del flex items-center gap-2 text-[10px] font-black text-red-500/40 hover:text-red-500 transition-all uppercase tracking-tighter"
                                >
                                  <span className="opacity-0 group-hover/del:opacity-100 transition-opacity">Remove Project</span>
                                  <div className="w-8 h-8 rounded-xl bg-red-500/5 group-hover/del:bg-red-500 flex items-center justify-center transition-all group-hover/del:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </div>
                                </button>
                              </div>
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

      {/* 4. AI 피드백 모달 */}
      {isAiModalOpen && aiFeedback && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className={`relative w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-white'}`}>
            
            {/* 모달 헤더 */}
            <div className="p-8 border-b border-zinc-700/10 flex items-center justify-between bg-zinc-900">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-blue-400">
                    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">OneResume AI 컨설팅</h3>
                  <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Powered by Gemini</p>
                </div>
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 본문 */}
            <div className="p-8 max-h-[65vh] overflow-y-auto custom-scrollbar space-y-10">
              {/* 전문가 총평 -> AI 커리어 인사이트 */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                  <h4 className={`text-sm font-black ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>AI 커리어 인사이트</h4>
                </div>
                <div className={`p-6 rounded-[24px] font-medium leading-relaxed text-sm ${isDarkMode ? 'bg-zinc-800/50 text-zinc-300' : 'bg-gray-50 text-zinc-600'}`}>
                  {aiFeedback.feedback}
                </div>
              </section>

              {/* 추천 문장 (Refined Text) */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                  <h4 className={`text-sm font-black ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>추천 드리는 완성 문장</h4>
                </div>
                <div className={`flex flex-col gap-4 p-7 rounded-[32px] border-2 transition-all duration-500 ${isDarkMode ? 'bg-blue-950/20 border-blue-500/30 text-blue-100 shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]' : 'bg-blue-50/50 border-blue-100 text-blue-900 shadow-xl shadow-blue-500/5'}`}>
                  <p className="font-bold text-base lg:text-lg leading-relaxed italic text-center py-2">"{aiFeedback.refinedText}"</p>
                  <div className="flex justify-center">
                    <button 
                      onClick={() => applyAiRefinement(aiFeedback.refinedText)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-xl flex items-center gap-3 hover:scale-105 hover:bg-blue-700 active:scale-95 transition-all group/btn"
                    >
                      <span className="text-xs font-black">이 추천 문장으로 즉시 변경하기</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </section>

              {/* 보완을 위한 질문 - 가독성 강화 */}
              {aiFeedback.questions && aiFeedback.questions.length > 0 && (
                <section className="space-y-4 pb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                    <h4 className={`text-sm font-black ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>내용을 더 풍성하게 만드는 팁</h4>
                  </div>
                  <div className="grid gap-4">
                    {aiFeedback.questions.map((q, i) => (
                      <div key={i} className={`flex items-start gap-5 p-6 rounded-3xl transition-all border ${isDarkMode ? 'bg-zinc-800/30 border-zinc-700/50 text-zinc-300' : 'bg-white border-zinc-100 shadow-sm text-zinc-700'}`}>
                        <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-[12px] font-black shadow-lg shadow-blue-600/20">Q{i+1}</span>
                        <p className="text-[14px] font-bold leading-relaxed pt-1">{q}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* 모달 푸터 */}
            <div className={`p-6 border-t ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'} flex justify-end`}>
              <button 
                onClick={() => setIsAiModalOpen(false)}
                className={`px-8 py-3 rounded-2xl text-xs font-black transition-all ${isDarkMode ? 'text-zinc-500 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-zinc-800 hover:bg-gray-100'}`}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeForm;