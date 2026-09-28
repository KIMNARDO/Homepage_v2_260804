"""Build the Korean SpinFire overview used by the homepage download link."""
from pathlib import Path
from shutil import copyfile

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "papsnet-spinfire-insight-ko.pdf"
PUBLIC = ROOT / "public" / "downloads" / OUTPUT.name
FONTS = Path("C:/Windows/Fonts")
pdfmetrics.registerFont(TTFont("Malgun", str(FONTS / "malgun.ttf")))
pdfmetrics.registerFont(TTFont("Malgun-Bold", str(FONTS / "malgunbd.ttf")))
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
PUBLIC.parent.mkdir(parents=True, exist_ok=True)

PAGE_W, PAGE_H = A4
INK = colors.HexColor("#10161f")
MUTED = colors.HexColor("#53616c")
LINE = colors.HexColor("#d5d9dc")
GREEN = colors.HexColor("#248767")
LIME = colors.HexColor("#d7ff55")
BG = colors.HexColor("#f8f8f5")
LEFT = 40
RIGHT = PAGE_W - 40
WIDTH = RIGHT - LEFT
pdf = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1, invariant=1)
pdf.setTitle("SpinFire Insight | 팹스넷 제품 소개서")
pdf.setAuthor("(주)팹스넷")
pdf.setSubject("SpinFire Insight CAD 뷰어 주요 기능과 도입 상담 안내")


def text(x, y, value, size=10, bold=False, color=INK):
    pdf.setFont("Malgun-Bold" if bold else "Malgun", size)
    pdf.setFillColor(color)
    pdf.drawString(x, y, value)


def rule(y):
    pdf.setStrokeColor(LINE)
    pdf.setLineWidth(.6)
    pdf.line(LEFT, y, RIGHT, y)


def link(x, y, label, url, size=7):
    text(x, y, label, size, color=MUTED)
    width = pdfmetrics.stringWidth(label, "Malgun", size)
    pdf.linkURL(url, (x, y - 2, x + width, y + size + 2), relative=0, thickness=0)


pdf.setFillColor(BG)
pdf.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
text(LEFT, 804, "PAPSNET  /  TECH SOFT 3D", 9, True)
text(RIGHT - 124, 804, "SpinFire 총판 계약 체결", 9, color=GREEN)
rule(789)
text(LEFT, 751, "SpinFire Insight", 34, True)
text(LEFT, 720, "CAD 데이터, 모든 부서가 함께 봅니다.", 18, True)
text(LEFT, 695, "원본 CAD 프로그램 없이 2D 도면과 3D 모델을 열고, 측정하고, 검토하세요.", 10)
text(LEFT, 677, "팹스넷이 Tech Soft 3D와 함께 SpinFire를 공급합니다.", 10, color=MUTED)

image_height = WIDTH * 9 / 16
pdf.drawImage(str(ROOT / "public/images/spinfire/spinfire-section-cut.jpg"),
              LEFT, 658 - image_height, width=WIDTH, height=image_height)
text(LEFT, 354, "단면 검토 화면 | 기어박스 내부 구조와 부품 배치를 확인합니다.", 8, color=MUTED)
text(RIGHT - 100, 354, "Windows 데스크톱 제품", 8, color=MUTED)

features = [
    ("01", "단면 검토", "모델을 잘라 내부 구조와 부품 배치를 살펴봅니다."),
    ("02", "정밀 측정", "길이·거리·반경 등 검토에 필요한 치수를 확인합니다."),
    ("03", "모델 비교·마크업", "형상 차이를 비교하고 주석으로 검토 의견을 남깁니다."),
]
for index, (number, title, description) in enumerate(features):
    y = 326 - index * 38
    rule(y + 15)
    text(LEFT, y - 2, number, 8, True, GREEN)
    text(LEFT + 27, y - 2, title, 10, True)
    text(LEFT + 150, y - 2, description, 9, color=MUTED)

rule(226)
text(LEFT, 207, "주요 지원 CAD", 9, True)
text(LEFT + 93, 207, "CATIA V5 · NX · Creo · SOLIDWORKS · Inventor · STEP · JT", 9)
text(LEFT, 190, "지원 형식·버전 및 내보내기 범위는 에디션에 따라 다릅니다.", 8, color=MUTED)

pdf.setFillColor(LIME)
pdf.roundRect(LEFT, 103, WIDTH, 64, 6, fill=1, stroke=0)
text(LEFT + 16, 145, "SpinFire 도입 상담  |  (주)팹스넷", 13, True)
text(LEFT + 16, 124, "070-5001-1144   ·   kimnardo@papsnet.net   ·   www.papsnet.net", 10)
contact_x = LEFT + 16
for label, url in [
    ("070-5001-1144", "tel:070-50011144"),
    ("kimnardo@papsnet.net", "mailto:kimnardo@papsnet.net?subject=SpinFire%20Insight"),
    ("www.papsnet.net", "https://www.papsnet.net/"),
]:
    contact_width = pdfmetrics.stringWidth(label, "Malgun", 10)
    pdf.linkURL(url, (contact_x, 121, contact_x + contact_width, 135), thickness=0)
    contact_x += contact_width + pdfmetrics.stringWidth("   ·   ", "Malgun", 10)

text(LEFT, 82, "제품 설명·화면 출처: Tech Soft 3D 공식 자료 | 팹스넷 작성: 2026.09.28", 7, color=MUTED)
link(LEFT, 66, "공식 제품: techsoft3d.com/enterprise/spinfire-insight/",
     "https://www.techsoft3d.com/enterprise/spinfire-insight/")
link(LEFT, 52, "지원 형식: techsoft3d.com/enterprise/spinfire-insight/cad-formats/",
     "https://www.techsoft3d.com/enterprise/spinfire-insight/cad-formats/")
text(RIGHT - 17, 37, "1 / 1", 7, color=MUTED)
pdf.showPage()
pdf.save()
copyfile(OUTPUT, PUBLIC)
print(f"Created {PUBLIC} ({PUBLIC.stat().st_size:,} bytes)")
