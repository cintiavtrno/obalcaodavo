/* =====================================================================
   RENDER (Phaser 3) · parte 1: texto pixel, utilidades, anims
   Lógica em unidades antigas (VW=960); o Phaser desenha em px lógicos = antigas/2.
   ===================================================================== */
const LW=LWX,LH=270,DX=Math.round((LWX-480)/2),H2=v=>v/2;
/* rua: a faixa andável (Y0..Y1) vira uma faixa de 22 px sobre a calçada (y 244..266), para o pé de todo mundo tocar o chão */
const SYB=246,SYH=16,SY=y=>SYB+(Math.min(Math.max(y,Y0),Y1)-Y0)*SYH/(Y1-Y0),SYinv=ry=>Y0+(ry-SYB)*(Y1-Y0)/SYH;
let HK=3;   // fator de resolução: o Phaser desenha em (LW*HK)x(LH*HK) e cada cena usa zoom HK; texto e painéis são vetoriais nessa grade
const FUI="'DMSans','DM Sans',system-ui,'Segoe UI',Roboto,sans-serif",FTX="'Atkinson','Atkinson Hyperlegible',system-ui,'Segoe UI',Roboto,sans-serif";
const FONTSTACK=FTX;
const TXT={ink:'#2B1A0E',cream:'#F5ECD8',yel:'#F2C46A',wood:'#5A3A24',dark:'#2A160A',pink:'#FF8AC8',grn:'#7CF0B8',blu:'#9FB4FF',ora:'#FF9A4A'};
/* cores de interface: versões contidas das cores de personagem (os sprites não mudam) */
const UIC={'#FF4DB8':'#C2577A','#19E68C':'#3E7B5C','#2F3BFF':'#2E4C80','#FF6A1F':'#C8642C','#FFD21F':'#E3A63C','#F4EFE0':'#E6D8B8','#6A2A5B':'#6A2A5B','#C2542B':'#B4452D'};
const uiC=c=>UIC[String(c||'').toUpperCase()]||c;
const plateTxt=c=>{const[r,g,b]=hex2rgb(uiC(c));return(r*.299+g*.587+b*.114)>150?'#2B1A0E':'#F5ECD8'};
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
  runs=toRuns(runs);const lh=Math.max(o.lh||Math.round(o.size*1.35),Math.ceil(o.size*1.22)); // nunca menor que o corpo da fonte (acentos não cortam)
  const L=layoutRuns(runs,o.size,o.w,lh,o.f);const pad=o.outline||o.shadow?2:0,padY=Math.max(pad,Math.ceil(o.size*.12));
  const W=Math.max(1,Math.ceil(o.w&&o.align!=='left'?o.w:L.W)+pad*2+1),Hh=Math.max(lh,L.H)+padY*2;
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
      const lx=pad+off+x.x,ly=padY+li*lh+lh/2,px=lx*kk,py=ly*kk;
      if(o.outline){g.lineWidth=Math.max(2,kk*1.6);g.strokeStyle=o.outline;g.strokeText(tt,px,py)}
      else if(o.shadow){g.fillStyle=o.shadow;g.fillText(tt,px,py+kk*.9)}
      g.fillStyle=col;g.fillText(tt,px,py);
      if(st.a&&x.t.trim()){g.fillRect(px,py+o.size*.5*kk,x.w*kk,Math.max(1,kk*.6));links.push({x:lx,y:padY+li*lh,w:x.w,h:lh,href:st.a})}})});
  return{canvas:cv,w:W,h:Hh,k:kk,links,lines:L.lines.length}}
function hex2rgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return[0,2,4].map(i=>parseInt(h.slice(i,i+2),16))}
let _tk=0;
/* imagem Phaser com texto; img.setT(str,opts) re-rasteriza */
function mkText(sc,x,y,str,o){
  const img=sc.add.image(x,y,'__DEFAULT').setOrigin(o&&o.ox!=null?o.ox:0,o&&o.oy!=null?o.oy:0);
  img._key=null;img._links=[];img._sc=sc;
  img.setT=function(s,o2){const ro=Object.assign({},o,o2||{});const r=pixText(s,ro);const key='pt'+(++_tk);
    const tex=this._sc.textures.addCanvas(key,r.canvas);tex.setFilter(Phaser.Textures.FilterMode.LINEAR);
    const old=this._key;this.setTexture(key);this.setScale(1/r.k);this._key=key;if(old&&this._sc.textures.exists(old))this._sc.textures.remove(old);
    this._links=r.links;this.tw=r.w;this.th=r.h;this.nLines=r.lines;return this};
  img.once('destroy',()=>{if(img._key&&sc.textures.exists(img._key))sc.textures.remove(img._key)});
  img.setT(str,o);return img}
