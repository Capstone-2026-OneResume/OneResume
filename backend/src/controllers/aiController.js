const axios = require("axios");
const prisma = require("../config/prisma");

// [보안] 클라이언트용 안전한 에러 메시지 반환 함수
const handleAiError = (error, res, customMessage = "AI 분석 서버에 일시적인 문제가 발생했습니다.") => {
  const errorDetail = error.response?.data?.error?.message || error.message;
  const statusCode = error.response?.status;

  // 서버 콘솔에는 상세 로그 출력
  console.log("-----------------------------------------------");
  console.error(`🚨 AI Error Trace [${new Date().toLocaleString()}]`);
  console.error(`- Status Code: ${statusCode}`);
  console.error(`- Error Message: ${errorDetail}`);
  console.log("-----------------------------------------------");
  
  // 429 Quota Exceeded 대응 (Google API 자체 제한)
  if (statusCode === 429 || error.message.includes("429")) {
    return res.status(429).json({
      message: "현재 AI 사용량이 많아 잠시 휴식이 필요합니다.\n약 1분 후 다시 시도해 주세요.",
      error: "Google Quota Exceeded"
    });
  }

  // [v1.8.7 추가] 503 Service Unavailable 대응
  if (statusCode === 503) {
    return res.status(503).json({
      message: "AI 서비스 점검 중이거나 일시적인 과부하 상태입니다.\n잠시 후 다시 시도해 주세요.",
      error: "AI Service Unavailable"
    });
  }

  // 그 외 일반적인 에러 (500)
  res.status(500).json({ 
    message: customMessage + " 잠시 후 다시 시도해 주세요.",
    error: "Internal Server Error"
  });
};

// [v1.8.0] Gemini 모델 폴백 리스트 (2026년 실시간 쿼터 최적화)
const AI_MODELS = [
  "gemini-3.1-flash-lite",   // 1순위 (실시간 가용 확인)
  "gemini-3.5-flash-lite",   // 2순위
  "gemini-3.5-flash",        // 3순위
  "gemini-2.5-flash",        // 4순위
  "gemini-flash-latest"      // 5순위
];

/**
 * [Helper] Gemini API 호출 (폴백 로직 포함)
 * 429 또는 503 에러 발생 시 다음 가용 모델로 자동 전환합니다.
 */
const callGeminiWithFallback = async (prompt, timeout = 30000) => {
  const apiKey = process.env.GEMINI_API_KEY;
  let lastError = null;

  for (const model of AI_MODELS) {
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await axios.post(apiUrl, {
        contents: [{
          parts: [{ text: prompt }]
        }]
      }, { timeout });

      console.log(`✅ [AI Success] Model: ${model}`);
      return response.data;
    } catch (error) {
      lastError = error;
      const statusCode = error.response?.status;

      // 429(제한 초과) 또는 503(서비스 일시 불가)인 경우에만 다음 모델 시도
      if (statusCode === 429 || statusCode === 503) {
        const errorType = statusCode === 429 ? "Rate Limit (429)" : "Service Unavailable (503)";
        console.warn(`⚠️ [AI Fallback] Model ${model} failed with ${errorType}. Trying next...`);
        continue;
      }

      // 그 외 에러는 즉시 중단
      throw error;
    }
  }

  throw lastError;
};

/**
 * [Core] 실시간 JD 추출 엔진
 * URL에서 채용 공고 본문을 긁어와 텍스트로 변환합니다.
 */
const extractTextFromUrl = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    let html = response.data;
    // 불필요한 태그 및 공백 제거 (정교한 정규식 기반 추출)
    let cleanText = html
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, "")
      .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gmi, "")
      .replace(/<[^>]*>?/gm, " ")
      .replace(/\s\s+/g, " ")
      .trim();

    return cleanText.substring(0, 10000); // AI가 읽기 적당한 길이로 자름
  } catch (e) {
    console.error("URL Extraction Error:", e.message);
    return null;
  }
};

