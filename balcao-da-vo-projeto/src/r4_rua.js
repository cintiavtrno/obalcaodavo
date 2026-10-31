/* ===== parte 4: helpers de mundo + cena RUA ===== */
const SCS=1.04,SCI=1.28;                               // escala base: rua / padaria
const scaleFor=(y,inside)=>{if(inside){const k=clamp((y-196)/60,0,1);return SCI*(.94+.12*k)}const k=clamp((y-SYB)/SYH,0,1);return SCS*(.9+.16*k)};
const ERALOOK=[{sat:-.30,con:.94,mc:0xF2E0BE,ma:.30,tone:'1991 · desbotada, quente'},{sat:.42,con:1.07,mc:0xFFF0DC,ma:.10,tone:'1996 · saturada'},{sat:-.18,con:1.0,mc:0xB9D0F0,ma:.34,tone:'2000 · mais fria'}];
/* camada comum: tint por época, vinheta e grão de filme */
function addLook(sc){
  const L={};L.mult=sc.add.rectangle(0,0,LW,LH,0xffffff,0).setOrigin(0).setScrollFactor(0).setDepth(99990).setBlendMode(Phaser.BlendModes.MULTIPLY);
  L.night=sc.add.rectangle(0,0,LW,LH,0x180a5a,0).setOrigin(0).setScrollFactor(0).setDepth(99991);
  L.vig=sc.add.image(0,0,'vig').setOrigin(0).setScrollFactor(0).setDepth(99996).setAlpha(.9);
  L.grain=sc.add.tileSprite(0,0,LW,LH,'grain').setOrigin(0).setScrollFactor(0).setDepth(99997).setAlpha(.12).setBlendMode(Phaser.BlendModes.OVERLAY);
  L.gt=0;L.cm=null;
  if(sc.renderer&&sc.renderer.type===Phaser.WEBGL&&sc.cameras.main.postFX){try{L.cm=sc.cameras.main.postFX.addColorMatrix()}catch(e){L.cm=null}}
  L.era=-1;return L}
function updLook(sc,L,dt){
  if(L.era!==S.era){L.era=S.era;const k=ERALOOK[S.era];L.mult.setFillStyle(k.mc,k.ma);
    if(L.cm){const m=L.cm;m.reset();m.saturate(k.sat,true);m.contrast(k.con-1,true)}}
  const dk=darkness();L.night.setFillStyle(0x180a5a,dk*.82);L.night.setVisible(dk>0);
  L.gt+=dt;if(L.gt>.09){L.gt=0;L.grain.tilePositionX=Math.random()*128|0;L.grain.tilePositionY=Math.random()*128|0}}
function plateText(sc,lines,o){ // placa de madeira com texto pequeno
  if(Array.isArray(lines))lines=lines.flatMap((l,i)=>i?[{br:1},{t:l}]:[{t:l}]);
  if(typeof lines==='string')lines=[{t:lines}];lines=lines.map(r=>r.t?Object.assign({},r,{b:1}):r);const t=mkText(sc,0,0,lines,{f:'ui',size:o.size||8,color:o.color||TXT.cream,bold:o.color||TXT.cream,lh:o.lh||10,align:'center',w:o.w||0,shadow:o.shadow===undefined?TXT.dark:o.shadow});
  const w=t.tw+6,h=t.th+4;const bg=sc.add.nineslice(0,0,o.tex||'wood9',null,w,h,5,5,5,5).setOrigin(.5);
  t.setOrigin(.5);return{bg,t,w,h,set(x,y,d){bg.setPosition(x,y).setDepth(d);t.setPosition(x,y+(o.dy||0)).setDepth(d+.01)},destroy(){bg.destroy();t.destroy()}}}
