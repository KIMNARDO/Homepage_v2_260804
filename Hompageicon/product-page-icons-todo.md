# 제품 상세 페이지 3D 아이콘 — 제작 요청 목록

> 결론: 제품 상세 페이지(5종)도 **홈페이지와 동일한 3D 아이콘**으로 풀 통일합니다.
> 문제: 제품 페이지는 홈페이지보다 아이콘 종류가 훨씬 많습니다. 주신 Stitch 세트(홈페이지용 43종)에
> **없는 아이콘 ~16종**은 소스가 없어 제가 3D로 만들 수 없습니다. 이 16종만 Stitch로 뽑아주시면 됩니다.
> 나머지(대체 가능분)는 기존 소스로 제가 알아서 처리합니다.

---

## ✅ 핸드오프 방법 (기존과 동일)
1. Stitch에서 아래 **① 새로 만들 아이콘**을 **한 개씩** 생성 (프롬프트는 아래 템플릿 사용).
2. **색상은 기본 파랑(#2563eb)** 그대로 두세요 — **제가 페이지별 테마색으로 리컬러**합니다.
   (CADWin=시안, PDM=블루, PMS=오렌지, BOM=그린, CMS=퍼플)
3. **배경은 신경 안 쓰셔도 됩니다** — 제가 배경·그림자 자동 제거합니다.
4. 받은 이미지를 기존과 같은 위치에 넣어주세요:
   `newicon/stitch_modern_corporate_icon_redesign/<설명적인_폴더명>/screen.png`
   (기존 폴더들과 같은 구조. 폴더명은 아이콘 내용이 드러나게. 예: `high_quality_3d_icon_of_a_magnifying_glass_search_front_view_flat`)
5. 다 넣으신 뒤 알려주시면 → 제가 리컬러 → 5개 페이지 전부 교체 → 라이트/다크 검증까지 합니다.

## 🎨 Stitch 프롬프트 템플릿 (스타일 일치용)
> 매 아이콘마다 `[개념]`만 바꿔서 넣으세요. 기존 43종과 톤이 맞아야 하므로 문구는 유지 권장.
```
A high-quality 3D icon of [개념], front view, flat perspective, modern soft 3D style,
smooth rounded forms with subtle depth and a soft drop shadow, single accent color blue (#2563eb)
with light-to-dark tonal shading of that one blue, centered on a plain light background,
generous padding, no text, no label. Clean, premium, trustworthy — for a B2B manufacturing PLM SaaS.
```

---

## ① 새로 만들 아이콘 — **16종** (이것만 만들어 주시면 됩니다)

| # | Material 이름 | 개념(Stitch `[개념]`에 넣을 영어) | 뜻 / 쓰이는 곳 | 사용 페이지 |
|---|---|---|---|---|
| 1 | `smart_toy` | a friendly AI robot head | AI 도면 검색 | CADWin |
| 2 | `view_in_ar` | a 3D cube / AR object | 3D·SolidWorks 통합 | CADWin |
| 3 | `file_copy` | two stacked copied documents | 파생 파일 생성·복제 | CADWin, PDM, CMS |
| 4 | `search` | a magnifying glass (plain search) | 검색 | PDM, BOM |
| 5 | `swap_horiz` | two horizontal arrows swapping | 교환·비교·동기화 | PDM, CMS, BOM |
| 6 | `lock` | a closed padlock | 접근 권한·보안 | PDM |
| 7 | `support_agent` | a headset customer-support agent | 기술 지원 | PDM |
| 8 | `factory` | a factory building with chimneys | 제조 현장 | PDM, CMS |
| 9 | `view_timeline` | a horizontal timeline / gantt bars | 일정·타임라인 | PMS |
| 10 | `route` | a winding route path with map pins | 프로세스 흐름 | PMS |
| 11 | `warning` | a warning triangle with exclamation | 리스크 경고 | PMS |
| 12 | `layers` | stacked flat layers / sheets | 다층 BOM 구조 | BOM |
| 13 | `calculate` | a calculator | 원가 계산 | CMS |
| 14 | `tune` | horizontal slider controls (tune) | 파라미터 조정 | CMS |
| 15 | `settings` | a gear / cog wheel | 설정 | CMS |
| 16 | `handshake` | two hands shaking (a deal) | 협력·거래 | CMS |

> **비슷한 것끼리 하나로**: `file_copy`=`content_copy`(4개 페이지 공용), `swap_horiz`=`sync_alt`=`compare_arrows`(공용)
> — 3·5번 각 1개만 만들면 여러 자리에 재사용합니다.

### (선택) 만들면 더 좋지만, 안 만들어도 제가 근사치로 대체 가능
| Material 이름 | 대체 시 사용할 기존 3D |
|---|---|
| `storage` (서버) | `database` |
| `schedule` (시계) | `manage_history` |
| `view_kanban` (칸반) | `dashboard` |
| `park` (나무) | `account_tree` |
| `request_quote` (견적서) | `description` |

---

## ② 제가 알아서 처리 (기존 소스 有 — 별도 제작 불필요)
아래는 `newicon` 폴더에 이미 소스가 있어, 제가 색상 변형만 뽑아 적용합니다.

| 제품 페이지가 쓰는 이름 | 사용할 기존 3D 소스 |
|---|---|
| `verified` | verified(스캘럽 배지 체크) — 소스 있음, 웹만 안 뽑음 |
| `history` | manage_history |
| `sync` | published_with_changes |
| `savings` | payments |
| `event_note` | calendar_month |
| `order_approve` | fact_check |
| `analytics` | monitoring |
| `account_tree`·`draw`·`hub`·`database`·`forum`·`group`·`groups`·`calendar_month`·`trending_up`·`fact_check` | 이미 보유 |

---

## 🔧 아이콘 받은 뒤 제 적용 계획
1. `scripts/_iconproc.mjs` JOBS에 **새 16종 + 대체분**을 페이지 테마색으로 등록 → 일괄 리컬러(webp).
2. 5개 `product-*.html`의 `.cap-bento-icon`(및 통합/기타 아이콘 슬롯) 글리프 → `<img>` 교체.
3. `styles.css`/`product-styles.css`의 `.cap-bento-icon`을 홈페이지 `.icard-ic`와 동일한
   **투명 배경 이미지 홀더**(centered, object-fit, drop-shadow)로 리스타일.
4. 라이트/다크 모드 각 페이지 스크린샷 검증.

> UI 아이콘(네비 토글, 갤러리 화살표, 푸터 전화·메일, 맨위로 등)은 기능성이라 Material Symbols 유지 권장.
> 원하시면 그것도 3D로 바꿀 수 있습니다(소스 대부분 이미 있음).