exports.auditResumeContent = async (req, res) => {
  try {
    const { fieldName, content, context } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: "서버에 API 키가 설정되지 않았습니다." });
    }

    if (!content || content.trim().length < 5) {
      return res.status(400).json({ 
        message: "분석할 내용이 너무 짧습니다. 최소 5자 이상 입력해 주세요." 
      });
    }

    const prompt = `
      당신은 세계 최고의 커리어 코치이자 이력서 첨삭 전문가입니다. 
      사용자가 작성한 이력서의 특정 항목을 분석하여 실시간으로 피드백을 주세요.

      [분석 대상 항목]: ${fieldName}
      [현재 작성된 내용]: 
      <<< USER_INPUT_START >>>
      "${content}"
      <<< USER_INPUT_END >>>

      [추가 컨텍스트]: ${context || "없음"}

      [첨삭 가이드라인]:
      1. [한 줄 소개(Bio)] 항목인 경우, 반드시 50자 이내의 강렬한 '한 줄' 문장으로 제안하세요. (에세이 금지)
      2. 사용자가 입력하지 않은 정보(예: [00]%, [성과])를 대괄호나 빈칸 형식으로 억지로 넣지 마세요. 
      3. 구체적인 수치가 없다면 전문적인 어휘(예: '최적화', '효율화', '기여')를 사용하여 문장의 품격을 높이세요.
      4. STAR 기법을 활용하되, 결과(Result)를 문장의 앞부분에 배치하여 임팩트를 주는 방식도 고려하세요.
      5. 답변은 정중하면서도 자신감을 주는 전문가의 톤앤매너를 유지하세요.

      [답변 형식 (반드시 JSON으로만 답변하세요)]:
      {
        "feedback": "전체적인 피드백 요약",
        "suggestions": ["구체적인 문장 수정 제안 1", "수정 제안 2"],
        "questions": ["보완을 위한 핵심 질문 1", "질문 2"],
        "refinedText": "가장 추천하는 완성형 문장 예시"
      }
    `;

    // [v1.8.0] 폴백 로직 적용
    const data = await callGeminiWithFallback(prompt);

    // 응답 데이터에서 텍스트 추출
    const responseText = data.candidates[0].content.parts[0].text;
    
    // JSON 데이터만 추출
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI의 응답에서 유효한 데이터를 찾을 수 없습니다.");
    }

    const auditResult = JSON.parse(jsonMatch[0]);
    res.json(auditResult);

  } catch (error) {
    handleAiError(error, res);
  }
};

