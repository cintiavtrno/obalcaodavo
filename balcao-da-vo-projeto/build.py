# -*- coding: utf-8 -*-
"""Monta o-balcao-da-vo.html a partir de src/ e fonts/.  Uso:  python3 build.py   (precisa só de Python 3)
O Phaser 3.80.1 é carregado do CDN (cdnjs). Para testar offline, coloque phaser.min.js ao lado deste arquivo e rode: python3 build.py dev"""
import base64, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, 'src'); FD = os.path.join(HERE, 'fonts')
mode = sys.argv[1] if len(sys.argv) > 1 else 'final'
out = os.path.join(HERE, 'o-balcao-da-vo.html' if mode == 'final' else 'o-balcao-da-vo_dev.html')
UR = "unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
def face(fam, base, w):
    d = base64.b64encode(open(os.path.join(FD, f'{base}-latin-{w}-normal.woff2'), 'rb').read()).decode()
    return f"@font-face{{font-family:'{fam}';font-weight:{w};font-display:swap;src:url(data:font/woff2;base64,{d}) format('woff2');{UR}}}"
fonts = '\n'.join([face('DMSans', 'dm-sans', w) for w in (500, 600, 700)] + [face('Atkinson', 'atkinson-hyperlegible', w) for w in (400, 700)])
rd = lambda f: open(os.path.join(SRC, f), encoding='utf-8').read()
if mode == 'dev':
    phaser = '<script>' + open(os.path.join(HERE, 'phaser.min.js'), encoding='utf-8').read() + '</script>'
else:
    phaser = '<script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.80.1/phaser.min.js" crossorigin="anonymous"></script>\n<script>if(typeof Phaser==="undefined"){document.getElementById("nocdn").style.display="flex"}</script>'
logic = rd('logic_pre.js')
render = ''.join(rd(f) + '\n' for f in ['r1_core.js', 'r2_boot.js', 'r3_ents.js', 'r4_rua.js', 'r5_padaria.js', 'r6_ui.js', 'r8_book.js', 'r9_fase2.js', 'r7_input.js'])
assert '/*@@RENDER@@*/' in logic
logic = logic.replace('/*@@RENDER@@*/', rd('logic_obj.js') + '\n' + render)
logic = logic.replace('bootPhaser();\n})();', 'if(typeof Phaser!=="undefined")bootPhaser();\n})();')
h = rd('shell.html').replace('/*FONTS*/', fonts).replace('<!--GFONT-->', '').replace('<!--PHASER-->', phaser).replace('/*ASSETS*/', rd('assets.js') + '\n' + rd('f2_assets.js')).replace('/*JS*/', logic).replace('/*CAPA*/', 'data:image/svg+xml;base64,' + base64.b64encode(open(os.path.join(SRC, 'capa.svg'), 'rb').read()).decode())
open(out, 'w', encoding='utf-8').write(h)
print(mode, len(h) // 1024, 'KB ->', out)
