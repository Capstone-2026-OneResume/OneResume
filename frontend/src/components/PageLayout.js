import React from 'react';

const PageLayout = ({ children, isDarkMode, noPadding = false }) => {
  return (
    <div className={`relative min-h-screen w-full flex flex-col transition-colors duration-300 overflow-hidden ${
      isDarkMode ? 'bg-zinc-900' : 'bg-gray-50'
    }`}>
      {/* 장식용 배경 원형 (Z-index 낮춰서 방해 안 되게) */}
      <div className={`w-[500px] h-[500px] fixed -right-20 -top-28 rounded-full blur-[80px] transition-all duration-500 pointer-events-none opacity-50 ${
        isDarkMode ? 'bg-blue-500/10' : 'bg-blue-700/5'
      }`}></div>
      <div className={`w-96 h-96 fixed -left-32 bottom-20 rounded-full blur-[60px] transition-all duration-500 pointer-events-none opacity-50 ${
        isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-700/5'
      }`}></div>

      {/* 실제 컨텐츠 */}
      <div className={`flex-1 flex flex-col z-10 ${noPadding ? '' : 'p-4 md:p-6'}`}>
        {children}
      </div>
    </div>
  );
};

export default PageLayout;