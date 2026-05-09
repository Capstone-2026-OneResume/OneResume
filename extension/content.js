console.log("🚀 OneResume Connect: Engine v1.1.1 (Stable) Loaded");

const encodeToken = (str) => {
  try { return btoa(str); } catch(e) { return str; }
};

window.addEventListener('ONERESUME_PING', () => {
  try {
    if (window.chrome && chrome.runtime && chrome.runtime.id) {
      window.dispatchEvent(new CustomEvent('ONERESUME_PONG'));
    }
  } catch (e) {}
});

window.addEventListener('message', (event) => {
  try {
    if (!event || !event.data || typeof event.data !== 'object') return;
    if (event.data.type === 'ONERESUME_SYNC_TOKEN') {
      const { token } = event.data;
      if (window.chrome && chrome.runtime && chrome.runtime.id) {
        chrome.storage.local.set({ 'oneresume_token': encodeToken(token) }, () => {
          window.postMessage({ type: 'ONERESUME_SYNC_SUCCESS' }, "*");
        });
      }
    }
  } catch (err) {}
});

/**
 * ---------------------------------------------------------
 * [버전 1.1.1] 완전체 자동 입력 설정
 * ---------------------------------------------------------
 */
const AUTOFILL_CONFIG = {
  'wanted.co.kr': {
    'input[name="name"]': 'basics.name',
    'input[name="email"]': 'basics.email',
    'input[name="mobile"]': 'basics.phone',
  },
  'saramin.co.kr': {
    // 1. 인적사항 (다중 셀렉터)
    'input[name="nm"], input#nm, input[placeholder*="이름"]': 'basics.name',
    'input[name="email"], input#email, input[placeholder*="이메일"]': 'basics.email',
    'input[name="phone"], input#phone, input[placeholder*="휴대폰"]': 'basics.phone',

    // 2. 학력 (강력한 복구)
    'input#school_nm, input[placeholder*="학교명"], input[title*="학교명"], input[name*="school"]': 'education.0.institution',
    'input#major_nm, input[placeholder*="전공"], input[title*="전공"], input[name*="major"]': 'education.0.area',
    'input#gpa, input[placeholder*="학점"], input[title*="학점"], input[name*="score"]': 'education.0.score',

    // 3. 경력
    'input#company_nm, input[placeholder*="회사명"], input[name*="company"]': 'work.0.company',
    'input#work_position, input[placeholder*="직무"], input[name*="position"]': 'work.0.position',
    'input[placeholder*="입사년월"]': 'work.0.startDate',
    'input[placeholder*="퇴사년월"]': 'work.0.endDate',
    'textarea#work_desc, textarea[placeholder*="업무"], textarea[name*="work"]': 'work.0.summary',

    // 4. 기타
    'input[placeholder*="GitHub"]': 'basics.profiles.0.url',
    'textarea[placeholder*="성장"]': 'selfIntroduction.growth',
    'textarea[placeholder*="성격"]': 'selfIntroduction.character',
    'textarea[placeholder*="지원"]': 'selfIntroduction.motivation',

    // 5. 클릭 자동화
    'CLICK_SELECT': {
      '대학구분': 'education.0.studyType',
      '졸업여부': 'education.0.status'
    }
  }
};

const clickByText = (text) => {
  const elements = Array.from(document.querySelectorAll('button, a, div, span, li'));
  const target = elements.find(el => el.textContent.trim().includes(text) && el.offsetParent !== null);
  if (target) {
    target.click();
    console.log(`🖱️ Clicked: "${text}"`);
    return true;
  }
  return false;
};

const getValueByPath = (obj, path) => {
  if (!obj) return null;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return null;
    current = current[part];
  }
  if (path.includes('Date') && typeof current === 'string') {
    return current.replace(/[^0-9]/g, '');
  }
  if (Array.isArray(current)) return current.join(', ');
  return current;
};

const runAutofill = async (resumeData) => {
  const host = window.location.hostname;
  const configEntry = Object.entries(AUTOFILL_CONFIG).find(([domain]) => host.includes(domain));
  if (!configEntry) return;

  const config = configEntry[1];
  console.log(`🚀 [OneResume] Deep & Smart Autofill on ${host}`);

  // 1. 텍스트 주입 (querySelectorAll로 모든 일치 항목 대응)
  Object.entries(config).forEach(([selector, dataPath]) => {
    if (selector === 'CLICK_SELECT') return;
    try {
      const value = getValueByPath(resumeData, dataPath);
      if (!value) return;

      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));
      });
    } catch (e) {}
  });

  // 2. 스마트 클릭 처리
  if (config.CLICK_SELECT) {
    for (const [triggerLabel, dataPath] of Object.entries(config.CLICK_SELECT)) {
      const value = getValueByPath(resumeData, dataPath);
      if (!value) continue;
      if (clickByText(triggerLabel)) {
        setTimeout(() => clickByText(value), 350);
      }
    }
  }
};

if (window.chrome && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "RUN_AUTOFILL") {
      runAutofill(request.resumeData);
      sendResponse({ status: "success" });
    }
    return true;
  });
}
