"""Генерирует превью-карточки (1200x630) для WhatsApp/Telegram и фото для страницы.

Запуск из корня проекта:  python tools/make_previews.py
Нужен Pillow:              pip install pillow
Исходники берутся из images/preview/ (в порядке ORDER, остальные — в конец).
"""
import glob
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

SRC_DIR = 'images/preview'
FONT = 'AdventSans-Logo.otf'
ORDER = ['jpg', 'Josue, Moises y.jpg', 'jpg(1)', 'zach.jpg', 'jpg(2)', 'jpg(3)',
         'Zacchaeus bible art _ Bible Zacchaeus http___holyordinary_blogspot.jpg']
W, H, PW = 1200, 630, 520  # размер карточки и ширина фото слева

NAVY, ROYAL, SKY = (6, 35, 110), (20, 80, 208), (169, 200, 255)


def font(size):
    return ImageFont.truetype(FONT, size)


def cover(im, w, h):
    r = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    left, top = (im.width - w) // 2, int((im.height - h) * 0.3)
    return im.crop((left, top, left + w, top + h))


def background():
    big = Image.linear_gradient('L').resize((1600, 1600)).rotate(-35)
    grad = big.crop((200, 485, 1400, 1115))
    bg = Image.composite(Image.new('RGB', (W, H), ROYAL), Image.new('RGB', (W, H), NAVY), grad)
    glow = Image.new('L', (W, H), 0)
    ImageDraw.Draw(glow).ellipse((700, -250, 1350, 350), fill=140)
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    return Image.composite(Image.new('RGB', (W, H), (90, 150, 255)), bg, glow)


def card(photo):
    bg = background()
    bg.paste(cover(photo, PW, H), (0, 0))
    fade = Image.linear_gradient('L').rotate(90).resize((60, H))
    bg.paste(Image.new('RGB', (60, H), (8, 45, 140)), (PW - 60, 0), fade)

    d = ImageDraw.Draw(bg)
    x = PW + 56
    d.text((x, 70), 'BAKI · YEDDİNCİ GÜNÜN ADVENTİSTLƏRİ', font=font(26), fill=SKY)
    d.text((x, 120), 'Onlayn', font=font(92), fill='white')
    d.text((x, 215), 'Şənbə ibadəti', font=font(72), fill=SKY)
    d.text((x, 330), 'Hər şənbə · 10:00', font=font(50), fill='white')

    def pill(px, py, text, color):
        f = font(28)
        w = d.textlength(text, font=f)
        d.rounded_rectangle((px, py, px + w + 48, py + 58), radius=29, fill=color)
        d.text((px + 24, py + 12), text, font=f, fill='white')
        return px + w + 48

    end = pill(x, 420, 'GOOGLE MEET', (232, 80, 58))
    pill(end + 16, 420, 'Bakı vaxtı', (30, 90, 220))
    d.text((x, 520), 'Qoşulmaq üçün linkə toxunun', font=font(30), fill=(220, 232, 255))
    return bg


def main():
    os.makedirs('assets/img/og', exist_ok=True)
    os.makedirs('assets/img/photos', exist_ok=True)
    names = [n for n in ORDER if os.path.exists(os.path.join(SRC_DIR, n))]
    names += sorted(os.path.basename(p) for p in glob.glob(f'{SRC_DIR}/*') if os.path.basename(p) not in names)

    for i, name in enumerate(names, 1):
        im = Image.open(os.path.join(SRC_DIR, name)).convert('RGB')
        photo = im.copy()
        photo.thumbnail((900, 900))
        photo.save(f'assets/img/photos/photo-{i}.jpg', quality=80, optimize=True, progressive=True)
        card(im).save(f'assets/img/og/og-{i}.jpg', quality=84, optimize=True, progressive=True)
        print(f'{i}: {name}')


if __name__ == '__main__':
    main()
