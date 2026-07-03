#!/bin/bash
cd /mnt/d/jarvix/projects/papsnet-homepage/papsnet-homepage-main
echo "=== .git type ==="
ls -lad .git
file .git 2>/dev/null
[ -d .git ] && ls .git | head -12
echo "=== scripts/ size detail ==="
du -sh scripts/* 2>/dev/null | sort -rh | head -8
echo "=== video refs in current html ==="
grep -ho 'videos/[A-Za-z0-9._-]*' index.html product-*.html brochure.html 2>/dev/null | sort -u
echo "=== videos on disk ==="
ls -la videos | awk '{print $5, $9}'
echo "=== 고객사 이미지 usage ==="
grep -l '홈페이지_고객사_이미지' index.html product-*.html brochure.html 2>/dev/null || echo "not referenced in html"
grep -o 'src="[^"]*고객사[^"]*"' index.html | head -3
echo "=== marquee img srcs sample ==="
grep -o '<img src="[^"]*"' index.html | grep -iv 'icons3d' | head -25