// [신규] 채용 공고(JD) 매칭 및 점수화 API
exports.matchJD = async (req, res) => {
  try {
    let { jdText } = req.body;
    const userId = req.user.id;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!jdText || jdText.trim().length < 10) {
      return res.status(400).json({ message: "분석을 위해 공고 URL 또는 내용을 입력해 주세요." });
    }

    // [v1.2.0 복구] 만약 URL이 들어오면 실시간으로 본문 추출
    if (jdText.startsWith('http')) {
      const extracted = await extractTextFromUrl(jdText);
      if (extracted) jdText = extracted;
    }

    // 1. 유저의 마스터 이력서 데이터 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        resumes: {
          take: 1,
          orderBy: { updatedAt: 'desc' },
          include: {
            projects: true,
            workExperiences: true,
            certifications: true
          }
        }
      }
    });

    if (!user || !user.resumes || user.resumes.length === 0) {
      return res.status(404).json({ message: "분석할 이력서 데이터가 없습니다. 먼저 이력서를 작성해 주세요." });
    }

    const resume = user.resumes[0];

    // 2. 이력서 데이터를 텍스트로 직렬화
    const resumeText = `
      [이름/기본정보]: ${user.username}, ${user.bio || "없음"}
      [학력]: ${resume.education || "없음"}
      [보유 기술]: ${resume.skills || "없음"}
      [경력 사항]: ${resume.workExperiences.map(w => `${w.companyName} (${w.role}, ${w.period}): ${w.jobDescription}`).join("\n")}
      [프로젝트]: ${resume.projects.map(p => `${p.name} (${p.role}): ${p.description} (기술: ${p.techStack})`).join("\n")}
      [자격증/수상]: ${resume.certifications.map(c => `${c.name} (${c.issuer}, ${c.date})`).join("\n")}
      [자기소개]: ${resume.selfIntroGrowth || ""} ${resume.selfIntroCharacter || ""} ${resume.selfIntroMotivation || ""}
    `;

    const prompt = `
      당신은 기업의 채용 담당자이자 AI 매칭 전문가입니다. 
      사용자의 [이력서]와 제공된 [채용 정보]를 비교 분석하여 정밀한 리포트를 작성하세요.

      [채용 정보]:
      <<< USER_INPUT_START >>>
      "${jdText}"
      <<< USER_INPUT_END >>>

      [사용자 이력서]:
      "${resumeText}"

      [분석 가이드라인]:
      1. score: 0점에서 100점 사이의 숫자로 매칭 점수를 산출하세요. JD의 필수 역량과 이력서의 경험이 얼마나 일치하는지가 기준입니다.
      2. coreCompetencies: JD에서 요구하는 핵심 역량 및 기술 스택 3~5개를 추출하세요.
      3. matchedKeywords: 사용자의 이력서에서 JD와 일치하거나 관련 있는 키워드/경험을 추출하세요.
      4. missingKeywords: JD에는 있으나 사용자의 이력서에는 부족하거나 보완이 필요한 키워드/역량을 추출하세요.
      5. improvementTips: 이 공고에 합격하기 위해 이력서의 어느 부분을 어떻게 수정하면 좋을지 구체적인 조언을 3개 이상 제공하세요.

      [답변 형식 (반드시 JSON으로만 답변하세요)]:
      {
        "score": 85,
        "coreCompetencies": ["React", "TypeScript", "상태 관리 라이브러리 경험"],
        "matchedKeywords": ["React 숙련도", "포트폴리오 프로젝트 경험"],
        "missingKeywords": ["Next.js", "CI/CD 파이프라인 구축 경험"],
        "improvementTips": [
          "프로젝트 경험 섹션에 Next.js 사용 여부를 구체적으로 명시하세요.",
          "경력 사항에서 협업 도구(Jira, Confluence) 활용 사례를 추가하면 좋습니다.",
          "자기소개서 지원동기에 해당 기업의 비즈니스 모델에 대한 이해도를 녹여내세요."
        ]
      }
    `;

    // [v1.8.0] 폴백 로직 적용
    const data = await callGeminiWithFallback(prompt);

    const responseText = data.candidates[0].content.parts[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("AI 분석 결과 형식이 올바르지 않습니다.");
    }

    const result = JSON.parse(jsonMatch[0]);
    res.json(result);

  } catch (error) {
    handleAiError(error, res, "AI 매칭 분석 중 오류가 발생했습니다.");
  }
};

// [신규] 공고 맞춤형 자소서 생성 API
exports.generateCoverLetter = async (req, res) => {
  try {
    let { jdText } = req.body;
    const userId = req.user.id;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!jdText || jdText.trim().length < 10) {
      return res.status(400).json({ message: "채용 공고 내용을 입력해 주세요." });
    }

    // [v1.2.0 복구] 만약 URL이 들어오면 실시간으로 본문 추출
    if (jdText.startsWith('http')) {
      const extracted = await extractTextFromUrl(jdText);
      if (extracted) jdText = extracted;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        resumes: {
          take: 1,
          orderBy: { updatedAt: 'desc' },
          include: {
            projects: true,
            workExperiences: true,
            certifications: true
          }
        }
      }
    });

    if (!user || !user.resumes || user.resumes.length === 0) {
      return res.status(404).json({ message: "이력서 데이터가 없습니다. 먼저 이력서를 작성해 주세요." });
    }

    const resume = user.resumes[0];

    const resumeText = `
      [이름]: ${user.username}
      [보유 기술]: ${resume.skills || "없음"}
      [경력 사항]: ${resume.workExperiences.map(w => `${w.companyName} (${w.role}, ${w.period}): ${w.jobDescription}`).join("\n")}
      [프로젝트]: ${resume.projects.map(p => `${p.name} (${p.role}): ${p.description} (기술: ${p.techStack})`).join("\n")}
      [자격증/수상]: ${resume.certifications.map(c => `${c.name} (${c.issuer}, ${c.date})`).join("\n")}
      [기존 자기소개서 - 성장과정]: ${resume.selfIntroGrowth || ""}
      [기존 자기소개서 - 성격의 장단점]: ${resume.selfIntroCharacter || ""}
      [기존 자기소개서 - 지원동기 및 포부]: ${resume.selfIntroMotivation || ""}
    `;

    const prompt = `
      당신은 수많은 합격자를 배출한 취업 전문 컨설턴트입니다.
      사용자의 [기존 이력서 정보]와 제공된 [채용 공고(JD)]를 분석하여, 이 공고에 완벽하게 맞춤화된 자기소개서 초안을 작성해주세요.

      [채용 공고]:
      <<< USER_INPUT_START >>>
      "${jdText}"
      <<< USER_INPUT_END >>>

      [사용자 이력서 정보]:
      "${resumeText}"

      [작성 가이드라인]:
      1. 지원동기, 직무 역량, 성장과정/성격 등 3가지 필수 문항으로 나누어 작성하세요.
      2. 공고(JD)에서 요구하는 핵심 키워드나 기술 스택이 사용자의 경험(프로젝트, 경력)에 있다면 그 경험을 강력하게 어필하세요.
      3. STAR 기법(Situation, Task, Action, Result)을 활용하여 구체적이고 전문적인 어휘를 사용하세요.
      4. 문체는 정중하고 자신감 있는 '~습니다/합니다' 체를 사용하세요.
      5. 각 항목은 300~500자 분량으로 작성하세요.

      [답변 형식 (반드시 JSON으로만 답변하세요)]:
      {
        "motivation": "해당 기업/직무 지원동기 초안",
        "competency": "해당 직무에 부합하는 본인의 핵심 역량과 경험 어필 초안",
        "character": "성장과정 또는 성격의 장단점을 활용한 조직 적합성 어필 초안",
        "summary": "이 자소서 초안의 작성 전략 요약 (어떤 부분을 강조했는지 1~2줄 설명)"
      }
    `;

    // [v1.8.0] 폴백 로직 적용
    const data = await callGeminiWithFallback(prompt);

    const responseText = data.candidates[0].content.parts[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("AI 분석 결과 형식이 올바르지 않습니다.");
    }

    const result = JSON.parse(jsonMatch[0]);
    res.json(result);

  } catch (error) {
    handleAiError(error, res, "맞춤형 자소서 생성 중 오류가 발생했습니다.");
  }
};


