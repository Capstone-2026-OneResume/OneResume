import React, { useState } from "react";

function App() {
  // 1. 입력 데이터를 담을 바구니 (State)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    education: "",
    skills: "",
  });

  // 2. 입력값이 변할 때마다 바구니에 업데이트하는 함수
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 3. 저장 버튼을 눌렀을 때 백엔드로 보내는 함수
  const handleSubmit = (e) => {
    e.preventDefault(); // 페이지 새로고침 방지

    fetch("http://localhost:5000/api/save-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message); //백엔드에서 온 성공 메시지 띄우기
      })
      .catch((err) => console.error("에러:", err));
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}> OneResume 이력서 작성</h1>

      <div style={{ display: "flex", gap: "40px", justifyContent: "center" }}>
        {/* 입력 영역 */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: "400px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <div>
            <label style={{ display: "block", fontWeight: "bold" }}>이름</label>
            <input
              style={{ width: "100%" }}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="홍길동"
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: "bold" }}>
              이메일
            </label>
            <input
              style={{ width: "100%" }}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: "bold" }}>학력</label>
            <input
              style={{ width: "100%" }}
              type="text"
              name="education"
              value={formData.education}
              onChange={handleChange}
              placeholder="OO대학교 컴퓨터공학과"
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: "bold" }}>
              기술 스택 (쉼표로 구분)
            </label>
            <input
              style={{ width: "100%" }}
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, Node.js, Python"
            />
          </div>

          <button
            type="submit"
            style={{
              padding: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            이력서 저장하기
          </button>
        </form>

        {/* 실시간 미리보기 영역 (이게 중요!) */}
        <div
          style={{
            width: "400px",
            border: "1px solid #ccc",
            padding: "20px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h2
            style={{ borderBottom: "2px solid #007bff", paddingBottom: "10px" }}
          >
            미리보기
          </h2>
          <p>
            <strong>이름:</strong> {formData.name}
          </p>
          <p>
            <strong>이메일:</strong> {formData.email}
          </p>
          <p>
            <strong>학력:</strong> {formData.education}
          </p>
          <p>
            <strong>기술 스택:</strong>
            {formData.skills.split(",").map(
              (skill, index) =>
                skill.trim() && (
                  <span
                    key={index}
                    style={{
                      backgroundColor: "#e1e1e1",
                      padding: "2px 8px",
                      margin: "2px",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  >
                    {skill.trim()}
                  </span>
                ),
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
