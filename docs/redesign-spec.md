# PAPSNET 홈페이지 고도화 사양서 (2026-06-10)

이 문서는 2026-06-10 전수 감사(디자인·SEO·과장카피·일관성·영상정합성) 결과를 바탕으로 한 **구현 기준**이다.
모든 구현 에이전트는 이 사양을 따른다. 충돌 시 이 문서가 우선한다.

## 0. 절대 규칙

- 모든 사용자 노출 텍스트는 한국어.
- **과장 금지**: 근거 없는 수치(%), 최상급(최고/유일/완벽/원천 차단/빈틈없이), 무근거 효과 약속 금지. 검증된 수치만 사용 (§5).
- 제품 브랜드 컬러 유지: CADWin=#0891b2, PDM=#2563eb, PMS=#ea580c, BOM=#16a34a, **CMS=#7c3aed(퍼플 — 현재 product-styles.css의 앰버 #b45309는 잘못된 값, 퍼플로 교체)**.
- 라이트/다크 테마 모두 동작해야 함.
- JS 결합 클래스 보존: `.blur-fade`/`.in-view`, `.reveal`/`.visible`, `.magic-card`, `.capability-card`, `.marquee-item`, `.tilt-element`, `.nav`, `[data-scroll-typewriter]`, `.dashboard-panel.active` — 클래스명·초기상태 변경 금지.
- styles.css는 후반 레이어(3868행~ 'CSTTEC restraint')가 캐스케이드 승자 — **수정은 후반 레이어에서**.
- product-styles.css의 `!important` 오버라이드(.btn-primary, .section-tag, .cap-bento-card)는 styles.css 변경을 가로챔 — 양쪽 동기화 필수.

## 1. 공통 head 템플릿 (7개 페이지 전부)

순서·내용 표준 (페이지별 값은 §2):

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{TITLE}</title>
<meta name="description" content="{DESC}">
<link rel="canonical" href="{CANONICAL}">
<meta property="og:type" content="website">
<meta property="og:title" content="{TITLE}">
<meta property="og:description" content="{DESC}">
<meta property="og:url" content="{CANONICAL}">
<meta property="og:image" content="{OG_IMAGE_ABS_URL}">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="팹스넷">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{TITLE}">
<meta name="twitter:description" content="{DESC}">
<meta name="twitter:image" content="{OG_IMAGE_ABS_URL}">
<link rel="icon" href="papsnet_logo.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&family=Noto+Sans+KR:wght@400;500;700;900&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap">
<link rel="stylesheet" href="styles.css">
<!-- 제품 페이지만: --> <link rel="stylesheet" href="product-styles.css">
<!-- JSON-LD (§3) -->
```

- `?v=forcecursor` 등 캐시버스터 쿼리 제거 (Vite 빌드 해시가 처리).
- app.js 로드는 전 페이지 `<script type="module" src="app.js"></script>` (body 끝) — 멀티페이지 빌드 번들링 필수 조건.
- 본문은 `<main id="main">`으로 감싸고 skip-link 타깃을 `#main`으로.

## 2. 페이지별 메타 값