const signLines=s=>s==='PADARIA & CAFÉ'?['PADARIA','& CAFÉ']:s==='CAFÉ PELÔ'?['CAFÉ','PELÔ']:[s];
const PY=254;   // linha do chão da calçada para os adereços (tudo apoia aqui)
class Rua extends Phaser.Scene{
  constructor(){super('Rua')}
  create(){
    this.sky=this.add.image(0,0,'skyg').setOrigin(0).setDisplaySize(1264,200).setDepth(-100);
    this.stars=[];for(let i=0;i<46;i++){this.stars.push(this.add.image(Math.floor(Math.random()*1264),Math.floor(Math.random()*80),'dot1').setDepth(-99).setAlpha(0))}
    this.bg=this.add.image(0,0,'rua91').setOrigin(0).setDepth(-50);
    this.sun=this.add.image(0,0,'sunlay').setOrigin(0).setScrollFactor(0).setDepth(99980).setBlendMode(Phaser.BlendModes.ADD).setAlpha(.5);
    this.ents=new EntSet(this);this.speech=new Speech(this);this.obub=new OrderBub(this);
    this.mk=new Marker(this,'mark','E');this.mkq=new Marker(this,'markq','!','#FFFFFF');
    this.props=[];this.dyn=[];this.propKey=null;this.look=addLook(this);this.skyT=-1;
    this.tray=[0,1].map(()=>this.add.image(0,0,'ui','pao_prato').setVisible(false));
    this.glows=[];[[553,127],[917,127],[1140,119],[1176,124],[318,70]].forEach(([x,y])=>this.glows.push(this.add.image(x,y,'glow').setScale(1.6).setDepth(99950).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0)));
    this.doorGlow=this.add.image(605,214,'glow').setScale(2.2,1.7).setDepth(99949).setBlendMode(Phaser.BlendModes.ADD).setAlpha(.35);
    this.dust=mkEmitter(this,0,0,'dot1',{x:{min:0,max:LW},y:{min:20,max:LH-20},lifespan:{min:4000,max:8000},speedX:{min:-5,max:9},speedY:{min:-4,max:3},scale:{start:1,end:1},alpha:{start:0,end:.55,ease:'Sine.easeOut'},frequency:420,quantity:1,blendMode:'ADD',tint:0xFFE9B0});this.dust.setScrollFactor(0).setDepth(99979);
    this.rain=mkEmitter(this,0,0,'rain',{x:{min:-20,max:LW+20},y:-10,lifespan:520,speedY:{min:420,max:520},speedX:-60,alpha:{start:.7,end:.3},frequency:12,quantity:2,emitting:false});this.rain.setScrollFactor(0).setDepth(99985);
    this.fireP=mkEmitter(this,1075,190,'fire',{x:{min:-34,max:34},lifespan:{min:500,max:900},speedY:{min:-40,max:-80},scale:{start:1.3,end:.2},alpha:{start:.95,end:0},frequency:70,quantity:1,blendMode:'ADD',emitting:false});this.fireP.setDepth(2000);
    this.smk=mkEmitter(this,1075,150,'ui',{frame:['fx_fumaca_2','fx_fumaca_3','fx_fumaca_4_dissipando'],x:{min:-34,max:34},lifespan:{min:1800,max:2800},speedY:{min:-14,max:-26},speedX:{min:-4,max:10},scale:{start:.8,end:1.9},alpha:{start:.6,end:0},frequency:260,emitting:false});this.smk.setDepth(2001);
    this.dpool=[];this.vo={};
    this.events.on('wake',()=>{});
  }
  ensureProps(){
    const saiu=(F.lRai==='cad'||F.lRai==='pres'||F.rompida)&&!F.lRaiNo;const key=[S.era,S.sign,F.pol==='bateu',F.inc==='fogo',saiu,S.mode].join('|');if(key===this.propKey)return;this.propKey=key;
    this.props.forEach(p=>p.destroy());this.props=[];this.lights=null;this.bg.setTexture(S.mode==='f2'?'f2_rua26':['rua91','rua96','rua00'][S.era]);
    const P=this.props,add=(o)=>{P.push(o);return o};const A=this.add;
    const door=S.era===0?605:S.era===2?606:620;this.doorX=door;this.doorGlow.setPosition(door,205);
    // placa da loja
    const L=signLines(S.sign),sg=add(plateText(this,L,{size:8,lh:9,color:'#FFE9A8'}));sg.set([688,681,691][S.era],[139,136,144][S.era],150);
    // placa do sobrado
    const rp=add(plateText(this,S.mode==='f2'?'MEMÓRIA VIVA':S.era<2?'RAIMUNDO':'ALUGA-SE',{size:8,color:'#FFE9A8',tex:'wood9d'}));rp.set(391,176,180);
    // palco do largo: faixa refeita em código (a do fundo tinha letras ilegíveis) e visual por época
    {const g=A.graphics().setDepth(-49),fill=(c,x,y,w,h)=>{g.fillStyle(c,1);g.fillRect(x,y,w,h)};
      const tx=(lines,col,y)=>{const t=mkText(this,0,0,lines.flatMap((l,i)=>i?[{br:1},{t:l}]:[{t:l}]),{size:8,color:col,lh:8,align:'center',shadow:null});t.setOrigin(.5);t.setPosition(1083,y).setDepth(-48);add(t)};
      add(g);fill(0x2A1A10,1049,132,68,24);
      if(S.era===0){fill(0xE3D6AE,1050,133,66,22);fill(0xC9B98A,1050,153,66,2)}
      if(S.era===1){fill(0xF2E7C9,1050,133,66,22);fill(0xB33A2A,1050,133,66,2);fill(0xB33A2A,1050,153,66,2);tx(['FESTA NO','LARGO 96'],'#8A1F1A',144)}
      if(S.era===2&&F.inc!=='fogo'&&S.mode!=='f2'){fill(0x0E1B33,1050,133,66,22);fill(0x38D4F0,1050,133,66,1);fill(0x38D4F0,1050,154,66,1);fill(0x16305A,1050,145,66,1);tx(['PELOURINHO','2000'],'#7FF0FF',144);
        [1041,1054,1069,1083,1098,1113].forEach((x,i)=>add(A.image(x,129,'glow').setScale(.9).setDepth(99940).setBlendMode(Phaser.BlendModes.ADD).setTint(i%2?0xFF4FD8:0x39D5FF).setAlpha(.5)))}
      if(S.era===2&&F.inc==='fogo'&&S.mode!=='f2'){fill(0x1B1511,1050,133,66,22);fill(0x3A2A20,1050,133,66,1);fill(0x3A2A20,1050,154,66,1);
        g.fillStyle(0x0C0806,.5);g.fillRect(1026,120,9,52);g.fillRect(1118,126,9,46);g.fillRect(1040,118,80,5);
        {const tg=A.graphics().setDepth(-47);add(tg);for(let x=1022;x<1146;x+=12){tg.fillStyle(0x2A1A10,1).fillRect(x,178,12,26);tg.fillStyle(x%24?0xB58A55:0xA87C4A,1).fillRect(x+1,179,10,24);tg.fillStyle(0xC9A06A,1).fillRect(x+1,179,10,1)}}
        const pl=add(plateText(this,['PROGRAMAÇÃO','SUSPENSA'],{size:8,color:'#3B1F0E',tex:'paper9',shadow:null}));pl.set(1083,144,-47)}}
    // cunhal (pilastra de esquina) na emenda entre a fachada de perto e o largo distante do pano
    {const g=A.graphics().setDepth(-47);add(g);const x=719,R=(c,xx,y,w,h)=>{g.fillStyle(c,1);g.fillRect(xx,y,w,h)};
     R(0xE6DCC4,x,0,9,256);R(0xF6F0E0,x,0,2,256);R(0xB9AC8E,x+7,0,2,256);R(0x8F8268,x+9,0,1,256);
     [64,150].forEach(y=>{R(0xD8CCB0,x-1,y,11,4);R(0xF6F0E0,x-1,y,11,1);R(0x9A8C70,x-1,y+4,11,1)});
     R(0xCFC2A4,x-1,238,11,18);R(0xF0E8D6,x-1,238,11,1);R(0x8A7C60,x-1,255,11,1)}
    if(S.era===0){
      {const g=A.graphics().setDepth(-49);add(g);g.fillStyle(0x5A4630,.11);g.fillRect(480,226,96,17);g.fillRect(612,231,64,12);g.fillRect(700,222,34,21);g.fillRect(540,96,60,6);g.fillStyle(0x5A4630,.16);[[562,72,3,20],[578,66,2,24],[642,70,3,18],[690,98,2,26]].forEach(r=>g.fillRect(...r))}
      add(A.image(425,PY-1,'shadow').setScale(3.4,1.6).setAlpha(.9).setDepth(PY-.5));add(A.sprite(425,PY,'ui').setOrigin(.5,1).setDepth(PY).play('domino'));
      add(A.image(520,PY-3,'shadow').setScale(.9,.8).setDepth(PY-3.5));add(A.image(520,PY-3,'orelhao').setOrigin(.5,1).setDepth(PY-3));
      const tx=770,ty=PY;add(A.image(tx-6,ty,'shadow').setScale(1.9,1).setAlpha(.9).setDepth(ty-.5));add(A.image(tx-16,ty+2,'ui','mesa_quadrada').setOrigin(.5,1).setDepth(ty+2));
      add(A.image(tx-22,ty-18,'ui','prato_acaraje_camarao').setOrigin(.5,1).setDepth(ty+3));add(A.image(tx-8,ty-18,'ui','abara_folha_tigela').setOrigin(.5,1).setDepth(ty+3));
      add(A.sprite(tx+8,ty,'ui').setOrigin(.5,1).setDepth(ty).play('baiana'));
      const sm=add(mkEmitter(this,tx-16,ty-26,'ui',{frame:['fx_fumaca_1','fx_fumaca_2'],lifespan:1600,speedY:{min:-12,max:-20},scale:{start:.5,end:1.1},alpha:{start:.55,end:0},frequency:420}));sm.setDepth(ty+4)}
    if(S.era===1){const tx=697,ty=PY;add(A.image(tx+4,ty,'shadow').setScale(1.8,1).setAlpha(.9).setDepth(ty-.5));
      add(A.image(tx,ty,'ui','mesa_quadrada').setOrigin(.5,1).setDepth(ty));add(A.image(tx,ty-34,'ui','tapete_listrado').setOrigin(.5,1).setDepth(ty+1));
      add(A.image(tx-9,ty-26,'ui','miniatura_boneca_baiana').setOrigin(.5,1).setDepth(ty+2));add(A.image(tx+7,ty-26,'ui','miniatura_farol').setOrigin(.5,1).setDepth(ty+2));
      add(A.image(tx+22,ty-1,'ui','vaso_flores').setOrigin(.5,1).setDepth(ty+1))}
    if(S.mode==='f2'){f2RuaProps(this,add);return}
    if(S.era===2){[535,745].forEach((x,i)=>{const y=PY;
      add(A.image(x,y-1,'shadow').setScale(2.6,1).setAlpha(.9).setDepth(y-1.5));
      add(A.image(x,y,'ui','mesa_posta').setOrigin(.5,1).setScale(.85).setDepth(y));add(A.image(x-22,y+1,'ui','cadeira_direita').setOrigin(.5,1).setDepth(y-1));add(A.image(x+22,y+1,'ui','cadeira_esquerda').setOrigin(.5,1).setDepth(y+1))});
      // 2000: a fachada foi reformada para o turista (toldo, vasos); em 1991 era a mesma casa, só que gasta
      {const g=A.graphics().setDepth(-49),R=(c,x,y,w,h,al)=>{g.fillStyle(c,al==null?1:al);g.fillRect(x,y,w,h)};
       for(let i=0;i<9;i++){const x=561+i*10;R(i%2?0xF2EEE0:0x2F4F86,x,150,10,9);R(i%2?0xF2EEE0:0x2F4F86,x+2,159,6,2)}R(0x1E3560,561,149,90,1);
       add(g);[552,660].forEach(x=>{add(A.image(x,PY,'shadow').setScale(.5,.6).setDepth(PY-.5));add(A.image(x,PY,'ui','vaso_flores').setOrigin(.5,1).setDepth(PY))})}
      // 2000: tapume na janela e na bandeira da porta do sobrado de Seu Raimundo (quando ele saiu)
      if(saiu){const g=A.graphics().setDepth(-48);add(g);const B=(x,y,w,h)=>{g.fillStyle(0x2A1A10,1).fillRect(x,y,w,h);g.fillStyle(0xB58A55,1).fillRect(x+1,y+1,w-2,h-2);g.fillStyle(0xC9A06A,1).fillRect(x+1,y+1,w-2,1);g.fillStyle(0x8E6A3E,1).fillRect(x+1,y+h-2,w-2,1)};
       for(let i=0;i<10;i++)B(307,18+i*7,52,8);g.fillStyle(0x5A3A20,1).fillRect(311,20,2,68).fillRect(353,20,2,68);
       g.fillStyle(0x2A2A30,1).fillRect(300,50,66,2).fillRect(300,86,66,2);for(let x=302;x<366;x+=5)g.fillRect(x,52,1,34);
       B(308,133,56,7);B(308,139,56,6);[[315,26],[350,26],[315,47],[350,47],[312,135],[360,135]].forEach(([x,y])=>{g.fillStyle(0x3A3A3A,1).fillRect(x,y,1,1)})}
      // 2000: varanda azul (ponto turístico) no fim do largo; Olodum e pintura corporal na calçada do sobrado
      {add(A.image(1198,246,'varanda').setOrigin(.5,1).setDepth(-48));
       // remendo de calçamento: a varanda cobre os turistas pintados no fundo e sobravam só as pernas
       add(A.image(1155-985,0,'rua00').setOrigin(0).setCrop(985,240,58,30).setDepth(-49));
       const spr=(x,y,fr,an,sx,bob)=>{const shw=add(A.image(x,y-1,'shadow').setScale(sx,1).setAlpha(.9).setDepth(y-.6));const o=add(A.sprite(x,y,'xtra',fr).setOrigin(.5,1).setDepth(y));if(an)o.play(an);o._sh=shw;
         if(bob){const tw=this.tweens.add({targets:o,y:y-1,duration:260+bob*30,yoyo:true,repeat:-1,delay:bob*70});add({destroy(){tw.remove()}})}return o};
       spr(70,250,'olo/ind_1',null,1.1,1);spr(138,249,'olo/trio_0','olo/trio',3.2);spr(214,252,'olo/ind_4',null,1.1,3);
       spr(258,248,'pint/arm_0','pint/arm',2.3);spr(388,252,'pint/face_0','pint/face',1.8);
       const w=spr(60,262,'olo/walk_0','olo/walk',1.9),tw=this.tweens.add({targets:[w,w._sh],x:430,duration:36000,yoyo:true,repeat:-1,onYoyo:()=>w.setFlipX(true),onRepeat:()=>w.setFlipX(false)});add({destroy(){tw.remove()}})}
      if(F.pol==='bateu')this.lights=null}

  }
  syncSky(){
    const h=S.min/60,k=Math.floor(h*4)+(S.rain?100:0);if(k===this.skyT)return;this.skyT=k;
    let[t,b]=skyAt2(h);if(S.rain){t=mix(t,'#8A93A6',.6);b=mix(b,'#B7BCC8',.6)}
    const c=G.skyTex.context,gr=c.createLinearGradient(0,0,0,64);gr.addColorStop(0,t);gr.addColorStop(1,b);c.fillStyle=gr;c.fillRect(0,0,2,64);G.skyTex.refresh();
    const sa=clamp((h-18.1)/1.3,0,1);this.stars.forEach((s,i)=>s.setAlpha(sa*(.4+.6*((i*7)%5)/4)))}
  actorScale(y){return scaleFor(y,false)}
  update(time,dtms){
    if(!G.ready)return;const dt=Math.min(.05,dtms/1000),cam=this.cameras.main;
    const vis=S.loc==='rua';cam.setVisible(vis);if(!vis)return;
    const camx=clamp(Math.round(S.cam/2),0,1264-LW);cam.scrollX=camx;
    this.ensureProps();this.syncSky();updLook(this,this.look,dt);
    const dk=darkness();this.glows.forEach((g,i)=>g.setAlpha(dk*(.82+.1*Math.sin(S.t*3+i))));this.doorGlow.setAlpha(.28+dk*.6);
    this.sun.setAlpha(clamp(1-dk*1.4,0,1)*(S.rain?.15:.55));
    if(S.rain){if(!this.rain.emitting)this.rain.start()}else if(this.rain.emitting)this.rain.stop();
    const fire=!!(S.fx&&S.fx.fire);if(fire&&!this.fireP.emitting){this.fireP.start();this.smk.start()}else if(!fire&&this.fireP.emitting){this.fireP.stop();this.smk.stop()}
    if(this.lights){const a=Math.sin(S.t*8)>0;this.lights[0].setFillStyle(a?0xE5322D:0x4a1210);this.lights[1].setFillStyle(a?0x10144a:0x2F3BFF)}
    this.syncActors(camx);if(S.mode==='f2')f2Rua(this);
  }
  syncActors(camx){
    const E=this.ents,sp=this.speech;E.begin();sp.begin();this.obub.begin();
    const play=S.scene==='play';
    for(const id in S.npcs){const n=S.npcs[id];if(n.hidden||n.loc!=='rua')continue;const e=npcShow(this,E,n,false);
      if(n.bark&&(play||n.bark.ev))sp.put('n:'+id,e.spr.x,e.top-3,n.bark.s,camx)}
    for(const a of S.extras){if(a.loc!=='rua')continue;const e=extraShow(this,E,a,false);if(a.bark&&play)sp.put('x:'+a.id,e.spr.x,e.top-3,a.bark.s,camx)}
    // multidão do largo
    const nC=(S.fx&&S.fx.crowd|0),crowd=[];for(let i=0;i<nC;i++){const x=(1740+((i*89)%430)+hsh(i,3,1)*20)/2,y=SY(GY+22+((i*53)%96)),e=E.get('c'+i);
      e.show({rig:'manif',x,y,s:scaleFor(y,false),dir:x<995?'right':'left',faceFront:true,play:true,rate:.4+hsh(i,1,1)*.4,tint:TINTS[i%TINTS.length]});
      crowd.push({x,y,e})}
    this.banners(S.fx&&S.fx.ban?crowd:[]);
    // roda: quando Davi está no largo, ele toca e forma-se um círculo de gente sambando
    {const dv=S.npcs.davi,on=dv&&!dv.hidden&&dv.loc==='rua'&&dv.x>1820&&S.mode!=='vist'&&!(S.fx&&S.fx.crowd>0)&&!S.rain&&(S.mode!=='f2'||(S.f2&&S.f2.roda));
     if(on){const cx=H2(dv.x),cy=SY(dv.y),N=6;for(let i=0;i<N;i++){const a=[180,212,246,294,328,0][i]*Math.PI/180+Math.sin(S.t*.8+i)*.08,x=cx+Math.cos(a)*48,y=clamp(cy-3+Math.sin(a)*9,SYB,SYB+SYH),e=E.get('rd'+i);
       e.show({rig:['moca','azul','moca','azul','menino','moca','azul'][i],x,y,s:scaleFor(y,false)*(i===4?.8:1),dir:Math.cos(a+Math.PI/2)>0?'right':'left',moving:true,play:true,rate:.8+hsh(i,2,1)*.4,tint:TINTS[(i+3)%TINTS.length],yoff:-Math.abs(Math.sin(S.t*6+i))*1.5})}}}
    // cachorro
    const d=S.dog;{const e=E.get('dog'),y=SY(d.y),x=H2(d.x);e.spr.setTexture('cachorro');
      e.spr.setOrigin(.5,1).setFlipX(d.dir<0).setScale(.9).setPosition(Math.round(x),Math.round(y+(d.walk?-Math.abs(Math.sin(S.t*14))*1.5:0))).setDepth(y).setVisible(true).setTint(0xFFFFFF).setAlpha(1);e.spr.anims.stop();e.key=null;e.sh.setPosition(Math.round(x),Math.round(y)-1).setScale(.8).setDepth(y-.5).setVisible(true);e.top=y-20}
    // ônibus
    // ônibus e viatura não aparecem na cena: viram nuvem de pensamento na UI

    // pombos
    S.pigeons.forEach((p,i)=>{const e=E.get('pb'+i);if(p.fly===-1){e.hide();return}e.spr.setTexture(p.fly>0&&Math.sin(S.t*24)>0?'pombaf':'pomba');e.spr.setOrigin(.5,1).setFlipX(i%2===0).setScale(1).setPosition(Math.round(p.x/2),Math.round(p.fly>0?p.y/2:SY(p.y)+(Math.sin(S.t*3+i)>.7?1:0))).setDepth(p.fly>0?900+i:SY(p.y)).setVisible(true).setTint(0xFFFFFF);e.spr.anims.stop();e.key=null;e.sh.setVisible(false);e.top=p.y/2-6});
    // jogador
    if(S.loc==='rua')playerShow(this,E,false);
    if(S.mode==='f2')f2Actors(this,E,sp,camx);else f2Off(this);
    E.end();sp.end();this.obub.end();
    this.markers(camx);
    // bandeja na mão
    const pe=E.m.get('player');S.tray.forEach((id,i)=>{const im=this.tray[i];if(!im||!pe)return;const dr=pe.hd==='left'?-1:1;im.setFrame(ICON[id]||'pao_prato').setVisible(true).setOrigin(.5,1);im.setScale(Math.min(1,15/Math.max(im.width,im.height))).setPosition(Math.round(pe.spr.x+dr*(7+i*2)),Math.round(pe.spr.y-pe.sc_*17-i*7)).setDepth(pe.spr.depth+.2)});
    for(let i=S.tray.length;i<2;i++)this.tray[i].setVisible(false);
  }
  /* cartazes da manifestação: no máximo cinco, cada um com um texto, espalhados em duas alturas para não se cobrirem */
  banners(crowd){
    const n=crowd.length?Math.min(BAN.length,Math.max(2,Math.round(crowd.length/4))):0,used={};
    if(n){const xs=crowd.map(c=>c.x),x0=Math.min(...xs)+18,x1=Math.max(...xs)-18,taken=new Set();
      for(let j=0;j<n;j++){const sx=n>1?x0+(x1-x0)*j/(n-1):(x0+x1)/2;let best=null,bd=1e9;crowd.forEach((c,k)=>{if(taken.has(k))return;const d=Math.abs(c.x-sx);if(d<bd){bd=d;best=k}});if(best==null)break;taken.add(best);
        const c=crowd[best],key='ban'+j;let b=this.dyn.find(o=>o.k===key);
        if(!b){const t=BAN[j],w=t.split(' ');const pl=plateText(this,w.length>2?[w.slice(0,2).join(' '),w.slice(2).join(' ')]:t,{size:8,color:'#2B1A0E',tex:'paper9',shadow:null,lh:10});b={k:key,pl,destroy(){pl.destroy()}};this.dyn.push(b)}
        const top=Math.round(c.y-c.e.sc_*58-(j%2?26:0));b.pl.set(Math.round(sx),top,2000+j);b.pl.bg.setVisible(true);b.pl.t.setVisible(true);used[key]=1}}
    this.dyn.forEach(o=>{if(/^ban/.test(o.k)&&!used[o.k]){o.pl.bg.setVisible(false);o.pl.t.setVisible(false)}})}
  markers(camx){
    const tg=S.tgt,show=tg&&S.scene==='play';
    if(show&&(tg.k==='st'||tg.k==='npc'||tg.k==='tour'||tg.k==='vis'||tg.k==='obj'||tg.k==='door'||tg.k==='quest'||tg.k==='ev'||tg.k==='f2')){
      let y,x=H2(tg.x);
      if(tg.k==='npc'||tg.k==='tour'||tg.k==='vis'){const id=tg.k==='npc'?'n:'+tg.n.id:tg.k==='tour'?'x:'+tg.a.id:null;const e=id&&this.ents.m.get(id);const hb=(tg.k==='npc'&&ordOpen(tg.n.ord))||tg.k==='tour';y=(e?e.top:SY(tg.y)-60)-(hb?30:7)}
      else if(tg.k==='f2'){const o=tg.h.actor&&this.f2spr&&this.f2spr[tg.h.id];y=o?o.top-7:SY(tg.y)-40}
      else if(tg.k==='obj')y=SY(tg.y)-26;else if(tg.k==='door')y=SY(tg.y)-48;else y=SY(tg.y)-32;
      this.mk.at(x,y)}else this.mk.off();
    const q=questOn();if(q&&S.scene==='play'&&q.tg.loc==='rua'&&!(S.tgt&&S.tgt.k==='quest'))this.mkq.at(H2(q.tg.x),SY(q.tg.y)-44+Math.sin(S.t*4)*2);else this.mkq.off()}
}
/* ---- atores compartilhados entre Rua e Padaria ---- */
function npcShow(sc,E,n,inside){
  const id=n.id,e=E.get('n:'+id),x=H2(n.x),y=inside?H2(n.y):SY(n.y),s=scaleFor(y,inside);
  const talk=n.talk||(S.speaker===id&&(S.scene==='dialog'||S.scene==='menu'));
  if(id==='vo'){voShow(sc,e,n,x,y,s,talk);return e}
  if(id==='lucia'&&!inside&&S.mode!=='vist'&&!talk&&!n.walk){ // fiscal patrulhando com a prancheta
    const w=wantAnchor(n);if(w[2]==='fachada'||w[2]==='sobrado'||w[2]==='calcada'){const t=S.t*.42+n.ph,ph=(Math.sin(t)+Math.sin(t*.5)*.4),px=x+ph*20;const mvg=Math.abs(Math.cos(t))>.28;
      e.show({rig:'lucia',x:px,y,s,dir:Math.cos(t)>=0?'right':'left',moving:mvg});e.mv=mvg;return e}}
  const sling=id==='dandara'&&S.era===2&&F.pol==='bateu';
  if(sling)e.show({rig:'dandara',grp:'sling',x,y,s,moving:n.walk,play:false});
  else if(id==='davi'&&!inside&&!n.walk&&n.x>1820&&S.mode!=='vist'&&!(S.fx&&S.fx.crowd>0)&&!S.rain)e.show({rig:'davi',grp:'drum',x,y,s,moving:true,play:true});
  else e.show({rig:ID2RIG[id]||'turista',x,y,s,dir:n.dir<0?'left':'right',moving:n.walk,faceFront:!talk&&!(n.ord&&ordOpen(n.ord)),play:false});
  return e}
