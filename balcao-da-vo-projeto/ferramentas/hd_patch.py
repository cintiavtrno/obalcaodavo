# -*- coding: utf-8 -*-
# reforma visual: texto HD (DM Sans / Atkinson), painéis lisos, render em HK x resolução
import re
def rd(p): return open(p,encoding='utf-8').read()
def wr(p,s): open(p,'w',encoding='utf-8').write(s)
def rep(s,a,b,n=1):
    assert s.count(a)==n,(a[:70],s.count(a)); return s.replace(a,b)
# ---------------- r1_core ----------------
p='src/r1_core.js';s=rd(p)
i=s.index("const FONTSTACK=");j=s.index("function hex2rgb")
new=r'''let HK=3;   // fator de resolução: o Phaser desenha em (LW*HK)x(LH*HK) e cada cena usa zoom HK; texto e painéis são vetoriais nessa grade
const FUI="'DMSans','DM Sans',system-ui,'Segoe UI',Roboto,sans-serif",FTX="'Atkinson','Atkinson Hyperlegible',system-ui,'Segoe UI',Roboto,sans-serif";
const FONTSTACK=FTX;
const TXT={ink:'#3B1F0E',cream:'#F4EFE0',yel:'#FFD21F',wood:'#5A3A24',dark:'#2A160A',pink:'#FF8AC8',grn:'#7CF0B8',blu:'#9FB4FF',ora:'#FF9A4A'};
const _mc=document.createElement('canvas').getContext('2d');
/* DM Sans (títulos, HUD, botões) e Atkinson Hyperlegible (diálogos e textos corridos) */
function fontCss(sz,role,bold,k){return (bold?700:role==='ui'?600:400)+' '+(sz*(k||HK))+'px '+(role==='ui'?FUI:FTX)}
/* ---- quebra de linha com trechos coloridos/links ---- */
function layoutRuns(runs,size,maxW,lh,role){
  const meas=(t,st)=>{_mc.font=fontCss(size,role,!!(st&&st.b));return _mc.measureText(t).width/HK};
  const lines=[[]];let x=0;
  const push=(w,st,t)=>{lines[lines.length-1].push({t,w,st,x});x+=w};
  const nl=()=>{lines.push([]);x=0};
  for(const r of runs){
    if(r.br){nl();continue}
    const parts=String(r.t).split(/(\s+)/).filter(s=>s!=='');
    for(const p of parts){
      const w=Math.ceil(meas(p,r)*10)/10,sp=/^\s+$/.test(p);
      if(sp){if(x>0)push(w,r,p);continue}
      if(maxW&&x+w>maxW&&x>0)nl();
      push(w,r,p)}}
  let W=0;lines.forEach(l=>l.forEach(o=>{W=Math.max(W,o.x+o.w)}));
  return{lines,W:maxW?Math.max(W,Math.min(maxW,W)):W,H:lines.length*lh}}
function toRuns(s){return typeof s==='string'?[{t:s.replace(/→/g,'>')}]:s.map(r=>r.t?Object.assign({},r,{t:String(r.t).replace(/→/g,'>')}):r)}
/* ---- rasteriza o texto em HK x (vetorial, com suavização), contorno/sombra reais ---- */
function pixText(runs,o){
  o=Object.assign({size:10,color:TXT.cream,w:0,lh:0,align:'left',outline:null,shadow:null,link:'#9FD0FF',bold:TXT.yel,f:'text'},o||{});
  runs=toRuns(runs);const lh=o.lh||Math.round(o.size*1.35);
  const L=layoutRuns(runs,o.size,o.w,lh,o.f);const pad=o.outline||o.shadow?2:0;
  const W=Math.max(1,Math.ceil(o.w&&o.align!=='left'?o.w:L.W)+pad*2+1),Hh=Math.max(lh,L.H)+pad*2;
  const kk=Math.max(1,Math.min(HK,3900/W,3900/Hh));
  const cv=document.createElement('canvas');cv.width=Math.ceil(W*kk);cv.height=Math.ceil(Hh*kk);const g=cv.getContext('2d');
  g.textBaseline='middle';g.lineJoin='round';const links=[];let cnt=0;
  L.lines.forEach((ln,li)=>{
    let lw=0;ln.forEach(x=>{lw=Math.max(lw,x.x+x.w)});
    const off=o.align==='center'?(((o.w||L.W)-lw)/2):o.align==='right'?((o.w||L.W)-lw):0;
    ln.forEach(x=>{
      const st=x.st,col=st.a?o.link:st.b?o.bold:(st.c||o.color);let tt=x.t;
      if(o.reveal!=null){const take=Math.max(0,Math.min(tt.length,o.reveal-cnt));cnt+=tt.length;tt=tt.slice(0,take);if(!tt)return}
      g.font=fontCss(o.size,o.f,!!st.b,kk);
      const lx=pad+off+x.x,ly=pad+li*lh+lh/2,px=lx*kk,py=ly*kk;
      if(o.outline){g.lineWidth=Math.max(2,kk*1.6);g.strokeStyle=o.outline;g.strokeText(tt,px,py)}
      else if(o.shadow){g.fillStyle=o.shadow;g.fillText(tt,px,py+kk*.9)}
      g.fillStyle=col;g.fillText(tt,px,py);
      if(st.a&&x.t.trim()){g.fillRect(px,py+o.size*.5*kk,x.w*kk,Math.max(1,kk*.6));links.push({x:lx,y:pad+li*lh,w:x.w,h:lh,href:st.a})}})});
  return{canvas:cv,w:W,h:Hh,k:kk,links,lines:L.lines.length}}
'''
s=s[:i]+new+s[j:]
# mkText: textura suave + escala 1/k
s=rep(s,"tex.setFilter(Phaser.Textures.FilterMode.NEAREST);","tex.setFilter(Phaser.Textures.FilterMode.LINEAR);")
s=rep(s,"const old=this._key;this.setTexture(key);this._key=key;","const old=this._key;this.setTexture(key);this.setScale(1/r.k);this._key=key;")
# ---- painéis lisos (substituem os 9-slices pixelados) ----
s+=r'''
/* ---- painéis lisos: cantos arredondados, cor chapada, sem textura atrás de texto ---- */
const PSTY={wood9:{f:'#6B4630',b:'#2A160A',h:'#85593C',r:5},wood9d:{f:'#4B2F1D',b:'#24130A',h:'#5E3C27',r:6},paper9:{f:'#F6EEDA',b:'#BFA77C',r:5},
  btn9:{f:'#FFD21F',b:'#6E4A0C',h:'#FFE680',r:5},btn9h:{f:'#7CF0B8',b:'#2E7F5A',h:'#C4FFE0',r:5},bub9:{f:'#FFFDF4',b:'#4A2A16',r:5},frame:{f:'#E7D7B4',b:'#5A3A24',r:5}};
function _rr(g,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function _mulHex(base,tint){const b=hex2rgb(base);return'rgb('+b.map((v,i)=>Math.round(v*((tint>>(16-8*i))&255)/255)).join(',')+')'}
function panelTex(sc,sty,w,h,tint){
  const k=Math.min(HK,4),tk=tint==null?'n':tint;const key='pn|'+sty+'|'+w+'x'+h+'|'+k+'|'+tk;
  if(!sc.textures.exists(key)){const S=PSTY[sty],cw=Math.max(2,Math.round(w*k)),ch=Math.max(2,Math.round(h*k));
    const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const g=cv.getContext('2d');
    const r=S.r*k,bw=Math.max(1,Math.round(k*.9)),fill=tint==null?S.f:_mulHex(S.f,tint);
    _rr(g,0,0,cw,ch,r);g.fillStyle=S.b;g.fill();
    _rr(g,bw,bw,cw-2*bw,ch-2*bw,r-bw);g.fillStyle=fill;g.fill();
    if(S.h&&ch>8*k){g.save();_rr(g,bw,bw,cw-2*bw,ch-2*bw,r-bw);g.clip();g.fillStyle='rgba(255,255,255,.16)';g.fillRect(0,bw,cw,Math.max(1,k*.8));g.restore()}
    sc.textures.addCanvas(key,cv).setFilter(Phaser.Textures.FilterMode.LINEAR)}
  return key}
class HPanel extends Phaser.GameObjects.Image{
  constructor(sc,x,y,sty,w,h){super(sc,x,y,'__DEFAULT');this._sty=sty;this._tint=null;this.lw=0;this.lh=0;this.setOrigin(.5);this._mk(Math.max(2,Math.round(w)),Math.max(2,Math.round(h)))}
  _mk(w,h){this.lw=w;this.lh=h;Phaser.GameObjects.Image.prototype.setTexture.call(this,panelTex(this.scene,this._sty,w,h,this._tint));this.setScale(1/Math.min(HK,4));
    if(this.input&&this.input.hitArea){this.input.hitArea.setSize(this.width,this.height)}}
  setSize(w,h){w=Math.max(2,Math.round(w));h=Math.max(2,Math.round(h));if(w!==this.lw||h!==this.lh)this._mk(w,h);return this}
  setTexture(k){if(PSTY[k]){if(this._sty!==k){this._sty=k;this._mk(this.lw,this.lh)}return this}return Phaser.GameObjects.Image.prototype.setTexture.apply(this,arguments)}
  setTint(c){const t=(c===0xFFFFFF||c==null)?null:c;if(t!==this._tint){this._tint=t;this._mk(this.lw,this.lh)}return this}
  clearTint(){return this.setTint(null)}
}
(function(){const F=Phaser.GameObjects.GameObjectFactory.prototype,orig=F.nineslice;
  F.nineslice=function(x,y,key,frame,w,h){if(typeof key==='string'&&PSTY[key]){const p=new HPanel(this.scene,x,y,key,w,h);this.displayList.add(p);return p}return orig.apply(this,arguments)}})();
'''
wr(p,s)
# ---------------- r3_ents: largura lógica do balão ----------------
p='src/r3_ents.js';s=rd(p)
s=rep(s,"const w=b.bg.width,h=b.bg.height;","const w=b.bg.lw,h=b.bg.lh;")
wr(p,s)
print('ok r1/r3')

