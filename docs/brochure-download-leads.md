# 제품 자료 다운로드 리드 운영

제품 PDF는 공개 URL로 바로 내려받지 않고 간단한 리드 폼을 거쳐 15분 동안 유효한 서명 URL로 제공한다.

## 처리 흐름

1. 방문자가 회사명, 담당자명, 업무 이메일, 선택 연락처를 입력한다.
2. 서버가 입력값, 동의 여부, 요청 횟수, 요청 자료를 검증한다.
3. 접수 ID를 발급하고 Google Sheet `자료다운로드` 탭에 먼저 기록한다.
4. 공식 영업 메일 `kimnardo@papsnet.net`로 알림을 보내고 `kimnardo98@gmail.com`을 BCC로 추가한다.
5. Sheet 기록 또는 이메일 전달 중 하나 이상이 성공하면 다운로드 URL을 발급한다.
6. 모든 기록 및 알림 채널이 실패한 경우에만 다운로드를 중단하고 재시도를 안내한다.

영업 메일 장애 때문에 다운로드 리드 자체가 유실되지 않도록 Sheet 저장을 이메일보다 먼저 수행한다. 같은 접수 ID가 재전송되더라도 Sheet 행과 Apps Script 알림은 중복 생성하지 않는다.

## 필수 운영 설정

전체 설정과 배포 절차는 [lead-conversion-setup.md](./lead-conversion-setup.md)를 따른다.

```text
LEAD_NOTIFICATION_EMAILS=kimnardo@papsnet.net,kimnardo98@gmail.com
LEAD_WEBHOOK_URL=https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec?token=<WEBHOOK_TOKEN>
DOWNLOAD_TOKEN_SECRET=<long random secret>
RESEND_API_KEY=<Resend API key>
LEAD_FROM_EMAIL=<verified papsnet.net sender>
```

로컬에서 실제 외부 메일을 보내지 않고 폼 동작만 확인할 때는 `LEAD_DELIVERY_MODE=log`를 사용한다. 운영 환경에는 이 값을 설정하지 않는다.

## Sheet 저장 항목

- 다운로드 ID와 시각
- 선택 제품 및 요청 파일
- 회사명과 담당자명
- 업무 이메일과 선택 연락처
- 유입 페이지
- 알림 메일 상태
- 영업 확인 상태, 담당자, 메모

개인정보를 브라우저 `localStorage`에 저장하지 않는다. Google Sheet 공유 권한도 영업 담당자에게만 부여한다.
