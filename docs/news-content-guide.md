# 팹스넷 소식 등록 가이드

소식은 `content/news.json` 한 파일에서 관리한다. 홈페이지의 분류 버튼, 건수, 목록, 상세 창은 이 데이터를 사용한다. 별도의 관리자 작성 화면은 현재 포함하지 않는다.

## 새 소식 추가 순서

1. 사진이 있으면 `public/images/news/` 아래에 넣는다. 화면에서 사용할 주소는 `/images/news/파일명.jpg`다.
2. `content/news.json`의 `items` 배열에 소식 한 건을 추가한다. 배열 순서가 화면 순서다. 새 소식을 먼저 보여주려면 배열 맨 앞에 넣는다. 각 페이지의 첫 소식은 크게, 나머지는 간결한 목록으로 표시된다.
3. 분류를 선택한다. `media`는 언론 보도, `education`은 교육 활동, `company`는 기업 소식이다. 분류를 늘릴 때에는 같은 파일의 `categories`에 ID와 표시 이름을 추가한다.
4. 로컬 화면에서 제목, 사진, 상세 내용, 연결 주소를 확인한다. 한 페이지에는 최대 네 건이 표시되며, 다섯 건부터 이전·다음 페이지 버튼이 자동으로 나타난다.
5. 사용자 검토 후 명시적으로 승인받은 범위에만 Git 커밋·푸시 또는 운영 배포를 진행한다. 파일을 수정하는 것만으로 운영 사이트에 게시되지는 않는다.

확인되지 않은 날짜는 `null`로 두면 날짜가 표시되지 않는다. `published: false`는 화면 목록에서 항목을 숨기는 편집용 표시이며 접근 권한을 설정하는 기능은 아니다. 작성 파일에는 공개 가능한 자료만 둔다.

## 기본 예시: 기업 소식

아래 구조를 `items` 배열 안에 추가한 뒤 실제 확인된 내용으로 작성한다. ID는 기존 항목과 겹치지 않는 영문 소문자·숫자·하이픈으로 정한다. 날짜를 확정했다면 `YYYY-MM-DD` 형식으로 적는다.

```json
{
  "id": "company-update-example",
  "category": "company",
  "kind": "announcement",
  "published": true,
  "date": null,
  "source": "팹스넷",
  "title": "새 소식 제목",
  "summary": "목록에 표시할 짧은 소개",
  "paragraphs": [
    "상세 창에 표시할 첫 번째 문단",
    "필요한 경우 추가하는 두 번째 문단"
  ]
}
```

대표 사진이 없으면 출처와 제목을 이용한 표지로 표시된다. 사진을 넣을 때에는 `image`와 사진을 설명하는 `imageAlt`를 함께 추가한다. 제품 소개로 연결하려면 `relatedUrl`과 `relatedLabel`을 추가한다.

## 소식 유형별 항목

| 유형 | `kind` | 추가 항목 |
| --- | --- | --- |
| 기사 | `article` | `sourceUrl`에 원문 주소. `sourceTitle`에 원문 제목, `coverLabel`·`coverTitle`에 표지 문구를 선택적으로 입력한다. |
| 방송 | `video` | `image`·`imageAlt`, `sourceUrl`, `video` 객체. `id`는 YouTube 영상 ID, `start`·`end`는 초 단위 구간, `label`은 표시 시간이다. |
| 현장 사진 | `gallery` | 대표 `image`·`imageAlt`, `photos` 배열. 각 사진에는 `src`·`alt`·`caption`을 입력한다. 작은 선택 사진은 `thumbnail` 주소를 지정하면 별도로 불러온다. |
| 기업 발표 | `announcement` | 본문을 입력하고 필요하면 `image`·`imageAlt`, `relatedUrl`·`relatedLabel`을 추가한다. |

기사에는 확인한 매체명·발행일·원문 주소를 기록하고, 본문은 팹스넷 관점에서 짧게 소개한다. 기사 전문이나 매체 사진을 그대로 옮기지 않는다. 현재 교육 활동 소식에는 강의 문의 버튼을 두지 않는다.

사진은 개수가 늘어나면 썸네일 영역 안에서 가로로 넘겨 선택한다. 이전·다음 버튼과 키보드 방향키를 사용할 수 있고, Home·End 키는 처음·마지막 사진으로 이동한다. 작은 사진에는 별도의 썸네일 파일을 지정해 상세 사진 전체를 한꺼번에 내려받지 않도록 한다.

화곡고등학교 추가 사진 16장은 `scripts/prepare-hwagok-photos.ps1`로 웹용 JPEG(가로 최대 1600px)와 썸네일(240px)을 만든다. 사용자 원본은 상위 `강의사진` 폴더에 그대로 보관한다.

## 확인 명령

작업 폴더 `papsnet-production`에서 실행한다.

```powershell
node --test tests/news-content.test.mjs
node node_modules/vite/bin/vite.js build
```

빌드 과정에서 중복 ID, 잘못된 분류·날짜·주소, 누락된 기사 원문 및 사진·방송 정보를 검사한다. 소식 내용은 빌드된 HTML에도 포함되며, JavaScript가 꺼진 환경에서는 원문과 사진 링크를 제공한다.

로컬 미리보기: `http://127.0.0.1:5174/#news`

특정 소식 직접 연결: `http://127.0.0.1:5174/#news/소식-id`
