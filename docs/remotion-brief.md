# 📹 팹스넷 홈페이지 Remotion 영상 제작 브리프

## 1. 프로젝트 컨텍스트

**회사**: 팹스넷(PapsNet) — 제조업 디지털 전환을 위한 통합 PLM 솔루션 전문기업
**홈페이지 위치**: `C:\00.AI개발\홈페이지` (순수 HTML/CSS/JS + Vite)
**언어**: 한국어 (Inter + Noto Sans KR 폰트)
**연락처**:
- Email: kimnardo@papsnet.net
- Tel: 070-5001-1144
- Mobile: +82) 10-5050-2011

### 제품 5종 (각 영상 제작 대상)
| 코드 | 제품명 | 한 줄 소개 | 컬러 |
|---|---|---|---|
| cadwin | **AI CADWin** | AI 기반 도면 자동 인식·BOM 자동 추출 | 시안 `#0891b2` |
| pdm | **Clip PDM** | 도면·부품·기술문서 통합 관리 + 결재 워크플로 | 블루 `#2563eb` |
| pms | **Clip PMS** | WBS·간트차트 기반 프로젝트/EVMS 관리 | 오렌지 `#ea580c` |
| bom | **Multi-BOM** | E-BOM/M-BOM 통합·정전개/역전개 가시성 | 그린 `#16a34a` |
| cms | **Clip CMS** | 설계 원가 vs 실제 원가 분석 (NEW) | 퍼플 `#7c3aed` |

---

## 2. 브랜드 디자인 시스템

### 컬러 토큰
```js
// 라이트 테마
const light = {
  bg: '#ffffff',
  bgSubtle: '#f7f8fc',
  bgCard: '#ffffff',
  text: '#0f1117',
  text2: '#5a6473',
  accent: '#2563eb',
  border: 'rgba(0,0,0,0.07)',
};

// 다크 테마
const dark = {
  bg: '#0c0c0f',
  bgSubtle: '#13131a',
  bgCard: '#17171f',
  text: '#eeeef5',
  text2: '#7a8494',
  accent: '#3b82f6',
  border: 'rgba(255,255,255,0.07)',
};

// 제품별 그라디언트 (light → dark)
const productGradients = {
  cadwin: ['#22d3ee', '#0e7490'],
  pdm:    ['#60a5fa', '#1d4ed8'],
  pms:    ['#fb923c', '#c2410c'],
  bom:    ['#4ade80', '#15803d'],
  cms:    ['#a78bfa', '#6d28d9'],
};
```

### 타이포그래피
- **메인 폰트**: `Inter` + `Noto Sans KR` (Google Fonts)
- **타이틀 굵기**: 700~900
- **본문 굵기**: 400~500
- **자간**: 한국어는 `letter-spacing: -0.01em` 권장
- **이징**: `cubic-bezier(0.16, 1, 0.3, 1)` (Magic UI 스타일)

### 시각적 모티브 (홈페이지에서 활용 중)
- Dot pattern 배경
- Meteor(유성) 효과
- Shimmer/Shiny 그라디언트
- Retro grid (바닥 원근감)
- Blur-fade 인트로 애니메이션
- Magic card 호버 글로우

---

## 3. 제작 대상 영상 (우선순위순)

### Phase 1 — 제품 페이지 히어로 영상 (5종)
각 제품 페이지의 hero visual을 정적 이미지에서 영상으로 교체.

| # | 파일명 | 페이지 | 길이 | 컨셉 |
|---|---|---|---|---|
| 1 | `hero-cadwin.mp4` | product-cadwin.html | 8~10초 루프 | AI가 도면을 스캔→BOM 데이터로 변환되는 모션 |
| 2 | `hero-pdm.mp4` | product-clippdm.html | 8~10초 루프 | 흩어진 도면들이 중앙 저장소로 모이고 버전 관리 UI 표출 |
| 3 | `hero-pms.mp4` | product-clippms.html | 8~10초 루프 | 간트차트 바가 자동으로 그려지며 마일스톤·CPM 하이라이트 |
| 4 | `hero-multibom.mp4` | product-multibom.html | 8~10초 루프 | E-BOM 트리 → M-BOM 트리로 변환되며 차이점 색상 표시 |
| 5 | `hero-clipcms.mp4` | product-clipcms.html | 8~10초 루프 | 부품 단가가 합산되며 원가 차트가 그려지는 모션 |

