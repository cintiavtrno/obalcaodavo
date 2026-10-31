from playwright.sync_api import sync_playwright
import sys, time, json
import os
URL = os.environ.get('BALCAO_URL', 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'o-balcao-da-vo_dev.html')))
def launch(p, w=1440, h=810):
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'])
    pg = b.new_page(viewport={'width': w, 'height': h})
    errs = []
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: errs.append('PAGEERROR: ' + str(e) + ' | ' + (getattr(e,'stack','') or '')[:700]))
    return b, pg, errs
def ev(pg, js):
    return pg.evaluate(js)
def wait_ready(pg, t=15000):
    pg.wait_for_function('window.__g && window.__phaser && window.__g.S && window.__phaser.scene.getScene("UI") && window.__phaser.scene.getScene("UI").hv', timeout=t)

def skip_dialogs(pg, maxn=60):
    n=0
    while pg.evaluate('__g.S.scene')=='dialog' and n<maxn:
        pg.wait_for_timeout(200)
        ch=pg.evaluate('!!(__g.S.d&&__g.S.d.ch)')
        pg.keyboard.press('1' if ch else 'e'); pg.wait_for_timeout(100)
        if not ch: pg.keyboard.press('e')
        pg.wait_for_timeout(150); n+=1
    return n
def start_game(pg):
    pg.goto(URL); wait_ready(pg); pg.wait_for_timeout(1200)
    pg.keyboard.press('e'); pg.wait_for_timeout(400)
    return skip_dialogs(pg)
def sim(pg, secs):
    pg.evaluate('(s)=>{for(let i=0;i<s*30;i++)__g.update(1/30)}', secs)