# ---------------- r2_boot ----------------
p='src/r2_boot.js';s=rd(p)
s=rep(s,"{fontFamily:FONTSTACK,fontSize:'32px',color:'#FFD21F'}).setOrigin(.5);","{fontFamily:FUI,fontSize:'26px',fontStyle:'700',color:'#FFD21F'}).setOrigin(.5).setResolution(HK);")
s=rep(s,"{fontFamily:FONTSTACK,fontSize:'16px',color:'#F4EFE0'}).setOrigin(.5);","{fontFamily:FTX,fontSize:'12px',color:'#F4EFE0'}).setOrigin(.5).setResolution(HK);")
s=rep(s,"{fontFamily:FONTSTACK,fontSize:'8px',color:'#a98a6a'}).setOrigin(.5);","{fontFamily:FTX,fontSize:'8px',color:'#a98a6a'}).setOrigin(.5).setResolution(HK);")
s=rep(s,"""document.fonts.load("8px 'Tiny5'"),document.fonts.load("8px 'Tiny5 Local'")].map(p=>p.catch(()=>0))""","""document.fonts.load("600 16px DMSans"),document.fonts.load("700 16px DMSans"),document.fonts.load("400 16px Atkinson"),document.fonts.load("700 16px Atkinson")].map(p=>p.catch(()=>0))""")
s=rep(s,"""G.fontOk=!!(document.fonts.check&&document.fonts.check("8px 'Tiny5'"))||!!document.fonts.check("8px 'Tiny5 Local'");[this.title,this.sub,this.foot].forEach(t=>t.setFontFamily(FONTSTACK))""","""G.fontOk=!!(document.fonts.check&&document.fonts.check("400 16px Atkinson"));this.title.setFontFamily(FUI);this.sub.setFontFamily(FTX);this.foot.setFontFamily(FTX)""")
# cardbg liso
i=s.index("canvasTex(sc,'cardbg'");j=s.index("\n",i)
s=s[:i]+"canvasTex(sc,'cardbg',LW,LH,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#2D1A0F');gr.addColorStop(1,'#3A2415');g.fillStyle=gr;g.fillRect(0,0,w,h)});"+s[j:]
# filtros suaves para texturas de gradiente
s=rep(s,"    canvasTex(sc,'chalk',48,64,(g)=>{R(g,'#1E3C38',0,0,48,64)});","    canvasTex(sc,'chalk',48,64,(g)=>{R(g,'#1E3C38',0,0,48,64)});\n    ['vig','glow','shaft','sunlay','skyg','shadow','cardbg','tvscan'].forEach(k=>{if(sc.textures.exists(k))sc.textures.get(k).setFilter(Phaser.Textures.FilterMode.LINEAR)});")
# fitGame sem display-canvas; config HD
s=rep(s,"  if(G.game)G.game.scale.refresh();dispFit()}","  if(G.game)G.game.scale.refresh()}")
i=s.index("/* ---- nitidez:");j=s.index("function bootPhaser()")
s=s[:i]+s[j:]
s=rep(s,"const cfg={type:Phaser.WEBGL,parent:'game',width:LW,height:LH,","HK=Math.max(2,Math.min(4,Math.ceil((window.innerWidth*(window.devicePixelRatio||1))/LW-.05)));\n  const cfg={type:Phaser.WEBGL,parent:'game',width:LW*HK,height:LH*HK,")
s=rep(s,"scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:LW,height:LH},","scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:LW*HK,height:LH*HK},")
s=rep(s,"window.__phaser=G.game;G.game.events.once('ready',dispSetup);","window.__phaser=G.game;\n  G.game.events.on('prerender',()=>{for(const sc of G.game.scene.scenes){const c=sc.cameras&&sc.cameras.main;if(c&&c.zoom!==HK){c.setOrigin(0,0);c.setZoom(HK)}}});")
wr(p,s)
# ---------------- ponteiro em px lógicos ----------------
p='src/r5_padaria.js';s=rd(p)
s=rep(s,"this.stationAt(p.x+camx,p.y)","this.stationAt(p.x/HK+camx,p.y/HK)")
wr(p,s)
print('ok r2/r5')
