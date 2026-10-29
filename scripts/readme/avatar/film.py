"""Films mini Chanlito into the polaroid: base layer, his frame, top layer,
tilted like the home page, then one animated WebP."""
import sys, os, glob
from PIL import Image

S = 2  # pixels per CSS pixel
PHOTO = (42, 46, 236, 295)  # x, y, w, h in CSS px (POLAROID.photo)
ROTATE = -4  # Pillow turns counterclockwise; the site tilts 4deg clockwise
FPS = 25

def film(frames_dir, base_png, over_png, out, step=1, hold=1.2, quality=80, last=None):
    base = Image.open(base_png).convert('RGBA')
    over = Image.open(over_png).convert('RGBA')
    x, y, w, h = (v * S for v in PHOTO)
    files = sorted(glob.glob(os.path.join(frames_dir, '*.png')))
    if last: files = files[:last]
    files = files[::step]
    out_frames = []
    for f in files:
        av = Image.open(f).convert('RGBA').resize((w, h), Image.LANCZOS)
        im = base.copy()
        photo = Image.new('RGBA', (w, h))
        photo.alpha_composite(im.crop((x, y, x + w, y + h)))
        photo.alpha_composite(av)
        im.paste(photo, (x, y))
        im.alpha_composite(over)
        out_frames.append(im.rotate(ROTATE, resample=Image.BICUBIC, expand=False))
    durations = [int(1000 * step / FPS)] * len(out_frames)
    durations[-1] += int(hold * 1000)
    out_frames[0].save(out, save_all=True, append_images=out_frames[1:], duration=durations,
                       loop=0, quality=quality, method=6, minimize_size=True, allow_mixed=True)
    return os.path.getsize(out)

if __name__ == '__main__':
    frames_dir, base_png, over_png, out = sys.argv[1:5]
    step = int(sys.argv[5]) if len(sys.argv) > 5 else 1
    q = int(sys.argv[6]) if len(sys.argv) > 6 else 80
    print(out, round(film(frames_dir, base_png, over_png, out, step=step, quality=q) / 1024), 'KB')
