# Papsnet 영업 리드 운영 설정

## 확정 구성

- Google Tag Manager: `GTM-WNWPBJMK`
- Google Analytics 4: `G-BSW4E81SS0`
- 영업 알림 수신(To): `kimnardo@papsnet.net`
- 누락 방지 백업(BCC): `kimnardo98@gmail.com`
- 영업 리드 Sheet: `1zfL3EKl4CsGySmq7Y94oxRc65gulGrhjdVX0fLITIg8`

회사 도메인 주소를 공식 영업 기록의 수신자로 사용하고 Gmail은 장애나 스팸 분류에 대비한 백업 수신자로만 사용한다. Google Sheet는 외부에 공개하지 않는다.

## Google Sheet Web App 설치

1. 영업 리드 Google Sheet를 연다.
2. `확장 프로그램 > Apps Script`를 연다.
3. [google-apps-script-lead-webhook.gs](./google-apps-script-lead-webhook.gs)의 전체 코드를 붙여 넣는다.
4. `프로젝트 설정 > 스크립트 속성`에 `WEBHOOK_TOKEN`을 만들고 충분히 긴 무작위 값을 저장한다. 이 값은 Git에 커밋하지 않는다.
5. 편집기에서 `setupLeadSheets`를 한 번 실행하고 Google 권한을 승인한다.
6. `배포 > 새 배포 > 웹 앱`을 선택한다.
7. 실행 사용자는 `나`, 액세스 사용자는 `모든 사용자`로 설정한다. Sheet 자체의 공유 설정은 비공개 상태를 유지한다.
8. 배포된 `/exec` URL 뒤에 `?token=<WEBHOOK_TOKEN>`을 붙여 Heroku의 `LEAD_WEBHOOK_URL`에 저장한다.

스크립트가 생성하는 탭은 다음 두 개다.

- `상담문의`: 상담 정보, 관심 제품, 도입 시기, 처리 상태, 담당자, 후속 연락일, 영업 메모
- `자료다운로드`: 다운로드 자료, 회사/담당자, 확인 상태, 담당자, 메모

같은 접수 ID가 다시 전송되면 행과 알림 메일을 중복 생성하지 않는다.

## Heroku 환경 변수

```text
LEAD_NOTIFICATION_EMAILS=kimnardo@papsnet.net,kimnardo98@gmail.com
LEAD_WEBHOOK_URL=https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec?token=<WEBHOOK_TOKEN>
RESEND_API_KEY=<production Resend API key>
LEAD_FROM_EMAIL=<verified sender on the papsnet.net domain>
DOWNLOAD_TOKEN_SECRET=<long random secret>
```

`LEAD_NOTIFICATION_EMAIL`은 이전 단일 주소 설정과의 호환용이다. `LEAD_NOTIFICATION_EMAILS`가 있으면 다중 주소 설정이 우선한다. Resend에서는 첫 주소가 To, 나머지 주소가 BCC로 전송된다. FormSubmit은 공식 회사 주소만 사용한다.

## 저장 및 전달 순서

1. 서버가 입력값과 스팸 방지 조건을 검증한다.
2. 접수번호를 발급하고 서버 로그 및 JSONL 원본에 기록한다.
3. Google Sheet Web App에 먼저 영구 저장을 요청한다.
4. Apps Script가 회사 주소로 메일을 보내고 Gmail을 BCC로 추가한다.
5. Apps Script 메일이 실패하면 서버가 Resend, FormSubmit 순서로 대체 전송한다.
6. 상담 문의는 실패한 채널만 30초, 2분, 10분 간격으로 재시도한다.

Heroku 파일 시스템은 재시작 때 보존되지 않을 수 있으므로 Google Sheet 기록을 운영상의 원본으로 사용한다.

## Analytics 이벤트

| Event | Trigger |
| --- | --- |
| `form_start` | `contact.html`에서 첫 실제 입력 |
| `generate_lead` | 접수 완료 화면 최초 진입 |
| `phone_click` | `tel:` 링크 클릭 |
| `brochure_view` | `brochure.html` 진입 |

GTM에서 `generate_lead` Custom Event 트리거를 만들고 GA4 이벤트 태그에 연결한다. GA4 직접 페이지 태그가 활성화된 상태에서 GTM에 페이지뷰 설정 태그를 중복 게시하지 않는다.

## 운영 검증

1. 상담 폼에 테스트용 회사 정보를 넣어 제출한다.
2. 완료 화면의 접수번호가 `상담문의` 탭 첫 열과 같은지 확인한다.
3. 회사 메일의 받은 편지함과 스팸함, Gmail BCC 수신함을 확인한다.
4. 자료 다운로드를 한 번 실행하고 `자료다운로드` 탭과 두 메일함을 확인한다.
5. 동일한 테스트 payload를 재전송했을 때 같은 접수번호의 행과 메일이 추가되지 않는지 확인한다.
6. Heroku 로그에서 `[contact-lead]`, `[brochure-lead]`, `webhook` 실패 메시지를 점검한다.

```powershell
heroku logs --tail --app <app-name> | Select-String "contact-lead|brochure-lead|webhook"
```

메일함에서 확인되지 않아도 Sheet 행이 생성됐다면 영업 정보는 보존된 상태다. Sheet 행의 `알림 메일 상태`가 `전송 실패`이면 Apps Script 실행 기록과 일일 MailApp 할당량을 확인한다.