### Phase 2 — 메인 페이지 보조 영상 (선택)
- `feature-cadwin.mp4` (현재 `CLIP PDM/grok-video-...mp4` 대체)
- `feature-pdm.mp4`, `feature-pms.mp4`, `feature-multibom.mp4`
- ⚠️ **메인 히어로 영상(`움직이는_차트_비디오_생성.mp4`)은 교체하지 말 것** (사용자 지시)

---

## 4. 기술 사양

```yaml
해상도: 1920x1080 (16:9, fps 30)
포맷: MP4 (H.264, web-optimized)
오디오: 없음 (muted autoplay 용도)
재생 방식: autoplay + muted + loop + playsinline
파일 크기 목표: ≤ 3MB / 영상 (CDN 부하 최소화)
배경: 투명 불필요 (제품별 컬러 그라디언트 또는 다크 테마 베이스 사용)
세이프존: 좌우 8% 여백 (제품 페이지 hero 컨테이너 max-width 1280px 고려)
```

### Remotion 권장 셋업
```bash
npx create-video@latest papsnet-videos
# 템플릿: Blank
# TypeScript: Yes
```

```ts
// remotion.config.ts
import {Config} from '@remotion/cli/config';
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
```

---

## 5. 영상별 시나리오

### 🔵 hero-cadwin.mp4 (AI CADWin)
1. **0~2s**: 빈 도면(라인 드로잉) 페이드인 → 스캔 라인이 위→아래 이동
2. **2~5s**: 도면 부품에 AI 인식 박스 표시(`#0891b2` 글로우), 수치/속성 텍스트가 옆에 발화 애니메이션
3. **5~8s**: 우측에 BOM 테이블이 스태거 애니메이션으로 한 줄씩 채워짐
4. **8~10s**: "AI로 도면을 더 스마트하게" 텍스트 페이드인 → 처음으로 루프

### 🔷 hero-pdm.mp4 (Clip PDM)
1. **0~2s**: 흩어진 도면 카드 5~8장이 화면에 흩뿌려진 상태
2. **2~5s**: 카드들이 중앙 "Clip PDM" 허브로 흡수되는 자석 애니메이션
3. **5~8s**: 중앙 UI에 버전 트리(v1.0 → v1.1 → v2.0) + Check-in/Check-out 뱃지 표출
4. **8~10s**: "설계 데이터의 혼란을 하나의 질서로" 텍스트

### 🟠 hero-pms.mp4 (Clip PMS)
1. **0~2s**: 빈 간트차트 그리드
2. **2~5s**: WBS 작업 바들이 좌→우로 그려지며 색상으로 채워짐
3. **5~7s**: 마일스톤 다이아몬드 아이콘 등장, Critical Path 빨간 점선 강조
4. **7~10s**: S-Curve 진척률 차트가 그려지며 "스마트 프로젝트 관리" 텍스트

### 🟢 hero-multibom.mp4 (Multi-BOM)
1. **0~3s**: 좌측 E-BOM 트리(설계) 노드들이 차례로 펼쳐짐
2. **3~6s**: 우측 M-BOM 트리(제조)로 노드들이 변환·이동, 추가/삭제 색상(녹색/빨강) 표시
3. **6~9s**: 두 트리 사이 "동기화" 화살표 애니메이션
4. **9~10s**: "E-BOM과 M-BOM의 완벽한 동기화" 텍스트

