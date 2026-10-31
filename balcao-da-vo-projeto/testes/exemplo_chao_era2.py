import sys; sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from lib import *
V='./'
with sync_playwright() as p:
    b, pg, errs = launch(p,1366,768)
    pg.goto(URL); wait_ready(pg,25000); pg.wait_for_timeout(800)
    pg.keyboard.press('e'); pg.wait_for_timeout(500); skip_dialogs(pg); pg.wait_for_timeout(300)
    ev(pg,'__g.startEra(2)'); pg.wait_for_timeout(500)
    for _ in range(4): pg.keyboard.press('e'); pg.wait_for_timeout(250)
    skip_dialogs(pg); ev(pg,'__g.S.min=660; __g.S.rain=false;')
    ev(pg,'__g.setLoc("rua",330,470)'); pg.wait_for_timeout(2500); skip_dialogs(pg); pg.wait_for_timeout(300)
    pg.screenshot(path=V+'h_ground.png',clip={'x':0,'y':480,'width':1366,'height':288})
    print(errs[:3]); b.close()
