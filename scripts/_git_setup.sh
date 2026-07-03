#!/bin/bash
# 저장소 초기화 + 첫 커밋 (반쪽짜리 .git 재초기화)
set -e
export GIT_DISCOVERY_ACROSS_FILESYSTEM=1
cd /mnt/d/jarvix/projects/papsnet-homepage/papsnet-homepage-main

git config --global --add safe.directory /mnt/d/jarvix/projects/papsnet-homepage/papsnet-homepage-main 2>/dev/null || true
git init -b main
git config user.name "kimnardo"
git config user.email "kimnardo98@gmail.com"
git config core.quotepath false

git add -A
echo "=== 스테이징 파일 수 ==="
git diff --cached --name-only | wc -l
echo "=== 스테이징 용량 상위 ==="
git diff --cached --name-only -z | xargs -0 -I{} du -k "{}" 2>/dev/null | sort -rn | head -10
echo "=== 제외 확인 (커밋되면 안 되는 것들) ==="
git check-ignore -q "회사자료_홈페이지참고자료" && echo "OK: 회사자료 제외" || echo "!! 회사자료 포함됨"
git check-ignore -q "_source_pdfs" && echo "OK: _source_pdfs 제외" || echo "!! _source_pdfs 포함됨"
git check-ignore -q "scripts/shots" && echo "OK: scripts/shots 제외" || echo "!! shots 포함됨"
git check-ignore -q "videos/pms-hero-v2.mp4" && echo "OK: 미사용 영상 제외" || echo "!! 미사용 영상 포함됨"
git check-ignore -q "dist" && echo "OK: dist 제외" || echo "!! dist 포함됨"

git commit -m "PapsNet 홈페이지 — Vite 정적 사이트 초기 커밋

- index.html + 제품 페이지 5종 + 브로슈어
- styles.css / product-styles.css 디자인 시스템 (라이트·다크)
- app.js 인터랙션 + 데모 상담 모달(폼 릴레이 접수)
- public/brochures 자료 다운로드, images/videos 런타임 에셋
- scripts/ QA·에셋 파이프라인 (Playwright)"
echo "=== 커밋 결과 ==="
git log --stat --oneline -1 | head -5
git count-objects -vH | grep size-pack
