// src/components/PasswordValidation.js
import React from 'react';

// 공통 정규식
export const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// 공통 인디케이터 아이템
export const ValidationItem = ({ isValid, text, isDirty }) => {
  const Icon = () => {
    if (isValid) return <span className="mr-1.5 text-emerald-500 font-bold">✓</span>;
    if (isDirty) return <span className="mr-1.5 text-red-500 font-extrabold text-sm relative top-[0.5px]">×</span>;
    return <span className="mr-1.5 text-slate-400">○</span>;
  };

  const getTextColor = () => {
    if (isValid) return 'text-emerald-600';
    if (isDirty) return 'text-red-600';
    return 'text-slate-500';
  };

  return (
    <div className={`flex items-center text-xs font-semibold transition-colors duration-300 ${getTextColor()}`}>
      <Icon />
      {text}
    </div>
  );
};