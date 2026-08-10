# 제품 자료 다운로드 리드 설정

제품 페이지의 PDF 다운로드는 다음 순서로 처리됩니다.

1. 방문자가 회사명, 담당자명, 업무 이메일을 입력합니다.
2. 서버가 입력값과 요청 횟수를 검증합니다.
3. 관리자 이메일로 리드가 전달됩니다. Resend가 설정되지 않았거나 실패하면 FormSubmit으로 재전송합니다.
4. 15분간 유효한 서명 다운로드 링크가 발급됩니다.
5. PDF 직접 주소 접근은 차단됩니다.

## 권장 운영 구성

- 이메일 알림: Resend를 사용해 `kimnardo@papsnet.net`으로 전송
- 영구 확인: Google Sheets, HubSpot 또는 사내 CRM 웹훅으로 동시 저장
- 장애 방지: 이메일과 웹훅을 함께 설정하면 한 채널이 실패해도 다른 채널에 기록됩니다.

Heroku 파일 시스템은 재시작 시 초기화될 수 있으므로 리드를 서버 파일에 저장하지 않습니다.

## Heroku 환경변수

```text
RESEND_API_KEY=Resend에서 발급한 API 키
LEAD_FROM_EMAIL=Papsnet Website <downloads@papsnet.net>
LEAD_NOTIFICATION_EMAIL=kimnardo@papsnet.net
DOWNLOAD_TOKEN_SECRET=충분히 긴 무작위 문자열
LEAD_WEBHOOK_URL=Google Sheets 또는 CRM 수신 URL (선택)
BROCHURE_FORM_ENDPOINT=https://formsubmit.co/ajax/kimnardo@papsnet.net
```

`downloads@papsnet.net` 발신을 사용하려면 Resend에서 `papsnet.net` 도메인 인증이 먼저 완료되어야 합니다.

다운로드는 관리자 이메일 전달이 성공한 뒤에만 허용됩니다. `RESEND_API_KEY`가 없거나 Resend가 실패하면 `BROCHURE_FORM_ENDPOINT`, `CONTACT_FORM_ENDPOINT`, 기본 FormSubmit 주소 순서로 대체 전송합니다.

상담 요청은 검증이 끝나는 즉시 접수번호와 함께 Heroku 로그에 먼저 기록됩니다. 외부 메일 채널이 일시적으로 실패하면 HTTP `202 Accepted`로 접수를 확정하고 30초, 2분, 10분 간격으로 백그라운드 재전송합니다. 잘못된 `CONTACT_FORM_ENDPOINT`가 설정되어 있어도 기본 FormSubmit 주소를 한 번 더 시도합니다.

FormSubmit이 상담 메일을 정상 구성하도록 표준 `name`, `email`, `company`, `phone`, `message` 필드와 한국어 영업 필드를 함께 전달합니다. 장기 운영에서는 FormSubmit 한 곳에만 의존하지 말고 Resend와 `LEAD_WEBHOOK_URL`을 함께 구성하는 것을 권장합니다.

로컬 테스트에서 실제 메일을 보내지 않으려면 `LEAD_DELIVERY_MODE=log`를 사용합니다. 이 값은 운영 환경에 설정하지 않습니다.
상담 폼만 로그 모드로 시험하려면 `CONTACT_DELIVERY_MODE=log`를 사용합니다.

## 수신 데이터

- 요청 제품
- 접수번호
- 회사명
- 담당자명
- 업무 이메일
- 연락처(선택)
- 요청 시각
- 유입 페이지
- 접속 IP 및 브라우저 정보

개인정보는 브라우저 `localStorage`에 저장하지 않습니다.
