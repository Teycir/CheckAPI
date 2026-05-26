from PIL import Image, ImageDraw, ImageFont
import math, os

W, H   = 900, 180
BG     = (10, 10, 10)
CYAN   = (0, 212, 255)
CYAN2  = (0, 150, 190)
GRID   = (0, 28, 38)

FONT   = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf'
font_t = ImageFont.truetype(FONT, 66)
font_s = ImageFont.truetype(FONT, 13)

TEXT  = "CheckAPIs"
SUB   = "validate your llm api keys instantly · privacy-first · client-side"

TOTAL_FRAMES = 48   # ~1.6s intro + loop
DELAY        = 60   # ms per frame  (≈16 fps)

def lerp(a, b, t):
    return a + (b - a) * t

def ease_out(t):
    return 1 - (1 - t) ** 3

def blend(c1, c2, t):
    return tuple(int(lerp(a, b, t)) for a, b in zip(c1, c2))

def make_frame(idx):
    img  = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # --- dot grid ---
    grid_alpha = min(1.0, idx / 8)
    gc = blend(BG, GRID, grid_alpha)
    for gx in range(0, W, 24):
        for gy in range(0, H, 24):
            draw.ellipse([gx, gy, gx+2, gy+2], fill=gc)

    # --- scan line sweep (frames 4-20, then repeats every 36 frames) ---
    def draw_scan(frame_offset):
        if frame_offset < 0 or frame_offset > 22:
            return
        sx = int(lerp(-120, W + 120, frame_offset / 22))
        for bx in range(sx - 60, sx + 60):
            if 0 <= bx < W:
                t = 1 - abs(bx - sx) / 60
                alpha = int(t * 38)
                for by in range(52, 118):
                    px = img.getpixel((bx, by))
                    img.putpixel((bx, by), tuple(min(255, px[i] + int(CYAN[i] * alpha / 255)) for i in range(3)))

    draw_scan(idx - 4)
    draw_scan((idx - 4) % 36 - 0 if idx >= 26 else -1)

    # --- diagonal beams ---
    for bx_start, by_start, bx_end, phase in [(80, 0, 200, 0), (400, 0, 560, 12), (650, 0, 720, 24)]:
        beam_t = ((idx + phase) % 36) / 36
        bprog  = beam_t
        alpha  = int(math.sin(bprog * math.pi) * 55)
        if alpha > 0:
            steps = 40
            for s in range(steps):
                t2 = s / steps
                px2 = int(lerp(bx_start, bx_end, t2))
                py2 = int(lerp(0, H, t2))
                if 0 <= px2 < W and 0 <= py2 < H:
                    orig = img.getpixel((px2, py2))
                    img.putpixel((px2, py2), tuple(min(255, orig[i] + int(CYAN[i] * alpha / 255)) for i in range(3)))

    # --- characters drop in ---
    chars     = list(TEXT)
    char_w    = 40  # approx per char
    total_w   = len(chars) * char_w
    # measure actual width
    bbox = draw.textbbox((0, 0), TEXT, font=font_t)
    actual_w = bbox[2] - bbox[0]
    start_x  = (W - actual_w) // 2

    # accumulate x per character
    cx = start_x
    for ci, ch in enumerate(chars):
        drop_start = ci * 2          # frame when this char starts
        drop_end   = drop_start + 6
        t_char = (idx - drop_start) / (drop_end - drop_start)
        t_char = max(0.0, min(1.0, t_char))
        t_ease = ease_out(t_char)

        # glow pulse after all chars landed (frame 24+)
        glow_t = 0.0
        if idx >= 24:
            glow_t = 0.5 + 0.5 * math.sin((idx - 24) * 0.22)

        # y offset: drop from -20
        y_off = int(lerp(-22, 0, t_ease))
        alpha_c = t_ease

        cb_bbox = draw.textbbox((0, 0), ch, font=font_t)
        ch_w = cb_bbox[2] - cb_bbox[0]

        if alpha_c > 0.02:
            # glow layers
            gl = int(glow_t * 3)
            for spread in range(gl, 0, -1):
                gc2 = blend(BG, CYAN, 0.12 * spread * alpha_c)
                for dx2 in range(-spread*2, spread*2+1, 2):
                    for dy2 in range(-spread*2, spread*2+1, 2):
                        draw.text((cx + dx2, 56 + y_off + dy2), ch, font=font_t, fill=gc2)
            # main character
            col = blend(BG, CYAN, alpha_c)
            draw.text((cx, 56 + y_off), ch, font=font_t, fill=col)

        cx += ch_w

    # --- blinking cursor ---
    if idx >= 18:
        cursor_x = cx + 4
        blink_on = ((idx - 18) % 10) < 5
        if blink_on:
            draw.rectangle([cursor_x, 60, cursor_x + 5, 114], fill=CYAN)

    # --- subtitle fade in ---
    sub_t = max(0.0, min(1.0, (idx - 20) / 8))
    if sub_t > 0:
        sb = draw.textbbox((0, 0), SUB, font=font_s)
        sw = sb[2] - sb[0]
        sx2 = (W - sw) // 2
        sc = blend(BG, CYAN2, sub_t * 0.65)
        draw.text((sx2, 148), SUB, font=font_s, fill=sc)

    return img

frames = [make_frame(i) for i in range(TOTAL_FRAMES)]

# Loop: after intro, cycle frames 24-47 forever (cursor blink + glow pulse)
loop_frames = frames[:24] + frames[24:] * 2

OUT = "/home/teycir/Repos/CheckAPI/Assets/banner.gif"
loop_frames[0].save(
    OUT,
    save_all=True,
    append_images=loop_frames[1:],
    optimize=False,
    duration=DELAY,
    loop=0,
)
print(f"Saved {OUT}  ({len(loop_frames)} frames)")
