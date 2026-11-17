"""Render a 40-second, seamless turn from each existing photographic orbit.

Usage: python scripts/render_idle_orbits.py --ffmpeg PATH
Requires OpenCV and NumPy. The source cameras and the first frame are preserved.
"""
import argparse
from pathlib import Path
import subprocess
import tempfile

import cv2
import numpy as np


ORBIT_DIR = Path(__file__).resolve().parents[1] / "public" / "models" / "orbit"
WIDTH, HEIGHT = 832, 624
FPS, DURATION = 24, 40


def render(kind, ffmpeg):
    source = cv2.VideoCapture(str(ORBIT_DIR / f"{kind}-exterior.mp4"))
    count = int(source.get(cv2.CAP_PROP_FRAME_COUNT))
    if count not in (96, 240):
        raise ValueError(f"Unexpected orbit length for {kind}: {count}")
    steps = FPS * DURATION // count
    flow = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    grid = np.dstack(np.meshgrid(np.arange(WIDTH), np.arange(HEIGHT))).astype(np.float32)

    def read():
        ok, image = source.read()
        if not ok:
            raise ValueError(f"Incomplete orbit: {kind}")
        return cv2.resize(image, (WIDTH, HEIGHT), interpolation=cv2.INTER_AREA)

    def gray(image):
        return cv2.resize(cv2.cvtColor(image, cv2.COLOR_BGR2GRAY), (WIDTH // 2, HEIGHT // 2))

    def field(a, b):
        return cv2.resize(flow.calc(a, b, None), (WIDTH, HEIGHT)) * 2

    def warp(image, displacement):
        return cv2.remap(image, grid - displacement, None, cv2.INTER_LINEAR,
                         borderMode=cv2.BORDER_REPLICATE)

    first = current = read()
    with tempfile.TemporaryDirectory(dir=ORBIT_DIR.parent.parent.parent) as temp:
        output = Path(temp) / f"{kind}-idle.mp4"
        args = [ffmpeg, "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr24",
                "-s", f"{WIDTH}x{HEIGHT}", "-r", str(FPS), "-i", "-", "-an",
                "-c:v", "libx264", "-preset", "fast", "-crf", "24", "-g", "48",
                "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(output)]
        with subprocess.Popen(args, stdin=subprocess.PIPE) as encoder:
            try:
                for i in range(count):
                    following = first if i == count - 1 else read()
                    a, b = gray(current), gray(following)
                    forward, backward = field(a, b), field(b, a)
                    encoder.stdin.write(current.tobytes())
                    for step in range(1, steps):
                        t = step / steps
                        image = cv2.addWeighted(warp(current, t * forward), 1 - t,
                                                warp(following, (1 - t) * backward), t, 0)
                        encoder.stdin.write(image.tobytes())
                    current = following
            finally:
                encoder.stdin.close()
                source.release()
            if encoder.wait():
                raise RuntimeError(f"Encoding failed: {kind}")
        output.replace(ORBIT_DIR / output.name)
    print(f"{kind}: {FPS * DURATION} frames", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg", default="ffmpeg")
    args = parser.parse_args()
    cv2.setNumThreads(4)
    for scene in ("ev", "aircraft", "campus"):
        render(scene, args.ffmpeg)
