from __future__ import annotations

import os
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
PAGES_DIR = ROOT / "tmp" / "pdfs" / "company-intro-pages"
OUTPUT_DIR = ROOT / "output" / "pdf"
BASE_PDF = ROOT / "tmp" / "pdfs" / "papsnet-company-intro-base.pdf"
FINAL_PDF = OUTPUT_DIR / "Papsnet_AI_Clip_PLM_Interactive_Company_Introduction.pdf"

PAGE_SIZE = landscape((720, 405))
PAGE_TITLES = [
    "AI Clip PLM",
    "산업별 제품 데이터",
    "Clip SSO 플랫폼",
    "제품 개발 흐름",
    "Multi-BOM EPL",
    "프로젝트 실행과 AI",
    "BOM과 원가 연결",
    "도입 범위 협의",
]
VIDEO_ATTACHMENTS = [
    (ROOT / "videos" / "hero-cadwin.mp4", "01_AI_CADWin.mp4"),
    (ROOT / "videos" / "clip-pdm-hero.mp4", "02_Clip_PDM.mp4"),
    (ROOT / "videos" / "v3-overview.mp4", "03_Clip_PMS.mp4"),
    (ROOT / "videos" / "clip-ai-chatbot-demo.webm", "04_AI_Chatbot.webm"),
]
ONLINE_LINKS = {
    0: [("홈페이지 열기", "https://www.papsnet.net/")],
    2: [("SSO 구성 보기", "https://www.papsnet.net/#platform")],
    3: [
        ("CADWin 영상", "https://www.papsnet.net/product-cadwin.html"),
        ("PDM 영상", "https://www.papsnet.net/product-clippdm.html"),
    ],
    4: [("EPL 상세 보기", "https://www.papsnet.net/product-multibom.html")],
    5: [
        ("PMS 영상", "https://www.papsnet.net/product-clippms.html"),
        ("AI 챗봇", "https://www.papsnet.net/#product-tour"),
    ],
    6: [("CMS 상세 보기", "https://www.papsnet.net/product-clipcms.html")],
    7: [("홈페이지 열기", "https://www.papsnet.net/")],
}


def register_fonts() -> None:
    regular = Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts" / "malgun.ttf"
    bold = Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts" / "malgunbd.ttf"
    pdfmetrics.registerFont(TTFont("Malgun", str(regular)))
    pdfmetrics.registerFont(TTFont("MalgunBold", str(bold)))


def draw_cover_image(c: canvas.Canvas, image_path: Path) -> None:
    page_w, page_h = PAGE_SIZE
    image = ImageReader(str(image_path))
    image_w, image_h = image.getSize()
    scale = max(page_w / image_w, page_h / image_h)
    draw_w, draw_h = image_w * scale, image_h * scale
    x = (page_w - draw_w) / 2
    y = (page_h - draw_h) / 2
    c.drawImage(image, x, y, draw_w, draw_h, preserveAspectRatio=True, mask="auto")


def build_visual_pdf() -> None:
    register_fonts()
    BASE_PDF.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    image_paths = sorted(PAGES_DIR.glob("*.png"))
    if len(image_paths) != 8:
        raise RuntimeError(f"Expected 8 page images, found {len(image_paths)}")

    c = canvas.Canvas(str(BASE_PDF), pagesize=PAGE_SIZE, pageCompression=1)
    c.setTitle("팹스넷 AI Clip PLM 회사소개")
    c.setAuthor("(주)팹스넷")
    c.setSubject("AI CADWin, Clip PDM, Multi-BOM EPL, Clip PMS, Clip CMS, AI Chatbot")

    for index, image_path in enumerate(image_paths):
        draw_cover_image(c, image_path)

        c.setFillColor(Color(0.02, 0.05, 0.06, alpha=0.82))
        c.rect(0, 0, 720, 20, fill=1, stroke=0)
        c.setFont("MalgunBold", 6.5)
        c.setFillColor(HexColor("#b7ef29"))
        c.drawString(14, 7, f"{index + 1:02d}  {PAGE_TITLES[index]}")
        c.setFillColor(white)
        c.drawRightString(706, 7, "PAPSNET · AI CLIP PLM")

        links = ONLINE_LINKS.get(index, [])
        if links:
            gap = 4
            total_width = 158
            button_width = (total_width - gap * (len(links) - 1)) / len(links)
            for link_index, (label, url) in enumerate(links):
                x = 548 + link_index * (button_width + gap)
                c.setFillColor(Color(0.02, 0.05, 0.06, alpha=0.92))
                c.setStrokeColor(HexColor("#b7ef29"))
                c.roundRect(x, 365, button_width, 24, 3, fill=1, stroke=1)
                c.setFont("MalgunBold", 6.5)
                c.setFillColor(HexColor("#b7ef29"))
                c.drawCentredString(x + button_width / 2, 374, f"{label}  ↗")
                c.linkURL(url, (x, 365, x + button_width, 389), relative=0, thickness=0)

        c.showPage()

    c.save()


def attach_videos() -> None:
    reader = PdfReader(str(BASE_PDF))
    writer = PdfWriter()
    writer.clone_document_from_reader(reader)

    for video_path, attachment_name in VIDEO_ATTACHMENTS:
        if not video_path.exists():
            raise FileNotFoundError(video_path)
        writer.add_attachment(attachment_name, video_path.read_bytes())

    writer.add_metadata({
        "/Title": "팹스넷 AI Clip PLM 인터랙티브 회사소개",
        "/Author": "(주)팹스넷",
        "/Subject": "영상 파일이 포함된 AI Clip PLM 회사소개",
        "/Keywords": "AI PLM, CADWin, PDM, Multi-BOM, EPL, PMS, CMS, AI Chatbot",
    })

    with FINAL_PDF.open("wb") as stream:
        writer.write(stream)


if __name__ == "__main__":
    build_visual_pdf()
    attach_videos()
    print(FINAL_PDF)
