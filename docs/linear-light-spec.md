# Linear-Light 디자인 전환 사양서 (2026-06-10, v2)

사용자 지시: "카드 디자인이 AI가 만든 디자인처럼 보인다. linear.app 스타일을 라이트 모드로. AI 문구가 들어가야 한다."
이 문서는 docs/redesign-spec.md(v1)의 **상위 개정판**이다. 충돌 시 이 문서가 우선. v1의 §0(과장 금지), §5(수치 정책), 아이콘 의미 사전, JS 결합 클래스 보존 규칙은 그대로 유효.

## 0. Linear 디자인 언어의 본질 (왜 'AI가 만든 느낌'이 사라지는가)

Linear 스타일 = **타이포그래피가 주인공, 컬러는 조연**.
1. 카드: 색 틴트 박스 ✗ → 흰 서피스 + 1px 헤어라인 + 거의 없는 그림자
2. 아이콘: 컬러 틴트 컨테이너 ✗ → 모노크롬(텍스트색) 소형 아이콘, 컨테이너 없음
3. 헤드라인: 800~900 울트라볼드 ✗ → **600~650 세미볼드** + 타이트한 트래킹
4. 액센트 컬러: 배경/아이콘에 도배 ✗ → 아이브로우·링크·포커스에만 점묘
5. 버튼: 알약(pill) ✗ → 8px 라운드 컴팩트
6. 섹션: 배경색 교차 ✗ → 넉넉한 여백 + 헤어라인 디바이더

## 1. 토큰 교체 (styles.css :root / [data-theme="dark"])

**라이트 (기본):**
```css
--bg: #fcfcfd;            /* 베이스 — 순백보다 살짝 차분 */
--bg-subtle: #f7f8f9;     /* 섹션 교차용 (사용 최소화) */
--bg-card: #ffffff;       /* 카드 서피스 */
--bg-elevated: #f3f4f6;
--border: rgba(0,0,0,.07);
--border-md: rgba(0,0,0,.1);
--border-hover: rgba(0,0,0,.16);
--text: #0f1011;          /* Linear급 니어블랙 */
--text-2: #5e6470;
--text-3: #8a8f98;        /* 캡션 전용 (본문 금지 정책 유지) */
--shadow-xs: 0 1px 2px rgba(0,0,0,.03);
--shadow-sm: 0 1px 3px rgba(0,0,0,.04), 0 4px 12px -4px rgba(0,0,0,.05);
--shadow-md: 0 2px 4px rgba(0,0,0,.04), 0 8px 24px -8px rgba(0,0,0,.08);
--shadow-lg: 0 4px 8px rgba(0,0,0,.04), 0 16px 40px -12px rgba(0,0,0,.1);
--shadow-xl: 0 8px 16px rgba(0,0,0,.05), 0 24px 60px -16px rgba(0,0,0,.14);
```
radius 토큰: --r-md 8px, --r-lg 10px, --r-xl 14px, --r-2xl 16px 로 하향 (--r-full은 배지 등 잔존 용도 유지).

**다크** ([data-theme="dark"] — Linear 원본 등가):
```css
--bg: #08090a; --bg-subtle: #0e0f11; --bg-card: #101113; --bg-elevated: #16171a;
--border: rgba(255,255,255,.07); --border-md: rgba(255,255,255,.1); --border-hover: rgba(255,255,255,.18);
--text: #f7f8f8; --text-2: #9ea3ae; --text-3: #62666d;
```
제품 브랜드 컬러 5종(--cadwin/--pdm/--pms/--bom/--cms)과 --accent는 유지하되 **사용처를 대폭 축소**(아래 §3).

## 2. 타이포그래피

- 헤드라인 웨이트 전면 하향: h1/h2/.hero-title/.section-header h2 등 **800·850·900 → 600** (히어로만 650 허용). font-weight 700 이상 잔존 금지(버튼·스탯 숫자는 600).
- letter-spacing: 헤드라인 -0.02em ~ -0.022em (현 -0.04em류 과도한 압축 해제).
- .hero-title 크기 소폭 하향: clamp(38px, 4.5vw, 64px).
- .section-tag(아이브로우) 재정의: **필 배경·보더 제거** → 투명 배경, 13px, weight 600, 액센트 컬러(제품 페이지는 --theme-primary), letter-spacing 0.01em, margin-bottom 12px. product-styles.css의 .section-tag !important 오버라이드도 동일하게 수정 (배경·보더 제거).
- 본문: 16px/1.7 유지, 카드 본문은 14px/1.6 --text-2.

## 3. 카드 레시피 (전 카드 공통 — 'AI 느낌' 제거의 핵심)

대상: .landing-focus-item, .solution-axis, .product-card, .industry-card, .integration-feature, .cap-bento-card, .outcome-card, .spec-card, .feature-card, .pf-* 블록, .plm-integrity-card 등 카드 전부.

```
배경: var(--bg-card)
보더: 1px solid var(--border)
radius: var(--r-xl) (14px)
그림자(휴지): none 또는 var(--shadow-xs)
패딩: 24px (var(--s-6)) — 큰 카드 28px
호버: border-color var(--border-hover); box-shadow var(--shadow-sm); transform 없음 또는 translateY(-1px)
```
- **마우스 추적 radial glow(.magic-card ::before 류)는 라이트에서 끔** (Linear는 안 씀). 다크에서는 매우 약하게(8% 이하) 허용. JS 클래스는 보존(효과만 약화/제거).
- **틸트(tilt-element) 효과 끄기**: transform 적용 부분을 CSS에서 무력화 (JS는 건드리지 않음).
- 카드 안 그라디언트 배경·border-beam·shiny 효과 제거(셀렉터는 남기되 시각 효과 제거 가능).

## 4. 아이콘 처리 (모노크롬 전환)

