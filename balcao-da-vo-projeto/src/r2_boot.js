/* ===== parte 2: Boot/Preload (barra de progresso), texturas procedurais, animações, jogo ===== */
/* true = a tela só cresce em múltiplos inteiros de 480×270 (pixels sempre iguais; sobra margem). false = preenche a janela, com pixels de tamanho um pouco irregular. */
const INTEGER_SCALE=false;
const G={ready:false,game:null,fontOk:false,t0:0};
const FR=n=>({key:'ui',frame:n});
function canvasTex(sc,key,w,h,fn){if(sc.textures.exists(key))sc.textures.remove(key);const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;fn(g,w,h);const t=sc.textures.addCanvas(key,c);t.setFilter(Phaser.Textures.FilterMode.NEAREST);return t}
const R=(g,c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
class Boot extends Phaser.Scene{
  constructor(){super('Boot')}
  preload(){
    const W=LW,Hh=LH;this.cameras.main.setBackgroundColor('#1a0f0a');
    const gfx=this.add.graphics();
    const draw=p=>{gfx.clear();gfx.fillStyle(0x3b1f0e,1).fillRect(90,148,300,14);gfx.fillStyle(0x7a4a2a,1).fillRect(92,150,296,10);gfx.fillStyle(0xffd21f,1).fillRect(92,150,Math.round(296*p),10);gfx.fillStyle(0xffe98a,1).fillRect(92,150,Math.round(296*p),3)};
    draw(0);
    this.title=this.add.text(W/2,112,'O balcão da vó',{fontFamily:FUI,fontSize:'26px',fontStyle:'700',color:'#FFD21F'}).setOrigin(.5).setResolution(HK);
    this.sub=this.add.text(W/2,134,'carregando a padaria…',{fontFamily:FTX,fontSize:'12px',color:'#F4EFE0'}).setOrigin(.5).setResolution(HK);
    this.foot=this.add.text(W/2,Hh-14,'O que a cidade mede · Pelourinho 1991–2000',{fontFamily:FTX,fontSize:'8px',color:'#a98a6a'}).setOrigin(.5).setResolution(HK);
    this.prog=0;this.fake=0;this.draw=draw;G.t0=performance.now();
    this.load.on('progress',v=>{this.prog=v});
    const A=ASSETS;
    this.load.atlas('chars',A.atlases.chars.img,A.atlases.chars.json);
    this.load.atlas('ui',A.atlases.ui.img,A.atlases.ui.json);
    if(A.atlases.xtra)this.load.atlas('xtra',A.atlases.xtra.img,A.atlases.xtra.json);
    for(const k in A.images)this.load.image(k,A.images[k]);
    if(typeof ASSETS2!=='undefined')for(const k in ASSETS2){const a=ASSETS2[k];if(a.fw)this.load.spritesheet(k,a.src,{frameWidth:a.fw,frameHeight:a.fh});else this.load.image(k,a.src)}
    this.fontP=Promise.race([Promise.all([document.fonts.load("600 16px DMSans"),document.fonts.load("700 16px DMSans"),document.fonts.load("400 16px Atkinson"),document.fonts.load("700 16px Atkinson")].map(p=>p.catch(()=>0))),new Promise(r=>setTimeout(r,2600))]).then(()=>{G.fontOk=!!(document.fonts.check&&document.fonts.check("400 16px Atkinson"));this.title.setFontFamily(FUI);this.sub.setFontFamily(FTX);this.foot.setFontFamily(FTX)});
  }
  update(t,dt){const el=(performance.now()-G.t0)/1000;const target=Math.min(this.prog*.8+(G.fontOk?.2:0.08),el/1.1);this.fake+=(target-this.fake)*.2;this.draw(Math.min(1,this.fake))}
  create(){
    this.draw(1);
    this.makeAnims();this.makeTextures();try{f2LiaTex(this)}catch(e){console.warn('lia26',e)}
    const go=()=>{this.scene.launch('Rua');this.scene.launch('Padaria');this.scene.launch('UI');this.scene.stop('Boot');G.ready=true;startGame()};
    const wait=Math.max(0,1100-(performance.now()-G.t0));
    Promise.all([this.fontP,new Promise(r=>setTimeout(r,wait))]).then(()=>{this.sub.setText('pronto');setTimeout(go,120)})}
  makeAnims(){
    const fpsOf=k=>{const [r,g]=k.split('/');if(r==='vo')return 3;if(r==='jornal')return 2.5;if(r==='secret')return 3;if(g==='slow')return 4;if(r==='bia'||r==='caio')return 4;if(/^s(down|up)$|^side$/.test(g))return 9;return 8};
    for(const k in GROUPS){const fr=GROUPS[k].filter(Boolean);if(fr.length<2)continue;this.anims.create({key:k,frames:fr.map(f=>({key:'chars',frame:f})),frameRate:fpsOf(k),repeat:-1})}
    const XF=(k,n,fps)=>this.anims.create({key:k,frames:[...Array(n)].map((_,i)=>({key:'xtra',frame:k+'_'+i})),frameRate:fps,repeat:-1});
    XF('olo/trio',4,5);XF('olo/walk',4,6);XF('pint/arm',4,3);XF('pint/face',4,3);XF('pint/duo',4,3);
    ['serio','sorri'].forEach(m=>this.anims.create({key:'sec2/'+m,frames:[0,1,2,3].map(i=>({key:'xtra',frame:'sec2/'+m+'_'+i})),frameRate:3,repeat:-1}));
    this.anims.create({key:'coin',frames:['fx_moeda_giro_1','fx_moeda_giro_2','fx_moeda_giro_3','fx_moeda_giro_4'].map(FR),frameRate:9,repeat:-1});
    this.anims.create({key:'forno',frames:['forno_fogo_medio','forno_fogo_alto','forno_brasa','forno_fogo_alto'].map(FR),frameRate:3,repeat:-1});
    this.anims.create({key:'domino',frames:['domino_mesa_quatro_pessoas_a','domino_mesa_quatro_pessoas_a','domino_mesa_quatro_pessoas_b_faisca'].map(FR),frameRate:1.4,repeat:-1});
    this.anims.create({key:'baiana',frames:['baiana_parada','baiana_leque_aceno','baiana_parada','baiana_leque_peito'].map(FR),frameRate:1.6,repeat:-1});
    this.anims.create({key:'spark',frames:['fx_brilho_minimo','fx_brilho_pequeno','fx_brilho_claro','fx_brilho_grande','fx_brilho_claro','fx_brilho_pequeno','fx_brilho_minimo'].map(FR),frameRate:14,repeat:0});
    this.anims.create({key:'star',frames:[FR('ui_estrela_cheia')],frameRate:1});
    this.anims.create({key:'seta',frames:['ui_seta_proxima_a','ui_seta_proxima_b'].map(FR),frameRate:3,repeat:-1});
    this.anims.create({key:'vapor',frames:['fx_fumaca_1','fx_fumaca_2','fx_fumaca_3','fx_fumaca_4_dissipando'].map(FR),frameRate:5,repeat:0})}
  makeTextures(){
    const sc=this;
    canvasTex(sc,'px',2,2,(g)=>R(g,'#fff',0,0,2,2));
    canvasTex(sc,'dot1',1,1,(g)=>R(g,'#fff',0,0,1,1));
    canvasTex(sc,'shadow',34,9,(g,w,h)=>{[[w/2,h/2,.16],[w/2*.82,h/2*.82,.18],[w/2*.6,h/2*.6,.22]].forEach(([rx,ry,al])=>{g.fillStyle='rgba(20,8,2,'+al+')';g.beginPath();g.ellipse(w/2,h/2,rx,ry,0,0,Math.PI*2);g.fill()})});
    canvasTex(sc,'vig',LW,LH,(g,w,h)=>{const gr=g.createRadialGradient(w/2,h/2,h*.42,w/2,h/2,w*.62);gr.addColorStop(0,'rgba(10,4,0,0)');gr.addColorStop(1,'rgba(10,4,0,.62)');g.fillStyle=gr;g.fillRect(0,0,w,h)});
    canvasTex(sc,'grain',128,128,(g,w,h)=>{const id=g.createImageData(w,h);for(let i=0;i<w*h;i++){const v=Math.random()*255|0,a=Math.random()<.5?0:(Math.random()*70|0);id.data[i*4]=v;id.data[i*4+1]=v;id.data[i*4+2]=v;id.data[i*4+3]=a}g.putImageData(id,0,0)});
    canvasTex(sc,'glow',64,64,(g)=>{const gr=g.createRadialGradient(32,32,1,32,32,32);gr.addColorStop(0,'rgba(255,214,120,.95)');gr.addColorStop(.4,'rgba(255,170,60,.42)');gr.addColorStop(1,'rgba(255,140,40,0)');g.fillStyle=gr;g.fillRect(0,0,64,64)});
    canvasTex(sc,'shaft',220,150,(g,w,h)=>{const gr=g.createLinearGradient(w,0,0,h);gr.addColorStop(0,'rgba(255,226,150,.55)');gr.addColorStop(.6,'rgba(255,214,130,.22)');gr.addColorStop(1,'rgba(255,200,110,0)');g.fillStyle=gr;g.beginPath();g.moveTo(w,0);g.lineTo(w,h*.52);g.lineTo(10,h);g.lineTo(0,h*.55);g.closePath();g.fill()});
    canvasTex(sc,'sunlay',LW,LH,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'rgba(255,230,160,.30)');gr.addColorStop(.5,'rgba(255,220,150,.08)');gr.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=gr;g.fillRect(0,0,w,h)});
    G.skyTex=canvasTex(sc,'skyg',2,64,(g,w,h)=>{R(g,'#7FB6E8',0,0,w,h)});
    // balão de fala (9-slice 12x12) e rabinho
    canvasTex(sc,'bub9',12,12,(g)=>{R(g,'#3B1F0E',0,0,12,12);R(g,'#F8F0DC',1,1,10,10);g.clearRect(0,0,1,1);g.clearRect(11,0,1,1);g.clearRect(0,11,1,1);g.clearRect(11,11,1,1);R(g,'#3B1F0E',1,1,1,1);R(g,'#3B1F0E',10,1,1,1);R(g,'#3B1F0E',1,10,1,1);R(g,'#3B1F0E',10,10,1,1)});
    canvasTex(sc,'tail',9,5,(g)=>{R(g,'#3B1F0E',0,0,9,1);R(g,'#F8F0DC',1,0,7,1);R(g,'#3B1F0E',1,1,1,1);R(g,'#F8F0DC',2,1,5,1);R(g,'#3B1F0E',7,1,1,1);R(g,'#3B1F0E',2,2,1,1);R(g,'#F8F0DC',3,2,3,1);R(g,'#3B1F0E',6,2,1,1);R(g,'#3B1F0E',3,3,1,1);R(g,'#F8F0DC',4,3,1,1);R(g,'#3B1F0E',5,3,1,1);R(g,'#3B1F0E',4,4,1,1)});
    // painel de madeira (9-slice 16x16) e papel
    canvasTex(sc,'wood9',16,16,(g)=>{R(g,'#2A160A',0,0,16,16);R(g,'#8B5A33',1,1,14,14);R(g,'#A66F42',2,2,12,2);R(g,'#6E4425',2,12,12,2);R(g,'#7D4F2D',2,4,12,8);for(let i=0;i<4;i++)R(g,'#8B5A33',2,5+i*2,12,1);g.clearRect(0,0,1,1);g.clearRect(15,0,1,1);g.clearRect(0,15,1,1);g.clearRect(15,15,1,1)});
    canvasTex(sc,'wood9d',16,16,(g)=>{R(g,'#1d0e05',0,0,16,16);R(g,'#5A3A24',1,1,14,14);R(g,'#704828',2,2,12,1);R(g,'#4A2E1A',2,3,12,11);for(let i=0;i<4;i++)R(g,'#523520',2,4+i*3,12,1);g.clearRect(0,0,1,1);g.clearRect(15,0,1,1);g.clearRect(0,15,1,1);g.clearRect(15,15,1,1)});
    canvasTex(sc,'paper9',16,16,(g)=>{const W=16,H=16;R(g,'#1C110A',0,0,16,16);R(g,'#F2E5C6',1,1,14,14);R(g,'#FBF4E0',1,1,14,1);R(g,'#E3D0A6',1,13,14,2);R(g,'#E3D0A6',14,1,1,14);g.clearRect(0,0,1,1);g.clearRect(W-1,0,1,1);g.clearRect(0,H-1,1,1);g.clearRect(W-1,H-1,1,1)});
    canvasTex(sc,'btn9',12,12,(g)=>{const W=12,H=12;R(g,'#1C110A',0,0,12,12);R(g,'#E3A63C',1,1,10,10);R(g,'#F6CF7E',1,1,10,1);R(g,'#B9792A',1,9,10,2);g.clearRect(0,0,1,1);g.clearRect(W-1,0,1,1);g.clearRect(0,H-1,1,1);g.clearRect(W-1,H-1,1,1)});
    canvasTex(sc,'btn9h',12,12,(g)=>{const W=12,H=12;R(g,'#1C110A',0,0,12,12);R(g,'#F0B850',1,1,10,10);R(g,'#FBE0A0',1,1,10,1);R(g,'#C4842E',1,9,10,2);g.clearRect(0,0,1,1);g.clearRect(W-1,0,1,1);g.clearRect(0,H-1,1,1);g.clearRect(W-1,H-1,1,1)});
    canvasTex(sc,'btn9s',12,12,(g)=>{const W=12,H=12;R(g,'#1C110A',0,0,12,12);R(g,'#3B2617',1,1,10,10);R(g,'#5A3D27',1,1,10,1);R(g,'#24170E',1,9,10,2);g.clearRect(0,0,1,1);g.clearRect(W-1,0,1,1);g.clearRect(0,H-1,1,1);g.clearRect(W-1,H-1,1,1)});
    canvasTex(sc,'dark9',12,12,(g)=>{const W=12,H=12;R(g,'#1C110A',0,0,12,12);R(g,'#2A1A11',1,1,10,10);R(g,'#4A3020',1,1,10,1);R(g,'#3A2517',1,2,1,8);R(g,'#3A2517',10,2,1,8);R(g,'#1F130C',1,10,10,1);g.clearRect(0,0,1,1);g.clearRect(W-1,0,1,1);g.clearRect(0,H-1,1,1);g.clearRect(W-1,H-1,1,1)});
    canvasTex(sc,'key9',12,13,(g)=>{const W=12,H=13;R(g,'#1C110A',0,0,12,13);R(g,'#F5ECD8',1,1,10,11);R(g,'#FFFFFF',1,1,10,1);R(g,'#C9B184',1,9,10,3);g.clearRect(0,0,1,1);g.clearRect(W-1,0,1,1);g.clearRect(0,H-1,1,1);g.clearRect(W-1,H-1,1,1)});
    canvasTex(sc,'plate9',12,12,(g)=>{const W=12,H=12;R(g,'#1C110A',0,0,12,12);R(g,'#C8C8C8',1,1,10,10);R(g,'#FFFFFF',2,2,8,1);R(g,'#FFFFFF',2,9,8,1);R(g,'#FFFFFF',2,2,1,8);R(g,'#FFFFFF',9,2,1,8);R(g,'#9A9A9A',1,10,10,1);g.clearRect(0,0,1,1);g.clearRect(W-1,0,1,1);g.clearRect(0,H-1,1,1);g.clearRect(W-1,H-1,1,1)});
    canvasTex(sc,'row9',12,12,(g)=>{const W=12,H=12;R(g,'#3A2618',0,0,12,12);R(g,'#2E1E14',0,11,12,1);g.clearRect(0,0,1,1);g.clearRect(W-1,0,1,1);g.clearRect(0,H-1,1,1);g.clearRect(W-1,H-1,1,1)});
    canvasTex(sc,'row9h',12,12,(g)=>{const W=12,H=12;R(g,'#E3A63C',0,0,12,12);R(g,'#46301F',1,1,10,10);R(g,'#2F1F14',1,10,10,1);g.clearRect(0,0,1,1);g.clearRect(W-1,0,1,1);g.clearRect(0,H-1,1,1);g.clearRect(W-1,H-1,1,1)});
    canvasTex(sc,'cover9',16,16,(g)=>{const W=16,H=16;R(g,'#1C110A',0,0,16,16);R(g,'#4A2C1C',1,1,14,14);R(g,'#6E4730',1,1,14,1);R(g,'#2E1A10',1,13,14,2);for(let i=0;i<3;i++)R(g,'#43281A',2,4+i*3,12,1);g.clearRect(0,0,1,1);g.clearRect(W-1,0,1,1);g.clearRect(0,H-1,1,1);g.clearRect(W-1,H-1,1,1)});
    canvasTex(sc,'pagefill',4,4,(g)=>{R(g,'#F2E5C6',0,0,4,4)});
    // marcador (setinha para baixo) e "!" de tarefa
    canvasTex(sc,'mark',13,13,(g)=>{R(g,'#1C110A',1,0,11,10);R(g,'#1C110A',0,1,13,8);R(g,'#F5ECD8',1,1,11,6);R(g,'#FFFFFF',2,1,9,1);R(g,'#C9B184',1,7,11,2);R(g,'#1C110A',4,10,5,1);R(g,'#1C110A',5,11,3,1);R(g,'#1C110A',6,12,1,1)});
    canvasTex(sc,'markq',13,13,(g)=>{R(g,'#1C110A',1,0,11,10);R(g,'#1C110A',0,1,13,8);R(g,'#B4452D',1,1,11,6);R(g,'#D86A50',2,1,9,1);R(g,'#7E2C1C',1,7,11,2);R(g,'#1C110A',4,10,5,1);R(g,'#1C110A',5,11,3,1);R(g,'#1C110A',6,12,1,1)});
    // ônibus (placeholder procedural)
    canvasTex(sc,'bus',208,77,(g)=>{const K=1.6,P_=v=>Math.round(v*K),S_=v=>v<=1?v:Math.round(v*K),R=(g,c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(P_(x),P_(y),S_(w),S_(h))};
      R(g,'#2A160A',2,6,126,36);R(g,'#E8B02A',3,7,124,31);R(g,'#F6D060',3,7,124,3);R(g,'#C8861A',3,34,124,4);
      R(g,'#2A160A',3,18,124,1);R(g,'#E8523A',3,20,124,5);R(g,'#2A160A',3,25,124,1);
      for(let i=0;i<8;i++){R(g,'#2A160A',10+i*14,10,11,9);R(g,'#9EC9E0',11+i*14,11,9,7);R(g,'#D6EEF6',11+i*14,11,3,3)}
      R(g,'#2A160A',108,10,16,24);R(g,'#9EC9E0',109,11,14,22);R(g,'#D6EEF6',109,11,4,8);R(g,'#2A160A',2,27,3,8);R(g,'#FFE98A',3,28,2,4);
      R(g,'#F4EFE0',20,28,60,7);R(g,'#2A160A',20,28,60,1);R(g,'#2A160A',20,34,60,1);
      for(const x of [24,92]){R(g,'#17100A',x-1,32,18,14);R(g,'#17100A',x,31,16,16);R(g,'#555',x+3,35,10,8);R(g,'#999',x+5,37,6,4)}
      g.clearRect(0,0,P_(2),P_(6));g.clearRect(P_(128),0,P_(2),P_(6))});
    canvasTex(sc,'gradil',100,30,(g)=>{for(let i=0;i<8;i++){R(g,'#2A2A2A',i*13+1,3,5,26);R(g,'#B7B3A8',i*13+2,4,3,24);R(g,'#E2DED2',i*13+2,4,1,24)}R(g,'#2A2A2A',0,5,100,5);R(g,'#B7B3A8',0,6,100,3);R(g,'#2A2A2A',0,20,100,5);R(g,'#B7B3A8',0,21,100,3);});
    canvasTex(sc,'orelhao',18,34,(g)=>{R(g,'#2A160A',6,14,6,20);R(g,'#4A4A4A',7,15,4,18);R(g,'#2A160A',1,2,16,14);R(g,'#E8782A',2,3,14,12);R(g,'#F6A04A',2,3,14,3);R(g,'#B84E14',2,12,14,3);R(g,'#2A160A',5,8,8,5);R(g,'#1A0E08',6,9,6,3);g.clearRect(1,2,2,1);g.clearRect(15,2,2,1)});
    canvasTex(sc,'pomba',11,8,(g)=>{const K='#2B2622';R(g,K,2,3,7,4);R(g,K,7,1,3,4);R(g,K,1,4,1,2);R(g,'#8E8C93',3,4,5,2);R(g,'#6E6C74',3,4,3,1);R(g,'#A8A6AE',7,2,2,2);R(g,'#5E8A7A',7,4,2,1);R(g,'#141210',8,2,1,1);R(g,'#D88A3A',10,3,1,1);R(g,'#C8743A',4,7,1,1);R(g,'#C8743A',6,7,1,1)});
    canvasTex(sc,'pombaf',13,8,(g)=>{const K='#2B2622';R(g,K,0,1,5,3);R(g,K,8,0,5,3);R(g,K,3,3,7,3);R(g,'#A8A6AE',1,2,3,1);R(g,'#A8A6AE',9,1,3,1);R(g,'#8E8C93',4,4,5,1);R(g,K,10,3,3,3);R(g,'#A8A6AE',10,4,2,1);R(g,'#D88A3A',12,4,1,1)});
    canvasTex(sc,'pomba_old',9,6,(g)=>{R(g,'#2A160A',1,2,7,3);R(g,'#C9C4B8',2,2,5,2);R(g,'#E8E4D8',3,1,3,2);R(g,'#2A160A',6,0,3,3);R(g,'#D8D4C8',7,1,1,1);R(g,'#E8782A',8,2,1,1)});
    canvasTex(sc,'pombaf_old',11,7,(g)=>{R(g,'#C9C4B8',1,3,8,2);R(g,'#E8E4D8',0,1,4,2);R(g,'#E8E4D8',5,0,5,2);R(g,'#2A160A',9,3,2,2)});
    canvasTex(sc,'cachorro',34,22,(g)=>{R(g,'#2A160A',7,6,22,10);R(g,'#E8A04A',8,7,20,8);R(g,'#C68B3C',8,13,20,2);R(g,'#2A160A',26,2,8,8);R(g,'#E8A04A',27,3,6,6);R(g,'#C68B3C',26,2,3,4);R(g,'#2A160A',33,6,1,1);R(g,'#2A160A',3,2,5,6);R(g,'#E8A04A',4,3,3,4);for(const x of [9,13,22,26]){R(g,'#2A160A',x,15,4,6);R(g,'#C68B3C',x+1,15,2,5)}R(g,'#2A160A',30,5,1,1)});
    canvasTex(sc,'orelha_sign',1,1,(g)=>R(g,'#000',0,0,1,1));
    canvasTex(sc,'fire',16,28,(g)=>{R(g,'#7A1A00',5,14,6,14);R(g,'#E8481A',3,10,10,18);R(g,'#FF8A2A',4,6,8,20);R(g,'#FFD21F',6,12,4,14);R(g,'#FFF3B0',7,18,2,8);g.clearRect(0,0,16,4);R(g,'#E8481A',7,3,2,8)});
    canvasTex(sc,'rain',2,8,(g)=>{R(g,'rgba(220,230,255,.85)',0,0,1,8);R(g,'rgba(220,230,255,.5)',1,3,1,5)});
    canvasTex(sc,'cardbg',LW,LH,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#F2E5C6');gr.addColorStop(1,'#E8D7B0');g.fillStyle=gr;g.fillRect(0,0,w,h)});
    canvasTex(sc,'tvscan',160,4,(g)=>{R(g,'rgba(0,0,0,.28)',0,0,160,1);R(g,'rgba(0,0,0,.12)',0,1,160,1)});
    canvasTex(sc,'chalk',48,64,(g)=>{R(g,'#1E3C38',0,0,48,64)});
    ['vig','glow','shaft','sunlay','skyg','shadow','cardbg','tvscan'].forEach(k=>{if(sc.textures.exists(k))sc.textures.get(k).setFilter(Phaser.Textures.FilterMode.LINEAR)});
  }
}
function fitGame(){
  const el=document.getElementById('game');if(!el)return;
  const W=document.documentElement.clientWidth,Hh=document.documentElement.clientHeight;
  el.style.width=W+'px';el.style.height=Hh+'px';G.scale=Math.min(W/LW,Hh/LH);
  if(G.game){G.game.scale.getParentBounds();G.game.scale.refresh()}}
