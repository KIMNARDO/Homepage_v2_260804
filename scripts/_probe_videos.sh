#!/bin/bash
cd /mnt/d/jarvix/projects/papsnet-homepage/papsnet-homepage-main
if command -v ffprobe >/dev/null; then
  for f in videos/*.mp4; do
    printf "%s: " "$f"
    ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$f"
  done
else
  echo NO_FFPROBE
fi
