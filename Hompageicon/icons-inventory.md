# 아이콘 인벤토리 — 홈페이지(index.html)

모든 아이콘 = **Material Symbols Rounded** 폰트 글리프.
- 미리보기/다운로드: `https://fonts.google.com/icons` 에서 이름으로 검색
- SVG 직접: `https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web/<이름>/materialsymbolsrounded/<이름>_24px.svg`

---

## 1) 카드 아이콘 — 리디자인 핵심 대상 (`.icard` 글리프)

### 데이터 플로우 (CAD → BOM → ERP → 원가)
| 카드 | 아이콘 이름 | 색 |
|---|---|---|
| CAD 도면 | `draw` | blue |
| E-BOM | `account_tree` | green |
| MBOM/ERP | `hub` | purple |
| 원가 영향 | `monitoring` | amber |

### 업무 흐름 (landing-focus)
| 카드 | 아이콘 | 색 |
|---|---|---|
| 설계 변경을 놓치지 않게 | `manage_history` | blue |
| BOM 영향을 바로 보게 | `difference` | green |
| 원가 변동까지 이어지게 | `payments` | amber |

### 역할별 PLM 대시보드 — 임원
| 카드 | 아이콘 | 색 |
|---|---|---|
| KPI 현황 | `speed` | blue |
| 프로젝트 진척 | `trending_up` | green |
| 리스크 관제 | `shield` | purple |
| 원가 영향 | `payments` | amber |

### 역할별 PLM 대시보드 — 관리자
| 카드 | 아이콘 | 색 |
|---|---|---|
| 사용자 관리 | `group` | blue |
| 도면 현황 | `description` | green |
| 결재 현황 | `fact_check` | purple |
| 보안 경고 | `gpp_maybe` | red |

### 역할별 PLM 대시보드 — 팀장
| 카드 | 아이콘 | 색 |
|---|---|---|
| 일정 관리 | `calendar_month` | blue |
| 업무 분배 | `groups` | green |
| 변경 이슈 | `article` | purple |
| 협업 상태 | `forum` | orange |

### 역할별 PLM 대시보드 — 개인
| 카드 | 아이콘 | 색 |
|---|---|---|
| 내 할 일 | `task_alt` | blue |
| 결재 요청 | `fact_check` | green |
| 변경 요청 | `cached` | purple |
| 알림 현황 | `notifications` | orange |

### 고객 산업군 (industry)
| 카드 | 아이콘 | 색 |
|---|---|---|
| 자동차 부품제조 | `directions_car` | blue |
| 반도체·전자 | `memory` | green |
| 의료장비 | `medical_services` | purple |

### 시스템 연동 (integration)
| 카드 | 아이콘 | 색 |
|---|---|---|
| 설계 흐름 연결 | `hub` | blue |
| ERP 연동 | `database` | green |
| CAD 호환 | `draw` | purple |

### 솔루션 맵 — 기능 4종(좌측 다크 패널)
| 항목 | 아이콘 |
|---|---|
| 설계 변경 추적 | `published_with_changes` |
| BOM 통합 관리 | `account_tree` |
| 원가 영향 분석 | `query_stats` |
| 데이터 보안 | `shield` |

**카드 아이콘 고유 이름(중복 제거):**
`draw, account_tree, hub, monitoring, manage_history, difference, payments, speed, trending_up, shield, group, description, fact_check, gpp_maybe, calendar_month, groups, article, forum, task_alt, cached, notifications, directions_car, memory, medical_services, database, published_with_changes, query_stats`

---

## 2) UI · 장식 아이콘 (보통 리디자인 대상 아님)

| 위치 | 아이콘 |
|---|---|
| 테마 토글 | `dark_mode` |
| 모바일 메뉴 닫기 | `close` |
| 맨 위로 | `arrow_upward` |
| 갤러리 이전/다음 | `chevron_left`, `chevron_right` |
| 제품 칩 외부링크 | `open_in_new` |
| 푸터 연락처 | `call`, `smartphone`, `mail` |
| 히어로 영역 | `verified`, `draw`, `database` |
| 솔루션맵 목업 사이드바 | `dashboard`, `draft`, `account_tree`, `edit_note`, `folder_shared`, `summarize` |
| PLM 목업 스텝퍼 | `check`, `expand_more` |

---

## 참고
- 글꼴 로드: `<head>`의 Material Symbols Rounded `<link>` (각 페이지)
- 렌더 옵션: `font-variation-settings: 'FILL' 1, 'wght' 500, ...` (CSS의 `.icard-ic .material-symbols-rounded` 등)
- 카드 컴포넌트 스타일: `styles.css` 의 `.icard`, `.icard-ic`, `.icard-grid-3/4` (현재 듀오톤 소프트)
