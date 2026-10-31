# -*- coding: utf-8 -*-
"""xtra: Olodum, pintura corporal, secretário (2000), retratos refeitos, varanda azul. Injeta em src/assets.js."""
import sys, json, colorsys
sys.path.insert(0, '/home/claude/balcao5/build'); sys.path.insert(0, '/home/claude/balcao5/xtra')
import numpy as np
from PIL import Image
from assetlib2 import *
from build_chars import *
from keylib import key, A

def union_crop(frames):
    bbs = [f.getbbox() for f in frames]
    x0 = min(b[0] for b in bbs); y0 = min(b[1] for b in bbs); x1 = max(b[2] for b in bbs); y1 = max(b[3] for b in bbs)
    return [f.crop((x0, y0, x1, y1)) for f in frames]

def cells(path, nc, nr, inset):
    im, _ = key(path)
    cw, ch = im.width / nc, im.height / nr
    return [[im.crop((round(c * cw) + inset, round(r * ch) + inset, round((c + 1) * cw) - inset, round((r + 1) * ch) - inset)) for c in range(nc)] for r in range(nr)]

X = {}   # nome -> imagem
# ---- 1. Olodum ----
oc = cells(A + 'a791b82a-image.jpg', 4, 2, 6)
groups = {}
for nm, row, H in (('olo/trio', oc[0], 54), ('olo/walk', oc[1], 54)):
    fr = union_crop(row); s = H / fr[0].height
    groups[nm] = [down(f, s) for f in fr]
ind = cells(A + 'cf4a9197-image.jpg', 4, 4, 0)   # grade irregular: usa bandas do recorte
imk, k = key(A + 'cf4a9197-image.jpg')
rb = [(8, 250), (261, 507), (520, 763), (776, 1019)]; cb = [(24, 221), (300, 480), (535, 731), (826, 989)]
ind_pick = [0, 4, 8, 9, 12, 14]
inds = []
for i in ind_pick:
    r, c = divmod(i, 4); f = imk.crop((cb[c][0] - 2, rb[r][0] - 2, cb[c][1] + 3, rb[r][1] + 3)); f = trim(f)
    inds.append(down(f, 50 / f.height))
# ---- 2. pintura corporal ----
bc = cells(A + '0641bb51-image.jpg', 4, 4, 7)
fr2 = union_crop(bc[1]); s_bp = 52 / fr2[0].height
for nm, row in (('pint/arm', bc[0]), ('pint/face', bc[1]), ('pint/duo', bc[3])):
    groups[nm] = [down(f, s_bp) for f in union_crop(row)]
# paleta única do grupo "gente"
allf = [f for v in groups.values() for f in v] + inds
pal = palette_from(allf, 72)
for nm, v in groups.items():
    for i, f in enumerate(v): X[f'{nm}_{i}'] = apply_pal(f, pal)
for i, f in enumerate(inds): X[f'olo/ind_{i}'] = apply_pal(f, pal)

# ---- 3. secretário em 2000: mais velho (cabelo branco, rugas leves) e de outro terno ----
def recolor(im, hair_y, suit_y, wrinkle=True):
    a = np.array(im.convert('RGBA')).astype(float); h = a.shape[0]
    R, G, B, Al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    mx = np.maximum(np.maximum(R, G), B); mn = np.minimum(np.minimum(R, G), B); sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    lum = .3 * R + .59 * G + .11 * B
    yy = np.arange(a.shape[0])[:, None] * np.ones((1, a.shape[1]))
    hair = (Al > 0) & (yy < hair_y * h) & (sat < .32) & (mx > 88)
    t = np.clip(lum / 150, 0, 1)
    for c, base in enumerate((236, 234, 228)): a[..., c] = np.where(hair, np.minimum(255, 150 + t * (base - 150) * 1.0 + 30), a[..., c])
    suit = (Al > 0) & (yy >= suit_y * h) & (mx > 14) & (mx <= 96) & (sat < .5)
    f = np.clip(.62 + lum / 70 * .5, .55, 1.5)
    for c, base in enumerate((70, 86, 112)): a[..., c] = np.where(suit, np.minimum(255, base * f), a[..., c])
    return Image.fromarray(a.astype(np.uint8), 'RGBA')
H, nc, an = RIGS['secret']
sfr, ssz = build_rig('secret', H, nc + 6, an)
for k2, im in sfr.items():
    X[k2.replace('secret/', 'sec2/')] = recolor(im, .20, .27)

# ---- 4. retratos refeitos (cabeça inteira, sem corte no nariz) ----
def fit_portrait(im, W=32, Hh=36):
    im = trim(im); s = min(W / im.width, Hh / im.height); f = down(im, s)
    c = Image.new('RGBA', (W, Hh), (0, 0, 0, 0)); c.paste(f, ((W - f.width) // 2, Hh - f.height)); return c
HEADS = {'lia': ('lia_andar_baixo_1', .36), 'raimundo': ('raimundo_andar_baixo_1', .34), 'dandara': ('mulher_verde_andar_baixo_1', .36),
         'davi': ('homem_chapeu_laranja_andar_baixo_1', .34), 'marta': ('turista_camera_andar_baixo_1', .34), 'lucia': ('lucia_frente_1', .36),
         'bia': ('bia_parada_1', .32), 'caio': ('caio_parado_1', .32), 'turista': ('turista_frente_1', .32), 'pm': ('policial_frente_1', .32),
         'tv': ('secretario_serio_1', .32)}
ports = {}
for kk, (src, fr_) in HEADS.items():
    im = load(src); ports['pt2_' + kk] = fit_portrait(im.crop((0, 0, im.width, int(im.height * fr_))))
    if kk == 'tv':
        im2 = recolor(im, .20, .27); ports['pt2_tv2'] = fit_portrait(im2.crop((0, 0, im2.width, int(im2.height * fr_))))
ppal = palette_from(list(ports.values()), 60)
for kk, im in ports.items(): X[kk] = apply_pal(im, ppal)

# ---- atlas ----
at = Atlas('xtra', 1024)
for kk, im in X.items(): at.add(kk, im)
sheet, js = at.pack()
# ---- 5. varanda azul (recorte do cenário) ----
sc = Image.open(A + '9ff7f793-image.jpg').convert('RGBA')
f = 1376 / 917
bx = (round(376 * f), round(14 * f), round(648 * f), round(430 * f))
bd = sc.crop(bx); tw = 134; bd = bd.resize((tw, round(bd.height * tw / bd.width)), Image.BOX)
bq = bd.convert('RGB').quantize(colors=96, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGBA')
bq.save('/home/claude/balcao5/xtra/varanda.png')
print('varanda', bq.size)
p = '/home/claude/balcao5/src/assets.js'; t = open(p).read(); d = json.loads(t[t.index('{'):t.rindex('}') + 1])
d['atlases']['xtra'] = {'img': b64png(sheet), 'json': js}
d['images']['varanda'] = b64png(bq)
open(p, 'w').write('const ASSETS=' + json.dumps(d, separators=(',', ':')) + ';\n')
sheet.save('/home/claude/balcao5/xtra/xtra_sheet.png')
print('ok', sheet.size, len(X), 'frames')