function voShow(sc,e,n,x,y,s,talk){
  const st=sc.vo[n.id]=sc.vo[n.id]||{g:'cruz',until:0,next:S.t+6,waved:false};
  const near=S.loc===n.loc&&Math.abs(S.px-n.x)<300;
  if(!near)st.waved=false;
  let g=st.g;
  if(S.voAlert>0)g='susto';
  else if(talk||n.bark)g=(Math.floor(S.t*1.3)%3===0)?'cruz':'ri';
  else if(near&&!st.waved&&S.scene==='play'&&S.loc==='dentro'){st.waved=true;g='acena';st.g='acena';st.until=S.t+2.6}
  else if(S.t<st.until)g=st.g;
  else{ // volta a respirar; de tempos em tempos muda de expressão
    if(S.t>st.next){const late=S.era===2&&(F.inc==='fogo'||F.pol==='bateu'||S.min>16*60);const pool=late?['triste','preocup','cruz']:['ri','acena','preocup','ri','cruz'];st.g=pick1(pool);st.until=S.t+rnd(2.2,3.6);st.next=S.t+rnd(7,13);g=st.g}
    else{const c=custAll();g=(c.length>=3&&S.loc==='dentro')?'preocup':'cruz'}}
  const bob=n.walk?-Math.abs(Math.sin(S.t*9))*1.2:0;VOEXP=g;
  e.show({rig:'vo',grp:g,x,y,s,yoff:bob,moving:true,play:true,rate:g==='cruz'?.8:1});
  return e}
