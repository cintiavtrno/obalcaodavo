# -*- coding: utf-8 -*-
"""Fase 2: limpa o magenta (#FF00FF), acha cada figura sozinha (componentes conectados),
alinha todas pelo pé e pelo centro, reduz para o tamanho do jogo e monta uma tira PNG.

Uso: python3 f2_sprites.py entrada.png saida.png --altura 37 [--ordem linhas] [--min 2000]
  --altura  altura final (px lógicos do jogo) da figura mais alta; as outras mantêm a proporção
  --corte   'pe' (padrão): a base de cada quadro é o pé; 'cintura': base reta (busto/balcão)
Saída: tira horizontal com quadros de mesma largura e mesma linha de base + um .json com os quadros.
"""
import sys, json, argparse
from PIL import Image
import numpy as np
from collections import deque

def mascara(im, tol=90):
    a = np.asarray(im.convert('RGB')).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # magenta e franja rosada: muito vermelho e azul, pouco verde
    mag = (r > 150) & (b > 150) & (g < 110) & (np.abs(r - b) < tol)
    return ~mag, a

def componentes(fg, minarea):
    H, W = fg.shape; lab = np.zeros((H, W), int); n = 0; boxes = []
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            if fg[y, x] and not lab[y, x]:
                n += 1; q = deque([(y, x)]); lab[y, x] = n; x0 = x1 = x; y0 = y1 = y; area = 0
                while q:
                    cy, cx = q.popleft(); area += 1
                    x0 = min(x0, cx); x1 = max(x1, cx); y0 = min(y0, cy); y1 = max(y1, cy)
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < H and 0 <= nx < W and fg[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = n; q.append((ny, nx))
                if area >= minarea: boxes.append([x0, y0, x1, y1, area])
    return boxes

def juntar(boxes, gap=6):
    # junta pedaços próximos (ex.: cabeça separada do corpo por 1 px)
    mud = True
    while mud:
        mud = False
        for i in range(len(boxes)):
            for j in range(i + 1, len(boxes)):
                a, b = boxes[i], boxes[j]
                if a[0] - gap <= b[2] and b[0] - gap <= a[2] and a[1] - gap <= b[3] and b[1] - gap <= a[3]:
                    boxes[i] = [min(a[0], b[0]), min(a[1], b[1]), max(a[2], b[2]), max(a[3], b[3]), a[4] + b[4]]
                    boxes.pop(j); mud = True; break
            if mud: break
    return boxes

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('ent'); ap.add_argument('sai')
    ap.add_argument('--altura', type=float, default=37); ap.add_argument('--min', type=int, default=1500)
    ap.add_argument('--corte', default='pe')
    o = ap.parse_args()
    im = Image.open(o.ent).convert('RGB'); fg, arr = mascara(im)
    bx = juntar(componentes(fg, o.min))
    # ordem de leitura: linhas (por y do centro), depois x
    bx.sort(key=lambda b: (round(((b[1] + b[3]) / 2) / (im.height / 8)), b[0]))
    hmax = max(b[3] - b[1] + 1 for b in bx); k = o.altura / hmax
    rgba = np.dstack([arr, (fg * 255)]).astype('uint8'); full = Image.fromarray(rgba, 'RGBA')
    frames = []
    for b in bx:
        c = full.crop((b[0], b[1], b[2] + 1, b[3] + 1))
        w, h = max(1, round(c.width * k)), max(1, round(c.height * k))
        # redução por média (melhor que vizinho mais próximo nesse fator), alfa binário,
        # e a franja rosada vira contorno escuro
        c = c.resize((w, h), Image.BOX)
        a = np.asarray(c).astype(int).copy(); a[..., 3] = np.where(a[..., 3] > 110, 255, 0)
        r, g, b_ = a[..., 0], a[..., 1], a[..., 2]
        fr = (a[..., 3] > 0) & (r > g + 35) & (b_ > g + 35)
        a[fr, 0], a[fr, 1], a[fr, 2] = 28, 17, 10
        frames.append(Image.fromarray(a.astype('uint8'), 'RGBA'))
    FW = max(f.width for f in frames) + 4; FH = max(f.height for f in frames) + 1
    strip = Image.new('RGBA', (FW * len(frames), FH), (0, 0, 0, 0))
    for i, f in enumerate(frames):  # pé na última linha, centro horizontal no meio do quadro
        strip.paste(f, (i * FW + (FW - f.width) // 2, FH - f.height), f)
    strip.save(o.sai, optimize=True)
    json.dump({'fw': FW, 'fh': FH, 'n': len(frames), 'boxes': bx}, open(o.sai.rsplit('.', 1)[0] + '.json', 'w'))
    print(o.ent, '->', o.sai, len(frames), 'quadros', FW, 'x', FH)

if __name__ == '__main__': main()
