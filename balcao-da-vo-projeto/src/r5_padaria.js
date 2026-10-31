/* ===== parte 5: cena PADARIA (interior) ===== */
const STX=()=>STXI.map(v=>v/2);
const STITEMS=[['pao_prato','coxinha_prato','cuscuz_tabua'],['bolo_amarelo_pedestal','bolo_chocolate','bolo_amarelo_pedestal'],['xicara_cafe_vapor','xicara_cafe_vapor','xicara_cafe_vapor']];
const STIMA=['miniatura_boneca_baiana','miniatura_farol','gema_arco_iris'];
class Padaria extends Phaser.Scene{
  constructor(){super('Padaria')}
  create(){
    this.vo={};this.bg=this.add.image(0,0,'interior').setOrigin(0).setDepth(-50);
    // o fundo trazia um bloco de piso reto que não batia com o balcão: cobre com o assoalho do salão, em faixas
    for(let x=56;x<392;x+=66){const w=Math.min(66,392-x);this.add.image(x-392,0,'interior').setOrigin(0).setCrop(392,222,w,48).setDepth(-49.5)}
    for(let x=56;x<100;x+=44){this.add.image(x-392,-28,'interior').setOrigin(0).setCrop(392,222,Math.min(44,100-x),28).setDepth(-49.5)}
    this.wall=this.add.rectangle(0,0,385,197,0xffffff,0).setOrigin(0).setDepth(-49).setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.shaft=this.add.image(388,92,'shaft').setOrigin(0,0).setScale(1.05,1.3).setDepth(-40).setBlendMode(Phaser.BlendModes.ADD).setAlpha(.5);
    this.shaft2=this.add.image(430,190,'glow').setScale(5,2.2).setDepth(-39).setBlendMode(Phaser.BlendModes.ADD).setAlpha(.25);
    {const g=this.add.graphics().setDepth(-47);g.fillStyle(0x2A160A,1).fillRect(220,22,80,68);g.fillStyle(0x8A5A34,1).fillRect(221,23,78,66);g.fillStyle(0x5A3A24,1).fillRect(223,25,74,62);
      g.fillStyle(0x1C3A32,1).fillRect(225,27,70,58);g.fillStyle(0x24483E,1).fillRect(225,27,70,2);g.fillStyle(0xFFFFFF,.05).fillRect(229,60,38,1).fillRect(240,72,40,1).fillRect(231,46,22,1);
      g.fillStyle(0x2A160A,1).fillRect(225,85,70,2);g.fillStyle(0xE8E0C8,1).fillRect(232,81,12,2).fillRect(250,82,6,1)}
    this.chalk=mkText(this,260,53,'',{size:8,color:'#EDEFE0',lh:10,align:'center',ox:.5}).setDepth(-45).setOrigin(.5,0);
    this.ents=new EntSet(this);this.speech=new Speech(this);this.obub=new OrderBub(this);
    this.mk=new Marker(this,'mark','E');this.mkq=new Marker(this,'markq','!','#FFFFFF');this.look=addLook(this);
    this.cg=this.add.graphics().setDepth(221);this.wg=this.add.graphics().setDepth(-48);this.wclock=this.add.image(130,127,'ui','ui_relogio').setScale(.8).setDepth(-46);this.wch=this.add.graphics().setDepth(-45);this.cader=this.add.image(246,186,'ui','caderneta_preta').setOrigin(.5,1).setDepth(221.2);this.ckey=null;this.stIm=[[],[],[]];this.vazio=[null,null,null];
    this.oven=this.add.sprite(60,205,'ui').setOrigin(.5,1).setDepth(205).play('forno');
    this.ovenSmoke=mkEmitter(this,60,132,'ui',{frame:['fx_fumaca_1','fx_fumaca_2','fx_fumaca_3'],lifespan:{min:2200,max:3400},speedY:{min:-12,max:-20},speedX:{min:-3,max:6},scale:{start:.7,end:1.7},alpha:{start:.5,end:0},frequency:520});this.ovenSmoke.setDepth(206);
    this.mach=this.add.image(350,187,'ui','maquina_espresso').setOrigin(.5,1).setDepth(221.2);
    this.steam=mkEmitter(this,344,150,'ui',{frame:['fx_fumaca_1','fx_fumaca_2'],lifespan:{min:1100,max:1700},speedY:{min:-14,max:-24},speedX:{min:-3,max:3},scale:{start:.45,end:1},alpha:{start:.7,end:0},frequency:260});this.steam.setDepth(221.4);
    this.reg=this.add.image(284,187,'ui','caixa_registradora').setOrigin(.5,1).setDepth(221.2);
    this.term=this.add.image(300,187,'ui','maquininha_cartao').setOrigin(.5,1).setDepth(221.2).setVisible(false);
    this.radio=this.add.image(405,186,'ui','radio_antigo').setOrigin(.5,1).setDepth(221.2);
    this.notes=mkEmitter(this,405,160,'px',{lifespan:1400,speedY:-16,speedX:{min:-8,max:8},scale:{start:1.2,end:.4},alpha:{start:1,end:0},tint:[0xFFD21F,0xFF4DB8,0x7CF0B8],frequency:240,emitting:false});this.notes.setDepth(221.5);
    this.thermos=this.add.image(380,187,'ui','garrafa_termica_banco').setOrigin(.5,1).setDepth(221.2);
    this.sac=this.add.image(330,186,'ui','sacola_papel_paes').setOrigin(.5,1).setDepth(221.3).setVisible(false);
    this.decor=[];this.dkey=null;
    this.dust=mkEmitter(this,0,0,'dot1',{x:{min:385,max:600},y:{min:100,max:255},lifespan:{min:3500,max:7000},speedX:{min:-6,max:5},speedY:{min:-6,max:3},scale:1,alpha:{start:0,end:.8,ease:'Sine.easeOut'},frequency:150,tint:0xFFEBB8,blendMode:'ADD'});this.dust.setDepth(-38);
    this.sparks=[];this.spT=0;this.tray=[0,1].map(()=>this.add.image(0,0,'ui','pao_prato').setVisible(false));this.hov=-1;
  }
  buildCounter(){
    const pal=PAL(),key=S.era+S.sign+S.mode;if(key===this.ckey)return;this.ckey=key;
    const g=this.cg;g.clear();const x0=CT.x0/2,x1=CT.x1/2,w=x1-x0,top=176,hex=c=>parseInt(c.slice(1),16);
    const base=hex(pal.cnt),lite=hex(mix(pal.cnt,'#FFFFFF',.28)),dark=hex(mix(pal.cnt,'#000000',.38)),topc=hex(S.era===0?'#C99A60':pal.cnt2||'#F4EFE0');
    g.fillStyle(0x1a0c04,1).fillRect(x0-2,top-1,w+4,50);
    g.fillStyle(topc,1).fillRect(x0,top,w,11);g.fillStyle(hex(mix('#FFFFFF','#C99A60',.5)),.55).fillRect(x0,top,w,2);g.fillStyle(0x000000,.18).fillRect(x0,top+9,w,2);
    g.fillStyle(base,1).fillRect(x0,top+11,w,36);g.fillStyle(lite,1).fillRect(x0,top+11,w,2);g.fillStyle(dark,1).fillRect(x0,top+44,w,3);
    for(let x=x0+16;x<x1-8;x+=26){g.fillStyle(dark,.8).fillRect(x,top+15,1,27);g.fillStyle(lite,.5).fillRect(x+1,top+15,1,27)}
    for(let x=x0+3;x<x1-20;x+=52){g.fillStyle(dark,1).fillRect(x,top+18,20,18);g.fillStyle(lite,.6).fillRect(x+1,top+19,18,1);g.fillStyle(base,1).fillRect(x+1,top+20,18,15)}
    g.fillStyle(0x1a0c04,1).fillRect(x0-2,top+47,w+4,2);
    // rodapé de madeira na parede atrás do balcão
    const w2=this.wg;w2.clear();const wd=hex(mix(pal.wall,'#3B1F0E',.42)),wl=hex(mix(pal.wall,'#FFFFFF',.25));
    w2.fillStyle(wd,.92).fillRect(0,144,385,32);w2.fillStyle(wl,.9).fillRect(0,143,385,2);w2.fillStyle(0x000000,.28).fillRect(0,145,385,1);
    for(let x=10;x<385;x+=18){w2.fillStyle(0x000000,.22).fillRect(x,148,1,26);w2.fillStyle(0xFFFFFF,.07).fillRect(x+1,148,1,26)}
    w2.fillStyle(0x000000,.35).fillRect(0,172,385,4);
    this.wall.setFillStyle(hex(mix('#FFFFFF',pal.wall,.82)),S.era===0?0:.45);
    this.chalkKey=null}
  buildDecor(){
    const key=[S.era,S.sign,F.cadeira&&S.era===2].join('|');if(key===this.dkey)return;this.dkey=key;
    this.decor.forEach(d=>d.destroy());this.decor=[];const A=this.add,D=this.decor,add=o=>{D.push(o);return o};
    // mesas, cadeiras, plantas, sacos
    const m1=S.era===2?'mesa_posta':'mesa_redonda';
    add(A.image(430,246,'ui',m1).setOrigin(.5,1).setDepth(246));add(A.image(406,247,'ui','cadeira_direita').setOrigin(.5,1).setDepth(245));add(A.image(454,247,'ui','cadeira_esquerda').setOrigin(.5,1).setDepth(248));
    add(A.image(590,252,'ui','mesa_quadrada').setOrigin(.5,1).setDepth(252));add(A.image(570,253,'ui','cadeira_direita').setOrigin(.5,1).setDepth(251));
    add(A.image(24,250,'ui','vaso_flores').setOrigin(.5,1).setDepth(250));add(A.image(626,252,'ui','vaso_flores').setOrigin(.5,1).setDepth(252));
    add(A.image(34,241,'ui','caixa_papelao_fenda_papel').setOrigin(.5,1).setDepth(241));add(A.image(52,243,'ui','sacola_papel_paes').setOrigin(.5,1).setDepth(243));
    add(A.image(150,200,'ui','cesta_paes').setOrigin(.5,1).setDepth(210).setVisible(false));
    if(S.era===2&&F.cadeira)add(A.image(115,241,'ui','cadeira_frontal').setOrigin(.5,1).setDepth(241));
    if(S.era<2){const r=add(A.sprite(458,250,'chars').setOrigin(.5,1).setDepth(250).setScale(SCI));r.play(S.era===0?'jornal/a':'jornal/b');this.reader=r}else this.reader=null;
    if(S.era===0){add(A.image(180,170,'ui','miniatura_farol').setOrigin(.5,1).setDepth(-30).setVisible(false))}
    this.term.setVisible(S.era===2)}
  chalkText(){
    this.chalk.setVisible(S.mode!=='f2');const key=S.era+S.sign+JSON.stringify(shop().st);if(key===this.chalkKey)return;this.chalkKey=key;
    const st=shop().st,rows=['MENU'].concat(st.map(id=>sname(id)+' '+price(id).toFixed(2).replace('.',',')));this.chalk.setT(rows.map(r=>({t:r})).flatMap((r,i)=>i?[{br:1},r]:[r]),{size:8,color:'#EDEFE0',lh:11,align:'center'});this.chalk.setPosition(260,34)}
  stationAt(wx,wy){const X=STX();for(let i=0;i<3;i++){if(wy>128&&wy<198&&Math.abs(wx-X[i])<(i===2?28:30))return i}return -1}
  update(time,dtms){
    if(!G.ready)return;const dt=Math.min(.05,dtms/1000),cam=this.cameras.main;
    const vis=S.loc==='dentro';cam.setVisible(vis);if(!vis)return;
    const camx=clamp(Math.round(S.icam/2),0,Math.max(0,640-LW));cam.scrollX=camx;
    this.buildCounter();this.buildDecor();this.chalkText();updLook(this,this.look,dt);
    {const m=S.min%60,hh=(S.min/60)%12,g=this.wch;g.clear();const cx=130,cy=127,a1=hh/12*Math.PI*2-Math.PI/2,a2=m/60*Math.PI*2-Math.PI/2;g.lineStyle(1,0x3b1f0e,1);g.lineBetween(cx,cy,Math.round(cx+Math.cos(a1)*5),Math.round(cy+Math.sin(a1)*5));g.lineBetween(cx,cy,Math.round(cx+Math.cos(a2)*8),Math.round(cy+Math.sin(a2)*8))}
    const dk=darkness(),day=clamp(1-dk*1.5,0,1)*(S.rain?.35:1);
    this.shaft.setAlpha(.55*day+.1);this.shaft2.setAlpha(.22*day+.05);
    this.radio.setVisible(true);if(S.radioT>0){if(!this.notes.emitting)this.notes.start()}else if(this.notes.emitting)this.notes.stop();
    this.sac.setVisible(S.era===0&&S.sac==='mesa');
    // itens do balcão por estoque
    const X=STX(),sh=shop(),list=sh.st;
    for(let i=0;i<3;i++){
      const id=list[i],set=id==='ima'?STIMA:STITEMS[i];const stock=S.stock[i];
      for(let j=0;j<3;j++){let im=this.stIm[i][j];if(!im){im=this.add.image(0,0,'ui',set[j]).setOrigin(.5,1).setDepth(221.3);this.stIm[i][j]=im}
        if(im._f!==set[j]){im._f=set[j];im.setFrame(set[j])}
        const ox=i===2?(j-1)*14+8:(j-1)*22,oy=i===2?3:0;im.setPosition(Math.round(X[i]+ox),186+oy+(i===2?1:0)).setVisible(stock>j).setAlpha(1).setScale(i===0||i===1?1:1);
        im.setTint(this.hov===i?0xFFF3B0:0xFFFFFF)}
      if(!this.vazio[i]){const pl=plateText(this,'VAZIO',{size:8,color:'#B03020',tex:'paper9',shadow:null});this.vazio[i]=pl;pl.set(Math.round(X[i]),158,223)}
      const v=stock<=0,pl=this.vazio[i];pl.bg.setVisible(v);pl.t.setVisible(v);if(v)pl.set(Math.round(X[i]),157+Math.round(Math.sin(S.t*3+i)),223)}
    this.mach.setTint(this.hov===2?0xFFF3B0:0xFFFFFF);
    // hover (mouse)
    const p=this.input.activePointer;this.hov=(S.scene==='play'&&S.loc==='dentro')?this.stationAt(p.x/HK+camx,p.y/HK):-1;
    // brilhos
    this.spT-=dt;if(this.spT<=0){this.spT=rnd(1.2,2.6);const i=Math.floor(Math.random()*3);if(S.stock[i]>0){const s=this.add.sprite(X[i]+rnd(-18,18),rnd(162,180),'ui').setDepth(221.6).setOrigin(.5);s.play('spark');s.once('animationcomplete',()=>s.destroy())}}
    // atores
    const E=this.ents,sp=this.speech,ob=this.obub;E.begin();sp.begin();ob.begin();const play=S.scene==='play';
    for(const id in S.npcs){const n=S.npcs[id];if(n.hidden||n.loc!=='dentro')continue;const e=npcShow(this,E,n,true);
      const o=n.ord;if(ordOpen(o)&&atCounter(n)&&S.scene!=='dialog'&&!n.bark)ob.put('n:'+id,e.spr.x,e.top-2,o);
      if(n.bark&&(play||n.bark.ev))sp.put('n:'+id,e.spr.x,e.top-3,n.bark.s,camx)}
    for(const a of S.extras){if(a.loc!=='dentro')continue;const e=extraShow(this,E,a,true);
      if(a.waiting&&ordOpen(a.ord)&&!a.bark&&S.scene!=='dialog')ob.put('x:'+a.id,e.spr.x,e.top-2,a.ord);
      if(a.bark&&play)sp.put('x:'+a.id,e.spr.x,e.top-3,a.bark.s,camx)}
    for(const s of S.staff){const e=E.get('s:'+s.id),x=H2(s.x),y=H2(s.y),sc=scaleFor(y,true);
      const grp=s.st==='go'?'down':s.st==='note'?(hasG(s.id,'caixa')?'caixa':'down'):s.st==='make'?(hasG(s.id,'cafe')?'cafe':'down'):'down';
      e.show({rig:s.id,grp,x,y,s:sc,moving:s.st==='go'});
      if(s.bark&&play)sp.put('s:'+s.id,e.spr.x,e.top-3,s.bark.s,camx)}
    f2Pad(this);playerShow(this,E,true);E.end();sp.end();ob.end();
    const pe=E.m.get('player');S.tray.forEach((id,i)=>{const im=this.tray[i];if(!im||!pe)return;const dr=pe.hd==='left'?-1:1;im.setFrame(ICON[id]||'pao_prato').setVisible(true).setOrigin(.5,1);im.setScale(Math.min(1,15/Math.max(im.width,im.height))).setPosition(Math.round(pe.spr.x+dr*(8+i*2)),Math.round(pe.spr.y-pe.sc_*17-i*7)).setDepth(pe.spr.depth+.2)});
    for(let i=S.tray.length;i<2;i++)this.tray[i].setVisible(false);
    // marcadores
    const tg=S.tgt;
    if(tg&&play&&S.loc==='dentro'){let y,x=H2(tg.x);
      if(tg.k==='st'){y=140;x=X[tg.i]}
      else if(tg.k==='npc'||tg.k==='tour'||tg.k==='vis'){const id=tg.k==='npc'?'n:'+tg.n.id:tg.k==='tour'?'x:'+tg.a.id:null;const e=id&&E.m.get(id);const hb=(tg.k==='npc'&&ordOpen(tg.n.ord))||tg.k==='tour';y=(e?e.top:H2(tg.y)-60)-(hb?30:7)}
      else if(tg.k==='f2'){y=tg.top}
      else if(tg.k==='door'){y=H2(tg.y)-52}else if(tg.k==='obj')y=H2(tg.y)-30;else y=H2(tg.y)-34;
      this.mk.at(x,y)}else this.mk.off();
    const q=questOn();if(q&&play&&q.tg.loc==='dentro'&&!(tg&&tg.k==='quest'))this.mkq.at(H2(q.tg.x),H2(q.tg.y)-44+Math.sin(S.t*4)*2);else this.mkq.off();
    // leitor do jornal: troca de página de vez em quando
    if(this.reader){const k=(Math.floor(S.t/9)%2)?'jornal/b':'jornal/a';if(this.reader.anims.currentAnim&&this.reader.anims.currentAnim.key!==k)this.reader.play(k)}
  }
}
