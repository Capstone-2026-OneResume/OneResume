console.log("🚀 OneResume Connect Content Script Loaded!");

// 1. 웹사이트의 설치 확인 신호(PING)에 응답
window.addEventListener('ONERESUME_PING', () => {
  console.log("📥 PING received from website");
  window.dispatchEvent(new CustomEvent('ONERESUME_PONG'));
});

// 2. 웹사이트로부터 토큰 동기화 메시지 수신 (window.postMessage)
window.addEventListener('message', (event) => {
  // 보안을 위해 신뢰할 수 있는 출처나 메시지 타입 확인 가능
  if (event.data && event.data.type === 'ONERESUME_SYNC_TOKEN') {
    const { token } = event.data;
    console.log("🔑 Syncing token to storage...");

    // Chrome Local Storage에 토큰 저장
    chrome.storage.local.set({ 'oneresume_token': token }, () => {
      console.log("✅ Token saved successfully!");
      
      // 성공 알림을 웹사이트로 다시 보냄
      window.postMessage({ type: 'ONERESUME_SYNC_SUCCESS' }, "*");
    });
  }
});