| 페이지 | TITLE | CANONICAL | OG_IMAGE (절대 URL 기준 https://www.papsnet.net/) |
|---|---|---|---|
| index.html | 팹스넷 \| 제조업 PLM·PDM·BOM 관리 솔루션 — 도면에서 원가까지 | https://www.papsnet.net/ | PLM_Dashboard_01.png |
| product-cadwin.html | AI CADWin — AI 도면 검색·BOM 자동 추출 \| 팹스넷 | …/product-cadwin.html | 도면이지CADWin_260203.jpg |
| product-clippdm.html | Clip PDM — 도면·BOM·설계변경(ECO) 통합 관리 \| 팹스넷 | …/product-clippdm.html | clip_pdm_dashboard.png |
| product-clippms.html | Clip PMS — WBS·간트차트 기반 프로젝트 관리 \| 팹스넷 | …/product-clippms.html | clip_pms_dashboard.png |
| product-multibom.html | Multi-BOM — 한 차종 다사양 BOM 통합 관리 \| 팹스넷 | …/product-multibom.html | multi_bom_dashboard.png |
| product-clipcms.html | Clip CMS — 견적원가·사후원가 통합 원가관리 \| 팹스넷 | …/product-clipcms.html | clip_pms_dashboard.png |
| brochure.html | 팹스넷 솔루션 브로슈어 — PLM·PDM·PMS·원가관리 | …/brochure.html | PLM_Dashboard_01.png |

DESC는 각 페이지 본문과 일치하는 사실 서술로 120~155자 (과장 수식어 금지, 핵심 키워드 포함: PLM/PDM/도면 관리/BOM 관리/프로젝트 관리/원가관리).
주의: cadwin의 DESC·본문에서 DraftSight는 "개발 중"으로만 언급 (현재형 지원 단정 금지).

## 3. JSON-LD

**index.html** — Organization + WebSite:
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "(주)팹스넷",
      "alternateName": "PapsNet Co., Ltd.",
      "url": "https://www.papsnet.net",
      "logo": "https://www.papsnet.net/papsnet_logo.jpg",
      "email": "kimnardo@papsnet.net",
      "telephone": "+82-70-500-1144",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "범안로 1142, 하우스디 더 스카이밸리 2차 714~715호",
        "addressLocality": "금천구",
        "addressRegion": "서울",
        "addressCountry": "KR"
      },
      "foundingDate": "2021-06-01",
      "description": "제조업 R&D 디지털 전환을 위한 한국형 PLM 솔루션 개발·공급사"
    },
    {
      "@type": "WebSite",
      "name": "팹스넷",
      "url": "https://www.papsnet.net"
    }
  ]
}
```

**제품 5페이지** — SoftwareApplication + BreadcrumbList (각 제품명/URL/설명으로 채움):
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "{제품명}",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Windows, Web",
      "description": "{DESC와 동일}",
      "url": "{CANONICAL}",
      "publisher": { "@type": "Organization", "name": "(주)팹스넷", "url": "https://www.papsnet.net" },
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW", "description": "도입 문의" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://www.papsnet.net/" },
        { "@type": "ListItem", "position": 2, "name": "{제품명}", "item": "{CANONICAL}" }
      ]
    }
  ]
}
```

## 4. 디자인 패턴 통일 규칙 (HTML)

