const API_BASE_URL = "https://api.oneresume.kr";

const decodeToken = (encoded) => {
  try {
    return atob(encoded);
  } catch (e) {
    return null;
  }
};

let currentResumeData = null;

async function updatePopup() {
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const dataDisplay = document.getElementById('data-display');
  const autofillBtn = document.getElementById('autofill-btn');
  const lastSync = document.getElementById('last-sync');

  // 1. 저장된 인코딩 토큰 가져오기
  chrome.storage.local.get(['oneresume_token'], async (result) => {
    const encodedToken = result.oneresume_token;
    const token = decodeToken(encodedToken);

    if (!token) {
      statusDot.classList.remove('active');
      statusText.innerText = "연동 필요";
      dataDisplay.innerText = "웹사이트에서 [원클릭 동기화]를 먼저 눌러주세요.";
      autofillBtn.disabled = true;
      return;
    }

    // 2. API 호출
    try {
      statusText.innerText = "업데이트 중...";
      const response = await fetch(`${API_BASE_URL}/api/resume/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("세션이 만료되었습니다.");

      const data = await response.json();
      currentResumeData = data;
      
      // 3. UI 업데이트
      statusDot.classList.add('active');
      statusText.innerText = "연동 활성화";
      statusText.style.color = "#10b981";
      autofillBtn.disabled = false;
      
      dataDisplay.innerText = `[${data.basics.name}] 님의 마스터 데이터가 로드되었습니다.\n\n최종 업데이트: ${new Date(data.generatedAt).toLocaleString()}`;
      lastSync.innerText = new Date().toLocaleTimeString();
      
    } catch (error) {
      statusDot.classList.remove('active');
      statusText.innerText = "오류 발생";
      dataDisplay.innerText = error.message;
      autofillBtn.disabled = true;
    }
  });
}

// 자동 입력 버튼 클릭 이벤트
document.getElementById('autofill-btn').addEventListener('click', async () => {
  if (!currentResumeData) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab) {
    chrome.tabs.sendMessage(tab.id, {
      action: "RUN_AUTOFILL",
      resumeData: currentResumeData
    }, (response) => {
      if (chrome.runtime.lastError) {
        alert("이 페이지에서는 자동 입력을 지원하지 않거나, 새로고침이 필요합니다.");
      } else {
        window.close(); // 성공 시 팝업 닫기
      }
    });
  }
});

// 팝업 열릴 때 실행
document.addEventListener('DOMContentLoaded', updatePopup);

// 새로고침 버튼 이벤트
document.getElementById('refresh-btn').addEventListener('click', updatePopup);
