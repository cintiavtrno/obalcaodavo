/* ===== parte 6: cena UI (HUD, diálogo, menu, cartões, caderno, painéis TV/PM) ===== */
const PT2={lia:'pt2_lia',raimundo:'pt2_raimundo',dandara:'pt2_dandara',davi:'pt2_davi',marta:'pt2_marta',lucia:'pt2_lucia',bia:'pt2_bia',caio:'pt2_caio',turista:'pt2_turista',pm:'pt2_pm',tv:'pt2_tv'};
const PORT={lia:'pt_lia',vo:'pt_vo_neutro',raimundo:'pt_raimundo',dandara:'pt_dandara',davi:'pt_davi',marta:'pt_marta',lucia:'pt_lucia',turista:'pt_turista',bia:'pt_bia',caio:'pt_caio',pm:'pt_pm',tv:'pt_tv',coord:'pt_homem_terno_cabelo_preto',fiscal:'pt_homem_barba_cheia_neutro',operario:'pt_homem_jovem_sorrindo',ze:'pt_idoso_bone_bigode_neutro_a',zefa:'pt_mulher_lenco_laranja_neutra',nego:'pt_homem_barba_curta_neutro'};
const hexn=c=>parseInt(String(c).replace('#',''),16)||0;
const CHROME='#9FD0FF';
class UI extends Phaser.Scene{
  constructor(){super('UI')}
  create(){
    this.hv={};this.fxs=[];this.cardV=-1;this.nbV=-1;this.scroll=0;this.maxScroll=0;this.dlgV=-1;this.menuV=-1;
    this.buildHud();this.buildHint();this.buildDlg();this.buildMacro();this.buildThought();this.buildMenu();this.buildCard();this.buildPanel();this.book=new Book(this);this.cutv=new CutView(this);
    this.fade=this.add.rectangle(0,0,LW,LH,0x2a1a10,0).setOrigin(0).setDepth(1000);
    this.input.on('pointerdown',(p,over)=>this.onDown(p,over));
    this.input.on('pointermove',p=>{if(p.isDown&&S.scene==='nb'&&this.drag&&this.book){this.book.scroll(this.drag.x<BK.sp?'l':'r',this.drag.y-p.y/HK);this.drag.y=p.y/HK}});
    this.input.on('pointerup',p=>{const d=this.drag;this.drag=null;if(d&&S.scene==='card'){const dx=p.x/HK-d.x0;if(Math.abs(dx)>28)this.flip(dx<0?1:-1)}});
    this.input.on('wheel',(p,o,dx,dy)=>{if(S.scene==='nb'&&this.book){this.book.wheel(p,dy);return}if(S.scene==='card'){const t=Date.now();if(t-(this._wt||0)>350){this._wt=t;this.flip(Math.sign(dy))}}});
  }
  /* ---------- HUD ---------- */
  buildHud(){
    const A=this.add,D=100;this.hud=[];const h=o=>{this.hud.push(o);return o};
    h(A.nineslice(0,0,'wood9d',null,LW,21,5,5,5,5).setOrigin(0).setDepth(D));
    h(A.rectangle(0,21,LW,1,0x000000,.35).setOrigin(0).setDepth(D));
    this.clockIm=h(A.image(14,11,'ui','ui_relogio').setScale(.62).setDepth(D+1));this.hands=h(A.graphics().setDepth(D+2));
    this.tClock=h(mkText(this,29,3,'',{f:'ui',size:12,color:TXT.yel,shadow:TXT.dark,lh:15}).setDepth(D+1));
    this.cupIm=h(A.image(142,11,'ui','ui_icone_xicara').setDepth(D+1));this.tCups=h(mkText(this,152,3,'',{f:'ui',size:12,color:TXT.cream,shadow:TXT.dark,lh:15}).setDepth(D+1));
    this.stars=[0,1,2,3,4].map(i=>h(A.image(218+i*13,11,'ui','ui_estrela_cheia').setScale(.8).setTint(0x6B4A32).setDepth(D+1)));
    this.coinIm=h(A.sprite(292,11,'ui').setScale(.9).setDepth(D+1).play('coin'));this.tCoin=h(mkText(this,302,3,'',{f:'ui',size:12,color:TXT.yel,shadow:TXT.dark,lh:15}).setDepth(D+1));
    this.nbBtn=h(A.nineslice(LW-92,3,'paper9',null,48,15,4,4,4,4).setOrigin(0).setDepth(D+1).setInteractive({useHandCursor:true}));this.tNb=h(mkText(this,LW-68,5,'',{f:'ui',size:8,color:TXT.ink,ox:.5,lh:11}).setDepth(D+2));
    this.nbDot=h(A.rectangle(LW-47,5,5,5,0xFF4DB8).setDepth(D+3).setVisible(false));
    this.yearPl=h(A.nineslice(440,3,'plate9',null,36,15,4,4,4,4).setOrigin(0).setDepth(D+1).setTint(0x2E4C80));this.tYear=h(mkText(this,458,4,'',{f:'ui',size:9,color:TXT.cream}).setDepth(D+2));
    this.nbBtn.on('pointerdown',()=>{this.uiHit=true;S.scene==='nb'?closeNb():openNb()});
    // tarefa (embaixo da barra) e bandeja
    this.taskPl=A.nineslice(4,25,'paper9',null,170,13,5,5,5,5).setOrigin(0).setDepth(D).setVisible(false);this.tTask=mkText(this,9,26,'',{size:8,color:TXT.ink}).setDepth(D+1).setVisible(false);
    this.trayPl=A.nineslice(LW-86,25,'dark9',null,82,15,4,4,4,4).setOrigin(0).setDepth(D).setInteractive({useHandCursor:true});this.tTray=mkText(this,LW-82,28,'',{f:'ui',size:8,color:TXT.cream,shadow:TXT.dark}).setDepth(D+1);
    this.trayIc=[0,1].map(i=>{const im=A.image(LW-30+i*13,32,'ui','pao_prato').setDepth(D+2).setVisible(false).setInteractive({useHandCursor:true});im.on('pointerdown',()=>{this.uiHit=true;if(S.scene==='play')backTrayAt(i)});return im});
    this.trayPl.on('pointerdown',()=>{this.uiHit=true;if(S.scene==='play')backTray()});
    this.objTags=[0,1].map(i=>{const bg=A.nineslice(4,25,'paper9',null,90,14,4,4,4,4).setOrigin(0).setDepth(D).setVisible(false).setInteractive({useHandCursor:true});const t=mkText(this,10,26,'',{size:8,color:TXT.ink}).setDepth(D+1).setVisible(false);bg.on('pointerdown',()=>{this.uiHit=true;if(S.scene==='play'){S.nbTab=0;openNb()}});bg._keep=false;t._keep=false;return{bg,t}});
    this.hud.push(this.taskPl,this.tTask,this.trayPl,this.tTray,...this.trayIc);
    this.bump=0;
  }
  updHud(dt){
    const show=!(S.scene==='card'||S.scene==='cut')&&!(S.fx&&S.fx.pan);this.hud.forEach(o=>o.setVisible(show&&(o._keep!==false)));
    if(!show){f2Hud(this,false);return}
    const vist=S.mode==='vist',hv=this.hv;
    const ck=clockTxt();if(hv.ck!==ck){hv.ck=ck;this.tClock.setT(ck)}
    // ponteiros do relógio (Graphics): hora e minuto
    const m=S.min%60,hh=(S.min/60)%12,g=this.hands;g.clear();const cx=14,cy=11,a1=hh/12*Math.PI*2-Math.PI/2,a2=m/60*Math.PI*2-Math.PI/2;
    g.lineStyle(1,0x3b1f0e,1);g.lineBetween(cx,cy,Math.round(cx+Math.cos(a1)*4),Math.round(cy+Math.sin(a1)*4));g.lineBetween(cx,cy,Math.round(cx+Math.cos(a2)*6),Math.round(cy+Math.sin(a2)*6));
    // xícaras / moedas / ano
    const L=S.led||{vendas:0,fiado:0,loc:0,vis:0};
    let cupsTxt,coinTxt,year;
    f2Hud(this,true);
    if(S.mode==='f2'){cupsTxt=' ';coinTxt=' ';year='2026';this.stars.forEach(s=>s.setVisible(false));this.coinIm.setVisible(false);this.cupIm.setVisible(false)}
    else if(vist){const V=S.vs||{done:{},cad:0,cult:0};cupsTxt='Lista '+Object.keys(V.done||{}).length+'/4';coinTxt='Pontos '+((V.cad||0)+(V.cult||0))+'/3';year='';this.stars.forEach(s=>s.setVisible(false));this.coinIm.setVisible(false);this.cupIm.setVisible(false)}
    else{const n=L.loc+L.vis;cupsTxt=Math.min(n,5)+'/5'+(n>5?' +'+(n-5):'');coinTxt=brl(L.vendas)+(L.fiado>0?' +'+brl(L.fiado).replace('R$ ','')+' fiado':'');year=ERAS[S.era].year;
      this.stars.forEach((s,i)=>{s.setVisible(true);const full=n>i;if(s._f!==full){s._f=full;if(full)s.clearTint();else s.setTint(0x6B4A32);if(full)this.tweens.add({targets:s,scale:{from:1.3,to:.8},duration:360,ease:'Back.easeOut'})}});this.coinIm.setVisible(true);this.cupIm.setVisible(true)}
    if(hv.cups!==cupsTxt){hv.cups=cupsTxt;this.tCups.setT(cupsTxt)}
    if(hv.coin!==coinTxt){hv.coin=coinTxt;this.tCoin.setT(coinTxt,{size:L.fiado>0&&!vist?10:12});if(!vist&&hv.coinBumped!==false)this.tweens.add({targets:this.tCoin,y:{from:0,to:3},duration:220,ease:'Quad.easeOut'})}
    if(vist){const cx=Math.max(120,29+this.tClock.tw+14);this.tCups.setX(cx);this.tCoin.setX(cx+this.tCups.tw+16)}else{this.tCoin.setX(302);this.tCups.setX(152)}
    if(hv.year!==year){hv.year=year;this.tYear.setT(year||' ');const w=this.tYear.tw+10,hh=Math.ceil(this.tYear.th)+1;this.yearPl.setSize(w,hh).setPosition(LW-4-w,Math.max(1,(21-hh)/2));this.tYear.setPosition(LW-4-w+5,Math.max(1,(21-hh)/2)+.5)}this.yearPl.setVisible(!!year);
    const ncl=Object.keys(S.clues).length+'',nbt='Caderno '+ncl;if(hv.nb!==nbt){hv.nb=nbt;this.tNb.setT(nbt)}this.tNb.setX(LW-68);this.nbDot.setVisible(!!S.newClue&&!vist&&show);
    // tarefa
    const q=questOn(),t=q?'Recado da vó: '+q.lab+(q.tg.loc!==S.loc?(q.tg.loc==='dentro'?' (no balcão)':' (lá fora)'):''):'';
    if(hv.task!==t){hv.task=t;if(t){this.tTask.setT(t,{w:0});this.taskPl.setSize(this.tTask.tw+12,this.tTask.th+3)}}
    this.taskPl.setVisible(!!t);this.tTask.setVisible(!!t);
    const OL=(S.objs&&!vist)?objList():[];let oy=t?42:25;this.objTags.forEach((g,i)=>{const o=OL[i];if(!o){g.bg.setVisible(false);g.t.setVisible(false);return}const[c,gg,ok]=objProg(o),s=(ok?'✓ ':'★ ')+o.s+'  '+c+'/'+gg;if(g.s!==s){g.s=s;g.t.setT(s,{w:0});g.bg.setSize(g.t.tw+14,g.t.th+3)}g.bg.setPosition(4,oy).setVisible(true).setTint(ok?0xC8F0D0:0xFFFFFF);g.t.setPosition(10,oy+2).setVisible(true);oy+=g.t.th+6});
    // bandeja
    const tr=vist?'':'Bandeja';if(hv.tray!==tr){hv.tray=tr;this.tTray.setT(tr||' ')}
    const noTray=vist||S.mode==='f2';this.trayPl.setVisible(!noTray);this.tTray.setVisible(!noTray);
    for(let i=0;i<2;i++){const im=this.trayIc[i],id=S.tray[i];if(id&&!vist){im.setFrame(ICON[id]||'pao_prato').setVisible(true);im.setScale(Math.min(1,13/Math.max(im.width,im.height)));im.setPosition(LW-26+i*14,32)}else im.setVisible(false)}
    if(!vist&&!S.tray.length){this.tTray.setT('Bandeja vazia');this.hv.tray=null}
  }
  /* ---------- dica (E) ---------- */
  buildHint(){
    this.hintBg=this.add.nineslice(26,LH-5,'dark9',null,200,16,4,4,4,4).setOrigin(0,1).setDepth(110).setInteractive({useHandCursor:true});
    this.hintTx=mkText(this,33,LH-9,'',{f:'ui',size:9,color:TXT.cream,bold:'#F2C46A'}).setDepth(111);
    this.eBtn=this.add.nineslice(6,LH-5,'key9',null,17,17,4,4,4,5).setOrigin(0,1).setDepth(112).setInteractive({useHandCursor:true});this.eTx=mkText(this,14.5,LH-20,'E',{f:'ui',size:9,color:TXT.ink,ox:.5}).setDepth(113);
    // legenda de controles (também são botões: servem no toque)
    {const L=[['E','usar/falar',()=>interact()],['C','caderno',()=>openNb()],['Q','devolver',()=>backTray()]];this.keysL=[];let x=0;
     this.keysBg=this.add.nineslice(0,LH-5,'dark9',null,10,17,4,4,4,4).setOrigin(0,1).setDepth(110);
     L.forEach(([k,lab,fn])=>{const b=this.add.nineslice(0,0,'key9',null,13,14,4,4,4,5).setOrigin(0).setDepth(112).setInteractive({useHandCursor:true});const kt=mkText(this,0,0,k,{f:'ui',size:8,color:TXT.ink,ox:.5}).setDepth(113);const lt=mkText(this,0,0,lab,{f:'ui',size:7.5,color:'#E6D3AE'}).setDepth(113).setInteractive({useHandCursor:true});
       const go=()=>{this.uiHit=true;if(S.scene==='play'||S.scene==='nb')fn()};b.on('pointerdown',go);lt.on('pointerdown',go);this.keysL.push({b,kt,lt})});
     const mv=mkText(this,0,0,TOUCH?'toque no chão para andar':'setas ou clique para andar',{f:'ui',size:7.5,color:'#CDB894'}).setDepth(113);this.keysMv=mv;
     let w=6;this.keysL.forEach(o=>{w+=15+o.lt.tw+7});w+=mv.tw+4;const x0=LW-6-w;this.keysBg.setPosition(x0,LH-5).setSize(w,18);x=x0+5;
     this.keysL.forEach(o=>{o.b.setPosition(x,LH-5-16);o.kt.setPosition(x+6.5,LH-5-15);o.lt.setPosition(x+15,LH-5-14);x+=15+o.lt.tw+7});mv.setPosition(x,LH-5-14);this.keysW=w}
    this.hintBg.on('pointerdown',()=>{this.uiHit=true;interact()});this.eBtn.on('pointerdown',()=>{this.uiHit=true;interact()});
  }
  updHint(){
    const t=(S.scene==='play'&&!(S.fx&&S.fx.pan))?S.hintText||'':'';const vis=!!t;
    if(this.hv.hint!==t){this.hv.hint=t;if(t){let rr=t.replace(/^E: /,'');rr=rr.charAt(0).toUpperCase()+rr.slice(1);this.hintTx.setT(rr,{w:LW-60-(this.keysW||0)});const h=this.hintTx.th+5;this.hintBg.setSize(this.hintTx.tw+14,h);this.hintTx.setPosition(33,LH-5-h+2.5);this.eBtn.setSize(17,Math.max(17,h))}}
    const kv=S.scene==='play'&&!(S.fx&&S.fx.pan)&&S.mode!=='vist';[this.keysBg,this.keysMv,...this.keysL.flatMap(o=>[o.b,o.kt,o.lt])].forEach(o=>o.setVisible(kv));
    this.hintBg.setVisible(vis);this.hintTx.setVisible(vis);const ev=vis&&/^E: /.test(t);this.eBtn.setVisible(ev);this.eTx.setVisible(ev);this.hintBg.setX(ev?26:6);this.hintTx.setX(ev?33:13);if(ev)this.eTx.setY(LH-5-(this.eBtn.lh||17)+2.5);
  }
  /* ---------- nuvem de pensamento: o que acontece fora da tela (ônibus, viatura) ---------- */
  buildThought(){
    const A=this.add,c=this.thC=A.container(0,0).setDepth(160).setAlpha(0).setVisible(false);
    this.thG=A.graphics();this.thT=mkText(this,LW/2,0,'',{size:8,color:'#2B1A0E',ox:.5});c.add([this.thG,this.thT]);
    this.th={q:[],cur:null,t:0,bus:null,pol:{}}}
  drawThought(s){
    this.thT.setT(s,{w:180});const w=this.thT.tw+16,h=this.thT.th+8,x=Math.round(LW-6-w),y=44,g=this.thG,R=(col,xx,yy,ww,hh,a)=>{g.fillStyle(col,a==null?1:a);g.fillRect(xx,yy,ww,hh)};g.clear();
    R(0x1C110A,x+1,y+2,w,h,.45);R(0x1C110A,x,y,w,h);R(0xF2E5C6,x+1,y+1,w-2,h-2);R(0xE3D0A6,x+1,y+h-2,w-2,1);
    R(0xE8DCAA,x+5,y-2,12,4,.9);R(0xE8DCAA,x+w-17,y-2,12,4,.9);
    this.thT.setPosition(Math.round(x+w/2),y+4)}
  updThought(dt){
    const T=this.th,bus=!!(S.busX&&S.busX<2800&&S.era>0);
    if(T.bus!==null&&bus!==T.bus)T.q.push(bus?'Um ônibus de turistas parou perto do largo.':'O ônibus de turistas foi embora.');T.bus=bus;
    const k='p'+S.era;if(S.era===2&&F.pol==='bateu'&&!T.pol[k]&&S.scene==='play'){T.pol[k]=1;T.q.push('Tem viatura da PM parada perto do largo.')}
    if(!T.cur&&T.q.length&&S.scene==='play'){T.cur=T.q.shift();T.t=0;this.drawThought(T.cur)}
    if(T.cur){T.t+=dt;this.thC.setVisible(true).setAlpha(Math.max(0,Math.min(1,T.t/.3,(5-T.t)/.4)));if(T.t>5){T.cur=null;this.thC.setVisible(false)}}}
  /* ---------- zoom da mesa de dominó (painel macro, escala 2x) ---------- */
  buildMacro(){
    const A=this.add,c=this.macro=A.container(DX,0).setDepth(150).setVisible(false).setAlpha(0);this.mAl=0;
    const g=A.graphics(),R=(x,y,w,h,col)=>{g.fillStyle(col,1);g.fillRect(x,y,w,h)};
    R(70,24,340,152,0x2A160A);R(72,26,336,148,0xE6D3A4);                       // moldura + parede
    R(72,88,336,4,0xB89A6A);R(72,92,336,82,0x8E8478);                           // rodapé + calçada
    for(let y=92,r=0;y<174;y+=14,r++){R(72,y,336,1,0x6F675D);for(let x=72+(r%2)*28;x<408;x+=56)R(x,y,1,14,0x6F675D)}
    R(300,36,44,46,0x3B2A1A);R(302,38,40,42,0x2F4F86);R(321,38,2,42,0x1E3560);R(302,58,40,2,0x1E3560); // janela do Seu Zé
    R(296,82,52,4,0xD8C690);
    c.add(g);
    const sh=A.image(240,166,'shadow').setScale(6,1.7).setAlpha(.9);c.add(sh);
    const sp=A.sprite(240,168,'ui').setOrigin(.5,1).setScale(2).play('domino');c.add(sp);
    const t=mkText(this,240,29,'MESA DO SEU ZÉ',{f:'ui',size:8,color:'#5A3A1A',ox:.5});c.add(t);
  }
  updMacro(dt){
    const on=S.scene==='dialog'&&S.focus==='domino',dg=S.scene==='dialog'&&S.focus&&S.focus.k==='degrau';if(S.scene!=='dialog'&&S.scene!=='fade'&&S.scene!=='menu')S.focus=null;
    this.mAl=clamp(this.mAl+(on?1:-1)*dt*5,0,1);this.macro.setAlpha(this.mAl).setVisible(this.mAl>0);
    if(dg&&this.dgV!==S.focus.v){this.dgV=S.focus.v;this.buildDegrau(S.focus)}
    this.dAl=clamp((this.dAl||0)+(dg?1:-1)*dt*5,0,1);if(this.dgC){this.dgC.setAlpha(this.dAl).setVisible(this.dAl>0)}}
  /* zoom do degrau: recorte do próprio cenário em 2x, Lia e a outra pessoa sentadas atrás do degrau */
  buildDegrau(f){if(this.dgC)this.dgC.destroy(true);const A=this.add,c=this.dgC=A.container(DX,0).setDepth(150).setAlpha(0);
    const key=['rua91','rua96','rua00'][S.era>2?1:S.era],cx=clamp(H2(f.x),84,1264-84),x0=cx-84,y0=176,k=2;
    const g=A.graphics();g.fillStyle(0x1C110A,1).fillRect(70,24,340,152);c.add(g);
    const im=A.image(72-x0*k,26-y0*k,key).setOrigin(0).setScale(k).setCrop(x0,y0,168,74);c.add(im);const fx=[];stageFix(this,fx,key,72,26,336,148,x0,y0,k);fx.forEach(o=>c.add(o));
    const sh=A.image(240,150,'shadow').setScale(5,1.4).setAlpha(.8);c.add(sh);
    const fr=(rig)=>{const nm=(GROUPS[rig+'/down']||GROUPS[rig+'/sdown']||[])[0];return nm};
    [[f.who,262],['lia',214]].forEach(([rig,x])=>{const nm=fr(rig);if(!nm)return;const sp=A.image(x,172,'chars',nm).setOrigin(.5,1).setScale(2.1);c.add(sp)});
    const st=A.graphics();st.fillStyle(0x1C110A,1).fillRect(72,140,336,36);st.fillStyle(0xB8A888,1).fillRect(72,141,336,34);st.fillStyle(0xD8CCAE,1).fillRect(72,141,336,3);st.fillStyle(0x8E8068,1).fillRect(72,172,336,3);
    for(let x=72;x<408;x+=42){st.fillStyle(0x9A8C70,1).fillRect(x,144,1,28)}c.add(st);
    const t=mkText(this,240,29,f.who==='raimundo'?'O DEGRAU DO SOBRADO':'NO DEGRAU',{f:'ui',size:8,color:'#F5ECD8',ox:.5});const tb=A.graphics();tb.fillStyle(0x1C110A,1).fillRect(240-t.tw/2-6,27,t.tw+12,t.th+3);tb.fillStyle(0x2E4C80,1).fillRect(240-t.tw/2-5,28,t.tw+10,t.th+1);c.add([tb,t])}
  /* ---------- caixa de diálogo ---------- */
  buildDlg(){
    const A=this.add,D=200;this.dl=[];const d=o=>{this.dl.push(o);return o};
    this.dBox=d(A.nineslice(6,192,'dark9',null,LW-12,74,4,4,4,4).setOrigin(0).setDepth(D).setInteractive());
    this.dPaper=A.nineslice(52,199,'paper9',null,416,60,5,5,5,5).setOrigin(0).setDepth(D+1).setVisible(false);
    this.dFrame=d(A.nineslice(9,197,'frame',null,40,44,5,5,5,5).setOrigin(0).setDepth(D+2));this.dPort=d(A.image(29,219,'ui','pt_lia').setDepth(D+2.5));
    this.dTag=d(A.nineslice(58,185,'plate9',null,70,14,4,4,4,4).setOrigin(0).setDepth(D+3));this.dTagT=d(mkText(this,64,187,'',{f:'ui',size:9,color:TXT.ink}).setDepth(D+4));
    this.dTx=d(mkText(this,58,203,'',{size:10,color:TXT.cream,w:404,lh:13}).setDepth(D+3));
    this.dArrow=A.sprite(458,252,'ui','ui_seta_proxima_a').setDepth(D+4).setVisible(false);this.dKey=null;this.dK=A.nineslice(0,0,'key9',null,13,14,4,4,4,5).setOrigin(0).setDepth(D+4).setVisible(false);this.dKT=mkText(this,0,0,'E',{f:'ui',size:8,color:TXT.ink,ox:.5}).setDepth(D+5).setVisible(false);this.dKL=mkText(this,0,0,'continuar',{f:'ui',size:8,color:'#CDB894'}).setDepth(D+5).setVisible(false);
    this.dBox.on('pointerdown',()=>{this.uiHit=true;if(S.scene==='dialog'&&S.d&&!S.d.ch)advance()});
    this.dChoice=[];this.dl.forEach(o=>o.setVisible(false));
    this.chPanel=A.nineslice(6,192,'dark9',null,LW-12,74,4,4,4,4).setOrigin(0).setDepth(D).setVisible(false);
  }
  clearChoices(){this.dChoice.forEach(c=>c.forEach(o=>o.destroy()));this.dChoice=[]}
  makeChoices(list,y0,fn,o){ // botões numerados; fn(i). Cada linha cresce se o texto quebrar.
    this.clearChoices();const base=o&&o.rowH||15,W=o&&o.cost?LW-120:LW-50;
    const txs=list.map(it=>mkText(this,0,0,it.lab,{size:9,color:TXT.cream,w:W,lh:12}).setDepth(222));
    const hs=txs.map(t=>Math.max(base,t.th+5)),total=hs.reduce((a,b)=>a+b,0)+4;const top=y0-total;let y=top+2;
    list.forEach((it,i)=>{const rowH=hs[i];
      const bg=this.add.nineslice(12,y,'row9',null,LW-24,rowH-2,2,2,2,2).setOrigin(0).setDepth(220).setInteractive({useHandCursor:true});
      const bgn=this.add.nineslice(15,y+Math.round((rowH-2-13)/2),'key9',null,12,13,4,4,4,5).setOrigin(0).setDepth(221);const num=mkText(this,21,y+Math.round((rowH-2-13)/2)+1,String(i+1),{f:'ui',size:8,color:TXT.ink,ox:.5}).setDepth(222);
      const tx=txs[i].setPosition(30,y+2);
      const parts=[bg,bgn,num,tx];
      if(it.cost){const c=mkText(this,LW-18,y+2,it.cost,{f:'ui',size:8,color:'#CDB894'}).setDepth(222);c.setX(Math.round(LW-18-c.tw));parts.push(c)}
      bg.on('pointerover',()=>bg.setTexture('row9h'));bg.on('pointerout',()=>bg.setTexture('row9'));
      bg.on('pointerdown',()=>{this.uiHit=true;fn(i)});this.dChoice.push(parts);y+=rowH});
    return top}
  updDlg(){
    const inD=S.scene==='dialog'&&S.d,inM=S.scene==='menu'&&S.menu;const pan=S.fx&&S.fx.pan;
    if(!inD||(inD&&S.d.ch)){if(this.dK){this.dK.setVisible(false);this.dKT.setVisible(false);this.dKL.setVisible(false)}}
    if(!inD&&!inM){if(this.dlgOn){this.dl.forEach(o=>o.setVisible(false));this.clearChoices();this.chPanel.setVisible(false);this.dlgOn=false;this.dKey=null}return}
    this.dlgOn=true;
    if(inD&&S.d.ch){ // escolhas do diálogo
      const key='c'+S.d.v;this.dl.forEach(o=>o.setVisible(false));
      if(this.dKey!==key){this.dKey=key;const opts=S.d.opts.map(o=>({lab:o.a?o.t:'“'+o.t+'”'}));const top=this.makeChoices(opts,LH-5,i=>pickCh(S.d.opts[i]),{rowH:opts.some(o=>o.lab.length>66)?15:15});
        this.chPanel.setPosition(6,top-4).setSize(LW-12,LH-5-top+8).setVisible(true)}
      return}
    if(inM){const m=S.menu;const key='m'+m.v+m.lvl;this.dl.forEach(o=>o.setVisible(false));
      if(this.dKey!==key){this.dKey=key;const w=WHO[m.n.id];const opts=m.opts.map(o=>({lab:o[0],cost:o[1]}));
        const top=this.makeChoices(opts,LH-5,i=>{m.opts[i][2]()},{rowH:15,cost:true});
        this.menuTx=this.menuTx||mkText(this,0,0,'',{size:9,color:TXT.cream,w:LW-40,lh:12}).setDepth(223);this.menuTx.setT(m.txt||'',{w:LW-40});
        this.menuTag=this.menuTag||this.add.nineslice(10,0,'plate9',null,60,13,4,4,4,4).setOrigin(0).setDepth(224);this.menuTagT=this.menuTagT||mkText(this,0,0,'',{f:'ui',size:8,color:TXT.ink}).setDepth(225);
        this.menuTagT.setT(w?w.n.toUpperCase():' ',{color:plateTxt(w?w.c:'#E3A63C')});const tagH=this.menuTagT.th+3;this.menuTag.setSize(this.menuTagT.tw+10,tagH).setTint(hexn(uiC(w?w.c:'#E3A63C')));
        const head=6+tagH+3+this.menuTx.th+4,pt=top-4-head;this.chPanel.setPosition(6,pt).setSize(LW-12,LH-5-pt).setVisible(true);
        this.menuTag.setPosition(14,pt+6).setVisible(true);this.menuTagT.setPosition(19,pt+7.5).setVisible(true);this.menuTx.setPosition(14,pt+6+tagH+3).setVisible(true)}
      return}
    // linha de fala
    this.chPanel.setVisible(false);this.clearChoices();if(this.menuTx){this.menuTx.setVisible(false);this.menuTag.setVisible(false);this.menuTagT.setVisible(false)}
    const d=S.d;if(!d.cur){this.dl.forEach(o=>o.setVisible(false));return}
    const who=WHO[d.cur[0]],full=d.cur[1];
    if(this.dKey!=='l'+d.v){this.dKey='l'+d.v;
      const port=who&&(d.cur[0]==='vo'?(VOEXP==='ri'||VOEXP==='acena'?'pt_vo_sorriso':VOEXP==='triste'?'pt_vo_triste':'pt_vo_neutro'):PORT[d.cur[0]]);
      this.hasPort=!!port;if(port){const k2=PT2[d.cur[0]];if(k2&&this.textures.exists(k2)){this.dPort.setTexture(k2)}else if(k2){this.dPort.setTexture('xtra',k2==='pt2_tv'&&S.era>=2?'pt2_tv2':k2)}else this.dPort.setTexture('ui',port);}
      const tw=this.hasPort?LW-76:LW-44,tx0=this.hasPort?58:16,lh=13,nL=layoutRuns(toRuns(full),10,tw,lh,'text').lines.length,th=nL*lh+4,tagH=who?17:0,h=Math.max(this.hasPort?54:34,10+tagH+th+8),top=LH-5-h;
      this.dBox.setPosition(6,top).setSize(LW-12,h);this.dFrame.setPosition(10,top+6);this.dPort.setPosition(30,top+28);
      if(who){this.dTagT.setT(who.n.toUpperCase(),{color:plateTxt(who.c)});this.dTag.setSize(this.dTagT.tw+10,this.dTagT.th+3).setTint(hexn(uiC(who.c)));this.dTag.setPosition(tx0,top+6);this.dTagT.setPosition(tx0+5,top+7.5)}
      this.dTx.setPosition(tx0,top+8+tagH);this.dKP=[LW-12-6-13,LH-5-6-14];this.dFull=full;this.dNar=!who;this.dTyped=-1}
    this.dl.forEach(o=>o.setVisible(true));
    this.dPort.setVisible(this.hasPort);this.dFrame.setVisible(this.hasPort);this.dTag.setVisible(!!who);this.dTagT.setVisible(!!who);
    const k=Math.floor(d.typed);if(this.dTyped!==k){this.dTyped=k;this.dTx.setT(full,{w:this.hasPort?LW-76:LW-44,reveal:k,color:this.dNar?'#E6D3AE':TXT.cream})}
    const done=d.typed>=full.length;this.dArrow.setVisible(false);if(this.dKP){const[kx,ky]=this.dKP;this.dK.setPosition(kx,ky).setVisible(done);this.dKT.setPosition(kx+6.5,ky+1.5).setVisible(done);this.dKL.setPosition(kx-4-this.dKL.tw,ky+2).setVisible(done)}}
  /* ---------- menu de conversa: usa o mesmo painel ---------- */
  buildMenu(){}
  /* ---------- cartões e caderno ---------- */
  buildCard(){
    const A=this.add;this.cardBg=A.image(0,0,'cardbg').setOrigin(0).setDepth(400).setVisible(false);this.cardTint=A.rectangle(0,0,LW,LH,0x000000,0).setOrigin(0).setDepth(401).setVisible(false);
    this.cardCont=A.container(0,0).setDepth(402).setVisible(false);this.cardTop=A.nineslice(0,0,'wood9d',null,LW,8,4,4,4,4).setOrigin(0).setDepth(410).setVisible(false);
    this.cardBar=A.nineslice(0,LH-30,'wood9d',null,LW,30,5,5,5,5).setOrigin(0).setDepth(410).setVisible(false);
    this.cardBtn=A.nineslice(LW/2,LH-15,'btn9h',null,120,18,4,4,4,4).setOrigin(.5).setDepth(411).setVisible(false).setInteractive({useHandCursor:true});this.cardBtnT=mkText(this,LW/2,LH-15,'',{f:'ui',size:10,color:TXT.ink,ox:.5,oy:.5}).setDepth(412).setVisible(false);
    this.cardBtn.on('pointerdown',()=>{this.uiHit=true;this.cardGo()});
    this.cardShade=A.rectangle(0,0,LW,LH,0x120A05,1).setOrigin(0).setDepth(400).setVisible(false);this.cardFrame=A.graphics().setDepth(401).setVisible(false);drawBookFrame(this.cardFrame,CK);
    this.cardPg=mkText(this,12,LH-19,'',{f:'ui',size:8,color:'#E6D3AE'}).setDepth(412).setVisible(false);
    this.cardNav=[-1,1].map(d=>{const bg=A.nineslice(0,LH-15,'btn9s',null,64,18,4,4,4,4).setOrigin(.5).setDepth(411).setVisible(false).setInteractive({useHandCursor:true});const t=mkText(this,0,LH-15,d<0?'‹ Voltar':'Virar ›',{f:'ui',size:9,color:TXT.cream,ox:.5,oy:.5}).setDepth(412).setVisible(false);bg.on('pointerdown',()=>{this.uiHit=true;this.flip(d)});return{bg,t,d}});
    this.cardOpts=[0,1,2].map(i=>{const bg=A.nineslice(0,LH-15,'btn9h',null,120,18,4,4,4,4).setOrigin(.5).setDepth(411).setVisible(false).setInteractive({useHandCursor:true});const t=mkText(this,0,LH-15,'',{f:'ui',size:10,color:TXT.ink,ox:.5,oy:.5}).setDepth(412).setVisible(false);bg.on('pointerdown',()=>{this.uiHit=true;this.cardPick(i)});return{bg,t}});
    this.sbar=A.rectangle(LW-3,10,2,20,0xFFD21F,.8).setOrigin(.5,0).setDepth(413).setVisible(false);
    this.nbPanel=A.nineslice(8,4,'cover9',null,464,262,5,5,5,5).setOrigin(0).setDepth(300).setVisible(false);
    {const g=this.nbPage=A.graphics().setDepth(301).setVisible(false);g.fillStyle(0x1C110A,1);g.fillRect(15,31,450,206);g.fillStyle(0xF2E5C6,1);g.fillRect(16,32,448,204);g.fillStyle(0xB7C4D2,.7);for(let y=46;y<236;y+=13)g.fillRect(16,y,448,1);g.fillStyle(0xC4573F,.6);g.fillRect(29,32,1,204)}this.nbShade=A.rectangle(0,0,LW,LH,0x000000,.55).setOrigin(0).setDepth(299).setVisible(false).setInteractive();
    this.nbCont=A.container(0,0).setDepth(302).setVisible(false);
    const TABN=['Pistas','Gente','Objetivos','Acontecido'];this.nbTabC=[0xB4452D,0x3E7B5C,0xB9792A,0x2E4C80];
    this.nbTabs=[0,1,2,3].map(i=>{const bg=A.nineslice(16+i*58,9,'plate9',null,55,19,4,4,4,4).setOrigin(0).setDepth(304).setInteractive({useHandCursor:true}).setVisible(false);const t=mkText(this,16+i*58+27.5,12,TABN[i],{f:'ui',size:9,color:TXT.cream,ox:.5}).setDepth(305).setVisible(false);bg.on('pointerdown',()=>{this.uiHit=true;S.nbTab=i;openNb()});return{bg,t}});
    this.nbX=A.nineslice(396,10,'btn9s',null,68,15,4,4,4,4).setOrigin(0).setDepth(304).setInteractive({useHandCursor:true}).setVisible(false);this.nbXT=mkText(this,430,12.5,'Fechar (C)',{f:'ui',size:9,color:TXT.cream,ox:.5}).setDepth(305).setVisible(false);this.nbX.on('pointerdown',()=>{this.uiHit=true;closeNb()});
    this.nbTitle=mkText(this,252,12,'Caderno da Lia',{f:'ui',size:10,color:'#E6D3AE'}).setDepth(305).setVisible(false);this.nbHint=mkText(this,22,245,'Role com a roda do mouse, as setas ou arrastando.  C ou Esc fecha.',{size:8,color:'#CDB894'}).setDepth(305).setVisible(false);this.nbBot=A.nineslice(8,236,'cover9',null,464,30,5,5,5,5).setOrigin(0).setDepth(303).setVisible(false);this.nbTop=A.nineslice(8,4,'cover9',null,464,28,5,5,5,5).setOrigin(0).setDepth(303).setVisible(false);
  }
  flip(d){if(S.scene!=='card'||!S.card)return;const n=this.nSp||1,v=clamp((this.spread||0)+d,0,n-1);if(v===this.spread)return;this.spread=v;this.cardCont.x=-v*LW;this.cardNavUpd()}
  cardNavUpd(){const n=this.nSp||1,sp=this.spread||0,last=sp>=n-1,c=S.card;if(!c)return;
    this.cardPg.setT(n>1?'páginas '+(sp*2+1)+'–'+(sp*2+2)+' de '+n*2:' ');this.cardPg.setPosition(LW-12-this.cardPg.tw,LH-19);
    this.cardNav[0].x=LW-150;[this.cardNav[0]].forEach(o=>{});this.cardNav.forEach(o=>{const vis=n>1&&(o.d<0?sp>0:!last);o.bg.setVisible(vis);o.t.setVisible(vis);const x=o.d<0?44:LW-48;o.bg.setPosition(x,LH-15);o.t.setPosition(x,LH-15)});
    const op=c.opts||[];this.cardOpts.forEach((o,i)=>{const on=last&&i<op.length;o.bg.setVisible(on);o.t.setVisible(on)});
    const showMain=!op.length||!last;this.cardBtn.setVisible(showMain);this.cardBtnT.setVisible(showMain);
    this.cardBtnT.setT((last?(c.btn||'Continuar'):'Virar a página ›')+'   [E]');this.cardBtn.setSize(this.cardBtnT.tw+24,18);this.cardNav.forEach(o=>{if(o.d>0){o.bg.setVisible(false);o.t.setVisible(false)}})}
  cardGo(){if(S.scene==='card'&&S.card&&(this.spread||0)<(this.nSp||1)-1){this.flip(1);return}if(S.scene==='card'&&S.card&&S.card.opts){this.cardPick(0);return}if(S.scene==='card'&&S.card&&S.card.fn){const f=S.card.fn;f()}}
  cardPick(i){const o=S.scene==='card'&&S.card&&S.card.opts&&S.card.opts[i];if(o)o.fn()}
  setScroll(v){if(S.scene==='nb'&&this.book){this.book.scroll('r',v-this.scroll);return}this.scroll=clamp(v,0,this.maxScroll);const c=S.scene==='nb'?this.nbCont:this.cardCont;c.y=(S.scene==='nb'?36:10)-this.scroll;this.sbarUpd()}
  sbarUpd(){const nb=S.scene==='nb',vis=(nb?200:226),H=this.contentH||1;this.sbar.setVisible(H>vis+2).setPosition(nb?465:LW-3,(nb?38:10)+(vis-30)*(this.maxScroll?this.scroll/this.maxScroll:0)).setSize(2,Math.max(12,vis*vis/H))}
  /* monta os blocos (HTML → Phaser) num container */
  layoutBlocks(cont,html,th){
    cont.removeAll(true);const bl=htmlToBlocks(html);let W=th.w,X=th.x,y=th.y0||0,pi=0,pN=0,pY=0;const secs=[],P=th.pages;
    if(P){const p0=P(0);X=p0.x;W=p0.w;y=p0.y0}
    const fit=()=>{if(!P)return;const pg=P(pi);if(y>pg.y1&&pY>pg.y0+1){pi++;const np=P(pi),dx=np.x-X,dy=np.y0-pY;for(let k=pN;k<cont.list.length;k++){const o=cont.list[k];o.x+=dx;o.y+=dy}X=np.x;W=np.w;y+=dy}};
    const T=(r,o)=>{const t=mkText(this,0,0,r,o);return t};
    const add=(o,x,yy)=>{o.setPosition(x,yy);cont.add(o);return o};
    let lastK='';for(const b of bl){fit();if(!(lastK==='h3'||lastK==='h2'||lastK==='year')){pN=cont.list.length;pY=y}lastK=b.k;
      if(b.k==='secstart'){secs.push({y,tc:b.tc,pi});y+=3;continue}
      if(b.k==='secend'){const s=secs.pop();if(s&&s.tc){const sy=s.pi===pi?s.y:P(pi).y0;const r=this.add.rectangle(X-7,sy,2,Math.max(4,y-sy-2),hexn(uiC(s.tc))>0?hexn(uiC(s.tc)):0xE3A63C).setOrigin(0);cont.add(r)}y+=5;continue}
      if(b.k==='year'){const m=T('JORNAL DO LARGO · SALVADOR',{f:'ui',size:8,color:th.bold});add(m,X,y);y+=m.th;const t=T(b.r,{f:'ui',size:28,color:th.yearC,lh:32});add(t,X,y);y+=t.th+1;cont.add(this.add.rectangle(X,y,W,1,0x1C110A).setOrigin(0));cont.add(this.add.rectangle(X,y+2,W,1,0x1C110A).setOrigin(0));y+=8;continue}
      if(b.k==='h2'){const t=T(b.r,{f:'ui',size:14,color:TXT.cream,lh:17,w:W-14});const bg=this.add.nineslice(0,0,'plate9',null,t.tw+14,t.th+5,4,4,4,4).setOrigin(0).setTint(0x2E4C80);add(bg,X,y);add(t,X+7,y+2.5);y+=t.th+11;continue}
      if(b.k==='h2big'){const t=T(b.r,{f:'ui',size:20,color:th.fg,outline:th.dark,lh:23,w:W});add(t,X,y);y+=t.th+6;continue}
      if(b.k==='h3'){const t=T(b.r,{f:'ui',size:11,color:th.h3,lh:14,w:W,shadow:th.shadow});add(t,X,y);y+=t.th+3;continue}
      if(b.k==='li'){const t=T([{t:'• '}].concat(b.r),{size:9,color:th.fg,lh:12,w:W-8,shadow:th.shadow});add(t,X+6,y);y+=t.th+2;continue}
      if(b.k==='row'){const dim=/dim/.test(b.cl),tot=/tot/.test(b.cl);const a=T(b.a,{size:10,color:dim?th.dim:tot?th.h3:th.fg,w:W-84,lh:12,shadow:th.shadow}),v=T(b.b,{size:10,color:tot?th.h3:th.fg,shadow:th.shadow});add(a,X,y);add(v,X+W-v.tw,y);cont.add(this.add.rectangle(X,y+a.th,W,1,th.rule,.5).setOrigin(0));y+=a.th+3;continue}
      if(b.k==='sticky'){y+=2;const t=T([{t:b.t,b:1},{br:1},{t:b.body}],{size:8,color:TXT.ink,w:W-14,lh:11,bold:'#9C3B26'});const bg=this.add.nineslice(0,0,'paper9',null,W,t.th+9,5,5,5,5).setOrigin(0);if(b.bg)bg.setTint(hexn(b.bg));add(bg,X,y);cont.add(this.add.rectangle(X+W/2-8,y-2,16,4,0xE8DCAA,.9).setOrigin(0));add(t,X+7,y+4.5);y+=t.th+13;continue}
      if(b.k==='port'){const k2=PT2[b.id],im=k2?this.add.image(0,0,'xtra',k2):this.add.image(0,0,'ui',PORT[b.id]||PORT.lia);im.setOrigin(0).setScale(Math.min(1,52/im.height));add(im,X,y);y+=Math.round(im.height*im.scaleY)+6;continue}
      if(b.k==='empty'){const g=this.add.graphics();g.fillStyle(0xA88C66,1);for(let i=0;i<W;i+=4){g.fillRect(X+i,y,2,1);g.fillRect(X+i,y+15,2,1)}for(let j=0;j<16;j+=4){g.fillRect(X,y+j,1,2);g.fillRect(X+W-1,y+j,1,2)}cont.add(g);const t=T('? ainda não anotado',{size:8,color:'#8A6A44'});add(t,X+6,y+2);y+=20;continue}
      if(b.k==='log'){const a=T(b.a,{f:'ui',size:8,color:'#2E4C80'}),v=T(b.b,{size:9,color:th.fg,w:W-62,lh:12});add(a,X,y+1);add(v,X+62,y);y+=Math.max(a.th,v.th)+4;continue}
      if(b.k==='p'){const cl=b.cl||'';let size=10,col=th.fg,lh=13;
        if(/note/.test(cl)){size=8;col=th.dim;lh=10}else if(/tip/.test(cl)){size=9;col=th.tip}else if(/nbs/.test(cl)){size=9;col=th.dim}else if(/fin/.test(cl)){size=9;col=th.h3}else if(/\br\b/.test(cl)){size=9;lh=12}else if(/cxg|cxc/.test(cl)){size=9;lh=12;col=th.fg}
        const t=T(b.r,{size,color:col,lh,w:W,shadow:th.shadow,bold:th.bold,link:th.link});add(t,X,y);
        (t._links||[]).forEach(l=>{const z=this.add.zone(X+l.x,y+l.y,l.w,l.h).setOrigin(0).setInteractive({useHandCursor:true});z.on('pointerdown',()=>{this.uiHit=true;this.linkTap=true;try{window.open(l.href,'_blank','noopener')}catch(e){}});cont.add(z)});
        y+=t.th+(/note|nbs/.test(cl)?4:6);continue}}
    fit();this._lastPi=pi;
    return y}
  showCardNow(){
    const c=S.card,th={pages:cardPage,w:420,x:Math.round((LW-420)/2),y0:22,fg:'#2B1A0E',yearC:'#2B1A0E',dark:null,h3:'#9C3B26',dim:'#6B5030',tip:'#2E6B4E',shadow:null,rule:0xB9A27A,bold:'#9C3B26',link:'#2E4C80'};
    this.cardCont.setVisible(true);this.cardCont.y=0;this.cardCont.x=0;this.scroll=0;this.spread=0;
    if(this.cardOrn&&this.cardOrn.parentContainer)this.cardCont.remove(this.cardOrn,false);
    const y=this.layoutBlocks(this.cardCont,c.html,th);this.nSp=Math.floor((this._lastPi||0)/2)+1;this.contentH=0;this.maxScroll=0;
    this.cardOrn=this.cardOrn||this.add.image(LW/2,14,'ui','ui_moldura_ornamento_topo').setDepth(403);this.cardOrn.setVisible(false);this.cardCont.add(this.cardOrn);this.cardOrn.setPosition(LW/2+.5,13).setAlpha(.55).setScale(.8);
    this.cardBtnT.setT((c.btn||'Continuar')+'   [E]');this.cardBtn.setSize(this.cardBtnT.tw+24,18);this.cardBtnT.setPosition(LW/2,LH-15);
    const op=c.opts||[];this.cardOpts.forEach((o,i)=>{const on=i<op.length;o.bg.setVisible(on);o.t.setVisible(on);if(!on)return;o.t.setT(op[i].t+'  ['+(i+1)+']',{color:i?TXT.cream:TXT.ink});o.bg.setTexture(i?'btn9s':'btn9h');const w=Math.max(120,o.t.tw+18),x=LW/2+(i-(op.length-1)/2)*150;o.bg.setSize(w,18).setPosition(x,LH-15);o.t.setPosition(x,LH-15)});this.cardBtn.setVisible(!op.length);this.cardBtnT.setVisible(!op.length);
    this.cardTint.setFillStyle(0x000000,0);
    this.cardNavUpd();this.sbar.setVisible(false)}
  updCard(){
    const on=S.scene==='card'&&S.card;
    [this.cardBg,this.cardTint,this.cardTop].forEach(o=>o.setVisible(false));[this.cardShade,this.cardFrame,this.cardCont,this.cardBar,this.cardPg].forEach(o=>o.setVisible(!!on));if(!on){[this.cardBtn,this.cardBtnT].forEach(o=>o.setVisible(false));this.cardOpts.forEach(o=>{o.bg.setVisible(false);o.t.setVisible(false)});this.cardNav.forEach(o=>{o.bg.setVisible(false);o.t.setVisible(false)})}
    if(!on){this.cardV=-1;if(this.cardOrn)this.cardOrn.setVisible(false);if(S.scene!=='nb')this.sbar.setVisible(false);return}
    if(this.cardV!==S.card.v){this.cardV=S.card.v;this.showCardNow()}
  }
  updNb(){
    if(this.book){[this.nbPanel,this.nbPage,this.nbShade,this.nbCont,this.nbBot,this.nbTop,this.nbX,this.nbXT,this.nbTitle,this.nbHint,...this.nbTabs.flatMap(t=>[t.bg,t.t])].forEach(o=>o.setVisible(false));this.book.upd();return}
    const on=S.scene==='nb'&&S.nbOpen;
    [this.nbPanel,this.nbPage,this.nbShade,this.nbCont,this.nbBot,this.nbTop,this.nbX,this.nbXT,this.nbTitle,this.nbHint,...this.nbTabs.flatMap(t=>[t.bg,t.t])].forEach(o=>o.setVisible(!!on));
    if(!on){this.nbV=-1;return}
    this.nbTabs.forEach((t,i)=>{const on=i===S.nbTab;t.bg.setTint(this.nbTabC[i]).setAlpha(on?1:.6).setY(on?7:10).setSize(55,on?24:19);t.t.setY(on?11:13.5)});
    if(this.nbV!==S.nbV){this.nbV=S.nbV;const th={w:420,x:34,y0:4,fg:TXT.ink,yearC:TXT.ink,dark:null,h3:'#7A2A00',dim:'#6B5030',tip:'#2A6A4A',shadow:null,rule:0x8a6a44,bold:'#7A2A00',link:'#1A4AA0'};
      this.nbCont.setVisible(true);const html=(S.nbHtml||'').replace(/<div class="nbh">.*?<\/div>/s,'');this.scroll=0;this.nbCont.y=36;
      const y=this.layoutBlocks(this.nbCont,html,th);this.contentH=y;this.maxScroll=Math.max(0,y+6-196);this.sbarUpd()}
  }
  /* ---------- painéis TV / PM ---------- */
  buildPanel(){this.pan=null;this.panKey=null;this.panObjs=[]}
  clearPanel(){this.panObjs.forEach(o=>o.destroy&&o.destroy());this.panObjs=[];this.panKey=null;this.panExtra=null}
  updPanel(dt){
    const k=S.fx&&S.fx.pan;if(!k||S.scene==='card'){if(this.panKey)this.clearPanel();return}
    if(this.panKey!==k){this.clearPanel();this.panKey=k;if(k==='pm')this.buildPM();else this.buildTV(k==='tv2');if(DX)this.panObjs.forEach(o=>{if(o.x!==undefined&&!(o.x===0&&o.width>=LW)&&Math.abs(o.x-LW/2)>.5)o.x+=DX})}
    if(k==='pm')this.updPM();else this.updTV()}
  keep(o){this.panObjs.push(o);return o}
  buildTV(duo){
    const A=this.add,D=150,K=o=>this.keep(o);K(A.rectangle(0,0,LW,LH,0x1e120a,.96).setOrigin(0).setDepth(D));
    K(A.nineslice(60,14,'wood9d',null,360,214,6,6,6,6).setOrigin(0).setDepth(D+1));
    K(A.rectangle(72,24,316,176,0x1d1209).setOrigin(0).setDepth(D+2));
    const sx=76,sy=28,sw=308,sh=168;this.tvr={sx,sy,sw,sh};
    for(let i=0;i<7;i++)K(A.rectangle(sx+i*sw/7,sy,sw/7+1,sh,i%2?0x2938E0:0x3A48FF).setOrigin(0).setDepth(D+3));
    const old=S.era>=2,SK=old?'xtra':'chars',SG=old?'sec2':'secret';
    this.tvSec=K(A.sprite(sx+sw/2+(duo?36:0),sy+sh-34,SK).setOrigin(.5,1).setDepth(D+5).setScale(2));this.tvSec.play(SG+'/serio');
    if(duo){this.tvAss=K(A.sprite(sx+sw/2-60,sy+sh-30,'chars').setOrigin(.5,1).setDepth(D+5).setScale(2).setTint(S.era>=2?0xA8C0B8:0xFFE0C8));this.tvAss.play('secret/sorri')}
    K(A.image(sx+sw/2+(duo?36:0),sy+sh-30,'ui','palanque_microfone_brasao').setOrigin(.5,1).setScale(1.7).setDepth(D+6));
    K(A.rectangle(sx,sy+sh-38,sw,38,0xE5322D).setOrigin(0).setDepth(D+7));K(A.rectangle(sx,sy+sh-38,sw,3,0xFFD21F).setOrigin(0).setDepth(D+7));
    K(mkText(this,sx+8,sy+sh-33,'AO VIVO',{f:'ui',size:9,color:TXT.yel}).setDepth(D+8));
    K(mkText(this,sx+sw/2,sy+sh-22,duo?'NOVA FASE DO PROGRAMA':'PRONUNCIAMENTO OFICIAL',{f:'ui',size:11,color:TXT.cream,ox:.5,shadow:TXT.dark}).setDepth(D+8));
    K(A.tileSprite(sx,sy,sw,sh,'tvscan').setOrigin(0).setDepth(D+9).setAlpha(.7));
    this.tvLive=K(A.rectangle(sx+8,sy+8,5,5,0xE5322D).setDepth(D+9));
    K(A.image(36,208,'ui','camera_tv_tripe').setOrigin(.5,1).setDepth(D+2).setScale(1.1));K(A.image(445,214,'ui','boom_microfone').setOrigin(.5,1).setDepth(D+2).setScale(1.0));
    [0xFF4DB8,0xFFD21F,0x19E68C].forEach((c,i)=>K(A.circle(404,40+i*22,6,c).setDepth(D+2)));
    K(mkText(this,LW/2,232,duo?'O SECRETÁRIO E O ASSESSOR':'O SECRETÁRIO · GOVERNO DO ESTADO',{f:'ui',size:11,color:TXT.cream,ox:.5,shadow:TXT.dark}).setDepth(D+2));
    K(mkText(this,LW/2,246,'personagem fictício',{f:'ui',size:8,color:TXT.yel,ox:.5}).setDepth(D+2));
    this.tvFlash=K(A.rectangle(sx,sy,sw,sh,0xffffff,.05).setOrigin(0).setDepth(D+10))}
  updTV(){const t=S.t-(S.fx.panT||0);if(this.tvLive)this.tvLive.setVisible(Math.sin(t*3)>0);if(this.tvFlash)this.tvFlash.setAlpha(.04+.04*Math.sin(t*40));
    const talk=Math.sin(t*11)>-.2;if(this.tvSec){this.tvSec.setY(this.tvr.sy+this.tvr.sh-34+(talk?0:1))}}
  buildPM(){
    const A=this.add,D=150,K=o=>this.keep(o);const f=S.fx;
    K(A.rectangle(0,0,LW,LH,0x120a06).setOrigin(0).setDepth(D));
    const bg=K(A.image(-640,-40,'rua00').setOrigin(0).setDepth(D+1).setScale(1.5));bg.setTint(0x886655);
    K(A.rectangle(0,0,LW,LH,0x1a0c10,.42).setOrigin(0).setDepth(D+2));
    this.pmTitle=K(mkText(this,LW/2,30,'',{f:'ui',size:11,color:TXT.ink,ox:.5}).setDepth(D+9));this.pmTitleBg=K(A.nineslice(LW/2,24,'btn9',null,160,20,4,4,4,4).setOrigin(.5,0).setDepth(D+8).setTint(0xFF4DB8));
    this.pmCiv=[0,1,2].map(i=>K(A.sprite(0,0,'chars').setOrigin(.5,1).setDepth(D+5).setScale(3).setTint(TINTS[i+1])));this.pmCiv.forEach(s=>s.play('manif/down'));
    this.pmFall=[0,1].map(i=>K(A.sprite(0,0,'chars').setOrigin(.5,1).setDepth(D+4).setScale(3).setVisible(false)));this.pmFall.forEach(s=>{s.setFrame(GROUPS['manif/down'][0]);s.setAngle(-90)});
    const rigs=['pm_a','pm_b','pm_c','pm_a'];this.pmPol=rigs.map((r,i)=>{const s=K(A.sprite(0,0,'chars').setOrigin(.5,1).setDepth(D+6+i*.1).setScale(3));s.rig=r;return s});
    this.pmSignT=K(mkText(this,230,194,'NÓS FICAMOS',{f:'ui',size:11,color:TXT.ink,ox:.5,oy:.5}).setDepth(D+8).setVisible(false));this.pmSign=K(A.nineslice(230,194,'paper9',null,this.pmSignT.tw+10,15,5,5,5,5).setOrigin(.5).setDepth(D+7).setVisible(false));
    this.pmGas=K(mkEmitter(this,0,0,'ui',{frame:['fx_fumaca_2','fx_fumaca_3','fx_fumaca_4_dissipando'],x:{min:200,max:470},y:{min:215,max:245},lifespan:{min:2200,max:3600},speedY:{min:-26,max:-44},speedX:{min:-8,max:14},scale:{start:1.6,end:4.2},alpha:{start:.5,end:0},frequency:150,emitting:false}).setDepth(D+20));
    this.pmBurst=[0,1,2].map(i=>K(A.sprite(0,0,'ui').setDepth(D+12).setVisible(false).setScale(2)));
    this.pmGround=K(A.rectangle(0,218,LW,52,0x3a2212,.55).setOrigin(0).setDepth(D+3));
  }
  updPM(){
    const f=S.fx,st=f.pmS||0,pp=f.pmP==null?st:f.pmP,e=clamp((S.t-(f.pmT||0))/1.1,0,1),L=(a,b)=>a+(b-a)*e,t=S.t-(f.panT||0),GYP=226;
    const T=['A VIATURA CHEGA','A POLÍCIA AVANÇA','O LARGO ESVAZIA'][st];if(this.pmTk!==T){this.pmTk=T;this.pmTitle.setT(T);this.pmTitleBg.setSize(this.pmTitle.tw+24,Math.ceil(this.pmTitle.th)+6).setPosition(LW/2,24);this.pmTitle.setPosition(LW/2,27)}
    this.pmTitle.setY(27);
    const POLX=[[400,430,460,490],[300,332,365,398],[325,358,390,422]],CIVX=[[150,190,235],[125,167,210],[125,167,210]];
    const stand=st<2||pp<2;
    for(let i=0;i<3;i++){const s=this.pmCiv[i],cx=L(CIVX[pp][i],CIVX[st][i])-(st===2?e*310:0);s.setPosition(Math.round(cx),GYP+(i%2?3:0)).setFlipX(false);s.setVisible(stand&&!(st>=1&&i===1));s.anims.timeScale=st===1&&e>.3?1.6:.5}
    this.pmFall.forEach((s,i)=>{const on=st>=1&&i<(st===2?2:1);s.setVisible(on);s.setPosition(i?260:200,GYP+6)});
    this.pmPol.forEach((s,i)=>{const px=L(POLX[pp][i],POLX[st][i]);s.setPosition(Math.round(px),GYP+(i%2?3:0)).setFlipX(true);
      const g=st===1?'side':'down',k=s.rig+'/'+g;const has=hasG(s.rig,g);const key=has?k:s.rig+'/down';
      const moving=st===1&&Math.sin(t*3+i)>.2;if(moving||st===1){if(s.anims.currentAnim?.key!==key)s.play(key,true)}else{if(s.anims.isPlaying)s.anims.stop();s.setFrame((GROUPS[s.rig+'/down']||GROUPS[key])[0])}});
    if(st>=1&&!this.pmGas.emitting)this.pmGas.start();
    this.pmBurst.forEach((b,i)=>{const on=st===1&&Math.sin(t*9+i*2.4)>.55;b.setVisible(on);if(on){b.setPosition(CIVX[1][i]+30,GYP-90-(i%2)*24);if(!b.anims.isPlaying)b.play('spark')}});
    const sg=st===2;this.pmSign.setVisible(sg);this.pmSignT.setVisible(sg);
  }
  /* ---------- feedback: moeda que sobe, balão de humor, estrela ---------- */
  worldPosOf(o){const sc=G.game.scene.getScene(S.loc==='rua'?'Rua':'Padaria');const cx=sc?sc.cameras.main.scrollX:0;
    for(const id in S.npcs){const n=S.npcs[id];if(n.ord===o)return{x:H2(n.x)-cx,y:(S.loc==='rua'?SY(n.y):H2(n.y))-62}}
    for(const a of S.extras)if(a.ord===o)return{x:H2(a.x)-cx,y:(S.loc==='rua'?SY(a.y):H2(a.y))-62};return{x:LW/2,y:130}}
  runFx(){
    while(FXQ.length){const q=FXQ.shift();
      if(q.k==='sale'){const p=this.worldPosOf(q.a);
        const coin=this.add.sprite(p.x,p.y,'ui').setDepth(500).setScale(1.2).play('coin');
        this.tweens.add({targets:coin,x:{value:this.coinIm.x,duration:900,ease:'Sine.easeInOut'},y:{value:this.coinIm.y,duration:900,ease:'Back.easeIn'},scale:{from:1.2,to:.7,duration:900},onComplete:()=>{coin.destroy();const sp=this.add.sprite(this.coinIm.x+4,this.coinIm.y,'ui').setDepth(501).play('spark');sp.once('animationcomplete',()=>sp.destroy());this.tweens.add({targets:this.coinIm,scale:{from:1.3,to:.9},duration:260})}});
        const b=this.add.image(p.x+12,p.y-6,'ui','balao_feliz').setDepth(499).setOrigin(.5,1);this.tweens.add({targets:b,y:p.y-26,alpha:{from:1,to:0},duration:1500,ease:'Quad.easeOut',onComplete:()=>b.destroy()});
        const st=this.add.sprite(p.x-10,p.y+6,'ui').setDepth(500).play('spark');st.once('animationcomplete',()=>st.destroy());
        if(S.led&&(S.led.loc+S.led.vis)===5){const big=this.add.image(LW/2,70,'ui','ui_estrela_cheia').setDepth(520).setScale(.2);this.tweens.add({targets:big,scale:{from:.2,to:3.2},duration:520,ease:'Back.easeOut',yoyo:true,hold:700,onComplete:()=>big.destroy()})}}
      else if(q.k==='lost'){const p=this.worldPosOf(q.a);const b=this.add.image(p.x+10,p.y-6,'ui','balao_irritado').setDepth(499).setOrigin(.5,1);this.tweens.add({targets:b,y:p.y-24,alpha:{from:1,to:0},duration:1500,onComplete:()=>b.destroy()})}}
  }
  update(time,dtms){
    if(!G.ready)return;const dt=Math.min(.05,dtms/1000);this.uiHit=false;
    this.runFx();this.updHud(dt);this.updHint();this.updDlg();this.updMacro(dt);this.updThought(dt);this.updCard();this.updNb();this.cutv&&this.cutv.upd();this.updPanel(dt);
    const a=S.trans?(S.trans.t<.22?S.trans.t/.22:Math.max(0,1-(S.trans.t-.22)/.28)):(S.scene==='fade'?1:0);this.fade.setAlpha(a>=1?1:a);
  }
  /* ---------- clique no mundo ---------- */
  onDown(p,over){
    if(this.uiHit||over.length)return;if(this.linkTap){this.linkTap=false;return}
    if(S.scene==='cut'){cutNext();return}
    if(S.scene==='card'||S.scene==='nb'){this.drag={y:p.y/HK,x:p.x/HK,x0:p.x/HK};return}
    if(S.scene==='dialog'){if(S.d&&!S.d.ch)advance();return}
    if(S.scene!=='play'||(S.fx&&S.fx.pan))return;
    const sc=G.game.scene.getScene(S.loc==='rua'?'Rua':'Padaria'),cx=sc.cameras.main.scrollX,wx=p.x/HK+cx,wy=p.y/HK;
    if(S.loc==='dentro'){const i=sc.stationAt(wx,wy);if(i>=0){adv(1);useStation(i);this.ping(wx,wy);return}
      for(const id in S.npcs){const n=S.npcs[id];if(n.hidden||n.loc!=='dentro'||!ordOpen(n.ord)||!atCounter(n))continue;const nx=H2(n.x),ny=H2(n.y);if(Math.abs(wx-nx)<14&&wy<ny+2&&wy>ny-50){if(orderAct(n,null)){this.ping(wx,wy);return}}}
      for(const a of S.extras){if(a.loc!=='dentro'||!a.waiting||!ordOpen(a.ord))continue;const nx=H2(a.x),ny=H2(a.y);if(Math.abs(wx-nx)<14&&wy<ny+2&&wy>ny-50){if(orderAct(null,a)){this.ping(wx,wy);return}}}}
    const tg=S.tgt;if(tg){const tx=H2(tg.x),ty=(S.loc==='rua'?SY(tg.y):H2(tg.y))-26;if(Math.abs(wx-tx)<16&&Math.abs(wy-ty)<30){interact();return}}
    S.want=null;const inn=S.loc==='dentro';
    S.tx=clamp(wx*2,inn?60:70,inn?IW-60:WW-70);S.ty=inn?clamp(wy*2,IY0,IY1):clamp(SYinv(wy),Y0,Y1);
    this.ping(wx,wy)}
  ping(x,y){const sc=G.game.scene.getScene(S.loc==='rua'?'Rua':'Padaria');const c=sc.add.circle(x,y,2,0xFFD21F,.9).setDepth(9400);sc.tweens.add({targets:c,scale:5,alpha:0,duration:420,onComplete:()=>c.destroy()})}
}
let VOEXP='cruz';
function goStation(i){const inn=true;S.want={i,t:S.t};S.tx=clamp(STXI[i],60,IW-60);S.ty=i===2?GY-8:GY+58}
