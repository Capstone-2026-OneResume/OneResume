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
  const mainUI = document.getElementById('main-ui');
  const errorUI = document.getElementById('error-ui');
  const mask = document.getElementById('disabled-mask');
  const masterToggle = document.getElementById('master-toggle');

  // 1. 저장된 설정 가져오기
  chrome.storage.local.get(['oneresume_token', 'or_extension_active'], async (result) => {
    const isActive = result.or_extension_active !== false;
    
    // UI 상태 초기화 (클래스 기반)
    masterToggle.checked = isActive;
    if (isActive) mask.classList.remove('active');
    else mask.classList.add('active');

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
      statusText.innerText = "데이터 로드 중...";
      const response = await fetch(`${API_BASE_URL}/api/resume/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("세션 만료");

      const data = await response.json();
      currentResumeData = data;
      
      // 3. UI 업데이트
      mainUI.style.display = 'block';
      errorUI.style.display = 'none';
      statusDot.classList.add('active');
      statusText.innerText = "연동 활성화";
      statusText.style.color = "#10b981";
      autofillBtn.disabled = false;
      
      dataDisplay.innerHTML = `[<span class="user-name">${data.basics.name}</span>] 님의 이력서 데이터가 로드되었습니다.<br><br><span class="sync-badge">최종 업데이트: ${new Date(data.generatedAt).toLocaleString()}</span>`;
      lastSync.innerText = new Date().toLocaleTimeString();
      
    } catch (error) {
      mainUI.style.display = 'none';
      errorUI.style.display = 'flex';
    }
  });
}

// 토글 스위치 이벤트
document.getElementById('master-toggle').addEventListener('change', (e) => {
  const isActive = e.target.checked;
  chrome.storage.local.set({ 'or_extension_active': isActive });
  
  // 마스크 UI 실시간 반영 (클래스 기반으로 변경하여 트랜지션 유지)
  const mask = document.getElementById('disabled-mask');
  if (mask) {
    if (isActive) mask.classList.remove('active');
    else mask.classList.add('active');
  }
});

// 홈페이지 이동 버튼
document.getElementById('go-home-btn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://oneresume.kr' });
});

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