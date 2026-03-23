// 메인
import React, { useState, useRef } from "react";
import ResumeForm from "./components/ResumeForm";
import ResumePreview from "./components/ResumePreview";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    education: "",
    skills: "",
    summary: "",
    experience: "",
  });

  const resumeRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const downloadPDF = () => {
    window.print();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/api/save-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => alert(data.message))
      .catch((err) => console.error("에러:", err));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <header className="text-center mb-12 relative">
        <h1 className="text-4xl font-black text-slate-800 mb-2">OneResume</h1>
        <p className="text-slate-500 font-medium text-lg">
          통합 이력서 관리를 위한 정밀 데이터 구축
        </p>
        <button
          onClick={downloadPDF}
          className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2 mx-auto"
        >
          <span>PDF로 내보내기</span>
        </button>
      </header>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-center gap-10">
        <ResumeForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
        />
        <ResumePreview formData={formData} ref={resumeRef} />
      </div>
    </div>
  );
}

export default App;