"""Generate Camp app icons (navy ground + blue mountain/'C' mark)."""
from PIL import Image, ImageDraw

NAVY = (31, 58, 95)
BLUE = (46, 117, 182)
LIGHT = (207, 226, 246)


def rounded(size, radius_frac, bg):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = int(size * radius_frac)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=bg)
    return img, d


def draw_mark(d, size):
    # Simple stylized "mountain/camp" peak in blue, plus a baseline.
    cx = size / 2
    w = size * 0.56
    top = size * 0.30
    base = size * 0.70
    left = cx - w / 2
    right = cx + w / 2
    # main peak
    d.polygon([(left, base), (cx, top), (right, base)], fill=LIGHT)
    # inset notch (snow line)
    notch_w = w * 0.30
    d.polygon([
        (cx - notch_w / 2, top + (base - top) * 0.34),
        (cx, top),
        (cx + notch_w / 2, top + (base - top) * 0.34),
    ], fill=BLUE)
    # ground line
    d.rounded_rectangle(
        [left - size * 0.02, base, right + size * 0.02, base + size * 0.05],
        radius=size * 0.025, fill=LIGHT,
    )


def make(path, size, maskable=False):
    radius = 0.0 if maskable else 0.22
    # maskable needs full-bleed background (safe zone is inner 80%)
    img, d = rounded(size, radius if not maskable else 0.0, NAVY)
    if maskable:
        # full square navy, mark drawn smaller within safe zone
        d.rectangle([0, 0, size, size], fill=NAVY)
        # shrink mark by drawing on a scaled temp
        tmp = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        td = ImageDraw.Draw(tmp)
        draw_mark(td, int(size * 0.8))
        img.alpha_composite(tmp, (int(size * 0.1), int(size * 0.1)))
    else:
        draw_mark(d, size)
    img.save(path)
    print("wrote", path)


make("icons/icon-192.png", 192)
make("icons/icon-512.png", 512)
make("icons/apple-touch-icon.png", 180)
make("icons/icon-maskable-512.png", 512, maskable=True)
