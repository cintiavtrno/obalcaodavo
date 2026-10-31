/* ===== parte 3: atores (y-sort), falas, balões de pedido, efeitos ===== */
const ID2RIG={lia:'lia',raimundo:'raimundo',dandara:'dandara',davi:'davi',marta:'marta',lucia:'lucia',vo:'vo',bia:'bia',caio:'caio'};
const ICON={pao:'pao_prato',bolo:'bolo_amarelo_pedestal',cafe:'xicara_cafe_vapor',ima:'miniatura_boneca_baiana'};
const TINTS=[0xFFFFFF,0xFFD8D8,0xD8E8FF,0xE0FFD8,0xFFF0C0,0xF0D8FF,0xD8FFF4];
function hashStr(s){let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h}
const DEPTH=(y)=>y;     // depth = y (px lógicos): y-sort de tudo que está no chão
class Ent{
  constructor(sc,id){this.sc=sc;this.id=id;this.spr=sc.add.sprite(0,0,'chars').setOrigin(.5,1);this.sh=sc.add.image(0,0,'shadow').setAlpha(.9);
    this.lx=null;this.ly=null;this.hd='down';this.idleT=0;this.key=null;this.age=0;this.extras=[];this.tagKey=null}
  /* o: x,y (px), s (escala), rig, dir ('left'|'right'|'up'|'down'|null), moving, grp (força grupo), play (anim em loop parado), tint, yoff, flipFix */
  show(o){
    const sp=this.spr,x=o.x,y=o.y;let hd=this.hd;const rg=ASSETS.rigs[o.rig],os=o.s*(rg&&rg[1]>52?52/rg[1]:1);
    if(this.lx!=null){const dx=x-this.lx,dy=y-this.ly,d=Math.hypot(dx,dy);if(d>.12){hd=Math.abs(dy)>Math.abs(dx)*1.25?(dy<0?'up':'down'):(dx<0?'left':'right');this.mv=true}else this.mv=false}else this.mv=false;
    this.lx=x;this.ly=y;
    if(o.dir&&!this.mv)hd=o.dir;this.hd=hd;
    let g,f;if(o.grp){g=o.grp;f=!!o.flip}else{const p=pickGroup(o.rig,(o.faceFront&&!this.mv)?'down':hd);g=p.g;f=p.f}
    const key=o.rig+'/'+g;const fr=GROUPS[key];
    const wantAnim=fr&&fr.filter(Boolean).length>1&&(this.mv||o.moving||o.play);
    if(wantAnim){if(this.key!==key){sp.play(key);this.key=key}sp.anims.timeScale=o.rate||1}
    else{if(this.key){sp.anims.stop();this.key=null}sp.setTexture(o.rig==='lia26'?'chars26':'chars',fr?fr[0]:GROUPS[o.rig+'/down'][0])}
    sp.setFlipX(f);sp.setScale(os);sp.setPosition(Math.round(x),Math.round(y+(o.yoff||0)));sp.setDepth(DEPTH(y));
    sp.setTint(o.tint||0xFFFFFF);sp.setVisible(true);sp.setAlpha(o.alpha==null?1:o.alpha);
    this.sh.setPosition(Math.round(x),Math.round(y)-1).setScale(os*(o.shs||.9)).setDepth(DEPTH(y)-.5).setVisible(true);
    this.top=y-(ASSETS.rigs[o.rig]?ASSETS.rigs[o.rig][1]:50)*os;this.sc_=os}
  hide(){this.spr.setVisible(false);this.sh.setVisible(false)}
  destroy(){this.spr.destroy();this.sh.destroy();this.extras.forEach(e=>e.destroy&&e.destroy())}
}
/* conjunto de entidades por id: cria sob demanda, apaga as que sumiram */
class EntSet{
  constructor(sc){this.sc=sc;this.m=new Map();this.seen=new Set()}
  begin(){this.seen.clear()}
  get(id){let e=this.m.get(id);if(!e){e=new Ent(this.sc,id);this.m.set(id,e)}this.seen.add(id);return e}
  end(){for(const[k,e]of this.m)if(!this.seen.has(k)){e.destroy();this.m.delete(k)}}
  clear(){for(const e of this.m.values())e.destroy();this.m.clear()}
}
/* ---- balões de fala (barks) ---- */
class Speech{
  constructor(sc){this.sc=sc;this.m=new Map();this.seen=new Set()}
  begin(){this.seen.clear()}
  put(id,x,y,s,cam,maxW){
    this.seen.add(id);let b=this.m.get(id);
    if(!b){b={s:null};b.bg=this.sc.add.nineslice(0,0,'bub9',null,20,16,4,4,4,4).setOrigin(.5,1);b.tail=this.sc.add.image(0,0,'tail').setOrigin(.5,0);b.tx=mkText(this.sc,0,0,'',{size:9,color:TXT.ink,w:maxW||118,lh:11});
      [b.bg,b.tail,b.tx].forEach(o=>o.setDepth(9000));this.m.set(id,b)}
    if(b.s!==s){b.s=s;b.tx.setT(s,{w:maxW||118});b.bg.setSize(Math.max(22,b.tx.tw+8),b.tx.th+6)}
    const w=b.bg.lw,h=b.bg.lh;let bx=x;bx=clamp(bx,cam+4+w/2,cam+LW-4-w/2);
    b.bg.setPosition(Math.round(bx),Math.round(y-4)).setVisible(true);b.tail.setPosition(Math.round(clamp(x,bx-w/2+8,bx+w/2-8)),Math.round(y-4)).setVisible(true);
    b.tx.setPosition(Math.round(bx-w/2+4),Math.round(y-4-h+3)).setVisible(true)}
  end(){for(const[k,b]of this.m)if(!this.seen.has(k)){b.bg.destroy();b.tail.destroy();b.tx.destroy();this.m.delete(k)}}
  clear(){for(const b of this.m.values()){b.bg.destroy();b.tail.destroy();b.tx.destroy()}this.m.clear()}
}
/* ---- balão de pedido: ícone do item + número + barra de paciência ---- */
class OrderBub{
  constructor(sc){this.sc=sc;this.m=new Map();this.seen=new Set()}
  begin(){this.seen.clear()}
  put(id,x,y,o,mood){
    this.seen.add(id);let b=this.m.get(id);
    if(!b){b={};b.bg=this.sc.add.nineslice(0,0,'bub9',null,30,24,4,4,4,4).setOrigin(.5,1);b.tail=this.sc.add.image(0,0,'tail').setOrigin(.5,0);
      b.ic=this.sc.add.image(0,0,'ui',ICON[o.item]||'pao_prato').setOrigin(.5);b.num=mkText(this.sc,0,0,'',{size:8,color:TXT.ink});b.bar=this.sc.add.graphics();
      b.mood=this.sc.add.image(0,0,'ui','balao_espera_relogio').setOrigin(.5,1).setVisible(false);
      [b.bg,b.tail,b.ic,b.num,b.bar,b.mood].forEach(q=>q.setDepth(8900));this.m.set(id,b)}
    const noted=!!o.noted;if(b.nn!==(noted?o.num:-1)){b.nn=noted?o.num:-1;b.num.setT(noted?'#'+o.num:'?')}
    b.ic.setFrame(ICON[o.item]||'pao_prato');const sc_=Math.min(1,16/Math.max(b.ic.width,b.ic.height));b.ic.setScale(sc_);
    const p=clamp(o.pat/o.max,0,1);
    b.bg.setPosition(Math.round(x),Math.round(y-4)).setVisible(true);b.tail.setPosition(Math.round(x),Math.round(y-4)).setVisible(true);
    b.ic.setPosition(Math.round(x-6),Math.round(y-16)).setVisible(true);b.num.setPosition(Math.round(x+4),Math.round(y-21)).setVisible(true);
    b.bar.clear();b.bar.fillStyle(0x3B1F0E,1).fillRect(Math.round(x-12),Math.round(y-10),24,3);const col=p>.5?0x3CD28A:p>.25?0xFFD21F:0xE5322D;b.bar.fillStyle(col,1).fillRect(Math.round(x-11),Math.round(y-9),Math.round(22*p),1);
    if(!noted){b.bar.fillStyle(0xFF4DB8,1).fillRect(Math.round(x+10),Math.round(y-27),3,3)}
    if(p<.3&&Math.sin(S.t*8)>0){b.mood.setVisible(true).setPosition(Math.round(x+14),Math.round(y-17)).setScale(.7)}else b.mood.setVisible(false)}
  end(){for(const[k,b]of this.m)if(!this.seen.has(k)){[b.bg,b.tail,b.ic,b.num,b.bar,b.mood].forEach(q=>q.destroy());this.m.delete(k)}}
  clear(){for(const b of this.m.values())[b.bg,b.tail,b.ic,b.num,b.bar,b.mood].forEach(q=>q.destroy());this.m.clear()}
}
/* ---- marcador do alvo (E) e da tarefa (!) ---- */
class Marker{
  constructor(sc,tex,ch,col){this.im=sc.add.image(0,0,tex).setOrigin(.5,1).setDepth(9500);this.tx=mkText(sc,0,0,[{t:ch,b:1}],{f:'ui',size:7,color:col||'#2B1A0E',bold:col||'#2B1A0E'}).setDepth(9501)}
  at(x,y){const bob=Math.round(Math.sin(S.t*5)*1.6);this.im.setPosition(Math.round(x),Math.round(y+bob)).setVisible(true);this.tx.setPosition(Math.round(x-this.tx.tw/2+.5),y+bob-13+(9-this.tx.th)/2+.5).setVisible(true)}
  off(){this.im.setVisible(false);this.tx.setVisible(false)}
}
/* ---- ouro e brilhos que sobem: feedback de venda ---- */
const FXQ=[];
function uiEv(k,a,b){FXQ.push({k,a,b,t:S.t})}
/* ---- partículas: usa o emissor do Phaser 3.60+ ---- */
function mkEmitter(sc,x,y,tex,cfg){return sc.add.particles(x,y,tex,cfg)}
/* envolve funções da lógica para disparar efeitos */
const _ledAdd=ledAdd;ledAdd=function(o){const v=_ledAdd(o);uiEv('sale',o,v);return v};
const _loseOrd=loseOrd;loseOrd=function(o,n,a){_loseOrd(o,n,a);uiEv('lost',o,n||a)};