function bootPhaser(){
  // painéis 9-slice e o filtro de época dependem de WebGL: se faltar, avisa em vez de abrir um jogo sem interface
  let gl=null;try{const c=document.createElement('canvas');gl=c.getContext('webgl2')||c.getContext('webgl')}catch(e){}
  if(!gl){const m=document.getElementById('nocdn');if(m){m.firstElementChild.innerHTML='Este navegador está sem WebGL.<br>Ative a aceleração de hardware ou abra o jogo em outro navegador.';m.style.display='flex'}return}
  HK=Math.max(2,Math.min(6,Math.ceil((window.innerWidth*(window.devicePixelRatio||1))/LW-.05)));
  const cfg={type:Phaser.WEBGL,parent:'game',width:LW*HK,height:LH*HK,backgroundColor:'#1a0f0a',pixelArt:true,roundPixels:true,antialias:false,
    scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:LW*HK,height:LH*HK},
    render:{pixelArt:true,roundPixels:true,antialias:false,powerPreference:'high-performance'},
    input:{keyboard:false,mouse:{preventDefaultWheel:false}},
    scene:[Boot,Rua,Padaria,UI]};
  fitGame();G.game=new Phaser.Game(cfg);window.__phaser=G.game;
  G.game.events.on('prerender',()=>{for(const sc of G.game.scene.scenes){const c=sc.cameras&&sc.cameras.main;if(c&&c.zoom!==HK){c.setOrigin(0,0);c.setZoom(HK)}}});
  addEventListener('resize',fitGame);
  G.game.events.on('prestep',(t,d)=>{if(!G.ready)return;const dt=Math.min(.05,d/1000);if(!document.hidden)tickLogic(dt)});
}
let _accT=0;
function tickLogic(dt){try{update(dt)}catch(e){console.error('update',e)}}
