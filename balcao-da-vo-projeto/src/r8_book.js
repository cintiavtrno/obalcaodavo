/* ===== parte 8: Caderno da Lia como livro aberto (índice à esquerda, detalhe à direita) ===== */
const BK={x:18+DX,y:12,w:436,h:246,px0:26+DX,py0:18,px1:446+DX,py1:246,sp:235+DX,L0:40+DX,L1:224+DX,R0:251+DX,R1:432+DX,listY:56,rTop:26,rBot:238};
const BC={ink:0x1C110A,pap:0xF2E5C6,pap2:0xEADBB6,pap3:0xE1CFA6,pap4:0xD4BE92,lea:0x4A2C1C,lea2:0x6E4730,lea3:0x2E1A10,ocre:0xE3A63C,ocre2:0xB9792A,sel:0xF6D891,tij:0xB4452D,verde:0x3E7B5C,anil:0x2E4C80,orn:0xB99A6C,card:0xFBF4E0,brass:0x8C6A3E};
const BCOL={txt:'#2B1A0E',dim:'#7A5A38',tij:'#9C3B26',anil:'#2E4C80',cream:'#F5ECD8'};
const BILL={sobrado:[400,150],padaria:[640,150],largo:[1010,140],calcada:[540,150],dentro:[330,120]};
class Book{
  constructor(sc){this.sc=sc;this.on=false;this.sel=[0,0,0,0,0];this.scrL=0;this.scrR=0;this.v=-1;this.objs=[];
    const A=sc.add,D=300;
    this.shade=A.rectangle(0,0,LW,LH,0x120A05,.66).setOrigin(0).setDepth(D).setInteractive();
    this.base=A.graphics().setDepth(D+1);this.drawBase(this.base);
    this.cL=A.container(0,0).setDepth(D+3);this.cR=A.container(0,0).setDepth(D+3);
    this.strips=A.graphics().setDepth(D+5);this.drawStrips(this.strips);
    this.head=A.container(0,0).setDepth(D+6);
    this.tabs=BOOKT.map((t,i)=>{const bg=A.graphics().setDepth(D+2);const tx=mkText(sc,0,0,[{t:t[0].toUpperCase(),b:1}],{f:'ui',size:7,color:BCOL.cream,bold:BCOL.cream}).setAngle(90).setDepth(D+2.5);
      const z=A.zone(BK.x+BK.w,0,22,40).setOrigin(0).setDepth(D+7).setInteractive({useHandCursor:true});z.on('pointerdown',()=>{sc.uiHit=true;this.goTab(i)});return{bg,tx,z,c:hexn(t[1])}});
    this.close=A.graphics().setDepth(D+2);this.close.fillStyle(BC.ink,1).fillRect(400+DX,2,50,11);this.close.fillStyle(BC.lea,1).fillRect(401+DX,3,48,10);
    this.closeT=mkText(sc,405+DX,3.5,'fechar',{f:'ui',size:7,color:BCOL.cream}).setDepth(D+3);this.closeK=A.nineslice(434+DX,3.5,'key9',null,11,9,3,3,3,3).setOrigin(0).setDepth(D+3);this.closeKT=mkText(sc,439.5+DX,3.5,'C',{f:'ui',size:6,color:BCOL.txt,ox:.5}).setDepth(D+4);
    this.closeZ=A.zone(400+DX,2,50,11).setOrigin(0).setDepth(D+7).setInteractive({useHandCursor:true});this.closeZ.on('pointerdown',()=>{sc.uiHit=true;closeNb()});
    this.foot=mkText(sc,BK.x+4,LH-10.5,TOUCH?'Toque num item para ver · toque nas fitas para trocar de aba · arraste para rolar':'↑ ↓ escolhe  ·  Tab ou 1–5 troca de aba  ·  roda do mouse rola  ·  C fecha',{f:'ui',size:6.5,color:'#E6D3AE'}).setDepth(D+2);
    this.statics=[this.shade,this.base,this.cL,this.cR,this.strips,this.head,this.close,this.closeT,this.closeK,this.closeKT,this.foot,...this.tabs.flatMap(t=>[t.bg,t.tx])];
    this.zones=[this.closeZ,...this.tabs.map(t=>t.z)];this.show(false)}
  show(v){this.statics.forEach(o=>o.setVisible(v));this.zones.forEach(z=>{z.setVisible(v);if(z.input)z.input.enabled=v});if(!v){this.cL.removeAll(true);this.cR.removeAll(true);this.head.removeAll(true)}}
  /* livro: capa de couro, cantos de metal, espessura das folhas, páginas com degraus de sombra perto da lombada */
  page(g,x0,y0,x1,y1,side){return bookPage(g,x0,y0,x1,y1,side)}
  _oldpage(g,x0,y0,x1,y1,side){const w=x1-x0,h=y1-y0;g.fillStyle(BC.pap,1).fillRect(x0,y0,w,h);
    const B=[[12,BC.pap2],[7,BC.pap3],[3,BC.pap4]];B.forEach(([d,c])=>{g.fillStyle(c,1);if(side==='l')g.fillRect(x1-d,y0,d,h);else g.fillRect(x0,y0,d,h)})}
  drawBase(g){drawBookFrame(g,BK)}
  /* faixas que escondem o que rola para fora (mesmas cores da página) */
  drawStrips(g){this.page(g,BK.px0,BK.py0,BK.sp,BK.listY-2,'l');this.page(g,BK.px0,BK.rBot,BK.sp,BK.py1,'l');this.page(g,BK.sp+3,BK.py0,BK.px1,BK.rTop,'r');this.page(g,BK.sp+3,BK.rBot,BK.px1,BK.py1,'r');
    g.fillStyle(BC.orn,1);[[BK.px0+4,BK.py0+4,1,1],[BK.px1-5,BK.py0+4,-1,1],[BK.px0+4,BK.py1-5,1,-1],[BK.px1-5,BK.py1-5,-1,-1]].forEach(([cx,cy,sx,sy])=>{g.fillRect(sx>0?cx:cx-6,cy,7,1);g.fillRect(cx,sy>0?cy:cy-6,1,7)})}
  T(str,o,bold){return mkText(this.sc,0,0,bold?[{t:str,b:1}]:str,Object.assign({bold:o&&o.color},o))}
  goTab(i){S.nbTab=(i+BOOKT.length)%BOOKT.length;this.scrL=0;this.scrR=0;openNb()}
  move(d){if(!this.model)return;const n=this.model.items.length;if(!n)return;this.sel[S.nbTab]=clamp(this.sel[S.nbTab]+d,0,n-1);this.scrR=0;this.build();this.ensureVis()}
  ensureVis(){const r=this.rows&&this.rows[this.sel[S.nbTab]];if(!r)return;const top=BK.listY,bot=BK.rBot-2;if(r.y-this.scrL<top)this.scrL=r.y-top;if(r.y+r.h-this.scrL>bot)this.scrL=r.y+r.h-bot;this.scrL=clamp(this.scrL,0,this.maxL);this.cL.y=-this.scrL;this.clip()}
  scroll(side,d){if(!this.model)return;if(side==='l'){this.scrL=clamp(this.scrL+d,0,this.maxL);this.cL.y=-this.scrL}else{this.scrR=clamp(this.scrR+d,0,this.maxR);this.cR.y=-this.scrR}this.clip()}
  wheel(p,dy){const x=p.x/HK;this.scroll(x<BK.sp?'l':'r',Math.sign(dy)*18)}
  upd(){const on=S.scene==='nb'&&S.nbOpen;if(on!==this.on){this.on=on;this.show(on);if(on)this.v=-1}if(!on)return;if(this.v!==S.nbV){this.v=S.nbV;this.build(true)}}
  build(reset){const sc=this.sc,tab=S.nbTab|0;this.model=bookModel(tab);const M=this.model;
    if(reset)this.sel[tab]=clamp(this.sel[tab],0,Math.max(0,M.items.length-1));
    this.head.removeAll(true);this.cL.removeAll(true);this.cR.removeAll(true);
    // abas
    let ty=BK.y+8;this.tabs.forEach((t,i)=>{const on=i===tab,w=on?22:18,h=Math.ceil(t.tx.tw)+12,y=ty,x=BK.x+BK.w-1,g=t.bg;ty+=h+3;g.clear();g.fillStyle(BC.ink,1).fillRect(x,y,w+1,h);g.fillStyle(t.c,1).fillRect(x,y+1,w,h-2);if(!on){g.fillStyle(0x000000,.22).fillRect(x,y+1,w,h-2)}g.fillStyle(0x000000,.2).fillRect(x,y+h-4,w,3);
      t.tx.setPosition(x+(w+t.tx.th)/2,y+6);t.z.setPosition(x,y).setSize(w+1,h)});
    // cabeçalho: placa pintada + subtítulo + filete duplo
    const[tn,tc]=BOOKT[tab];const pt=this.T(tn.toUpperCase(),{f:'ui',size:10,color:BCOL.cream},1);const pl=sc.add.nineslice(BK.L0,BK.py0+9,'plate9',null,pt.tw+12,pt.th+5,4,4,4,4).setOrigin(0).setTint(hexn(tc));pt.setPosition(BK.L0+6,BK.py0+11.5);
    const sub=this.T(M.sub||'',{f:'ui',size:7,color:BCOL.dim,w:BK.L1-BK.L0-pt.tw-18});sub.setPosition(BK.L0+pt.tw+18,BK.py0+9+(pt.th+5-sub.th)/2);
    const rl=sc.add.graphics();rl.fillStyle(BC.ink,.5).fillRect(BK.L0,BK.listY-7,BK.L1-BK.L0,1).fillRect(BK.L0,BK.listY-5,BK.L1-BK.L0,1);
    this.head.add([pl,pt,sub,rl]);
    // índice
    let y=BK.listY;this.rows=[];
    if(!M.items.length&&M.empty){const t=this.T(M.empty,{size:8,color:BCOL.dim,w:BK.L1-BK.L0,lh:11});t.setPosition(BK.L0,y);this.cL.add(t);y+=t.th}
    M.items.forEach((it,i)=>{const n0=this.cL.list.length;const sel=i===this.sel[tab],x0=BK.L0,tx=x0+21,tw=BK.L1-tx-(it.mk?14:3);
      const tt=this.T(it.t,{f:'ui',size:8,color:it.unk?'#A88C66':BCOL.txt,w:tw,lh:10},1),st=this.T(it.s||'',{size:7,color:BCOL.dim,w:tw,lh:9});
      const h=Math.max(21,tt.th+st.th+4),g=sc.add.graphics();
      if(sel){g.fillStyle(BC.ocre2,1).fillRect(x0-3,y-1,BK.L1-x0+5,h+2);g.fillStyle(BC.sel,1).fillRect(x0-2,y,BK.L1-x0+3,h);g.fillStyle(0xE3BE6E,1).fillRect(x0-2,y+h-1,BK.L1-x0+3,1);
        g.fillStyle(BC.tij,1);for(let k=0;k<4;k++)g.fillRect(x0-9+k,y+h/2-3+k,1,7-2*k)}
      // ícone
      const iy=y+(h-16)/2;
      if(it.unk){g.fillStyle(0xA88C66,1);for(let k=0;k<14;k+=3){g.fillRect(x0+1+k,iy,2,1);g.fillRect(x0+1+k,iy+15,2,1)}for(let k=0;k<16;k+=3){g.fillRect(x0+1,iy+k,1,2);g.fillRect(x0+15,iy+k,1,2)}}
      else{g.fillStyle(BC.ink,1).fillRect(x0+1,iy,15,16);g.fillStyle(it.port?0x5C4330:BC.card,1).fillRect(x0+2,iy+1,13,14)}
      this.cL.add(g);
      if(it.port&&!it.unk){const im=portImg(sc,it.port);im.setOrigin(.5,1).setScale(13/im.width).setPosition(x0+8.5,iy+15);this.cL.add(im)}
      else{const c=this.T(it.unk?'?':(it.ch||'•'),{f:'ui',size:7,color:it.unk?'#A88C66':BCOL.tij,ox:.5},1);c.setPosition(x0+8.5,iy+(16-c.th)/2);this.cL.add(c)}
      tt.setPosition(tx,y+2);st.setPosition(tx,y+2+tt.th);this.cL.add([tt,st]);
      if(it.bar&&it.bar[1]<=10){const bx=tx+st.tw+3,by=y+2+tt.th+(st.th-5)/2;if(bx+it.bar[1]*5<BK.L1-14){const bg=sc.add.graphics();for(let k=0;k<it.bar[1];k++){bg.fillStyle(BC.ink,1).fillRect(bx+k*5,by,4,4);bg.fillStyle(k<it.bar[0]?BC.verde:BC.card,1).fillRect(bx+k*5+1,by+1,2,2)}this.cL.add(bg)}}
      if(it.mk){const mg=sc.add.graphics(),mx=BK.L1-10,my=y+(h-10)/2;mg.fillStyle(BC.ink,1).fillRect(mx,my,10,10);mg.fillStyle(BC.card,1).fillRect(mx+1,my+1,8,8);if(it.mk==='ok'){mg.fillStyle(BC.verde,1).fillRect(mx+2,my+2,6,6)}this.cL.add(mg)}
      const z=sc.add.zone(x0-3,y,BK.L1-x0+5,h).setOrigin(0).setInteractive({useHandCursor:true});z.on('pointerdown',()=>{sc.uiHit=true;this.sel[tab]=i;this.scrR=0;this.build();this.ensureVis()});this.cL.add(z);
      this.tagFrom(this.cL,n0,y-1,y+h+1);this.rows.push({y,h});y+=h+3});
    if(M.note){y+=6;const n0=this.cL.list.length;const a=this.T(M.note[0].toUpperCase(),{f:'ui',size:7,color:BCOL.tij});a.setPosition(BK.L0,y);const b=this.T(M.note[1],{size:8,color:BCOL.txt,w:BK.L1-BK.L0,lh:11});b.setPosition(BK.L0,y+a.th+1);this.cL.add([a,b]);y+=a.th+b.th+2;this.tagFrom(this.cL,n0,y-a.th-b.th-2,y)}
    this.maxL=Math.max(0,y-(BK.rBot-2));this.scrL=clamp(this.scrL,0,this.maxL);this.cL.y=-this.scrL;
    // página da direita
    const it=M.items[this.sel[tab]];let ry=BK.rTop+2;
    if(it){ry=this.detail(bookDetail(tab,it.id),ry)}else{const t=this.T('Nada para mostrar ainda.',{size:8,color:BCOL.dim});t.setPosition(BK.R0,ry);this.cR.add(t);ry+=t.th}
    this.maxR=Math.max(0,ry-(BK.rBot-2));this.scrR=clamp(this.scrR,0,this.maxR);this.cR.y=-this.scrR;this.clip();
    // números de página
    const n1=this.T(String(tab*2+1),{f:'ui',size:7,color:'#9A7A52'}),n2=this.T(String(tab*2+2),{f:'ui',size:7,color:'#9A7A52'});n1.setPosition(BK.px0+14,BK.py1-11);n2.setPosition(BK.px1-14-n2.tw,BK.py1-11);this.head.add([n1,n2])}
  detail(B,y){const sc=this.sc,X=BK.R0,W=BK.R1-BK.R0,add=o=>{this.cR.add(o);return o};
    for(const b of B){const n0=this.cR.list.length,y0=y;y=this.block(b,y,X,W,add);this.tagFrom(this.cR,n0,y0,y-2)}
    return y}
  block(b,y,X,W,add){const sc=this.sc;{
      if(b.k==='ill'){const h=58,g=sc.add.graphics();g.fillStyle(BC.ink,1).fillRect(X,y,W,h);g.fillStyle(0x5C4330,1).fillRect(X+1,y+1,W-2,h-2);add(g);
        const key=S.mode==='f2'?(b.p==='dentro'?'f2_interior26':'f2_rua26'):b.p==='dentro'?'interior':['rua91','rua96','rua00'][S.era>2?1:S.era],[cx,cy]=BILL[b.p]||BILL.largo,sc2=.6,cw=(W-4)/sc2,ch=(h-4)/sc2,x0=Math.max(0,cx-cw/2),y0=Math.max(0,cy-ch/2);
        if(sc.textures.exists(key)){if(/^rua|rua26/.test(key))add(skyFill(sc,X+2,y+2,W-4,h-4));const im=sc.add.image(X+2-x0*sc2,y+2-y0*sc2,key).setOrigin(0).setScale(sc2).setCrop(x0,y0,cw,ch).setTint(0xF2DEB8);add(im);const fx=[];stageFix(sc,fx,key,X+2,y+2,W-4,h-4,x0,y0,sc2);fx.forEach(add)}
        const g2=sc.add.graphics();g2.fillStyle(BC.orn,1).fillRect(X+1,y+1,W-2,1).fillRect(X+1,y+h-2,W-2,1).fillRect(X+1,y+1,1,h-2).fillRect(X+W-2,y+1,1,h-2);add(g2);
        if(b.cap){const t=this.T(b.cap,{f:'ui',size:6.5,color:BCOL.txt});const cg=sc.add.graphics();cg.fillStyle(BC.ink,1).fillRect(X+4,y+h-6-t.th,t.tw+6,t.th+3);cg.fillStyle(BC.card,1).fillRect(X+5,y+h-5-t.th,t.tw+4,t.th+1);add(cg);t.setPosition(X+7,y+h-4.5-t.th);add(t)}
        y+=h+6;return y}
      if(b.k==='port'){const g=sc.add.graphics();g.fillStyle(BC.ink,1).fillRect(X,y,52,58);g.fillStyle(0x7A5A3E,1).fillRect(X+1,y+1,50,56);g.fillStyle(BC.orn,1).fillRect(X+1,y+1,50,1);add(g);
        const im=portImg(sc,b.id);im.setOrigin(.5,1).setScale(48/im.width).setPosition(X+26,y+57);add(im);
        const tx=X+58,tw=W-58;const n=this.T(b.t,{f:'ui',size:11,color:BCOL.txt,w:tw},1);n.setPosition(tx,y);add(n);let yy=y+n.th;
        const r=this.T(b.sub,{f:'ui',size:7,color:BCOL.dim,w:tw});r.setPosition(tx,yy);add(r);yy+=r.th+2;
        if(b.txt){const p=this.T(b.txt,{size:7.5,color:BCOL.txt,w:tw,lh:10});p.setPosition(tx,yy);add(p);yy+=p.th+2}
        if(b.bar){yy=this.barRow(tx,yy,'Confiança',b.bar[0],b.bar[1])}
        y=Math.max(y+60,yy)+4;return y}
      if(b.k==='h2'){const t=this.T(b.t,{f:'ui',size:11,color:BCOL.txt,w:W,lh:13},1);t.setPosition(X,y);add(t);y+=t.th+2;return y}
      if(b.k==='h4'){y+=3;const t=this.T(b.t.toUpperCase(),{f:'ui',size:7,color:BCOL.tij,w:W});t.setPosition(X,y);add(t);y+=t.th+1;return y}
      if(b.k==='p'){const t=this.T(b.t,{size:8,color:BCOL.txt,w:W,lh:11});t.setPosition(X,y);add(t);y+=t.th+3;return y}
      if(b.k==='when'){const g=sc.add.graphics();g.fillStyle(BC.ink,1).fillRect(X,y+1,7,7);g.fillStyle(BC.tij,1).fillRect(X+1,y+2,5,5);add(g);const t=this.T(b.t,{f:'ui',size:7,color:BCOL.anil,w:W-11});t.setPosition(X+11,y);add(t);y+=t.th+3;return y}
      if(b.k==='quote'){const t=this.T(b.t,{size:8,color:BCOL.txt,w:W-7,lh:11});const g=sc.add.graphics();g.fillStyle(BC.ocre,1).fillRect(X,y,2,t.th);add(g);t.setPosition(X+7,y);add(t);y+=t.th+4;return y}
      if(b.k==='step'){const t=this.T(b.t,{size:8,color:b.done?BCOL.dim:BCOL.txt,w:W-11,lh:11});const g=sc.add.graphics();
        if(b.dot){g.fillStyle(BC.tij,1).fillRect(X+2,y+4,3,3)}else{g.fillStyle(BC.ink,1).fillRect(X,y+2,8,8);g.fillStyle(BC.card,1).fillRect(X+1,y+3,6,6);if(b.done){g.fillStyle(BC.verde,1).fillRect(X+2,y+4,4,4)}}
        add(g);t.setPosition(X+11,y);add(t);y+=t.th+2;return y}
      if(b.k==='bar'){y=this.barRow(X,y,b.lab,b.n,b.g)+2;return y}
      if(b.k==='chips'){let cx=X;const ch=14;b.ids.forEach(id=>{const t=this.T(NMS[id]||id,{f:'ui',size:7,color:BCOL.txt});const w=t.tw+19;if(cx+w>X+W){cx=X;y+=ch+3}
          const g=sc.add.graphics();g.fillStyle(BC.ink,1).fillRect(cx,y,w,ch);g.fillStyle(BC.card,1).fillRect(cx+1,y+1,w-2,ch-2);g.fillStyle(0x5C4330,1).fillRect(cx+1,y+1,11,ch-2);g.fillStyle(BC.ink,1).fillRect(cx+12,y+1,1,ch-2);add(g);
          const im=portImg(sc,id);im.setOrigin(.5,1).setScale(11/im.width).setPosition(cx+6.5,y+ch-1);add(im);t.setPosition(cx+15,y+(ch-t.th)/2);add(t);cx+=w+3});y+=ch+4;return y}
      if(b.k==='rel'){b.rows.forEach(r=>{const m=this.T(r.mood.toUpperCase(),{f:'ui',size:6.5,color:BCOL.cream});const w=Math.max(42,m.tw+8);const pl=sc.add.nineslice(X,y,'plate9',null,w,m.th+3,3,3,3,3).setOrigin(0).setTint(r.r<0?BC.tij:r.r>0?BC.verde:0x8A6A44);add(pl);m.setPosition(X+(w-m.tw)/2,y+1.5);add(m);
          const l=this.T(r.lab,{size:8,color:BCOL.txt,w:W-w-6});l.setPosition(X+w+6,y+(m.th+3-l.th)/2);add(l);y+=Math.max(m.th+3,l.th)+3});}}
    return y}
  tagFrom(c,n0,a,b){for(let k=n0;k<c.list.length;k++)c.list[k]._r=[a,b]}
  clip(){const f=(c,scr,top,bot)=>c.list.forEach(o=>{if(!o._r)return;const v=o._r[0]-scr>=top-1&&o._r[1]-scr<=bot+1;o.setVisible(v);if(o.input)o.input.enabled=v});
    f(this.cL,this.scrL,BK.listY-1,BK.rBot);f(this.cR,this.scrR,BK.rTop,BK.rBot)}
  barRow(x,y,lab,n,g){const t=this.T(lab,{f:'ui',size:7,color:BCOL.dim});t.setPosition(x,y);this.cR.add(t);const gg=this.sc.add.graphics(),bx=x+t.tw+5,by=y+(t.th-6)/2;
    for(let k=0;k<g;k++){gg.fillStyle(BC.ink,1).fillRect(bx+k*7,by,6,6);gg.fillStyle(k<n?BC.verde:BC.card,1).fillRect(bx+k*7+1,by+1,4,4)}this.cR.add(gg);
    const c=this.T(n+' de '+g,{f:'ui',size:7,color:BCOL.dim});c.setPosition(bx+g*7+4,y);this.cR.add(c);return y+t.th+2}
}
function portImg(sc,id){const k2=PT2[id];if(k2&&sc.textures.exists(k2))return sc.add.image(0,0,k2);if(k2&&sc.textures.get('xtra').has(k2))return sc.add.image(0,0,'xtra',k2);return sc.add.image(0,0,'ui',id==='vo'?'pt_vo_neutro':(PORT[id]||PORT.lia))}

