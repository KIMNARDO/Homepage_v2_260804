# SpinFire Insight 소개 섹션 검토안

## 승인 상태

사용자가 제공한 Tech Soft 3D와의 SpinFire 총판 계약 사실을 반영한 **로컬 검토안**이다. Git 커밋·푸시 및 운영 사이트 게시·배포는 실행하지 않았다. 각각 사용자의 명시적인 검토 승인 범위에서만 진행한다.

- 미리보기: http://127.0.0.1:5174/#spinfire
- 기준: 실제 운영 코드 `766be38499af96182646c09297aaabb65701def7`
- 브랜치: `improve/production-site`
- 작업 폴더: `D:\코덱스\papsnet-homepage\papsnet-production`

## 구성과 문구

CLIP 제품 소개 다음, 고객사 소개 앞에 별도 SpinFire 섹션을 추가했다. 기존 섹션의 배경색 순서에 영향을 주지 않도록 새 섹션은 별도 div에 넣었다. 기존 히어로, 제품군, 화곡고등학교 강의 사진 등 기존 13개 section 내용은 수정 전 로컬 파일과 동일하다.

- 계약 안내: `Tech Soft 3D × PAPSNET`, `SpinFire 총판 계약 체결`
- 제품명: `SpinFire Insight`
- 소개: `CAD 데이터, 모든 부서가 함께 봅니다.`
- 기능 화면 3개: 단면 검토 / 정밀 측정 / 모델 비교
- 추가 안내: 마크업·주석, Windows 데스크톱, 대표 CAD 형식
- 자료: 한국어 제품 소개서 PDF, 공식 지원 형식 페이지, 공식 사용 가이드
- 탐색: 홈페이지 솔루션 메뉴, 모바일 메뉴, 하단 솔루션 메뉴에 진입 링크
- 상담: 제품을 미리 선택한 기존 상담 양식으로 연결

계약 지역·독점 여부·계약일·가격·할인·서비스 수준 등 사용자가 제공하지 않은 조건은 추가하지 않았다. 기존 CLIP 웹 뷰어와 직접 연동되는 제품이라는 표현도 넣지 않았다.

## 공식 출처

2026-09-28 확인:

1. [SpinFire Insight 제품 소개](https://www.techsoft3d.com/enterprise/spinfire-insight/): 2D/3D CAD 열람, 단면, 측정, 모델 비교, 마크업, Windows 및 독립형 제품 설명.
2. [지원 CAD 형식](https://www.techsoft3d.com/enterprise/spinfire-insight/cad-formats/): 형식·버전·에디션별 지원 차이.
3. [공식 사용 문서](https://docs.techsoft3d.com/spinfire/insight/): 설치, 기능별 사용 방법, 지원 문서.

총판 계약 표기는 사용자의 직접 진술을 근거로 했다. 공개 파트너 목록에서 계약을 검증했다는 의미가 아니다.

### 제품 화면 원본

아래 이미지는 공식 제품 페이지가 제공하는 실제 제품 화면을 그대로 저장했다. 편집·합성하지 않았으며 홈페이지에 출처를 표시했다.

| 로컬 파일 | 공식 원본 URL |
| --- | --- |
| `public/images/spinfire/spinfire-section-cut.jpg` | https://a-us.storyblok.com/f/1023536/1920x1080/f4a22512d1/2025-08_section-cut.jpg |
| `public/images/spinfire/spinfire-measurement.jpg` | https://a-us.storyblok.com/f/1023536/1920x1080/66e3a78ae9/2025-08_smart-dimensioning.jpg |
| `public/images/spinfire/spinfire-model-compare.jpg` | https://a-us.storyblok.com/f/1023536/1920x1080/6aee43ee60/2025-08_model-compare.jpg |

세 이미지 합계: 351,976바이트. 너비·높이를 지정하고 지연 로딩하며, 자동 재생 영상은 추가하지 않았다.

### 제품 소개서

- 홈페이지 제공 파일: `public/downloads/papsnet-spinfire-insight-ko.pdf`
- 생성 스크립트: `scripts/build-spinfire-brochure.py`
- A4 1쪽, 한글 글꼴 포함, 실제 제품 화면·주요 기능·대표 CAD 형식·문의처·출처 수록.
- 팹스넷 작성 자료이며 Tech Soft 3D 공식 발행 브로슈어로 표시하지 않았다.
- 홈페이지에서 정보 입력 없이 직접 내려받을 수 있는 제품 개요 자료다. 기존 보호된 브로슈어 다운로드 절차는 변경하지 않았다.

## 동작과 검증

- PC 1280px, 모바일 390px·320px에서 가로 넘침 없음.
- 모바일은 기능 탭을 이미지 위에 두고, 섹션을 보는 동안 기존 떠 있는 상담·위로 버튼의 겹침을 방지.
- 클릭, 방향키, Home 키로 기능 선택 및 화면 전환 확인. 화면 폭에 따라 탭의 가로·세로 방향 접근성 정보 전환.
- 세 제품 이미지 정상 로딩, 밝은 테마·어두운 테마 확인.
- SpinFire 상담 링크에서 제품 자동 선택, 전용 문구·입력 안내 확인.
- 일반 상담 링크의 기존 문구와 선택 상태 유지 확인.
- 상담 폼의 모든 제품명이 서버 허용 목록에 포함됨을 확인. 실제 상담 제출·메일 발송은 수행하지 않음.
- PDF 응답 200, PDF 형식, 1쪽, 한글 텍스트 및 링크 확인. 페이지를 PNG로 렌더링하여 시각 검수.
- Vite 빌드, JS 구문 검사 및 diff 공백 검사 통과.
- 원본 이미지와 PDF가 빌드 결과에 동일하게 포함되는지 확인.

검토 기록과 화면은 `output/spinfire-review/`에 저장했다. 최종 확인은 섹션 위치, 계약 문구, 제품 소개서 내용이며 커밋과 게시 승인은 각각 별도로 받는다.

## 강조색 추가 검토

사용자의 ‘색상을 하나 더 추가해 눈에 띄게’ 요청에 따라 SpinFire 영역에 기존 사이트의 코발트 블루 `--am-blue` (`#2457d6`)를 추가했다. 변경 파일은 `home-spinfire.css`이며, 제품명·계약 배지·제품 화면 상단 바·선택한 기능 탭·자료 아이콘·키보드 포커스에 적용했다. 상담 버튼의 기존 연두색과 블루가 함께 보이도록 구성했다.

어두운 테마에서는 블루 글자를 `#91b1ff`로 밝히고, 선택 배경을 `#202b46`으로 조정했다. 밝은 테마의 제품명 대비는 5.79:1, 배지 및 선택 탭은 5.40:1, 화면 상단 바의 흰 글자는 6.16:1이다. 어두운 테마의 제품명은 8.56:1, 선택 탭은 6.64:1이다.

- 데스크톱과 모바일의 밝은·어두운 테마를 화면으로 확인했다.
- 390px·320px 너비에서 페이지 및 SpinFire 영역에 가로 넘침이 없다.
- 기능 탭 클릭, 방향키, Home 키를 통한 선택과 제품 이미지 전환을 확인했다.
- 최종 Vite 빌드와 diff 공백 검사를 통과했다. 색상 변경에 대한 별도 테스트 코드는 추가하지 않았다.
- 변경 전후 화면은 `output/spinfire-review/color-before.png`, `color-light-desktop.png`, `color-dark-desktop.png`, `color-light-mobile.png`, `color-dark-mobile.png`에 저장했다.

이번 변경도 로컬 검토 단계이며, Git 커밋·푸시와 운영 배포는 수행하지 않았다.