/* ---- HTML (cartões/caderno) → blocos ---- */
function htmlToBlocks(html){
  const doc=new DOMParser().parseFromString('<body>'+html+'</body>','text/html');const out=[];
  const inline=(node,st,runs)=>{
    node.childNodes.forEach(c=>{
      if(c.nodeType===3){const t=c.textContent.replace(/\s+/g,' ');if(t.trim()||t===' ')runs.push(Object.assign({},st,{t}))}
      else if(c.nodeType===1){const tg=c.tagName.toLowerCase();
        if(tg==='br'){runs.push({br:1});return}
        const s2=Object.assign({},st);if(tg==='b'||tg==='strong')s2.b=1;if(tg==='a')s2.a=c.getAttribute('href');if(tg==='i'||tg==='em'){}
        inline(c,s2,runs)}})};
  const runsOf=n=>{const r=[];inline(n,{},r);while(r.length&&r[0].t&&!r[0].t.trim())r.shift();return r};
  const walk=(n,ctx)=>{
    n.childNodes.forEach(c=>{
      if(c.nodeType!==1)return;const tg=c.tagName.toLowerCase(),cl=c.className||'';
      const tc=(c.getAttribute('style')||'').match(/--tc:\s*([^;]+)/);const ctx2=Object.assign({},ctx,tc?{tc:tc[1].trim()}:{});
      if(tg==='section'){out.push({k:'secstart',tc:ctx2.tc||null});walk(c,ctx2);out.push({k:'secend'});return}
      if(tg==='div'&&/\bcxr\b/.test(cl)){const sp=c.querySelector('span'),b=c.querySelector('b');out.push({k:'row',a:sp?sp.textContent:'',b:b?b.textContent:'',cl});return}
      if(tg==='div'&&/\bnote-i\b/.test(cl)){const st=c.querySelector('strong');out.push({k:'sticky',t:st?st.textContent:'',body:c.textContent.replace(st?st.textContent:'','').trim(),bg:(c.getAttribute('style')||'').match(/background:\s*(#[0-9a-fA-F]{3,6})/)?.[1]||null,tc:ctx2.tc});return}
      if(tg==='div'&&/\bnote-e\b/.test(cl)){out.push({k:'empty'});return}
      if(tg==='div'&&/\blg\b/.test(cl)){const sp=c.querySelector('span'),b=c.querySelector('b');out.push({k:'log',a:sp?sp.textContent:'',b:b?b.textContent:''});return}
      if(tg==='div'&&/\bport\b/.test(cl)){out.push({k:'port',id:c.getAttribute('data-k')});return}
      if(tg==='div'||tg==='ul'||tg==='ol'||tg==='button'&&false){if(/\bnews\b/.test(cl))out.push({k:'newsstart'});walk(c,ctx2);if(/\bnews\b/.test(cl))out.push({k:'newsend'});return}
      if(tg==='li'){out.push({k:'li',r:runsOf(c)});return}
      if(tg==='h2'){out.push({k:/\bbig\b/.test(cl)?'h2big':'h2',r:runsOf(c)});return}
      if(tg==='h3'){out.push({k:'h3',r:runsOf(c),tc:ctx2.tc});return}
      if(tg==='p'||tg==='small'){out.push({k:'p',cl:cl,r:runsOf(c)});return}
      if(/\bcx\b|\byear\b/.test(cl)){out.push({k:/year/.test(cl)?'year':'p',r:runsOf(c),cl});return}
      if(c.children.length)walk(c,ctx2);else if(c.textContent.trim())out.push({k:'p',cl,r:runsOf(c)})})};
  walk(doc.body,{});return out}
const pick1=a=>a[Math.floor(Math.random()*a.length)];
const SKYK2=[[6.5,'#7C9BC4','#F2B98A'],[8,'#7FB6E8','#F4DDB0'],[12,'#5FA8E8','#CFE6F4'],[16,'#7AB0E4','#F6DDA8'],[17.6,'#E88E5A','#FFD08A'],[18.6,'#6A4A94','#F28A5A'],[19.6,'#1B1B4A','#3A2F6E']];
function skyAt2(h){let a=SKYK2[0],b=SKYK2[SKYK2.length-1];for(let i=0;i<SKYK2.length-1;i++)if(h>=SKYK2[i][0]&&h<=SKYK2[i+1][0]){a=SKYK2[i];b=SKYK2[i+1]}const t=clamp((h-a[0])/((b[0]-a[0])||1),0,1);return[mix(a[1],b[1],t),mix(a[2],b[2],t)]}
const darkness=()=>clamp((S.min/60-17)/2.4,0,1)*.62;
const RIGS=Object.keys(ASSETS.rigs);
const GROUPS={};
for(const name in ASSETS.atlases.chars.json.frames){const m=/^([^/]+)\/(.+)_(\d+)$/.exec(name);if(!m)continue;const k=m[1]+'/'+m[2];(GROUPS[k]=GROUPS[k]||[])[+m[3]]=name}
const hasG=(rig,g)=>!!GROUPS[rig+'/'+g];
/* escolhe grupo e flip de um sheet para a direção pedida */
function pickGroup(rig,dir){
  if(dir==='up'){if(hasG(rig,'up'))return{g:'up',f:false};if(hasG(rig,'sup'))return{g:'sup',f:false};}
  if(dir==='down'){if(hasG(rig,'down'))return{g:'down',f:false};if(hasG(rig,'sdown'))return{g:'sdown',f:false}}
  if(dir==='left'||dir==='right'){
    if(hasG(rig,dir))return{g:dir,f:false};const o=dir==='left'?'right':'left';if(hasG(rig,o))return{g:o,f:true};
    if(hasG(rig,'side'))return{g:'side',f:dir==='left'};
    if(hasG(rig,'down'))return{g:'down',f:dir==='left'}}
  const any=['down','sdown','cruz','a','serio'].find(g=>hasG(rig,g))||Object.keys(GROUPS).find(k=>k.startsWith(rig+'/')).split('/')[1];
  return{g:any,f:false}}

/* ---- painéis pixel: contorno de 1 px, canto chanfrado, brilho em cima, sombra seca embaixo ----
   f preenchimento · b contorno · h brilho · s sombra (sb px) · sd laterais · i filete interno (placas) */
const INK='#1C110A';
const PSTY={
  wood9:{f:'#6A4327',b:INK,h:'#8C5A33',s:'#4A2E1A',sb:1},
  wood9d:{f:'#4B2F1D',b:INK,h:'#6A4327',s:'#2E1C10',sb:1},
  paper9:{f:'#F2E5C6',b:INK,h:'#FBF4E0',s:'#E3D0A6',sb:2},
  btn9:{f:'#E3A63C',b:INK,h:'#F6CF7E',s:'#B9792A',sb:2},
  btn9h:{f:'#F0B850',b:INK,h:'#FBE0A0',s:'#C4842E',sb:2},
  btn9s:{f:'#3B2617',b:INK,h:'#5A3D27',s:'#24170E',sb:2},
  bub9:{f:'#FBF4E0',b:INK,s:'#E3D0A6',sb:1},
  frame:{f:'#5C4330',b:INK,i:'#B07A45'},
  dark9:{f:'#2A1A11',b:INK,h:'#4A3020',s:'#1F130C',sb:1,sd:'#3A2517'},
  key9:{f:'#F5ECD8',b:INK,h:'#FFFFFF',s:'#C9B184',sb:3},
  plate9:{f:'#FFFFFF',b:INK,i:'rgba(255,255,255,.6)',s:'rgba(0,0,0,.25)',sb:1},
  row9:{f:'#3A2618',s:'#2E1E14',sb:1},
  row9h:{f:'#46301F',b:'#E3A63C',s:'#2F1F14',sb:1},
  cover9:{f:'#4A2C1C',b:INK,h:'#6E4730',s:'#2E1A10',sb:2}};
function _mulHex(base,tint){if(!/^#/.test(base))return base;const b=hex2rgb(base);return'rgb('+b.map((v,i)=>Math.round(v*((tint>>(16-8*i))&255)/255)).join(',')+')'}
function panelTex(sc,sty,w,h,tint){
  const k=Math.min(HK,4),tk=tint==null?'n':tint;const key='pp|'+sty+'|'+w+'x'+h+'|'+k+'|'+tk;
  if(!sc.textures.exists(key)){const S=PSTY[sty],cw=Math.max(2,Math.round(w*k)),ch=Math.max(2,Math.round(h*k)),u=k;
    const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const g=cv.getContext('2d');
    const T=c=>tint==null?c:_mulHex(c,tint),F=(c,x,y,ww,hh)=>{g.fillStyle=c;g.fillRect(x,y,ww,hh)};
    const o=S.b?u:0;
    if(S.b)F(S.b,0,0,cw,ch);
    F(T(S.f),o,o,cw-2*o,ch-2*o);
    if(S.h)F(T(S.h),o,o,cw-2*o,u);
    if(S.sd){F(T(S.sd),o,o+u,u,ch-2*o-2*u);F(T(S.sd),cw-o-u,o+u,u,ch-2*o-2*u)}
    if(S.s&&ch>6*u)F(T(S.s),o,ch-o-(S.sb||1)*u,cw-2*o,(S.sb||1)*u);
    if(S.i&&cw>8*u&&ch>8*u){g.fillStyle=S.i;g.fillRect(o+u,o+u,cw-2*o-2*u,u);g.fillRect(o+u,ch-o-2*u-(S.s?(S.sb||1)*u:0),cw-2*o-2*u,u);g.fillRect(o+u,o+u,u,ch-2*o-2*u-(S.s?(S.sb||1)*u:0));g.fillRect(cw-o-2*u,o+u,u,ch-2*o-2*u-(S.s?(S.sb||1)*u:0))}
    if(S.b){g.clearRect(0,0,u,u);g.clearRect(cw-u,0,u,u);g.clearRect(0,ch-u,u,u);g.clearRect(cw-u,ch-u,u,u)}
    sc.textures.addCanvas(key,cv).setFilter(Phaser.Textures.FilterMode.NEAREST)}
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
