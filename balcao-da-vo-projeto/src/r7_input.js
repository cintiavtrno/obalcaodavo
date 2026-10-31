/* ===== parte 7: teclado, estações clicáveis, ganchos ===== */
const UIs=()=>G.game&&G.game.scene.getScene('UI');
addEventListener('keydown',e=>{const k=e.key;if(!G.ready)return;
 if(S.scene==='cut'){if(!e.repeat){if(k==='Escape')cutNext(true);else if(k==='e'||k==='E'||k==='Enter'||k===' '||k==='ArrowRight'){e.preventDefault();cutNext()}}return}
 if(S.scene==='card'){
  if(S.card&&S.card.opts&&/^[1-9]$/.test(k)&&!e.repeat){e.preventDefault();UIs().cardPick(+k-1);return}
  if(!e.repeat&&(k==='e'||k==='E'||k==='1'||k==='Enter')){e.preventDefault();UIs().cardGo();return}
  const u=UIs();if(['ArrowDown','ArrowUp','PageDown','PageUp','ArrowLeft','ArrowRight',' '].includes(k)){e.preventDefault();u.flip(k==='ArrowUp'||k==='PageUp'||k==='ArrowLeft'?-1:1)}return}
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(k))e.preventDefault();
 if(S.scene==='menu'||(S.scene==='dialog'&&S.d&&S.d.ch)){const list=S.scene==='menu'?S.menu.opts:S.d.opts;
  if(/^[1-9]$/.test(k)){const o=list[+k-1];if(o){if(S.scene==='menu')o[2]();else pickCh(o)}return}
  if(k==='Escape'&&S.scene==='menu'){if(S.menu.lvl==='root')closeMenu();else{S.menu.lvl='root';renderMenu()}}return}
 if(S.scene==='nb'){const u=UIs(),bk=u.book;if(k==='c'||k==='C'||k==='Escape')closeNb();else if(k==='ArrowDown')bk.move(1);else if(k==='ArrowUp')bk.move(-1);else if(k==='ArrowRight'||k==='Tab'){e.preventDefault();bk.goTab(S.nbTab+1)}else if(k==='ArrowLeft')bk.goTab(S.nbTab-1);else if(k==='PageDown')bk.scroll('r',40);else if(k==='PageUp')bk.scroll('r',-40);else if(/^[1-5]$/.test(k))bk.goTab(+k-1);return}
 if(k==='c'||k==='C'){openNb();return}
 if(k==='q'||k==='Q'){if(S.scene==='play')backTray();return}
 if(k===' '||k==='Enter'||k==='e'||k==='E'){if(k===' ')e.preventDefault();if(!e.repeat)interact();return}
 const kk=k.length===1?k.toLowerCase():k;if(['w','a','s','d','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(kk)){S.want=null}
 S.keys[kk]=true});
addEventListener('keyup',e=>{S.keys[e.key.length===1?e.key.toLowerCase():e.key]=false});
addEventListener('blur',()=>{for(const k in S.keys)S.keys[k]=false});
/* clicar num item do balcão: a Lia anda até a estação e age */
const _tick=tickLogic;tickLogic=function(dt){_tick(dt);
 if(S.want){if(S.t-S.want.t>7||S.scene!=='play'){S.want=null}
  else if(S.tgt&&S.tgt.k==='st'&&S.tgt.i===S.want.i&&!S.walk&&S.tx==null){S.want=null;interact()}}};
/* mesa de dominó: abre o painel de zoom enquanto o diálogo dela durar */
const _od=openDlg;openDlg=function(script,done){try{const f=script&&script[0];
 if(f&&typeof f[1]==='string'&&f[1].indexOf('A mesa de dominó fica na calçada')===0)S.focus='domino';
 else if(f&&typeof f[1]==='string'&&/sentad[oa] no degrau|sentam no degrau|se senta no degrau/.test(f[1])&&S.loc==='rua'){const sp=script.find(l=>Array.isArray(l)&&!['narra','lia','vo','ze'].includes(l[0]));S.focus={k:'degrau',who:sp?sp[0]:(/Davi/.test(f[1])?'davi':'raimundo'),x:S.px,v:(S.focus&&S.focus.v||0)+1}}
 else if(S.focus==='domino'&&f&&!['ze','narra','lia'].includes(f[0]))S.focus=null}catch(e){}_od(script,done)};
window.__openDlg=openDlg;