function bookPage(g,x0,y0,x1,y1,side){const w=x1-x0,h=y1-y0;g.fillStyle(BC.pap,1).fillRect(x0,y0,w,h);
  [[12,BC.pap2],[7,BC.pap3],[3,BC.pap4]].forEach(([d,c])=>{g.fillStyle(c,1);if(side==='l')g.fillRect(x1-d,y0,d,h);else g.fillRect(x0,y0,d,h)})}
function drawBookFrame(g,K){const{x,y,w,h}=K;
    g.fillStyle(0x000000,.45).fillRect(x+2,y+3,w,h);
    g.fillStyle(BC.ink,1).fillRect(x,y+1,w,h-2).fillRect(x+1,y,w-2,h);g.fillStyle(BC.lea,1).fillRect(x+1,y+1,w-2,h-2);g.fillStyle(BC.lea2,1).fillRect(x+1,y+1,w-2,1);g.fillStyle(BC.lea3,1).fillRect(x+1,y+h-4,w-2,3);
    // espessura das folhas
    g.fillStyle(BC.ink,1).fillRect(K.px0,K.py1,K.px1-K.px0,6);for(let i=0;i<3;i++){g.fillStyle(i%2?BC.pap4:BC.pap2,1).fillRect(K.px0+1,K.py1+i*2,K.px1-K.px0-2,1)}
    g.fillStyle(BC.ink,1).fillRect(K.px0-1,K.py0-1,K.px1-K.px0+2,K.py1-K.py0+1);
    bookPage(g,K.px0,K.py0,K.sp,K.py1,'l');bookPage(g,K.sp+3,K.py0,K.px1,K.py1,'r');
    g.fillStyle(BC.ink,1).fillRect(K.sp,K.py0,3,K.py1-K.py0);g.fillStyle(0x8A6A44,1);for(let yy=K.py0+4;yy<K.py1-4;yy+=7)g.fillRect(K.sp+1,yy,1,3);
    // ornamentos de canto de página
    g.fillStyle(BC.orn,1);const o=(cx,cy,sx,sy)=>{g.fillRect(cx,cy,7*sx,1);g.fillRect(cx,cy,1,7*sy)};
    [[K.px0+4,K.py0+4,1,1],[K.px1-5,K.py0+4,-1,1],[K.px0+4,K.py1-5,1,-1],[K.px1-5,K.py1-5,-1,-1]].forEach(([cx,cy,sx,sy])=>{g.fillRect(sx>0?cx:cx-6,cy,7,1);g.fillRect(cx,sy>0?cy:cy-6,1,7)});
    // cantos de metal
    [[x-1,y-1],[x+w-9,y-1],[x-1,y+h-9],[x+w-9,y+h-9]].forEach(([cx,cy])=>{g.fillStyle(BC.ink,1).fillRect(cx,cy,10,10);g.fillStyle(BC.brass,1).fillRect(cx+1,cy+1,8,8);g.fillStyle(0xC9A86A,1).fillRect(cx+1,cy+1,8,1).fillRect(cx+1,cy+1,1,8)})}

