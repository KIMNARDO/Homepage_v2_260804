# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

팹스넷(Papsnet) 기업 홈페이지 — B2B 제조업 PLM 솔루션 회사의 정적 마케팅 사이트. 한국어 기반, 순수 HTML/CSS/JS로 구성되며 Vite로 서빙.

## 명령어

```bash
npm run dev      # Vite 개발 서버 실행 (핫 리로드)
npm run build    # 프로덕션 빌드
npm run preview  # 프로덕션 빌드 로컬 미리보기
```

테스트, 린트, CI 파이프라인은 없음.

## 아키텍처

**기술 스택**: 순수 HTML + CSS + JS. 프레임워크 없음. Vite 6은 개발 서버 및 번들링 용도로만 사용.

**페이지 구조** — 멀티 페이지 정적 사이트, 각 페이지는 독립된 HTML 파일:
- `index.html` — 메인 랜딩 페이지 (히어로, 제품 카드, 고객사 로고, 문의 폼)
- `product-cadwin.html` — AI CADWin 제품 페이지
- `product-clippdm.html` — Clip PDM 제품 페이지
- `product-clippms.html` — Clip PMS 제품 페이지
- `product-multibom.html` — Multi-BOM 제품 페이지
- `product-clipcms.html` — Clip CMS 제품 페이지 (최신)
- `brochure.html` — 인쇄/디지털 브로슈어 (인라인 스타일로 자체 완결)

**스타일링**:
- `styles.css` (~2900줄) — 메인 스타일시트. CSS 커스텀 프로퍼티(디자인 토큰), `[data-theme]`을 통한 라이트/다크 테마, Magic UI 효과(도트 패턴, 유성, 쉬머, 레트로 그리드, blur-fade 애니메이션)
- `product-styles.css` (~930줄) — 제품 페이지별 테마 오버라이드. 각 제품은 body 클래스(`theme-cadwin`, `theme-cms` 등)로 `--theme-primary`, `--theme-secondary` 등을 설정
- 폰트: Inter + Noto Sans KR (Google Fonts), Material Symbols Rounded (아이콘)

**자바스크립트**:
- `app.js` (~600줄) — 모든 인터랙션을 하나의 파일에서 처리: 테마 토글, 스크롤 프로그레스, 네비게이션/모바일 메뉴, 드롭다운, IntersectionObserver 애니메이션(blur-fade, 카운터), 스크롤 줌 비디오, 파티클 캔버스, 유성 효과, 마퀴, FAQ 아코디언, 문의 폼, 부드러운 스크롤

**에셋**: 제품 스크린샷(PNG), 고객사 로고는 `홈페이지_고객사_이미지/`, 참고 PDF는 `CLIP PDM/` 및 `CLIP PMS/`, 목업 이미지는 `CLIP MMS/`

## 주요 컨벤션

- 모든 사용자 대상 텍스트는 한국어 (ko 로케일)
- 디자인 토큰은 `:root`에 CSS 커스텀 프로퍼티로 정의 — 항상 토큰 사용, 색상 하드코딩 금지
- 제품별 컬러: CADWin=시안(`#0891b2`), PDM=블루(`#2563eb`), PMS=오렌지(`#ea580c`), BOM=그린(`#16a34a`), CMS=퍼플(`#7c3aed`)
- 다크 테마는 styles.css 내 `[data-theme="dark"]` 셀렉터로 오버라이드
- 네비게이션과 푸터는 각 HTML 파일에 중복 작성됨 (템플릿 시스템 없음)
- 애니메이션은 `blur-fade` 클래스와 `data-delay` 속성을 사용, app.js의 IntersectionObserver로 트리거