- 카드 아이콘(.cap-bento-icon, .product-card-icon, .solution-axis-icon, .outcome-icon, .integration-feature 아이콘 등): **틴트 배경 컨테이너 제거** → 컨테이너 투명/무보더, 아이콘 크기 22~24px, 색 **var(--text-2)** (모노크롬). 호버 시에만 var(--theme-primary)/제품색으로 전환.
- 컨테이너를 유지해야 레이아웃이 덜 흔들리는 곳은: 36px, 배경 var(--bg-elevated), 보더 1px var(--border), radius 8px, 아이콘색 var(--text-2) — "뉴트럴 칩".
- 히어로 배지/체크 도트 등 시그널 컬러는 유지.
- 아이콘 의미 사전(v1 §4.8)은 계속 유효 — 아이콘 글리프는 바꾸지 말고 색/컨테이너만 변경.

## 5. 버튼

- radius: --r-full(알약) → **8px**. 높이: primary 40px(히어로 44px), 패딩 10px 18px, 폰트 14px/600.
- .btn-primary (라이트): 배경 **#0f1011(니어블랙)**, 텍스트 #fff, 호버 #2a2c33, 그림자 없음→호버 시 var(--shadow-sm). 다크 모드: 배경 #f7f8f8, 텍스트 #08090a.
- .btn-secondary: 흰 배경 + 1px var(--border-md) + 텍스트 --text, 호버 보더 진해짐 + --bg-elevated.
- 제품 페이지 .btn-primary !important(테마색 배경)는 **유지하되** radius/높이/웨이트는 공통을 따름 — 제품 CTA에서만 테마색이 살아있는 것이 Linear식 점묘에 부합.
- .cta-btn-*, .btn-glass도 radius 8px로 통일.

## 6. 섹션/히어로/네비

- 섹션 패딩: 상하 96~128px 유지. **배경색 교차 줄이기**: --bg-subtle 섹션 배경 대부분 → var(--bg) + 섹션 사이 1px 헤어라인 디바이더(border-top: 1px solid var(--border)).
- 히어로: 그라디언트 메시를 **더 절제** — radial 1개(액센트 4~5%)+화이트. 히어로 미디어/패널 프레임: 흰 서피스+헤어라인+--shadow-lg, 뒤에 60px blur 액센트 글로우(opacity .12) 1장.
- 네비: 글래스 blur 유지하되 배경 rgba(255,255,255,.8) 라이트 / rgba(8,9,10,.8) 다크, 하단 1px 헤어라인. 네비 링크 14px/500, --text-2 → 호버 --text.
- 공지바: 배경 var(--bg-subtle), 텍스트 --text-2, 액센트 링크만 컬러.
- 트러스트바(.trust-number): 컬러 → var(--text), 크기 유지, 라벨 --text-2.
- CTA 다크 카드: 유지 (Linear도 다크 패널 CTA 사용). 라운드 --r-2xl(16px)로.
- 푸터: 배경 var(--bg) + 상단 헤어라인, 링크 14px --text-2.
- dot-pattern/retro-grid/메테오 류 배경 장식: 라이트에서 모두 끄기(이미 대부분 꺼짐 — 잔존 확인).

## 7. AI 문구 (index.html — 사실 기반만, v1 §0 과장 금지 유효)

근거: AI CADWin은 실제로 AI 형상 인식·유사도 분석·도면 검색 기능 보유(회사소개서/기능명세 검증됨).
1. **title**: `팹스넷 | AI 도면 검색·PLM·BOM 관리 솔루션 — 도면에서 원가까지` (og:title/twitter:title 동기화)
2. **meta description**: 기존 문장에 "AI 도면 검색(AI CADWin)" 키워드 자연 삽입 (155자 이내 유지)
3. **히어로 배지**: `제조업 제품개발 데이터 흐름 개선` → `AI 도면 검색 × 제조업 PLM`
4. **히어로 부제**: 첫 문장 앞 또는 뒤에 "AI CADWin이 도면을 읽어 BOM 데이터로 바꾸고," 같은 사실 기반 절 삽입 — 전체 흐름 자연스럽게 재작성 허용 (과장 금지: '모든', '완벽', 수치 약속 불가)
5. **AI CADWin 제품 카드/기능 카드**: 기존 카피 유지 (이미 AI 중심)
6. JSON-LD Organization description에도 "AI 도면 검색" 포함 가능
7. 금지: 근거 없는 "AI가 전부 자동화", "생성형 AI", "AI PLM"(PLM 자체는 AI 제품 아님 — AI는 CADWin 한정으로 서술)

## 8. 구현 분담 (파일 소유)

- **styles.css**: §1 토큰, §2 타이포, §3 카드(메인 페이지 카드들), §4 아이콘(메인), §5 버튼, §6 섹션/히어로/네비/푸터/공지바/CTA
- **product-styles.css**: .section-tag/.pf-tag 오버라이드 수정, 제품 카드(.cap-bento-*, .outcome-*, .spec-*, .pf-*) §3·§4 적용, .product-cta radius, trust bar 색, 버튼 radius 동기화, 제품 히어로 배경(테마 그라디언트 → 거의 화이트 + 테마색 글로우 1장 5%)
- **index.html**: §7 AI 문구만 (구조 변경 없음)

## 9. 검증 게이트

- 빌드 통과, 콘솔 에러 0
- 라이트 모드가 기본이며 Linear의 절제미가 보일 것: 틴트 아이콘 박스 0, 800+ 웨이트 헤드라인 0, 알약 버튼 0
- 다크 모드 깨짐 없음 (토큰 매핑 확인)
- AI 문구가 사실 기반(AI CADWin 한정)인지, 과장 표현 없는지
- 모바일 390px 히어로/공지바/카드 그리드 정상