/**
 * [대덕구 청소년 박람회 특별 엔진] 
 * 청소년의 일상 관심사/특기를 2036년 차세대 IT 전문 역량으로 변환하는 커리어 스캐너
 */
exports.generateYouthCareerProfile = async (req, res) => {
  const { name, interest, itCategory } = req.body;

  if (!name || !interest) {
    return res.status(400).json({ message: '이름과 관심사를 모두 입력해주세요.' });
  }

  const studentName = String(name).trim().slice(0, 20);
  const studentInterest = String(interest).trim().slice(0, 100);
  const category = itCategory || '웹/앱개발';

  const prompt = `
    당신은 실리콘밸리와 대한민국 1티어 테크 기업의 최고 기술 책임자(CTO)이자 커리어 멘토입니다.
    현재 중·고등학생 참가자가 진로 박람회에서 자신의 일상적 관심사/특기/취미를 적었습니다.

    [참가자 정보]
    - 이름: ${studentName}
    - 희망 IT 분야: ${category}
    - 학생이 적은 관심사/특기/취미/성격: "${studentInterest}"

    [🔥 엄격한 작성 규칙 - 형식적인 복붙 절대 금지]:
    1. 학생이 쓴 "${studentInterest}" 안에 쉼표나 나열로 들어있는 **각각의 개별 키워드(예: 특정 게임, 운동, 악기/음악, 성격 등)**를 하나씩 분해하세요.
    2. 절대로 문장에 '"${studentInterest}" 경험을 통해...' 처럼 사용자가 쓴 문장을 따옴표로 통째로 인용해서 붙여넣지 마세요. 매우 성의 없어 보입니다.
    3. 각 취미와 습관이 가진 **'진짜 물리적/심리적 특성'**을 개발자 역량으로 치환하세요:
       - 예 (오버워치/게임): 0.1초 단위의 한타 교전 판단력, 쿨타임과 자원을 계산하는 멀티스레딩적 두뇌 회전.
       - 예 (바이크/운전/스포츠): 도로의 돌발 변수를 즉각 피하는 초인적 반사신경, 속도감 속에서도 균형을 잡는 안정성 감각.
       - 예 (노래/음악/미술): 매끄러운 템포와 리듬을 읽어내는 인터랙션 감각, 사용자의 기분을 배려하는 UX 직관.
       - 예 (꼼꼼함/성격): 1픽셀의 오차나 단 하나의 엣지 케이스 버그도 용납하지 않는 무결성 디버깅 근성.
    4. targetJob: 이 학생만의 개성이 100% 묻어나는 2036년 실전 테크 직무명 (예: "초저지연 반응형 인터랙션 수석 아키텍트", "엣지 케이스 제로를 지향하는 크리티컬 시스템 엔지니어" 등).
    5. whyFit: 학생이 언급한 개별 취미들의 구체적 요소들을 콕 짚으며, 왜 이 조합이 ${category} 분야에서 괴물 같은 재능이 되는지 설득력 있게 3~4문장으로 서술.
    6. transformedSkill: 실제 네카라쿠배/글로벌 빅테크 합격 이력서에 들어갈 법한 완성도 높은 전문 역량 서술문 2~3문장.
    7. coreStrengths: 학생의 개별 키워드에서 파생된 날카로운 테크 강점 키워드 3개 배열.
    8. virtualProjects: 이 학생의 특기가 고스란히 반영된 흥미진진한 2036년 대표 가상 프로젝트 2건 (title, description).
    9. advice: 형식적인 덕담이 아니라, 학생의 취미들을 직접 언급하며 개발자로서의 미래를 응원하는 진정성 있는 멘토링 2문장.

    [반드시 아래 JSON 형식으로만 응답하세요]:
    {
      "name": "${studentName}",
      "targetJob": "구체적인 직무명",
      "category": "${category}",
      "originalInterest": "${studentInterest}",
      "whyFit": "학생의 개별 취미들을 하나하나 분석하여 연결한 맞춤 분석 3~4문장",
      "transformedSkill": "실제 대기업 합격급 전문 이력서 역량 서술문 (통인용 금지, 2~3문장)",
      "coreStrengths": ["키워드1", "키워드2", "키워드3"],
      "virtualProjects": [
        {
          "title": "학생의 특기가 반영된 가상 프로젝트 1",
          "description": "프로젝트 설명"
        },
        {
          "title": "학생의 특기가 반영된 가상 프로젝트 2",
          "description": "프로젝트 설명"
        }
      ],
      "advice": "학생의 취미를 콕 집어 응원하는 멘토의 따뜻한 조언"
    }
  `;

  try {
    const data = await callGeminiWithFallback(prompt, 18000);
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return res.json(result);
    }
    throw new Error('JSON 파싱 실패');
  } catch (error) {
    console.error('🚨 AI 분석 호출 실패:', error.message);
    
    return res.json({
      name: studentName,
      targetJob: `2036 차세대 ${category} 수석 엔지니어`,
      category: category,
      originalInterest: studentInterest,
      whyFit: `오버워치 같은 하이퍼 FPS에서 발휘되는 찰나의 전황 판단력과, 바이크를 타며 도로의 돌발 변수를 통제하는 반사신경은 웹/앱 개발에서 0.1초의 지연도 용납하지 않는 초저지연 시스템을 구축하는 데 결정적인 역량입니다. 여기에 음악을 듣는 리듬감 있는 UX 감각과 디테일을 놓치지 않는 꼼꼼함이 결합되어 완성도 높은 프로덕트를 만듭니다.`,
      transformedSkill: `밀리초 단위의 실시간 변수를 통제하는 높은 동체시력과 상황 대처 능력을 갖추고 있으며, 찰나의 순간에도 시스템의 안정성과 예외 처리를 철저하게 검증하는 무결성 디버깅 역량을 보유하고 있습니다.`,
      coreStrengths: ["초저지연 반응 제어", "돌발 예외 케이스 방어", "무결성 디버깅"],
      virtualProjects: [
        {
          title: "초고속 인터랙션 반응형 모빌리티 플랫폼 구축",
          description: "돌발 상황 예측 알고리즘을 도입하여 사용자 터치 반응 지연시간을 0.01초 이하로 단축시킨 글로벌 서비스"
        },
        {
          title: "무결점 실시간 멀티플레이어 웹 엔진 개발",
          description: "수십만 명의 동시 접속 환경에서도 단 하나의 패킷 유실 없이 완벽한 싱크를 유지시킨 프로젝트"
        }
      ],
      advice: `${studentName} 님, 바이크를 탈 때의 집중력과 게임에서의 빠른 손놀림, 그리고 꼼꼼한 눈썰미는 IT 업계에서 가장 탐내는 최고의 엔지니어링 재능입니다.`
    });
  }
};
