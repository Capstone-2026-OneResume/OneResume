//미리보기 담당
import React from "react";

const ResumePreview = React.forwardRef(({ formData }, ref) => {
  return (
    <div
      ref={ref}
      className="bg-white shadow-2xl border-t-[12px] border-blue-600 w-[210mm] min-h-[297mm] p-[20mm] text-left flex flex-col box-border overflow-hidden"
      style={{ wordBreak: "break-all" }}
    >
      {/* 헤더 */}
      <div className="border-b-2 border-slate-100 pb-8 mb-10 text-center">
        <h2 className="text-4xl font-black text-slate-900 mb-4">
          {formData.name || "이름 없음"}
        </h2>
        <div className="flex justify-center items-center gap-3 text-slate-500 text-sm font-medium">
          <span>{formData.email || "Email"}</span>
          <span className="text-slate-300">|</span>
          <span>{formData.education || "Education"}</span>
        </div>
      </div>

      {/* 본문 */}
      <div className="space-y-10">
        {formData.summary && (
          <section>
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-blue-600 font-black mb-3 border-l-4 border-blue-600 pl-3">
              About Me
            </h3>
            <p className="text-lg text-slate-700 italic font-medium bg-slate-50 p-4 rounded-lg">
              "{formData.summary}"
            </p>
          </section>
        )}

        <section>
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-blue-600 font-black mb-4 border-l-4 border-blue-600 pl-3">
            Technical Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {formData.skills ? (
              formData.skills.split(",").map((s, i) => (
                <span
                  key={i}
                  className="bg-white text-blue-700 px-3 py-1.5 rounded-md text-xs font-bold border border-blue-200 shadow-sm"
                >
                  {s.trim()}
                </span>
              ))
            ) : (
              <p className="text-slate-300 text-sm">기술 스택이 표시됩니다.</p>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-blue-600 font-black mb-4 border-l-4 border-blue-600 pl-3">
            Experience & Projects
          </h3>
          <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[15px]">
            {formData.experience || "경력 및 프로젝트 내용을 채워주세요."}
          </div>
        </section>
      </div>
    </div>
  );
});

export default ResumePreview;