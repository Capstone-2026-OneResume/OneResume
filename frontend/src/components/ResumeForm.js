// 입력 담당
import React from "react";

function ResumeForm({ formData, handleChange, handleSubmit }) {
  return (
    <div className="w-full lg:w-[450px] bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-fit">
      <h2 className="text-xl font-bold mb-6 text-slate-800 border-l-4 border-blue-600 pl-3">
        정보 입력
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="홍길동"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="abc@example.com"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">최종 학력</label>
          <input
            type="text"
            name="education"
            value={formData.education}
            onChange={handleChange}
            className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="한남대학교 컴퓨터공학과"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">보유 기술</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="React, AWS"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">한 줄 자기소개</label>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            rows="2"
            className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="자기소개"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">주요 프로젝트</label>
          <textarea
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            rows="4"
            className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="경험 상세 내용"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all"
        >
          이력서 중앙 저장소로 전송
        </button>
      </form>
    </div>
  );
}

export default ResumeForm;