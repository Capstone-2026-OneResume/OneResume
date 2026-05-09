const API_BASE_URL = "https://api.oneresume.kr"; // 또는 http://localhost:5000

async function updatePopup() {
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const dataDisplay = document.getElementById('data-display');

  // 1. 저장된 토큰 가져오기
  chrome.storage.local.get(['oneresume_token'], async (result) => {
    const token = result.oneresume_token;

    if (!token) {
      statusDot.classList.remove('active');
      statusText.innerText = "연동 필요";
      dataDisplay.innerText = "웹사이트에서 [원클릭 동기화]를 먼저 눌러주세요.";
      return;
    }

    // 2. API 호출하여 데이터 가져오기
    try {
      statusText.innerText = "데이터 불러오는 중...";
      const response = await fetch(`${API_BASE_URL}/api/resume/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("인증이 만료되었거나 서버 오류가 발생했습니다.");
      }

      const data = await response.json();
      
      // 3. UI 업데이트
      statusDot.classList.add('active');
      statusText.innerText = "동기화 완료";
      statusText.style.color = "#10b981";
      dataDisplay.innerText = JSON.stringify(data, null, 2);
      
    } catch (error) {
      statusDot.classList.remove('active');
      statusText.innerText = "오류 발생";
      dataDisplay.innerText = error.message;
    }
  });
}

// 팝업 열릴 때 실행
document.addEventListener('DOMContentLoaded', updatePopup);

// 새로고침 버튼 이벤트
document.getElementById('refresh-btn').addEventListener('click', updatePopup);
