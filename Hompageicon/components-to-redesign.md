# 리디자인 대상 컴포넌트 스펙

> 라이브 화면: `http://localhost:5173` (현재 디자인 직접 확인/캡처 가능)
> Stitch에 이 스펙 + 본인이 찍은 라이브 스크린샷을 함께 주면 정확도가 높습니다.

---

## ① 아이콘 카드 `.icard` — 핵심 대상
사이트 전역 카드(업무흐름·PLM 역할별·산업·연동·데이터플로우)에 공통 사용.

**마크업**
```html
<div class="icard c-blue">
  <span class="icard-ic">
    <span class="material-symbols-rounded">manage_history</span>
  </span>
  <h4>설계 변경을 놓치지 않게</h4>
  <p>도면과 부품 변경 이력을 기준으로 검토·승인 흐름을 정리합니다.</p>
</div>
```

**현재 스타일 (듀오톤 소프트)**
- 카드: `border-radius: 22px`, 흰 배경 + 미묘한 톤 그라데이션, 얇은 컬러 보더, 부드러운 그림자, 중앙 정렬
- 아이콘 컨테이너 `.icard-ic`: 64×64, `border-radius: 18px`, **연한 컬러 틴트 배경 + 진한 컬러 글리프 + 얇은 컬러 보더 + 미세 입체감**
- 색상: `c-blue` / `c-green` / `c-purple` / `c-amber` / `c-orange` / `c-red` → 변수 `--fc`
- 그리드: `.icard-grid-3`(3열, 카드 최대 336px, 중앙 정렬) · `.icard-grid-4`(4열·데이터플로우)

**리디자인 포인트(예시)**
- 아이콘 컨테이너 질감(틴트/글래스/라인 등)·모양·크기
- 카드 프레임(라운드·그림자·보더·배경)
- 아이콘 대비 카드 비율, 여백, 타이포 위계

---

## ② 데이터 플로우 `.icard-flow` (= .icard 4열 + 연결 화살표)
CAD 도면 → E-BOM → MBOM/ERP → 원가 영향. 카드 사이 `→` 화살표(`.icard-flow .icard::after`).
- 카드는 ①과 동일 컴포넌트. 차이: 4열 + 단계 연결 화살표 + 1줄짜리 짧은 설명.

---

## ③ 제품 갤러리 카드 `.product-gallery .product-card`
"팹스넷의 통합 PLM 솔루션" — 가로 스크롤 캐러셀(3개 표시, 좌우 화살표 `.pg-arrow`).

**마크업**
```html
<a href="product-xxx.html" class="product-card cadwin">
  <div class="product-card-thumb"><img src="..." alt="..."></div>
  <div class="product-card-body">
    <span class="product-card-tag">AI 도면 인식</span>
    <h3>AI CADWin</h3>
    <div class="product-card-keys"><span>표제란 인식</span><span>E-BOM 추출</span><span>유사 도면 검색</span></div>
    <div class="product-card-link">자세히 보기 →</div>
  </div>
</a>
```
- 썸네일 16:10(화면 강조) + 하단 4px 컬러 액센트, 본문은 태그+제목+키워드 칩+링크
- 제품 색: cadwin(cyan) · pdm(blue) · pms(orange) · bom(green) · cms(purple)
- 리디자인 포인트: 카드 프레임·썸네일 프레이밍·키워드 칩 스타일

---

## 디자인 토큰 (Stitch 산출물이 맞춰야 할 값) — `styles.css :root`
- 색: `--accent #2563eb` · 제품색 `--cadwin #0891b2` `--pdm #2563eb` `--pms #ea580c` `--bom #16a34a` `--cms #7c3aed`
- 텍스트: `--text #0f1011` `--text-2 #5e6470` `--text-3 #8a8f98`
- 배경/보더: `--bg-card #fff` · `--bg-subtle #f7f8f9` · `--border rgba(0,0,0,.07)`
- 라운드: `--r-md 8` `--r-lg 10` `--r-xl 14` `--r-2xl 16`
- 간격: `--s-1..--s-12` (4px 스케일)
- 폰트: Inter + Noto Sans KR / 아이콘 Material Symbols Rounded
- 라이트·다크 테마 모두 대응 필요(`[data-theme="dark"]`)