/* livro dos cartões (abertura de época, caixa, relatório final, fichas): o texto corre de página em página, sem rolagem */
const CK={x:18+DX,y:4,w:436,h:234,px0:26+DX,py0:10,px1:446+DX,py1:226,sp:235+DX,L0:40+DX,L1:224+DX,R0:251+DX,R1:432+DX,cy0:18,cy1:218};
function cardPage(i){const sp=Math.floor(i/2),r=i%2,o=sp*LW;return r?{x:CK.R0+o,w:CK.R1-CK.R0,y0:CK.cy0,y1:CK.cy1}:{x:CK.L0+o,w:CK.L1-CK.L0,y0:CK.cy0,y1:CK.cy1}}
/* cenas narradas: "fotografia" do próprio cenário com movimento lento + legenda com retrato */
const CUTC={sobrado:[400,135],padaria:[640,135],largo:[1010,128],dentro:[330,135]};
const CUTT={rua91:0xF2DEB8,rua96:0xFFFFFF,rua00:0xE2E8F2,interior:0xF2E2C4};
class CutView{
  constructor(sc){this.sc=sc;const A=sc.add,D=450;this.key=null;this.o=[];
    this.shade=A.rectangle(0,0,LW,LH,0x120A05,1).setOrigin(0).setDepth(D).setVisible(false).setInteractive();
    this.img=A.image(0,0,'rua91').setOrigin(0).setDepth(D+1.1).setVisible(false);
    this.fr=A.graphics().setDepth(D+2).setVisible(false);
    this.box=A.nineslice(0,0,'dark9',null,100,60,4,4,4,4).setOrigin(0).setDepth(D+2).setVisible(false);
    this.tx=mkText(sc,0,0,'',{size:10,color:TXT.cream,lh:14}).setDepth(D+4).setVisible(false);
    this.k=A.nineslice(0,0,'key9',null,13,14,4,4,4,5).setOrigin(0).setDepth(D+4).setVisible(false);this.kt=mkText(sc,0,0,'E',{f:'ui',size:8,color:TXT.ink,ox:.5}).setDepth(D+5).setVisible(false);
    this.kl=mkText(sc,0,0,'continuar',{f:'ui',size:8,color:'#CDB894'}).setDepth(D+5).setVisible(false);
    this.skip=mkText(sc,0,0,TOUCH?'Pular cena ›':'Pular cena ›  [Esc]',{f:'ui',size:8,color:TXT.cream}).setDepth(D+6).setVisible(false);this.skipB=A.nineslice(0,0,'btn9s',null,60,14,4,4,4,4).setOrigin(0).setDepth(D+5).setVisible(false).setInteractive({useHandCursor:true});this.skipB.on('pointerdown',()=>{sc.uiHit=true;cutNext(true)});
    this.cnt=mkText(sc,0,0,'',{f:'ui',size:7,color:'#9A7A52'}).setDepth(D+5).setVisible(false);
    this.all=[this.skipB,this.shade,this.img,this.fr,this.box,this.tx,this.k,this.kt,this.kl,this.skip,this.cnt]}
  clearO(){this.o.forEach(o=>o.destroy());this.o=[]}
  upd(){const c=S.scene==='cut'&&S.cut;if(!c){if(this.on){this.on=false;this.all.forEach(o=>o.setVisible(false));this.clearO();this.key=null;(this.fixO||[]).forEach(o=>o.destroy());this.fixO=[];if(this.sky)this.sky.setVisible(false)}return}
    if(!this.on){this.on=true;this.all.forEach(o=>o.setVisible(true))}
    const s=c.L[c.i],sc=this.sc,X=30,W=LW-60,Y=12,H=148,key=c.v+'-'+c.i;
    if(this.key!==key){this.key=key;this.t0=performance.now();this.clearO();const A=sc.add;
      this.img.setTexture(sc.textures.exists(s.img[0])?s.img[0]:'rua91').setTint(CUTT[s.img[0]]||0xFFFFFF);
      this.fr.clear();this.fr.fillStyle(0x1C110A,1).fillRect(X-2,Y-2,W+4,2).fillRect(X-2,Y+H,W+4,2).fillRect(X-2,Y,2,H).fillRect(X+W,Y,2,H);this.fr.fillStyle(0xB99A6C,1).fillRect(X,Y,W,1).fillRect(X,Y+H-1,W,1).fillRect(X,Y,1,H).fillRect(X+W-1,Y,1,H);
      if(s.year){const t=mkText(sc,0,0,[{t:s.year,b:1}],{f:'ui',size:10,color:TXT.cream,bold:TXT.cream}).setDepth(455);const p=A.nineslice(X+8,Y+8,'plate9',null,t.tw+12,t.th+4,4,4,4,4).setOrigin(0).setTint(0x2E4C80).setDepth(454);t.setPosition(X+14,Y+10);this.o.push(p,t)}
      // legenda
      const by=Y+H+8,bh=LH-6-by,port=s.port;this.box.setPosition(X,by).setSize(W,bh);let tx0=X+12;
      if(port){const g=A.graphics().setDepth(453);g.fillStyle(0x1C110A,1).fillRect(X+8,by+8,46,52);g.fillStyle(0x7A5A3E,1).fillRect(X+9,by+9,44,50);g.fillStyle(0xB99A6C,1).fillRect(X+9,by+9,44,1);const im=portImg(sc,port).setOrigin(.5,1).setDepth(454);im.setScale(42/im.width).setPosition(X+31,by+58);this.o.push(g,im);tx0=X+62;
        const w=WHO[port]||{n:NMS[port]||port,c:'#E3A63C'};const nt=mkText(sc,0,0,[{t:w.n.toUpperCase(),b:1}],{f:'ui',size:8,color:plateTxt(w.c),bold:plateTxt(w.c)}).setDepth(455);const np=A.nineslice(tx0,by+8,'plate9',null,nt.tw+10,nt.th+3,4,4,4,4).setOrigin(0).setTint(hexn(uiC(w.c))).setDepth(454);nt.setPosition(tx0+5,by+9.5);this.o.push(np,nt);this.ty=by+8+nt.th+6}
      else this.ty=by+10;
      this.tx0=tx0;this.tw=X+W-12-tx0;this.typed=-1;
      this.k.setPosition(X+W-19,LH-6-20);this.kt.setPosition(X+W-12.5,LH-6-18.5);this.kl.setPosition(X+W-23-this.kl.tw,LH-6-18);
      this.skipB.setSize(this.skip.tw+14,this.skip.th+4).setPosition(LW-30-this.skip.tw-14,Y+6);this.skip.setPosition(LW-30-this.skip.tw-7,Y+8);this.cnt.setT((c.i+1)+' / '+c.L.length);this.cnt.setPosition(X+W-8-this.cnt.tw,by+6);this.skipB.setPosition(X+W-this.skip.tw-22,Y+6);this.skip.setPosition(X+W-this.skip.tw-15,Y+8)}
    // fotografia com movimento lento (o enquadramento abre devagar)
    const[cx,cy]=CUTC[s.img[1]]||CUTC.largo,tex=sc.textures.get(this.img.texture.key).getSourceImage(),k=Math.min(1,c.t/9),sc0=Math.max(W/(tex.width||640),H/150)*1.0,scl=sc0*(1.08-.06*k);
    const cw=W/scl,ch=H/scl,x0=clamp(cx-cw/2+(k-.5)*14,0,(tex.width||640)-cw),y0=clamp(cy-ch/2,0,(tex.height||270)-ch);
    this.img.setScale(scl).setCrop(x0,y0,cw,ch).setPosition(X-x0*scl,Y-y0*scl).setAlpha(Math.min(1,(performance.now()-(this.t0||0))/450));
    if(!this.sky){this.sky=skyFill(sc,X,Y,W,H,450.5)}this.sky.setVisible(/^rua|rua26/.test(this.img.texture.key));
    (this.fixO||[]).forEach(o=>o.destroy());this.fixO=[];stageFix(sc,this.fixO,this.img.texture.key,X,Y,W,H,x0,y0,scl,451.2);this.fixO.forEach(o=>o.setAlpha(this.img.alpha));
    const n=Math.floor(c.typed);if(n!==this.typed){this.typed=n;this.tx.setT(s.t,{w:this.tw,reveal:n});this.tx.setPosition(this.tx0,this.ty)}
    const done=c.typed>=s.t.length;[this.k,this.kt,this.kl].forEach(o=>o.setVisible(done))}
}

