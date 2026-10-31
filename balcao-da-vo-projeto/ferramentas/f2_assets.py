# -*- coding: utf-8 -*-
"""Fase 2 · prepara as imagens do Gemini e gera src/f2_assets.js.
Uso: python3 ferramentas/f2_assets.py PASTA_DAS_IMAGENS
A pasta precisa ter: memorial.jpg raimundo.jpg vo_retratos.jpg vo_balcao.jpg npcs.jpg onibus.jpg props.jpg ponto.jpg
O que faz em cada folha:
  - tira o fundo magenta (ou o fundo liso da célula, por preenchimento a partir das bordas)
  - acha cada figura por componentes conectados (não depende da grade vir certa)
  - reduz com média, alfa binário, e alinha todos os quadros pelo PÉ e pelo centro
    (assim nada flutua nem treme quando anima)
"""
import sys, os, io, json, base64
import numpy as np
from PIL import Image
from collections import deque

IN = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'src', 'f2_assets.js')
PREV = os.path.join(HERE, '..', 'f2_previa'); os.makedirs(PREV, exist_ok=True)

def load(n): return np.asarray(Image.open(os.path.join(IN, n)).convert('RGB')).astype(int)

def mag_mask(a, dark=False):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    if dark:  # ônibus: sombra roxa escura também sai
        return (r > 110) & (b > 110) & (g < 70) & (np.abs(r - b) < 70)
    return (r > 185) & (b > 185) & (g < 90)

def flood_bg(a, tol=34):
    """fundo liso de uma célula: tudo que é parecido com a borda e está ligado a ela"""
    H, W = a.shape[:2]; bg = np.zeros((H, W), bool); q = deque()
    for x in range(W): q.append((0, x)); q.append((H - 1, x))
    for y in range(H): q.append((y, 0)); q.append((y, W - 1))
    ref = np.median(np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]), axis=0)
    while q:
        y, x = q.popleft()
        if bg[y, x]: continue
        if np.abs(a[y, x] - ref).sum() > tol * 3: continue
        bg[y, x] = True
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < H and 0 <= nx < W and not bg[ny, nx]: q.append((ny, nx))
    return bg

