from PIL import Image, ImageDraw, ImageFont
import os, math
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "png")
os.makedirs(OUT, exist_ok=True)
S = 512               # desenha grande e reduz (antialias)
BG  = (9, 8, 11)
AC  = (188, 123, 164)  # Rosa Saudade
ACT = (220, 185, 205)
TX  = (236, 236, 238)
SAL = (154, 175, 156)

def base():
    im = Image.new("RGB", (S, S), BG)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([6, 6, S-6, S-6], radius=110, outline=(40, 36, 46), width=4)
    return im, d

def salvar(im, nome):
    for px in (180, 512):
        im.resize((px, px), Image.LANCZOS).save(os.path.join(OUT, f"{nome}-{px}.png"))

# A · monograma mL
def A():
    im, d = base()
    f = ImageFont.truetype(r"C:\Windows\Fonts\seguisb.ttf", 250)
    m_w = d.textlength("m", font=f); l_w = d.textlength("L", font=f)
    x = (S - (m_w + l_w)) / 2; y = S/2 - 150
    d.text((x, y), "m", font=f, fill=TX)
    d.text((x + m_w, y), "L", font=f, fill=AC)
    salvar(im, "A-monograma")

# B · feixe do transdutor
def B():
    im, d = base()
    cx, cy = S/2, S*0.20
    # corpo do transdutor
    d.rounded_rectangle([cx-52, cy-70, cx+52, cy+14], radius=22, fill=ACT)
    # arcos do feixe, abrindo e esmaecendo
    for i, (r, w, cor) in enumerate([(150, 20, AC), (225, 18, (150, 98, 131)), (300, 16, (108, 71, 95))]):
        d.arc([cx-r, cy-r, cx+r, cy+r], start=52, end=128, fill=cor, width=w)
    # nódulo no meio do feixe
    d.ellipse([cx-34, cy+205, cx+34, cy+273], fill=SAL)
    salvar(im, "B-feixe")

# C · nódulo com calipers
def C():
    im, d = base()
    cx, cy, r = S/2, S/2, 118
    d.ellipse([cx-r, cy-r, cx+r, cy+r], outline=AC, width=18)
    d.ellipse([cx-46, cy-46, cx+46, cy+46], fill=(58, 40, 52))
    for ang in (45, 225):
        x = cx + math.cos(math.radians(ang))*r
        y = cy + math.sin(math.radians(ang))*r
        d.line([x-30, y-30, x+30, y+30], fill=ACT, width=14)
        d.line([x-30, y+30, x+30, y-30], fill=ACT, width=14)
    salvar(im, "C-nodulo")

A(); B(); C()
print("\n".join(sorted(os.listdir(OUT))))