function extraShow(sc,E,a,inside){
  const e=E.get('x:'+a.id),x=H2(a.x),y=inside?H2(a.y):SY(a.y);
  const hs=hashStr(a.id),rig=a.kid?'menino':['turista','azul','moca'][hs%3];
  const s=scaleFor(y,inside)*(a.kid?.78:Math.min(a.s||1,1));
  e.show({rig,x,y,s,dir:a.dir<0?'left':'right',moving:a.walk,faceFront:!a.walk&&!a.waiting,tint:a.kid?TINTS[hs%TINTS.length]:TINTS[(hs>>3)%TINTS.length],play:false});
  if(a.flash>0){if(!e.fl){e.fl=sc.add.image(0,0,'ui','fx_brilho_grande').setDepth(9000);e.extras.push(e.fl)}
    e.fl.setPosition(Math.round(x+(a.dir<0?-9:9)*e.sc_),Math.round(y-e.sc_*30)).setVisible(true).setAlpha(Math.min(1,a.flash*3)).setScale(.8+Math.sin(S.t*40)*.2)}
  else if(e.fl)e.fl.setVisible(false);
  return e}
function playerShow(sc,E,inside){
  const e=E.get('player'),x=H2(S.px),y=inside?H2(S.py):SY(S.py),s=scaleFor(y,inside);
  e.show({rig:S.mode==='vist'?'lucia':S.mode==='f2'?'lia26':'lia',x,y,s,moving:S.walk});
  if(!S.walk&&S.tx==null&&e.idleT!==undefined){}
  return e}