### 🟣 hero-clipcms.mp4 (Clip CMS)
1. **0~2s**: BOM 부품 리스트가 좌측에 표시됨
2. **2~5s**: 각 부품 단가(원화 ₩)가 카운트업 애니메이션으로 합산
3. **5~7s**: 우측에 도넛 차트(재료비/가공비/경비 3분할)가 그려짐
4. **7~10s**: "설계 단계부터 원가를 관리" + 목표 원가 vs 실제 원가 비교 바 표출

---

## 6. 디자인 가이드라인

### DO ✅
- **다크 베이스(`#0c0c0f`) 사용** — 사이트 다크모드에서도 자연스럽게 어울림
- 제품 컬러를 글로우/하이라이트로만 사용 (배경 전체에 깔지 말 것)
- 텍스트는 한국어 → Noto Sans KR 700, 영문 → Inter 700
- `cubic-bezier(0.16, 1, 0.3, 1)` 이징으로 부드러운 모션
- Blur-fade 인트로(`filter: blur(10px) → 0`, `opacity: 0 → 1`)
- 8px 그리드 시스템 준수

### DON'T ❌
- 사람 얼굴/실사 이미지 사용 금지 (B2B, 추상적 데이터 시각화 위주)
- 과도한 파티클/폭발 효과 금지 (Antigravity 스타일의 "클린한 프리미엄")
- 빨강 외 경고색 남용 금지
- 텍스트 5단어 이상 금지 (영상은 짧은 카피만)
- 배경음악/효과음 넣지 말 것 (autoplay muted)

---

## 7. 출력·전달 규격

### 파일 위치
완성된 MP4를 다음 경로에 배치:
```
C:\00.AI개발\홈페이지\videos\
  ├── hero-cadwin.mp4
  ├── hero-pdm.mp4
  ├── hero-pms.mp4
  ├── hero-multibom.mp4
  └── hero-clipcms.mp4
```

### HTML 교체 예시 (참고용, 실제 수정은 메인 브랜치에서)
```html
<!-- 기존 -->
<img src="clip_pdm_dashboard.png" alt="Clip PDM Dashboard">

<!-- 교체 후 -->
<video autoplay muted loop playsinline poster="clip_pdm_dashboard.png">
  <source src="videos/hero-pdm.mp4" type="video/mp4">
</video>
```

### 제출물
1. `videos/*.mp4` (5개 파일)
2. Remotion 소스 코드 (`/remotion/` 별도 폴더, 재렌더링 가능하도록)
3. 각 영상의 첫 프레임 PNG (`videos/poster-*.png`) — `<video poster>` 폴백용

---

## 8. 참고 자료

홈페이지 폴더 내 활용 가능한 자료:
- **사용 중인 정적 이미지** (모션 스토리보드 참고용):
  - `clip_pdm_dashboard.png`, `clip_pms_dashboard.png`, `multi_bom_dashboard.png`
  - `PLM_Dashboard_01.png`, `clip_PMS_목업_V01.png`
- **PDF 자료** (제품 상세 기능 참고):
  - `AI_CADWin_설계_혁신.pdf`
  - `CLIP PDM/CADWIN_PDM.pdf`
  - `CLIP PDM/(주)팹스넷 Multi-BOM 시스템 기능 및 속성 명세 - Table 1.pdf`
- **샘플 영상**: `sample동영상_remotion_V1.mp4` (이전 Remotion 시도 결과물)
- **로고**: `papsnet_logo.jpg`, `260101_팹스넷_로고.jpeg`
- **CLAUDE.md**: 프로젝트 전반 가이드

---

## 9. 작업자 지시

> 본 브리프대로 Remotion 프로젝트를 별도 브랜치에서 셋업하여 5개 제품 hero 영상을 제작합니다. **메인 페이지 히어로 영상은 교체 대상이 아닙니다.** 완성 후 `videos/` 폴더에 MP4를 산출하고, Remotion 소스는 `/remotion/` 폴더에 커밋해 향후 재렌더링이 가능하도록 합니다. 한국어 카피·브랜드 컬러·다크 테마 호환성을 반드시 준수해주세요.