1. **섹션 헤더**: 모든 섹션은 `.section-tag`(국문) + `h2` + `p` 3요소. 어휘 사전: `핵심 기능 / 상세 기능 / 도입 효과 / 기술 사양 / 시스템 연동 / 도입 문의`. PDM의 '핵심 역량'→'핵심 기능'. inline `style="text-align:center"` 등 인라인 스타일 제거. 부제 p가 없는 섹션은 사실 기반 1문장 작성.
2. **카드 제목은 h3** (h4 사용 페이지는 h3로 교체).
3. **화살표 규칙**: 버튼/링크의 `→`는 `<span class="arrow" aria-hidden="true">→</span>` 형태로 통일. 본문 문장 속 의사 다이어그램(`ECR → ECO → 배포` 등)은 자연어로 풀어쓰기 ("ECR 접수 후 ECO 승인을 거쳐 배포됩니다" 식).
4. **체크리스트**: `ul.pf-checklist`의 각 li 안 `check_circle` 아이콘 span 제거 (CSS가 ::before 도트로 대체 — §7). `pf-chips`는 키워드 나열 용도로 유지.
5. **공지바 통일**: 라벨 `안내`, 문구 "Clip CMS — 사전·사후 원가 데이터를 함께 관리하는 제조업 원가관리시스템입니다.", 링크 화살표 aria-hidden.
6. **푸터 통일**: 상태 문구 `제조업 PLM 구축 상담 가능`. `index.html#demo` 깨진 링크 → `index.html#contact`. back-to-top 버튼이 없는 제품 페이지(cadwin/clippdm/clippms/multibom)에 index와 동일 마크업 추가.
7. **히어로 배지**: 국문 카테고리명으로 통일 (cadwin: "AI 도면 자동화", pdm: "제품 데이터 관리", pms: "프로젝트 관리 시스템", bom: "다사양 BOM 관리", cms: "사전·사후 통합 원가관리"). 아이콘 inline style 제거.
8. **아이콘 의미 사전** (Material Symbols Rounded): 도면/CAD=`draw`, BOM=`account_tree`, 프로젝트/일정=`event_note`, 원가/견적=`request_quote`, ERP=`database`, MES=`factory`, 연동/허브=`hub`, AI=`smart_toy`, 보안/권한=`lock`, 문서=`description`, 협업/소통=`forum`, 검색=`search`, 버전=`history`, 결재/승인=`order_approve`, 대시보드=`monitoring`. 같은 의미에 다른 아이콘 쓰지 말 것. CAD 소프트웨어 로고 나열부는 각기 다른 아이콘 강제하지 않음(텍스트 위주 허용).
9. **PDM 운영효과 카드**: `.outcome-stat` 안의 중복 아이콘 제거 — 카드당 `.outcome-icon` 1개만, stat 슬롯은 텍스트 키워드 또는 삭제.
10. **index 제품 그리드**: 5열→3열×2행. 6번째 셀에 통합 상담 CTA 카드(`.product-card.product-card-cta`) 추가 — "어떤 솔루션이 맞을지 고민되시나요? / 도입 상담 →" (#contact 링크).
11. **`.premium-gradient-blur` div 제거** (index, clippdm 등 잔존 전부) — CSS에서 죽은 레이어와 함께 삭제됨.

## 5. 수치/카피 정책 (검증된 사실만)

**사용 가능 (출처: 회사소개서 V6.0, Clip PDM Solution Guide, 제품 매뉴얼)**:
- 설립 2021년 / 자동차부품 15개사·반도체·가전 8개사·의료장비 5개사 (합 28개사) 고객 분포
- CAD 20여 종 지원, 중립 포맷 30여 종 자동 변환, PMS 표준 템플릿 40종+
- ECMS 수율 시뮬레이션 5종, ICMS 원소재 시세 매일 자동 업데이트(철강 05:30·비철 05:00), SAP 단가 매일 1회 자동 동기화
- 구축 일정: 도입준비 2~4주 + 구축 6~8주 + 교육 2~3주
- 고객사 실명: 현대공업, 쿠쿠전자, 네오바이오텍, SL, 하나, 송암CNC, JNTC(ECMS), GODSC(ICMS), 우리산업, 인지컨트롤스, 디에스시, 하이로닉, AMS (로고 보유분)
- 익명 사례: D사(시트프레임)/W사(공조 전장)/H사(의료장비) — 실명 매칭 금지

**금지/교체 (Trust Bar 표준: 키워드 또는 검증 수치 + 라벨)**:
- cadwin: 85%/65%/70%/50% → `AI 검색|형상 기반 유사 도면 검색` / `자동 추출|도면 → BOM 데이터화` / `AutoCAD|리본 메뉴 플러그인 통합` / `재사용|기존 도면 검색·재활용`
- clippms: 30%/40%/45%/35% → `40+|표준 WBS 템플릿` / `CP|Critical Path 자동 계산` / `EVMS|다차원 KPI 분석` / `Gate|단계별 승인 워크플로`
- clippdm: 통합/잠금/변경/연계 (유지하되 라벨 보강) → `20+|지원 CAD 종류` / `30+|중립 포맷 자동 변환` / `3단계|주·부·수정 버전 관리` / `ECO|설계변경 프로세스 자동화`
- multibom: `N개|한 차종 다사양 동시 관리` / `Excel|맞춤 템플릿·Export` / `자동 검수|사양별 수량 총합` / `ERP|BOM 데이터 전송`
- clipcms: 유지 (`2-Way|SAP 매일 자동 동기화` / `5종|수율 시뮬레이션` / `매일|원소재 시세 자동 업데이트` / `전자계약|가격합의서 자동 생성` 으로 라벨 정확화)
- brochure: 150+/5/40%/99.9% → `2021|설립` / `28개사|자동차·반도체·의료 고객` / `20+|지원 CAD` / `40+|PMS 표준 템플릿`
- index 히어로 패널 "변경 영향 12분" → 수치 제거: "변경 영향 — 도면·BOM·원가 동시 확인"

**개별 과장 표현 교정** (파일별, 원문→교체):
- index 577행 "국내 주요 제조업 분야에서 팹스넷을 신뢰합니다" → "자동차부품·반도체·의료기기 등 국내 제조 현장에 구축해 왔습니다"
- cadwin 143행 "AutoCAD·DraftSight 환경에서" → "AutoCAD 환경에서" (+사양표에 'DraftSight 개발 중' 유지). 메타 설명도 동일.
- cadwin 145행 "차세대 도면 자동화 솔루션" → "AI 도면 자동화 솔루션"
- cadwin 189행 "모든 과정을 자동화합니다" → "도면 판독·BOM 추출 등 반복 작업을 자동화합니다"
- cadwin 215행 "AutoCAD·DraftSight·ZWCAD 리본 메뉴" → "AutoCAD 리본 메뉴" (DraftSight는 개발 중 표기)
- cadwin 257행 "극대화했습니다" → "높였습니다"
- cadwin 263행 "설계 시간 대폭 절감" → "신규 작도 작업을 줄입니다"
- cadwin 368행 "주요 2D/3D CAD와 원활하게 통합" → "AutoCAD·SolidWorks 통합을 지원하며, 기타 CAD는 협의 후 연동합니다"
- 전 제품 푸터 "시스템 정상 운영 중" → "제조업 PLM 구축 상담 가능"
- clippms 142행 "빈틈없이" → "체계적으로" / 143행 "프로젝트 성공률을 높입니다" → "일정 리스크를 조기에 파악하도록 돕습니다"
- clippms 210행 "지연을 사전 차단" → "지연 위험을 조기에 식별"
- clippms 286행 "영구 보존" → "기록·보존"
- clippms 329행 등 "최적의 인력 배정/최적 배분/최적 배정" → "업무 부하와 스킬 기준의 인력 배정 지원" 계열
- multibom 8행 "혁신적인 BOM 관리 시스템" → "한 차종의 N개 사양을 한번에 관리하는 BOM 관리 시스템"
- multibom 140행 "완벽한 동기화" → "정합성 관리"
- multibom 143행 "철저히 검증" → "자동 차이 감지와 시각 비교로 검증"
- multibom 200행 "AI 스마트 검색" → "다중 조건 스마트 검색" (AI 기능 근거 없음)
- multibom 219행 "인적 오류를 원천 차단" → "입력 오류를 줄입니다"
- multibom 237행 "실시간 연동" → "연동"
- clipcms 246행 "정확한 원가 예측" → "일관된 기준의 원가 산출" (190행 동일 계열 포함)
- clipcms 479행 "검증된 연동 경험으로 빠르게 도입" → "SAP·ERP·MES 연동 구축 경험을 바탕으로 고객 환경에 맞춰 도입을 지원"
- brochure 1070행 "디지털 혁신을 이끕니다" → "디지털 전환을 지원합니다"
- brochure 1116행 "딥러닝 엔진이" → "AI 형상 인식 엔진이"
- brochure 1141행 "20+ CAD" → 유지 가능 (PDM 기준 20여 종 검증됨 — 'PDM 기준' 명시)
- brochure 1178행 "ERP 실시간 연동" → "ERP 연동"
- brochure 1347행 "완벽 연동" → "연동 지원"
- brochure 1356행 "데이터 암호화 보장" → "역할 기반 접근 제어·데이터 암호화 적용"
- brochure 1365행 "외산 대비 TCO 절감" → "유연한 라이선스와 국내 개발팀 직접 지원"

## 6. 영상 정합성 (영상 내용과 카피 일치)

- **index.html AI CADWin 기능 카드**: `CLIP PDM/grok-video-….mp4`(PDM 무드클립, 제품 불일치) → `videos/hero-cadwin.mp4` + `poster="videos/poster-cadwin-clean.png"` + `preload="metadata"` (muted/loop/autoplay/playsinline 유지). 카피는 현행 유지(실제 영상 내용과 일치: 표제란 인식·BOM 추출).
- **index.html Clip PMS 기능 카드**: 정적 png → `videos/v3-overview.mp4` + `poster="videos/v3-overview-preview.jpg"`. 주변 카피를 영상 내용에 맞춤: "경영진을 위한 전사 통합 인사이트 — 전사 프로젝트·KPI·알림을 한 화면에서".
- **product-cadwin.html 히어로**: 정적 이미지 → `videos/hero-cadwin.mp4` + poster 동일 (실기능 시연과 페이지 카피 1:1 일치).
- **product-clippdm.html 히어로**: AI 생성 placeholder 영상 제거 → 정적 `<img src="260528_등록이미지/관리자데시보드.png" alt="Clip PDM 관리자 대시보드 — 도면·BOM·결재 현황">` (실제 데모 영상이 생길 때까지 정직한 정적 화면).
- **product-clippms.html 히어로**: `v3-overview.mp4` → `videos/v3-wbs.mp4` + `poster="videos/v3-wbs-preview1.jpg"`, aria-label "Clip PMS WBS·간트차트 데모 영상" (헤드라인 'WBS 기반'과 일치).
- 모든 video: `preload="metadata"`, poster 필수. 모든 img: `loading="lazy"`(첫 화면 제외) + `decoding="async"`.

## 7. CSS 고도화 지시 (styles.css 담당)

1. **그림자 토큰 다층화**: `--shadow-xs~xl`을 다층(ambient+key) 슬레이트 틴트로 교체 (예: `--shadow-md: 0 1px 2px rgba(15,23,42,.05), 0 4px 12px -2px rgba(15,23,42,.06), 0 12px 28px -8px rgba(15,23,42,.08)`). 다크는 기존 강도 + `inset 0 1px 0 rgba(255,255,255,.04)`.
2. **미정의 복구**: `.hero-badge`/`.hero-badge-dot` 정의(필 배지+펄스 점), `.products-overview-section { padding: var(--s-24) 0; }`, 4047~4292행의 미정의 토큰(`--surface-0/1`→`--bg`/`--bg-subtle`, `--border-color`→`--border`, `--text-primary/secondary`→`--text`/`--text-2`, `--accent-primary` 폴백 `#6366f1`→`var(--accent)`) 치환.
3. **다크 텍스트 위계 복원**: 다크 `--text-2:#9aa6b8; --text-3:#6b7585`. 라이트 `--text-3`도 `#6b7585`로 어둡게(WCAG) 조정.
4. **모션**: 파일 말미 `@media (prefers-reduced-motion: reduce)` 전역 게이트 추가. `floating-cta-pulse`·`impact-sheen` 무한 루프 → hover 트리거 또는 반복 제한.
5. **버튼**: `transition:all` → 명시 속성 목록. `.btn:active { transform: scale(.98); }` 추가. `.btn-primary:hover` opacity 트릭 → `color-mix` 배경.
6. **타이포**: styles.css 7행 `@import` **삭제** (head link로 대체됨 — §1). `h1,h2,h3 { text-wrap: balance }`(섹션 헤더 포함), 본문 p `text-wrap: pretty`. `--text-2xl: clamp(21px,1.8vw,24px)`, `--text-xl: clamp(18px,1.5vw,20px)`. 행간 3단계: 디스플레이 1.15/헤딩 1.25/본문 1.7 — `.hero-title` line-height 1.05→1.12, letter-spacing -0.04em→-0.02em (한글 표제 가독성).
7. **products-grid**: 5열 → `repeat(3, 1fr)` 3열×2행. `.product-card-cta` 스타일 신설(틴트 배경, 중앙 정렬 CTA 카드). 반응형 1024px 2열/640px 1열.
8. **히어로**: `min-height:100vh`→`88svh`(vh 폴백 선행). 절제형 그라디언트 메시 배경(§감사 제안 코드).
9. **죽은 레이어 정리**: 3721~3866 비활성 규칙(노이즈 ::after, premium-gradient-blur, 글래스), 3903~3908 display:none 차단 삭제 — 단 `.tilt-element` 클래스 셀렉터 자체와 JS 결합 셀렉터는 보존. `#particleCanvas`/`.meteor-container` display:none 규칙은 유지(HTML/JS에서 제거되므로 무해) 또는 함께 삭제.
10. **scroll-typewriter 저대비**: 기본색 `--text-3`→`--text-2`.
11. **하드코딩 회수**: `.plm-integrity-card` 흰 배경 → `color-mix(in srgb, var(--bg-card) 80%, transparent)` + `var(--border-md)`. radius 2rem/24px/20px/18px → 토큰.
12. **pf-checklist 도트 불릿**: `.pf-checklist li::before`로 6px 테마색 도트 (HTML에서 check_circle span 제거됨 — §4.4). 기존 아이콘 span 셀렉터 스타일은 잔존해도 무해하나 정리 권장.
13. **iOS @supports 블록(4026~4042)**: 카드 배경 변경과 동기화하거나 삭제.
14. **워크플로 화살표**: `.workflow-scenario span::after { content: '→' / ''; }` (대체텍스트 빈 문자열로 스크린리더 음독 방지).

## 8. CSS 고도화 지시 (product-styles.css 담당)

1. **CMS 테마 퍼플 정렬**: `body.theme-cms` → `--theme-primary:#7c3aed; --theme-secondary:#a78bfa; --theme-dark:#6d28d9` + 그라디언트 동기화.
2. **아이콘 플랫화**: `.cap-bento-icon`/`.cap-icon`/`.outcome-icon`/`.spec-card-icon`의 스택 하드섀도·광택 버블 ::after·rotate 호버 제거 → `background: color-mix(in srgb, var(--theme-primary) 12%, var(--bg-card)); border:1px solid color-mix(in srgb, var(--theme-primary) 24%, transparent); color: var(--theme-primary)`, hover는 translateY(-2px)만.
3. **벤토 위계**: `.capabilities-bento`에 `:first-child { grid-column: span 2 }` + 6번째 span 2 (2-1-1/1-1-2 리듬). 1024px 이하 기존 2열 복귀.
4. **trust bar**: 단어형 스탯이 숫자 스타일을 쓰는 문제 — `.trust-number`는 수치/키워드 모두 허용하되 크기 축소(clamp 28~40px), `.trust-label` 가독성 향상.
5. **CTA 다크 카드화**: `.product-cta`를 index `.cta-card`와 동일한 다크 그라디언트 카드 스타일로 재정의 (테마색 보더 어센트). `btn-glass` 대비 확보. (HTML 구조는 유지 — CSS-only.)
6. **버튼 동기화**: `.btn-primary` hover `!important` 오버라이드를 `color-mix(in srgb, var(--theme-primary) 88%, #000)`로 styles.css와 동일 패턴화. `:active` 스케일 추가.
7. **outcomes-grid**: theme-pdm 한정 `repeat(2, 1fr)` (4장 고아행 해소).
8. **reduced-motion** 게이트 추가 (이 파일의 무한 애니메이션 대상).
9. 카드 제목 `h3,h4` 동시 셀렉터는 h3 단일로 정리 가능 (HTML이 h3로 통일됨).

## 9. app.js 지시

- 파티클 캔버스·유성(meteor) 초기화 루프 제거 (`#particleCanvas`, `.meteor-container` — CSS에서 숨겨져 있던 rAF 낭비). 해당 DOM이 없어도 에러 없게.
- 나머지 인터랙션(테마 토글, 네비, IntersectionObserver, 마퀴, FAQ, 폼, 스크롤 줌, 타이프라이터, 대시보드 탭, back-to-top) 전부 보존.
- `backToTop` 바인딩이 모든 페이지에서 동작하는지 확인 (요소 없으면 무시하는 가드).

## 10. 검증 기준 (최종 빌드 게이트)

- `npm run build` (WSL) 성공 + dist에 7개 HTML 전부.
- 전 페이지: canonical/OG/JSON-LD 존재, h1 유일, `<main>` 존재, 금지 표현(§5) 0건.
- 라이트/다크 각각 첫 화면 렌더 깨짐 없음.
- 콘솔 에러 0건 (파티클 제거 후 잔존 참조 없음).
