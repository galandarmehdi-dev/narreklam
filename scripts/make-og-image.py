"""Generates public/og-image.png (1200x630) — provisional social sharing image using the temporary wordmark.
Replace with an official branded image once the NarReklam identity is supplied."""
import os, random
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
NAR, INK, PAPER = (197, 29, 52), (23, 23, 23), (248, 247, 244)
img = Image.new('RGB', (W, H), PAPER)
d = ImageDraw.Draw(img)
random.seed(7)
d.ellipse((700, 40, 1260, 600), fill=NAR)
for y in range(60, 600, 26):
    for x in range(720, 1240, 26):
        if (x - 980) ** 2 + (y - 320) ** 2 < 270 ** 2:
            d.ellipse((x - 2, y - 2, x + 2, y + 2), fill=(232, 120, 135))
font_dir = 'node_modules/@fontsource-variable/unbounded/files'
def font(size):
    for cand in ['/System/Library/Fonts/Supplemental/Arial Bold.ttf', '/Library/Fonts/Arial Bold.ttf', '/System/Library/Fonts/Helvetica.ttc']:
        if os.path.exists(cand):
            return ImageFont.truetype(cand, size)
    return ImageFont.load_default()
d.text((80, 200), 'Nar', font=font(120), fill=INK)
w = d.textlength('Nar', font=font(120))
d.text((80 + w, 200), 'Reklam', font=font(120), fill=NAR)
d.text((84, 350), 'Dizayn · Çap · Reklam · İstehsalat', font=font(40), fill=INK)
d.text((84, 420), 'Design · Print · Advertising · Production', font=font(30), fill=(107, 104, 98))
img.save('public/og-image.png', optimize=True)
print('public/og-image.png written')
