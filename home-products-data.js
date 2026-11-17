export function productScreenHref(product, view) {
  return view.id ? product.href + '?screen=' + encodeURIComponent(view.id) + '#features' : product.href;
}

export const products = {
  "2d": {
    "name": "CLIP 2D Viewer",
    "tag": "VIEW · MEASURE · COMPARE",
    "title": "개정 도면의 차이를 바로 확인하세요.",
    "copy": "CAD 없이 도면을 확인해야 하는 생산·품질·구매 담당자를 위한 Windows·웹 뷰어입니다.",
    "color": "#1c6569",
    "features": [
      [
        "개정 비교",
        "바뀐 위치를 도면 위에서 확인합니다."
      ],
      [
        "유사 도면 검색",
        "이전 작업에서 참고할 도면을 찾습니다."
      ],
      [
        "도면 열람",
        "생산·품질 부서에서 DWG·DXF를 검토합니다."
      ]
    ],
    "mediaLabel": "개정 도면 비교",
    "scope": "귀사 도면으로 도입 범위를 확인하세요.",
    "shot": "도면 전체와 개정 차이를 함께 보는 비교 화면",
    "href": "product-clip2dviewer.html",
    "image": "images/viewer-branding/drawing-change.webp?v=fullframe2",
    "art": "images/viewer-branding/clip-2d-viewer-icon.jpg",
    "product": "CLIP VIEW 2D",
    "pdf": "brochures/CLiP_2D_Viewer_제품소개.pdf"
  },
  "pdm": {
    "name": "CLiP PDM",
    "tag": "DRAWING · BOM · CHANGE",
    "title": "CAD에서 등록한 설계, 웹에서 확인하세요.",
    "copy": "SOLIDWORKS에서 등록한 조립품은 웹에서 다단계 설계 BOM으로 펼쳐 봅니다. AutoCAD에서는 PLM 탐색기로 도면을 찾아 작업하고, 체크인한 도면을 웹에서 검토합니다.",
    "color": "#772343",
    "features": [
      [
        "도면·리비전 관리",
        "조립 도면의 차수와 배포 상태를 확인하고 첨부 PDF를 미리 봅니다."
      ],
      [
        "다단계 BOM",
        "조립품의 하위 구조를 펼쳐 각 부품이 몇 개 쓰이는지 확인합니다."
      ],
      [
        "설계변경 기록",
        "ECO에서 변경 사유와 도면·BOM의 변경 범위를 확인합니다."
      ]
    ],
    "scope": "CAD 연동과 자료 이관, 결재 규칙은 고객 환경에 맞춰 구성합니다.",
    "shot": "PTC 히터 · 도면 상세",
    "href": "product-clippdm.html",
    "image": "images/product-highlights/pdm-screen.webp",
    "art": "/brand-family/pdm.svg",
    "product": "Clip PDM",
    "pdf": "brochures/Clip_PDM_브로슈어.pdf",
    "views": [
      {
        "id": "drawing",
        "label": "도면 상세",
        "image": "images/product-highlights/pdm-screen.webp",
        "caption": "PTC 히터 · 도면 상세",
        "copy": "PTC 히터 어셈블리의 차수는 01이고 상태는 ‘배포중’입니다. 오른쪽에 같은 조립품의 PDF 도면이 열려 있습니다.",
        "redacted": true,
        "points": [
          "조립품 품번 DEMO-A-L01",
          "분류 ‘조립도’",
          "첨부 도면 DEMO-A-L01_ASSY_R01.pdf"
        ]
      },
      {
        "id": "bom",
        "label": "다단계 BOM",
        "image": "images/product-highlights/pdm-bom.webp",
        "caption": "PTC 히터 · 다단계 BOM",
        "copy": "PTC 히터 어셈블리의 방열핀 조립 아래에 터미널 2개와 하네스 3개가 표시됩니다. 수량은 상위 조립품 1개 기준입니다.",
        "redacted": true,
        "points": [
          "최상위 조립품 DEMO-A-L01",
          "13개 항목을 5단계로 표시",
          "방열핀 조립 DEMO-A-L04 아래에서 부품별 수량 확인"
        ]
      },
      {
        "id": "eco",
        "label": "설계변경",
        "image": "images/product-highlights/pdm-eco.webp",
        "caption": "액추에이터 · 설계변경",
        "copy": "액추에이터(ACTUATOR)의 리비전 01 변경 사유는 ‘품질향상’입니다. 변경 내용에는 ‘도면’과 ‘BOM’이 선택돼 있습니다.",
        "redacted": true,
        "points": [
          "품목그룹 ACTUATOR",
          "등록 사유 ‘설계변경’",
          "호환성과 금형수정 모두 ‘있음’으로 표시"
        ]
      }
    ],
    "workflow": [
      "도면·개정 확인",
      "부품 수량 검토",
      "변경 범위 확인"
    ]
  },
  "dds": {
    "name": "CLiP DDMS",
    "tag": "DISTRIBUTE · TRACK · CONTROL",
    "title": "보낸 도면의 수신부터 회수까지.",
    "copy": "사내 배포 담당자와 협력사는 서로 다른 화면으로 접속합니다. 사내에서는 배포와 회수를 관리하고, 협력사는 받은 도면의 열람·수신확인·폐기확인을 진행합니다.",
    "color": "#205e8a",
    "features": [
      [
        "사내 배포 현황",
        "대시보드에서 기한이 임박한 배포와 아직 도면을 열지 않은 수신자를 확인합니다."
      ],
      [
        "배포 건별 수신확인",
        "사내 배포 목록에서 도면 수와 수신확인 건수를 비교합니다."
      ],
      [
        "협력사 전용 포털",
        "협력사는 최근 받은 배포 건과 수신확인·폐기확인 요청을 확인합니다."
      ]
    ],
    "scope": "회수는 시스템 접근 차단과 폐기확인 절차이며, 외부 사본의 삭제를 보장하지 않습니다.",
    "shot": "사내 배포 대시보드",
    "href": "product-clipddms.html",
    "image": "images/product-highlights/dds-dashboard.webp",
    "art": "/brand-family/dds.svg",
    "product": "CLiP DDMS",
    "pdf": "brochures/CLiP_DDMS_제품소개.pdf",
    "views": [
      {
        "id": "dashboard",
        "label": "사내 대시보드",
        "image": "images/product-highlights/dds-dashboard.webp",
        "caption": "사내 배포 대시보드",
        "copy": "캡처 시점에 배포 중인 건은 15건, 기한 임박은 3건입니다. 전체 수신확인율은 67%(서명 16/24)로 표시됩니다.",
        "redacted": true,
        "points": [
          "발송 대기 3건",
          "아직 도면을 열지 않은 수신자 4명",
          "미폐기 3건"
        ]
      },
      {
        "id": "distribution",
        "label": "사내 배포 관리",
        "image": "images/product-highlights/dds-distribution.webp",
        "caption": "브라켓 P-3120 · 사내 배포",
        "copy": "사내 배포 목록의 ‘브라켓 P-3120 신규 배포 (Rev A)’ 행에 도면 1건과 수신확인 2/2가 표시됩니다.",
        "redacted": true,
        "points": [
          "배포 번호 DEMO-2026-0915-0007",
          "배포 상태 ‘배포중’",
          "만든 날 2026-09-15"
        ]
      },
      {
        "id": "partner",
        "label": "협력사 포털",
        "image": "images/product-highlights/dds-partner.webp",
        "caption": "브라켓 P-3120 · 협력사 수신",
        "copy": "협력사 포털의 ‘최근 수신 배포’에는 같은 브라켓 P-3120 (Rev A)이 ‘수신확인 완료’로 표시됩니다.",
        "redacted": true,
        "points": [
          "배포 번호 DEMO-2026-0915-0007",
          "파일 1개 · 2026-09-15",
          "같은 목록의 HVAC 커버 설계변경 반영본은 ‘수신확인 대기’"
        ]
      }
    ],
    "workflow": [
      "전체 배포 현황",
      "사내 배포 목록",
      "협력사 수신확인"
    ]
  },
  "pms": {
    "name": "CLiP PMS",
    "tag": "PLAN · GATE · DELIVER",
    "title": "고객 일정과 사내 실행을 한눈에.",
    "copy": "고객 마일스톤을 기준으로 작업·담당자·진척을 관리합니다. 간트 차트와 게이트 점검으로 현재 확인할 일정과 산출물을 찾습니다.",
    "color": "#0a6962",
    "features": [
      [
        "고객 일정·WBS",
        "주요 마일스톤과 작업·담당자·진척을 같은 프로젝트에서 관리합니다."
      ],
      [
        "간트·게이트 점검",
        "일정을 편집하고 단계별 계획·실적·판정으로 점검 대상을 찾습니다."
      ],
      [
        "이슈·산출물 연결",
        "문서·도면·개발 활동과 이슈를 관련 업무에 연결합니다."
      ]
    ],
    "scope": "선행관계 표시·저장을 지원하며, 일정 자동 재계산은 포함하지 않습니다.",
    "shot": "PMS · 프로젝트 간트 차트",
    "href": "product-clippms.html",
    "image": "images/product-highlights/pms-screen.webp",
    "art": "/brand-family/pms.svg",
    "product": "Clip PMS",
    "pdf": "brochures/Clip_PMS_브로슈어.pdf",
    "views": [
      {
        "label": "간트 차트",
        "image": "images/product-highlights/pms-screen.webp",
        "caption": "PMS · 프로젝트 간트 차트",
        "copy": "작업별 계획 기간과 진척을 간트 차트로 확인하며 프로젝트 일정을 관리합니다.",
        "redacted": true,
        "points": [
          "작업별 계획 기간과 진척 확인",
          "WBS 작업 구조와 일정 함께 검토",
          "담당 업무와 산출물 연결"
        ]
      },
      {
        "label": "고객 일정",
        "image": "images/product-highlights/pms-schedule.webp",
        "caption": "PMS · 고객 일정과 WBS 게이트",
        "copy": "고객 마일스톤과 사내 게이트를 나란히 보고 임박 일정과 지연 단계를 확인합니다.",
        "redacted": true,
        "points": [
          "고객 마일스톤과 사내 게이트 비교",
          "기한 임박·지연 단계 확인",
          "같은 프로젝트에서 일정 맥락 유지"
        ]
      },
      {
        "label": "게이트 점검",
        "image": "images/product-highlights/pms-gate.webp",
        "caption": "PMS · 게이트 점검 현황",
        "copy": "게이트별 계획·실시 건수와 판정 분포를 확인해 점검 현황을 파악합니다.",
        "redacted": false,
        "points": [
          "게이트별 계획·실시 건수 비교",
          "합격·조건부합격·불합격·미판정 확인",
          "연간·월간 현황과 프로젝트별 점검"
        ]
      }
    ],
    "workflow": [
      "고객 일정 확인",
      "WBS·간트 관리",
      "게이트 점검"
    ]
  },
  "cadwin": {
    "name": "AI CADWin",
    "tag": "MORE SOLUTIONS",
    "title": "쌓인 도면을, 다음 설계의 자산으로.",
    "copy": "도면을 찾고 정보를 옮겨 적는 반복 업무를 줄이세요. 기존 설계를 재활용하고, 확인한 정보를 제품 데이터 관리로 이어갑니다.",
    "color": "#31565d",
    "features": [
      [
        "기존 도면 재활용",
        "새로 그리기 전에, 활용할 수 있는 기존 설계부터 확인합니다."
      ],
      [
        "반복 입력 감소",
        "BOM 정보를 추출해 옮겨 적는 업무를 줄이고, 결과 검토에 집중합니다."
      ],
      [
        "제품 데이터 연결",
        "도면과 BOM 정보를 Clip PDM에 연결해 후속 업무에서 활용합니다."
      ]
    ],
    "scope": "귀사 도면과 사용 환경을 기준으로, 실제 결과와 적용 범위를 시연 상담에서 확인하세요.",
    "shot": "AI CADWin 제품 소개 이미지",
    "mediaLabel": "PRODUCT OVERVIEW",
    "consultLabel": "우리 도면으로 시연 상담 ↗",
    "href": "product-cadwin.html",
    "image": "도면이지CADWin_260203.jpg",
    "art": "/brand-family/cadwin.svg",
    "product": "AI CADWin",
    "pdf": null
  },
  "bom": {
    "name": "Multi-BOM EPL",
    "tag": "MORE SOLUTIONS",
    "title": "여러 0레벨 제품 구조를 한 화면에서 관리",
    "copy": "서로 다른 최상위 제품의 하위 BOM 구조를 나란히 생성·편집·비교하고 변경 범위를 확인합니다.",
    "color": "#31565d",
    "features": [
      [
        "0레벨별 하위 구조 관리",
        "제품마다 다른 Part·Assy 구조를 하나의 EPL 화면에서 관리합니다."
      ],
      [
        "레벨 자유 편집",
        "BOM 레벨과 품목 관계를 업무 기준에 맞게 생성·수정·삭제합니다."
      ],
      [
        "설계 데이터에서 BOM 시작",
        "AutoCAD·SolidWorks 연동 또는 고객 양식 PDF 가져오기를 구성할 수 있습니다."
      ]
    ],
    "scope": "제품별 상세 페이지에서 기능과 도입 범위를 확인하세요.",
    "shot": "Clip Multi-BOM EPL 다중 제품 구조 관리 화면",
    "href": "product-multibom.html",
    "image": "images/multibom_dashboard_real.webp",
    "art": "/brand-family/bom.svg",
    "product": "Multi-BOM",
    "pdf": null
  },
  "cms": {
    "name": "Clip CMS",
    "tag": "MORE SOLUTIONS",
    "title": "사전 원가와 사후 원가를 같은 기준으로 비교",
    "copy": "자재비, 가공비, 견적, 실제 원가를 제품 기준으로 연결해 변경이 비용에 미치는 영향을 분석합니다.",
    "color": "#31565d",
    "features": [
      [
        "견적 기준 관리",
        "제품과 품목 기준으로 사전 원가 데이터를 관리합니다."
      ],
      [
        "실적 원가 비교",
        "사전 원가와 사후 원가를 같은 구조에서 비교합니다."
      ],
      [
        "변경 비용 검토",
        "설계 변경 전후의 원가 데이터를 비교합니다."
      ]
    ],
    "scope": "제품별 상세 페이지에서 기능과 도입 범위를 확인하세요.",
    "shot": "Clip CMS 원가 분석 대시보드 화면",
    "href": "product-clipcms.html",
    "image": "images/cms_cost_dashboard.png",
    "art": "/brand-family/cms.svg",
    "product": "Clip CMS",
    "pdf": null
  }
};
