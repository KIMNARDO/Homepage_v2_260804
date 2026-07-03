# Stitch 컴포넌트 리디자인 프롬프트 모음

> 팹스넷 홈페이지 컴포넌트를 구글 Stitch로 리디자인할 때 쓰는 프롬프트.
> **영어로 넣으세요**(Stitch가 영어에 더 강함). 화면에 보일 **텍스트는 한글 그대로** 둡니다.
> Stitch 결과(이미지 시안 / HTML·CSS / Figma)를 주시면 제가 사이트에 정확히 통합합니다.

---

## 0) 프롬프트 5원칙
1. **한 번에 하나의 섹션/컴포넌트**만 (한꺼번에 X).
2. **역할 + 실제 콘텐츠(한글 카피)** 를 넣는다.
3. 아래 **BRAND BLOCK을 매 프롬프트 끝에 붙인다** (색·폰트·라이트/다크 일관성).
4. **레이아웃(그리드/열/간격/정렬)** 을 명시.
5. 마음에 안 들면 **follow-up("make the cards more compact", "stronger shadow"...)** 으로 반복.

## ✅ BRAND BLOCK (모든 프롬프트 끝에 그대로 붙이기)
```
— Brand & style constraints —
Product: Papsnet, a Korean B2B manufacturing PLM SaaS. Tone: modern, clean, trustworthy, corporate. Web / desktop-first, fully responsive, and it MUST support both LIGHT and DARK themes.
Fonts: Inter + Noto Sans KR. Headings bold with tight letter-spacing.
Colors: primary/accent blue #2563eb; product accents — cyan #0891b2, blue #2563eb, orange #ea580c, green #16a34a, purple #7c3aed; text #0f1011, secondary #5e6470, tertiary #8a8f98; card background #ffffff, page background #fcfcfd, subtle surface #f7f8f9; hairline borders rgba(0,0,0,0.07).
Shape & depth: soft rounded corners 16–22px; soft, subtle shadows (not heavy/glossy).
Icons: use my existing 3D corporate icons (colored, transparent, centered) — leave a placeholder icon slot.
Keep Korean UI text exactly as given. No lorem ipsum.
```

---

## 1) 아이콘 카드 섹션 (feature/benefit card grid)
```
Design a feature-card grid section for a B2B PLM SaaS landing page.
Layout: a centered section header (small blue eyebrow tag, a bold 1–2 line H2, a muted subtitle), then a row of 3–4 equal cards.
Each card: a 3D colored icon at top-center, a bold title, and a 1–2 line description below, all center-aligned. Cards are white with soft rounded corners (~20px), a hairline border, and a soft subtle shadow; comfortable padding; hover lifts slightly.
Use real content, e.g. card 1 title "설계 변경을 놓치지 않게" / desc "도면과 부품 변경 이력을 기준으로 검토·승인 흐름을 정리합니다." (blue), card 2 "BOM 영향을 바로 보게" (green), card 3 "원가 변동까지 이어지게" (amber). Each card icon uses its own accent color.
Show both light and dark versions.
[BRAND BLOCK]
```

## 2) 제품 갤러리 카드 (product showcase carousel)
```
Design a horizontal product-showcase carousel for a PLM SaaS.
Each card (show 3 at once, with left/right circular arrow buttons and scroll-snap): a large product screenshot at the top (16:10) with a 4px color accent bar under it; then a compact body — a small colored pill tag, the product name as H3, three short keyword chips, and a "자세히 보기 →" link at the bottom. The screenshot is the hero; keep text minimal. White card, rounded 16px, soft shadow, hover lifts and image zooms slightly.
Example: tag "AI 도면 인식", name "AI CADWin", chips [표제란 인식][E-BOM 추출][유사 도면 검색] (cyan accent). Other products: Clip PDM (blue), Clip PMS (orange), Multi-BOM (green), Clip CMS (purple).
Show light and dark.
[BRAND BLOCK]
```

## 3) 역할별 PLM 대시보드 섹션 (tabbed dashboard showcase)
```
Design a "role-based dashboard" showcase section.
Top: centered header (eyebrow "통합 PLM", H2 "역할별 PLM 현황을 한 화면에서 전환합니다", subtitle). Below it a pill tab bar with 4 tabs: 임원 / 관리자 / 팀장 / 개인 (first active, dark pill).
Under the tabs, a two-column split: LEFT ~58% = a large product dashboard screenshot inside a rounded frame with a small floating label chip ("Executive Dashboard"); RIGHT ~38% = a step label ("01 — 임원 KPI 관점"), a bold 2-line heading ("데이터 기반으로 / 전사 의사결정을 지원합니다"), a short paragraph, then a 2×2 grid of small icon-cards (3D colored icon + title + one-line desc): KPI 현황 / 프로젝트 진척 / 리스크 관제 / 원가 영향.
Left and right should be visually balanced in height. Show light and dark.
[BRAND BLOCK]
```

## 4) 히어로 (hero)
```
Design a hero section for a B2B PLM SaaS landing page.
Two columns. LEFT: a small pill badge ("한국형 제조업 PLM · AI 도면 인식"), a large bold headline on 2–3 lines ("설계 도면, BOM, 프로젝트, 원가를 하나의 PLM에서 관리합니다."), a muted subtitle paragraph, two buttons (primary "제품 도입 문의 →" filled blue, secondary "제품 화면 보기" outline), and a proof strip of 3 small items with tiny icons (제조 현장 28개사 구축 / 주요 CAD 20여 종 연동 / SAP·영림원 ERP 연동).
RIGHT: a realistic browser-window mockup (3 dots + url "plm.papsnet.net / dashboard") containing a product dashboard screenshot; subtle floating/tilt, soft shadow.
Clean, spacious, corporate. Show light and dark.
[BRAND BLOCK]
```

## 5) 솔루션 맵 (solution showcase — 2-panel)
```
Design a "solution map" showcase block made of two side-by-side rounded panels.
LEFT panel (dark navy, ~46% width): eyebrow "솔루션 구성", bold headline "도면에서 원가까지, 하나의 제품개발 흐름으로", a short paragraph, a small floating app-window mockup (a BOM tree UI), a row of 3 white info-cards (변경 요청 / 원가 영향 +1.24% with a mini line chart / 최근 활동 timeline), and a bottom row of 4 feature items (icon + label + subtext).
RIGHT panel (light, ~54%): three columns separated by hairlines, each numbered — "01 CAD DATA", "02 PLM FLOW", "03 OPERATION" — with a small mini-mockup at top, a bold title, a short desc, a 3-item checklist, and product pills at the bottom.
Premium, information-rich but clean. Show light and dark.
[BRAND BLOCK]
```

## 6) CTA / 문의 섹션 (contact CTA)
```
Design a final call-to-action section for a B2B SaaS.
A wide dark rounded panel: a bold headline ("어디부터 적용할지 함께 정리합니다"), a short supporting line, and either two buttons (primary "도입 문의하기", secondary "브로슈어 보기") or a compact inline contact form (이름 / 회사 / 이메일 / 문의내용 + submit). Add a subtle glow/gradient accent. Keep it focused and trustworthy. Show light and dark.
[BRAND BLOCK]
```

---

## 🔁 핸드오프 (Stitch → 나)
- **이미지 시안** → 제가 보고 HTML/CSS로 정확히 구현
- **HTML/CSS export** → 우리 디자인 토큰·구조에 맞춰 통합
- **Figma** → 스펙(치수·색·폰트) 읽어 반영
- 한 컴포넌트씩 주셔도 되고, 여러 개 모아 주셔도 됩니다.