/* a faixa do palco no fundo tem letras ilegíveis: em todo recorte do cenário ela é pintada por cima, como no jogo */
function stageFix(sc,cont,key,X,Y,W,H,x0,y0,k,depth){let era=key==='rua96'?1:key==='rua00'?2:key==='rua91'?0:-1;if(S.mode==='f2'&&era===2)era=0;if(era<0)return;
  const g=sc.add.graphics();if(depth!=null)g.setDepth(depth);const R=(c,x,y,w,h)=>{const a=Math.max(X,X+(x-x0)*k),b=Math.max(Y,Y+(y-y0)*k),c2=Math.min(X+W,X+(x+w-x0)*k),d=Math.min(Y+H,Y+(y+h-y0)*k);if(c2>a&&d>b){g.fillStyle(c,1);g.fillRect(a,b,c2-a,d-b)}};
  R(0x2A1A10,1049,132,68,24);
  if(era===0){R(0xE3D6AE,1050,133,66,22);R(0xC9B98A,1050,153,66,2)}
  if(era===1){R(0xF2E7C9,1050,133,66,22);R(0xB33A2A,1050,133,66,2);R(0xB33A2A,1050,153,66,2)}
  if(era===2){R(0x0E1B33,1050,133,66,22);R(0x38D4F0,1050,133,66,1);R(0x38D4F0,1050,154,66,1)}
  cont.push(g);const cx=X+(1083-x0)*k,cy=Y+(144-y0)*k;
  if(era>0&&cx>X+10&&cx<X+W-10&&cy>Y+4&&cy<Y+H-4){const t=mkText(sc,0,0,era===1?[{t:'FESTA NO',b:1},{br:1},{t:'LARGO 96',b:1}]:[{t:'PELOURINHO',b:1},{br:1},{t:'2000',b:1}],{f:'ui',size:Math.max(3,7*k),lh:Math.max(3,8*k),align:'center',color:era===1?'#8A1F1A':'#7FF0FF',bold:era===1?'#8A1F1A':'#7FF0FF'});t.setOrigin(.5);t.setPosition(cx,cy);if(depth!=null)t.setDepth(depth+.1);cont.push(t)}}
function skyFill(sc,X,Y,W,H,depth){const g=sc.add.graphics();if(depth!=null)g.setDepth(depth);g.fillGradientStyle(0x7FB6E8,0x7FB6E8,0xF4DDB0,0xF4DDB0,1);g.fillRect(X,Y,W,H);return g}