def comps(fg, minarea=1500):
    H, W = fg.shape; lab = np.zeros((H, W), np.int32); out = []; n = 0
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            if fg[y, x] and not lab[y, x]:
                n += 1; q = deque([(y, x)]); lab[y, x] = n; x0 = x1 = x; y0 = y1 = y; ar = 0
                while q:
                    cy, cx = q.popleft(); ar += 1
                    if cx < x0: x0 = cx
                    if cx > x1: x1 = cx
                    if cy < y0: y0 = cy
                    if cy > y1: y1 = cy
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < H and 0 <= nx < W and fg[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = n; q.append((ny, nx))
                if ar >= minarea: out.append([x0, y0, x1, y1])
    # junta pedaços vizinhos (cabeça separada do corpo por 1 px, hélice do drone etc.)
    ch = True
    while ch:
        ch = False
        for i in range(len(out)):
            for j in range(i + 1, len(out)):
                p, s = out[i], out[j]
                if p[0] - 8 <= s[2] and s[0] - 8 <= p[2] and p[1] - 8 <= s[3] and s[1] - 8 <= p[3]:
                    out[i] = [min(p[0], s[0]), min(p[1], s[1]), max(p[2], s[2]), max(p[3], s[3])]; out.pop(j); ch = True; break
            if ch: break
    return out

def cut(a, fg, b, k):
    """recorta a figura, reduz por média (com alfa pré-multiplicado) e limpa a franja"""
    x0, y0, x1, y1 = b
    rgba = np.dstack([a[y0:y1 + 1, x0:x1 + 1], fg[y0:y1 + 1, x0:x1 + 1] * 255]).astype('uint8')
    im = Image.fromarray(rgba, 'RGBA')
    w, h = max(1, round(im.width * k)), max(1, round(im.height * k))
    im = im.resize((w, h), Image.BOX)
    p = np.asarray(im).astype(int).copy(); al = p[..., 3] > 110; p[..., 3] = np.where(al, 255, 0)
    # franja: pixel de borda ainda puxado para o magenta vira contorno escuro
    edge = al & ~(np.roll(al, 1, 0) & np.roll(al, -1, 0) & np.roll(al, 1, 1) & np.roll(al, -1, 1))
    fr = edge & ((p[..., 0] + p[..., 2]) / 2 - p[..., 1] > 55) & (p[..., 0] > 80) & (p[..., 2] > 80)
    p[fr, 0], p[fr, 1], p[fr, 2] = 28, 17, 10
    return Image.fromarray(p.astype('uint8'), 'RGBA')

def strip(frames, name):
    FW = max(f.width for f in frames) + 2; FH = max(f.height for f in frames) + 1
    s = Image.new('RGBA', (FW * len(frames), FH), (0, 0, 0, 0))
    for i, f in enumerate(frames): s.paste(f, (i * FW + (FW - f.width) // 2, FH - f.height), f)  # pé na última linha
    prev = Image.new('RGBA', s.size, (96, 140, 110, 255)); prev.alpha_composite(s)
    prev.resize((s.width * 3, s.height * 3), Image.NEAREST).save(os.path.join(PREV, name + '.png'))
    return s, FW, FH

def order(bx, H, rows):
    return sorted(bx, key=lambda b: (int(((b[1] + b[3]) / 2) / (H / rows)), b[0]))

def sheet(a, fg, bx, height, name):
    hmax = max(b[3] - b[1] + 1 for b in bx); k = height / hmax
    return strip([cut(a, fg, b, k) for b in bx], name)

def portrait(a, fg, b, name, top=0.0, frac=1.0):
    """busto 32×36 a partir do alto da figura"""
    x0, y0, x1, y1 = b; w = x1 - x0 + 1; h = int(w * 36 / 32 * frac); yy = y0 + int((y1 - y0) * top)
    cx = (x0 + x1) // 2; ww = int(h * 32 / 36); bb = [max(0, cx - ww // 2), yy, cx + ww // 2, yy + h]
    im = cut(a, fg, bb, 36 / (bb[3] - bb[1] + 1)).resize((32, 36), Image.NEAREST)
    return im

OUTD = {}
def put(key, im, **extra):
    buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True)
    OUTD[key] = dict(src='data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode(), **extra)

ADULT = 50  # altura (px lógicos) da Lia na fase 1: todos os adultos da fase 2 saem nessa altura

# 1. Seu Raimundo-robô: 16 quadros (4 frente, 4 andando para a direita, frente, 3 virando, 4 de costas)
a = load('raimundo.jpg'); fg = ~mag_mask(a); bx = order(comps(fg), a.shape[0], 2)
s, fw, fh = sheet(a, fg, bx, ADULT, 'raibot'); put('f2_raibot', s, fw=fw, fh=fh, n=len(bx))
put('f2_pt_raibot', portrait(a, fg, bx[0], 'pt_raibot', 0, .55))

# 2. Vó-robô no balcão: tira as faixas bege de "balcão" desenhadas na folha, depois 16 quadros cortados na cintura
a = load('vo_balcao.jpg'); m = mag_mask(a)
for y in range(a.shape[0]):
    row = a[y]; beige = (row[:, 0] > 150) & (row[:, 1] > 120) & (row[:, 2] > 90) & (row[:, 1] < 215) & ~m[y]
    dark = (row.sum(1) < 120)
    if beige.mean() > .6 or dark.mean() > .6: m[y] = True
fg = ~m; bx = []
for cy in range(4):
    for cx in range(4):  # cada célula: só a parte acima da faixa do balcão
        cell = np.zeros_like(fg); y0 = cy * 256; cell[y0:y0 + 226, cx * 256:(cx + 1) * 256] = fg[y0:y0 + 226, cx * 256:(cx + 1) * 256]
        cs = comps(cell, 2500); cs.sort(key=lambda b: -(b[2] - b[0]) * (b[3] - b[1])); b0 = cs[0]
        bx.append([b0[0], b0[1], b0[2], y0 + 225])  # base reta, na cintura
s, fw, fh = sheet(a, fg, bx, 31, 'vobot'); put('f2_vobot', s, fw=fw, fh=fh, n=len(bx))

# 3. Retratos da vó-robô (linha de cima: olhos apagados, sorrindo, falha, desligada)
a = load('vo_retratos.jpg'); fg = ~mag_mask(a); bx = [b for b in comps(fg) if (b[1] + b[3]) / 2 < a.shape[0] / 2]
bx.sort(key=lambda b: b[0])
for i, nm in enumerate(['off', 'ok', 'glitch', 'dark'][:len(bx)]):
    put('f2_pt_vo_' + nm, cut(a, fg, bx[i], 36 / (bx[i][3] - bx[i][1] + 1)).resize((32, 36), Image.NEAREST))

# 4. Elenco: uma linha por personagem (operador, entregador, turista, idoso)
a = load('npcs.jpg'); fg = ~mag_mask(a); H = a.shape[0]
for i, (nm, hh) in enumerate([('tiago', ADULT), ('caio', ADULT + 2), ('turista', ADULT), ('ze', ADULT - 4)]):
    band = np.zeros_like(fg); band[i * H // 4:(i + 1) * H // 4] = fg[i * H // 4:(i + 1) * H // 4]
    bx = sorted(comps(band), key=lambda b: b[0])
    s, fw, fh = sheet(a, band, bx, hh, nm); put('f2_' + nm, s, fw=fw, fh=fh, n=len(bx))
    put('f2_pt_' + nm, portrait(a, band, bx[0], 'pt_' + nm, 0, .62 if nm != 'caio' else .7))

# 5. Totens de escuta (linha 1 da folha de objetos: apagado, ouvindo, gravando, alerta)
a = load('props.jpg'); fg = ~mag_mask(a); band = np.zeros_like(fg); band[:a.shape[0] // 4] = fg[:a.shape[0] // 4]
bx = sorted(comps(band), key=lambda b: b[0])
s, fw, fh = sheet(a, band, bx, 46, 'totem'); put('f2_totem', s, fw=fw, fh=fh, n=len(bx))

# 6. Ônibus: aberto, andando, fechado com letreiro
a = load('onibus.jpg'); fg = ~mag_mask(a, dark=True)
bx = order(comps(fg, 20000), a.shape[0], 2)
s, fw, fh = sheet(a, fg, bx, 64, 'onibus'); put('f2_onibus', s, fw=fw, fh=fh, n=len(bx))

# 7. Memorial: células com fundos diferentes, cada uma limpa a partir da borda
a = load('memorial.jpg'); H, W = a.shape[:2]; cw, ch = W // 3, H // 2
for (cx, cy, nm, hh) in [(0, 0, 'retrato', 22), (1, 0, 'altar', 18), (0, 1, 'cadeira', 30), (1, 1, 'carta', 11), (2, 1, 'carregador', 16)]:
    c = a[cy * ch + 6:(cy + 1) * ch - 6, cx * cw + 6:(cx + 1) * cw - 6].copy()
    fg = ~(flood_bg(c) | mag_mask(c)); bx = comps(fg, 800)
    if nm == 'carregador': bx = sorted(bx, key=lambda b: b[0])  # dois: base vazia e base com bateria
    b = [min(x[0] for x in bx), min(x[1] for x in bx), max(x[2] for x in bx), max(x[3] for x in bx)] if nm != 'carregador' else bx[0]
    im = cut(c, fg, b, hh / (b[3] - b[1] + 1)); s, fw, fh = strip([im], 'm_' + nm); put('f2_m_' + nm, s)

# 8. Ponto de ônibus inteligente (só nas cenas narradas)
im = Image.open(os.path.join(IN, 'ponto.jpg')).convert('RGB').resize((484, 270), Image.BOX); put('f2ponto', im)

js = '/* gerado por ferramentas/f2_assets.py — não editar à mão */\nconst ASSETS2=' + json.dumps(OUTD, separators=(',', ':')) + ';\n'
open(OUT, 'w', encoding='utf-8').write(js)
print('ok', len(OUTD), 'itens', len(js) // 1024, 'KB ->', OUT)
for k, v in OUTD.items(): print(' ', k, {x: v[x] for x in v if x != 'src'})

# 9. Cenários de 2026: a tecnologia é pintada DENTRO do fundo (nada colado por cima), e a pintura fica fria
SRC = open(os.path.join(HERE, '..', 'src', 'assets.js'), encoding='utf-8').read(); AA = json.loads(SRC[SRC.index('{'):SRC.rindex('}') + 1])
ALPHA = {}
def asset(k):
    im = np.asarray(Image.open(io.BytesIO(base64.b64decode(AA['images'][k].split(',')[1]))).convert('RGBA')).astype(float); ALPHA[k] = im[..., 3].copy(); return im[..., :3].copy()
def withA(a, k): return Image.fromarray(np.dstack([a, ALPHA[k]]).astype('uint8'), 'RGBA')
def grade(a, cool=1.0):
    L = a.mean(2, keepdims=True); a = a * .78 + L * .22  # menos saturado
    a[..., 0] *= 1 - .10 * cool; a[..., 1] *= 1 - .02 * cool; a[..., 2] *= 1 + .10 * cool
    return np.clip(a, 0, 255)
def R(a, x, y, w, h, c): a[y:y + h, x:x + w] = c
INK, STEEL, STEEL2, SCR, CY = (28, 17, 10), (42, 53, 72), (124, 135, 150), (11, 30, 38), (61, 242, 224)
def screen(a, x, y, w, h):
    R(a, x, y, w, h, INK); R(a, x + 1, y + 1, w - 2, h - 2, STEEL); R(a, x + 1, y + 1, w - 2, 1, STEEL2); R(a, x + 3, y + 3, w - 6, h - 6, SCR); R(a, x + 3, y + 3, w - 6, 1, CY)
def dome(a, x, y):  # câmera de parede: suporte + domo
    R(a, x - 1, y - 6, 2, 6, INK); R(a, x - 5, y - 1, 10, 6, INK); R(a, x - 4, y, 8, 4, STEEL2); R(a, x - 2, y + 1, 4, 3, (40, 60, 80)); R(a, x - 1, y + 2, 1, 1, (255, 59, 59))
# padaria: parede repintada de branco-gelo, lousa vira tela, leitor facial na parede, fita de LED no rodapé, câmera no alto
a = asset('interior'); H, W = a.shape[:2]; r, g, b = a[..., 0], a[..., 1], a[..., 2]
yy = np.arange(H)[:, None].repeat(W, 1); xx = np.arange(W)[None, :].repeat(H, 0)
wall = (r > 140) & (g > 120) & (b > 80) & (r - b > 18) & (r - b < 110) & (yy < 176) & (xx < 312)
L = (r * .3 + g * .59 + b * .11) / 255
a[wall] = np.stack([205 * L[wall] + 20, 214 * L[wall] + 20, 222 * L[wall] + 22], -1)
a = grade(a, .8)
R(a, 256, 13, 8, 7, a[22, 300]); screen(a, 234, 19, 52, 71)          # lousa -> tela
R(a, 296, 58, 10, 16, INK); R(a, 297, 59, 8, 14, STEEL); R(a, 298, 61, 6, 8, (20, 60, 70)); R(a, 299, 63, 4, 4, CY)  # leitor facial
R(a, 0, 142, 312, 1, CY); R(a, 0, 143, 312, 1, (30, 120, 120))       # fita de LED
dome(a, 300, 8)
put('f2_interior26', withA(a, 'interior'))
# rua: pintura fria, câmeras, telão, fitas de LED sob as sacadas
a = grade(asset('rua00'), 1.0)
for (x, y) in [(395, 118), (752, 148), (958, 150)]: dome(a, x, y)
screen(a, 803, 148, 62, 24)
for (x0, x1, y) in [(726, 812, 124), (862, 905, 133)]: R(a, x0, y, x1 - x0, 1, CY); R(a, x0, y + 1, x1 - x0, 1, (30, 120, 120))
put('f2_rua26', withA(a, 'rua00'))
# interior gerado (só para a cena narrada)
put('f2_intger', Image.open(os.path.join(IN, 'interior_ger.jpg')).convert('RGB').resize((484, 270), Image.BOX))
js = '/* gerado por ferramentas/f2_assets.py — não editar à mão */\nconst ASSETS2=' + json.dumps(OUTD, separators=(',', ':')) + ';\n'
open(OUT, 'w', encoding='utf-8').write(js); print('cenarios ok', len(js) // 1024, 'KB')
