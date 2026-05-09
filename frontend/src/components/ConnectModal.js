import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";

function ConnectModal({ isOpen, onClose, isDarkMode }) {
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // 확장 프로그램 설치 여부 확인
  useEffect(() => {
    if (isOpen) {
      const checkExtension = () => {
        const event = new CustomEvent('ONERESUME_PING');
        window.dispatchEvent(event);
      };

      const handlePong = () => {
        setIsExtensionInstalled(true);
      };

      window.addEventListener('ONERESUME_PONG', handlePong);
      checkExtension();

      // 브라우저 익스텐션 전용 API 체크 (존재 시 설치된 것으로 간주)
      if (window.chrome && window.chrome.runtime && window.chrome.runtime.sendMessage) {
        // 단, 외부 웹사이트에서 접근 가능하도록 설정되어 있어야 함
      }

      return () => window.removeEventListener('ONERESUME_PONG', handlePong);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 확장 프로그램으로 토큰 직접 전달 (원클릭 연동)
  const handleSyncExtension = () => {
    const token = localStorage.getItem("oneresume-token") || sessionStorage.getItem("oneresume-token");
    if (!token) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    setIsSyncing(true);
    const loadingToast = toast.loading("확장 프로그램과 연결 중...");

    // 확장 프로그램에 메시지 전송
    window.postMessage({ 
      type: 'ONERESUME_SYNC_TOKEN', 
      token: token 
    }, "*");

    // 확장 프로그램으로부터 응답 대기 (3초 후 타임아웃)
    const timeout = setTimeout(() => {
      setIsSyncing(false);
      toast.error("확장 프로그램 응답이 없습니다. 설치 여부를 확인해주세요.", { id: loadingToast });
    }, 3000);

    const handleSyncSuccess = (event) => {
      if (event.data?.type === 'ONERESUME_SYNC_SUCCESS') {
        clearTimeout(timeout);
        setIsSyncing(false);
        toast.success("확장 프로그램 연동 성공!", { id: loadingToast });
        window.removeEventListener('message', handleSyncSuccess);
      }
    };

    window.addEventListener('message', handleSyncSuccess);
  };

  const handleCopyJson = async () => {
    const token = localStorage.getItem("oneresume-token") || sessionStorage.getItem("oneresume-token");
    if (!token) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    const loadingToast = toast.loading("데이터를 추출하고 있습니다...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/resume/export`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("데이터 로드 실패");
      const data = await response.json();
      
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      toast.success("표준 JSON이 클립보드에 복사되었습니다!", { id: loadingToast });
    } catch (e) {
      toast.error("데이터를 가져오는 중 오류가 발생했습니다.", { id: loadingToast });
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className={`relative w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-500 ${
        isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'
      }`}>
        {/* 상단 디자인 바 */}
        <div className="h-2 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600" />
        
        <div className="p-10">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-700 rounded-[22px] flex items-center justify-center shadow-2xl shadow-purple-500/30 transform -rotate-6">
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-2xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-zinc-800'}`}>OneResume Connect</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${isExtensionInstalled ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                  <span className={`text-[11px] font-black uppercase tracking-widest ${isExtensionInstalled ? 'text-emerald-500' : 'text-zinc-500'}`}>
                    {isExtensionInstalled ? 'Extension Active' : 'Extension Not Detected'}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className={`w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-zinc-500/10 transition-all active:scale-90 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className={`p-8 rounded-[32px] border-2 border-dashed transition-all ${
              isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600/10 text-blue-600 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">1</div>
                  <p className={`text-sm font-bold leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    채용 사이트(원티드, 사람인 등)에서 <span className="text-blue-600 underline underline-offset-4">원클릭으로 이력서를 입력</span>하려면 확장 프로그램이 필요합니다.
                  </p>
                </div>
                {!isExtensionInstalled && (
                  <button 
                    onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}
                    className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-2xl text-sm font-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10"
                  >
                    확장 프로그램 설치하기
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleSyncExtension}
                disabled={isSyncing}
                className={`flex flex-col items-center justify-center p-6 rounded-[32px] transition-all transform hover:-translate-y-1 active:scale-95 group ${
                  isDarkMode ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-purple-600 text-white shadow-xl shadow-purple-600/20'
                }`}
              >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <span className="text-sm font-black">원클릭 동기화</span>
                <span className="text-[10px] opacity-70 mt-1 font-bold">Extension Sync</span>
              </button>

              <button 
                onClick={handleCopyJson}
                className={`flex flex-col items-center justify-center p-6 rounded-[32px] transition-all transform hover:-translate-y-1 active:scale-95 group ${
                  isDarkMode ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' : 'bg-white text-zinc-600 border border-zinc-200 shadow-lg shadow-zinc-200/50'
                }`}
              >
                <div className="w-12 h-12 bg-zinc-500/10 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </div>
                <span className="text-sm font-black">표준 데이터 복사</span>
                <span className="text-[10px] opacity-70 mt-1 font-bold">Copy JSON</span>
              </button>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className={`text-[11px] font-bold leading-relaxed ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
              확장 프로그램은 사용자의 데이터를 안전하게 암호화하여 처리하며,<br/>
              허용된 사이트 외에는 어떤 데이터도 전송하지 않습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConnectModal;
