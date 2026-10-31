/* ---------- ritmo da partida, objetivos sorteados e apresentação final ---------- */
const RITMO={completo:{n:'Completo',k:1,d:'O dia inteiro, no tempo da rua.'},r10:{n:'Rápido · 10 min',k:2.1,d:'O relógio anda mais rápido.'},r7:{n:'Rápido · 7 min',k:3,d:'O relógio anda bem mais rápido.'}};
// no rápido o relógio só desacelera quando há uma tarefa da vó em curso (o essencial fica garantido)
function clockK(){const r=RITMO[S.ritmo]||RITMO.completo;return questOn()?1:r.k}
const HQ=['q0a','q0b','q0c','q1a','q1b','q2a','q2b'];
const doneQ=id=>S.qd[id]==='done';
const nHelp=ids=>ids.filter(h=>S.helped[h]).length;
const PEOPLE=['raimundo','dandara','davi','marta','lucia','vo'];
const OBJT={
 investigar:{t:'Investigar acontecimentos',s:'Investigar',d:'Ouvir as conversas da rua e ver de perto o que acontece no largo.',goal:4,
  cur:()=>EV.filter(v=>!v.auto&&S.evSeen[v.id]).length+['q0b','q2b'].filter(doneQ).length,q:['q0b','q2b'],ev:1},
 confianca:{t:'Estabelecer relações de confiança',s:'Confiança',d:'Fazer com que três pessoas da rua se abram com a Lia. Ouvir e ajudar aproximam.',goal:3,
  cur:()=>PEOPLE.filter(id=>tr(id)>=3).length,listen:1,help:'*'},
 evidencias:{t:'Reunir evidências e informações',s:'Evidências',d:'Juntar no caderno papéis, anotações e o que cada um conta.',goal:8,
  cur:()=>Object.keys(CLUES).filter(has).length,obj:1,listen:1},
 reunioes:{t:'Participar de reuniões e articulações',s:'Reuniões',d:'Estar onde a rua se organiza: a mesa de dominó, a discussão e a assembleia no largo.',goal:3,
  cur:()=>['q0c','q0b','q1a','q2b'].filter(doneQ).length+nHelp(['md1','hd2']),q:['q0c','q0b','q1a','q2b'],help:['md1','hd2']},
 intervencoes:{t:'Fazer intervenções no território',s:'Intervenções',d:'Mudar alguma coisa na rua com as próprias mãos: consertar, colar, mostrar, propor.',goal:3,
  cur:()=>nHelp(['hr1','hd2','hv2','hl2','hm1','hm2','hv3','ha2']),help:['hr1','hd2','hv2','hl2','hm1','hm2','hv3','ha2']},
 moradia:{t:'Lidar com moradia e permanência',s:'Moradia',d:'Acompanhar quem está sob pressão para sair de casa: Seu Raimundo e Dandara.',goal:4,
  cur:()=>['ray1','ray2','ray3','ray4','dan1','dan2'].filter(has).length+['q0a','q1b','q2a'].filter(doneQ).length,q:['q0a','q1b','q2a'],npc:['raimundo','dandara']},
 mobilizar:{t:'Mobilizar pessoas e construir solidariedade',s:'Solidariedade',d:'Aproximar vizinhos e fazer a rua agir junto.',goal:3,
  cur:()=>nHelp(['md1','hd1','hd2','hd3','hv3','hl2','hr3'])+(doneQ('q1a')?1:0),q:['q1a'],help:['md1','hd1','hd2','hd3','hv3','hl2','hr3']}};
const objList=()=>(S.objs||[]).map(k=>Object.assign({k},OBJT[k]));
const objProg=o=>{const c=Math.min(o.cur(),o.goal);return[c,o.goal,c>=o.goal]};
function pickObjs(){const k=Object.keys(OBJT).sort(()=>Math.random()-.5);S.objs=k.slice(0,2)}
// o que está na mira serve a algum objetivo?
function objServes(t){if(!t||!S.objs||S.mode==='vist')return false;const L=objList();
 if(t.k==='quest')return L.some(o=>o.q&&o.q.includes(t.q.id));
 if(t.k==='ev')return L.some(o=>o.ev);
 if(t.k==='obj')return L.some(o=>o.obj||(o.k==='moradia'&&/^(ray|dan)/.test(t.o.c||'')));
 if(t.k==='npc'){const n=t.n;if(ordOpen(n.ord))return false;if(evOfNpc(n))return L.some(o=>o.ev);
  const hs=helpsFor(n).map(h=>h.id);
  return L.some(o=>(o.listen&&beatFor(n))||(o.help==='*'&&hs.length)||(Array.isArray(o.help)&&hs.some(h=>o.help.includes(h)))||(o.npc&&o.npc.includes(n.id)&&rootOpts(n).length))}
 return false}
const _tl=tlabel;tlabel=function(t){const s=_tl(t);return s&&s.indexOf('E: ')===0&&objServes(t)?s+'  ★':s};
const _fe=finishEv;finishEv=function(v,seen,played){if(seen)S.evSeen[v.id]=1;return _fe(v,seen,played)};
function objHudTxt(){if(!S.objs||S.mode==='vist')return'';return objList().map(o=>{const[c,g,ok]=objProg(o);return(ok?'✓ ':'★ ')+o.s+' '+c+'/'+g}).join('   ')}
function objCardHTML(era){if(!S.objs)return'';const L=objList();
 return`<section style="--tc:${YEL}"><h3>Seus objetivos nesta partida</h3>${L.map(o=>{const[c,g]=objProg(o);return`<p class="r"><b>${o.t}${era?` (${c}/${g})`:''}.</b> ${o.d}</p>`+objHow(o,era).slice(0,2).map(x=>`<p class="r">• ${x}</p>`).join('')}).join('')}<p class="note">O objetivo geral é acompanhar a vida da rua: entender o que acontece, construir relações, reunir informações e interferir no que afeta a comunidade. Dá para atender o balcão, sair à rua, ouvir, perguntar, ajudar, pressionar e examinar objetos. O que serve aos seus objetivos aparece com ★.</p></section>`}
function objNbHTML(){return'';if(!S.objs)return'';return`<section style="--tc:${YEL}"><h3>Objetivos desta partida</h3>${objList().map(o=>{const[c,g,ok]=objProg(o);return`<div class="note-i" style="background:${ok?'#B8F5D4':'#F4EFE0'}"><strong>${o.t} · ${c}/${g}${ok?' · cumprido':''}</strong>${o.d}</div>`}).join('')}</section>`}
function objEndHTML(){if(!S.objs)return'';return`<section style="--tc:${YEL}"><h3>Seus objetivos</h3>${objList().map(o=>{const[c,g,ok]=objProg(o);return`<p class="r"><b>${o.t}: ${ok?'cumprido':'ficou de fora'} (${c} de ${g}).</b> ${ok?o.d:'Faltou: '+o.d.charAt(0).toLowerCase()+o.d.slice(1)}</p>`}).join('')}<p class="fin">Os objetivos orientam a partida, não decidem o final. O resto do relatório mostra o que mudou com ou sem eles.</p></section>`}
function startGame(){pickObjs();S.ritmo=S.ritmo||'completo';S.evSeen={};S.objSeen={};S.log=[];
 const L=objList();
 showCard(`<div class="cin dense"><div class="year">1991–2000</div><h2>O balcão da vó</h2><p>Você é a Lia e ajuda sua avó, Dona Aurea, na padaria do Pelourinho enquanto o Programa de Recuperação do Centro Histórico muda a rua. São três dias, em 1991, 1996 e 2000.</p><p>Cada dia começa com as condições do período. Depois você circula, encontra gente, observa, conversa, ajuda ou pressiona, junta pistas e decide. A vó segura o balcão quando você sai, mas não por muito tempo.</p><section style="--tc:${YEL}"><h3>Sorteados para esta partida</h3>${L.map(o=>`<p class="r"><b>${o.t}.</b> ${o.d}</p>`).join('')}<p class="note">Os objetivos aparecem no topo da tela e no caderno (C). No fim, o relatório mostra o que foi cumprido e o que ficou de fora.</p></section><h3>Como quer jogar?</h3><p class="r"><b>Completo:</b> o dia inteiro, no tempo da rua (cerca de 25 min). <b>Rápido:</b> o relógio corre mais, mas as tarefas da vó e as conversas principais continuam garantidas.</p><p class="note">Personagens e dados do jogo são fictícios.</p></div>`,null,null,
  Object.keys(RITMO).map(k=>({t:RITMO[k].n,fn:()=>{S.ritmo=k;startEra(0)}})))}
/* apresentação dos personagens, a partir do que aconteceu nesta partida */
const QWHO={q0a:'raimundo',q1b:'raimundo',q2a:'raimundo',q1a:'dandara',q0b:'davi',q2b:'davi'};
const THWHO={raimundo:'ray',dandara:'dan',vo:'vo',davi:'roda',marta:'prog',lucia:'prog'};
const PRON={raimundo:'ele',davi:'ele',dandara:'ela',vo:'ela',marta:'ela',lucia:'ela'};
function metIds(){return PEOPLE.filter(id=>id==='vo'||[0,1,2].some(e=>S.intro[e+id]&&(INTRO[id]||[])[e])||(S.askN&&S.askN[id])||(LISTEN[id]||[]).some(b=>S.seen[b.id])||EV.some(v=>S.evSeen[v.id]&&v.actors.includes(id)))}
function castHTML(id){const nm=NMS[id],pr=PRON[id],f=fates().find(x=>x[0].indexOf(nm.split(',')[0])===0);
 const who=[];[0,1,2].forEach(e=>{const L=(INTRO[id]||[])[e];if(L&&S.intro[e+id]){const l=lines2(L)[0];if(l)who.push(`<p class="r"><b>${ERAS[e].year}.</b> ${l[1]}</p>`)}});
 if(!who.length&&id==='vo')who.push('<p class="r">Avó da Lia, dona da padaria. Segurou o balcão nos três dias.</p>');
 const lia=liaLines(id,true);
 const did=f?f[1]:{'PADARIA':'A vó manteve a padaria.','PADARIA & CAFÉ':'A vó dividiu o ponto: padaria de manhã, café à tarde.','CAFÉ PELÔ':'A vó transformou a padaria em café.','LEMBRANÇAS':'A vó transformou a padaria em loja de lembranças.'}[S.sign];
 return`<div class="cin dense"><div class="port" data-k="${id}"></div><h2>${nm}</h2><section style="--tc:${WHO[id].c}"><h3>Quem passou por aqui</h3>${who.join('')}</section><section style="--tc:${PINK}"><h3>O que ${pr} fez</h3><p class="r">${did}</p></section><section style="--tc:${YEL}"><h3>Como a Lia viveu isso</h3>${(lia.length?lia:['Lia cruzou com '+pr+', mas quase não conversaram.']).map(x=>`<p class="r">${x}</p>`).join('')}</section><p class="note">Personagem fictício. O texto acima junta só o que aconteceu nesta partida.</p></div>`}
function castSeq(i){const L=metIds();if(i>=L.length){showCard(`<div class="cin end"><h2>Fim da partida</h2><p>Cada partida sorteia outros objetivos e abre outros caminhos. Quem você não ouviu desta vez continua na rua.</p><p class="note">Personagens, falas e dados do jogo são fictícios.</p></div>`,null,null,[{t:'Continuar: 2026',fn:startF2},{t:'Jogar de novo',fn:()=>{resetGame();S.ritmo=null;startGame()}}]);return}
 showCard(castHTML(L[i]),i+1<L.length?'Próximo: '+NMS[L[i+1]].split(',')[0]:'Encerrar',()=>castSeq(i+1))}
/* ---------- como cumprir cada objetivo (dicas concretas do dia) e registro do que aconteceu ---------- */
const HWHERE={hr1:'na rua, quando ele estiver perto do sobrado',hr2:'na padaria, depois de folhear a caderneta',hr3:'na rua, depois das 15h30',hd1:'na rua, perto do sobrado, com pão ou bolo na bandeja',hd2:'na padaria, quando ela já confiar um pouco em você',hd3:'no largo',hv1:'onde ele estiver',hv2:'dentro da padaria',hv3:'no largo, depois das 15h30',ha1:'perto do forno',ha2:'no balcão, depois de achar o papel da gaveta',ha3:'perto do caixa',hm1:'dentro da padaria',hm2:'na rua',hl1:'na rua, perto do sobrado',hl2:'na rua',md1:'quando Seu Raimundo e Dandara estiverem perto um do outro e os dois confiarem em você'};
const fmtH=h=>{const H=Math.floor(h),M=Math.round((h-H)*60);return H+'h'+(M?String(M).padStart(2,'0'):'')};
const whereX=(loc,x)=>loc==='dentro'?'na padaria':x<900?'na calçada do sobrado':x<1500?'na rua, perto da padaria':'no largo';
const owner=hid=>Object.keys(HELP).find(id=>(HELP[id]||[]).some(h=>h.id===hid));
function howHelp(ids,era){const L=[];ids.forEach(hid=>{if(S.helped[hid])return;const id=owner(hid);if(!id)return;const h=HELP[id].find(x=>x.id===hid);if(!h||!h.e.includes(era))return;
  L.push(`Falar com ${NMS[id]} e escolher Ajudar → ${h.lab.charAt(0).toLowerCase()+h.lab.slice(1)} (${HWHERE[hid]||'quando a situação permitir'}).`)});return L}
function howQuest(ids,era){return(ids||[]).map(id=>QUESTS.find(q=>q.id===id)).filter(q=>q&&q.e.includes(era)&&!doneQ(q.id)&&S.qd[q.id]!=='miss').map(q=>`Ficar perto da padaria a partir das ${fmtH(q.h)}: a vó vai pedir para ${q.lab}.`)}
function objHow(o,era){if(era==null)era=S.era;let L=[];
 if(o.k==='investigar'){L=EV.filter(v=>!v.auto&&v.e===era&&!S.evSeen[v.id]).map(v=>`Entre ${fmtH(v.h0)} e ${fmtH(v.h1)}, ${whereX(v.loc,v.at[0])}: ${v.actors.map(a=>NMS[a]).join(' e ')} conversam. Chegue perto e aperte E.`).concat(howQuest(o.q,era))}
 else if(o.k==='confianca'){L=PEOPLE.filter(id=>id!=='vo'&&tr(id)<3&&SCHED[era]&&(INTRO[id]||[])[era]!==undefined).map(id=>`${NMS[id]}: confiança ${Math.max(0,tr(id))}/3.`);L.unshift('Perto de alguém, aperte E: Ouvir (+1) e Ajudar (+2) aproximam. Pressionar afasta.')}
 else if(o.k==='evidencias'){L=OBJ.filter(x=>x.e.includes(era)&&!(x.c&&has(x.c))&&!S.objSeen[x.id]).map(x=>`${x.lab} (${x.loc==='dentro'?'na padaria':'na rua'}).`);L.push('Ouvir e Perguntar também rendem pistas. Tudo vai para o caderno (C).')}
 else if(o.k==='moradia'){L=howQuest(o.q,era).concat(OBJ.filter(x=>x.e.includes(era)&&/^(ray|dan)/.test(x.c||'')&&!has(x.c)).map(x=>`${x.lab} (${x.loc==='dentro'?'na padaria':'na rua'}).`));L.push('Ouvir e perguntar a Seu Raimundo e a Dandara sobre a casa.')}
 else L=howQuest(o.q,era).concat(howHelp(o.help||[],era));
 if(!L.length)L=['Hoje não há mais nada previsto para este objetivo. Ele continua no próximo dia.'];return L}
const _dob=doObj;doObj=function(o){S.objSeen[o.id]=1;return _dob(o)};
function logIt(t,o){(S.log=S.log||[]).push(Object.assign({e:S.mode==='vist'?3:S.mode==='f2'?4:S.era,m:S.min,t},o||{}))}
const _fe2=finishEv;finishEv=function(v,seen,played){if(seen&&!S.evSeen[v.id]){let L=[];try{L=lines2(v.L)||[]}catch(e){}logIt(`${v.actors.map(a=>NMS[a]).join(' e ')} conversam ${whereX(v.loc,v.at[0])}.`,{tt:'Conversa '+whereX(v.loc,v.at[0]),who:v.actors.slice(),L:L.filter(l=>Array.isArray(l)),at:[v.loc||'rua',v.at[0]]})}return _fe2(v,seen,played)};
const _dh=doHelp;doHelp=function(n,h){let L=[];try{L=lines2(h.L)||[]}catch(e){}logIt(`Lia ajudou ${NMS[n.id]}: ${h.lab.charAt(0).toLowerCase()+h.lab.slice(1)}.`,{tt:h.lab,who:[n.id],L:L.filter(l=>Array.isArray(l)),at:[n.loc,n.x]});return _dh(n,h)};
const _dq=doQuest;doQuest=function(q){if(!(q.pick&&S.sac==='mesa'))logIt(`A pedido da vó, Lia foi ${q.lab}.`,{tt:q.lab.charAt(0).toUpperCase()+q.lab.slice(1),who:QWHO[q.id]?[QWHO[q.id]]:[],at:[q.tg.loc,q.tg.x],sub:'recado da vó'});return _dq(q)};
function logHTML(){const L=(S.log||[]);if(!L.length)return'<p class="nbs">Nada anotado ainda. Conversas ouvidas, ajudas e recados da vó aparecem aqui, com ano e hora.</p>';
 return L.map(x=>`<div class="lg"><span>${x.e===1&&S.mode==='vist'?'1998':ERAS[x.e].year} · ${fmtH(x.m/60)}</span><b>${x.t}</b></div>`).join('')}
function objTabHTML(){if(!S.objs)return'';return objList().map(o=>{const[c,g,ok]=objProg(o);
 return`<section style="--tc:${ok?GRN:YEL}"><h3>${ok?'☑':'☐'} ${o.t} · ${c}/${g}</h3><p class="nbs">${o.d}</p>${ok?'<p class="r">Cumprido. O que vier a mais também conta.</p>':objHow(o).map(x=>`<p class="r">• ${x}</p>`).join('')}</section>`}).join('')+'<p class="nbs">O que serve a um objetivo aparece com ★ na dica de ação, embaixo da tela.</p>'}

function liaLines(id,end){const pr=PRON[id],lia=[];
 const bs=(LISTEN[id]||[]).filter(b=>S.seen[b.id]);if(bs.length){const q=bs[0].L.find(l=>l[0]===id);lia.push(`Lia ouviu ${bs.length===1?'uma história':bs.length+' histórias'} contada${bs.length===1?'':'s'} por ${pr}${q?`, como esta: "${q[1]}"`:'.'}`)}
 (HELP[id]||[]).filter(h=>S.helped[h.id]).forEach(h=>lia.push('Lia ajudou: '+h.lab.charAt(0).toLowerCase()+h.lab.slice(1)+'.'));
 if(S.helped.md1&&(id==='raimundo'||id==='dandara'))lia.push('Lia chamou Seu Raimundo e Dandara para conversar.');
 Object.keys(QWHO).filter(q=>QWHO[q]===id).forEach(qid=>{const q=QUESTS.find(x=>x.id===qid);if(!q)return;if(doneQ(qid))lia.push(`Em ${ERAS[q.e[0]].year}, Lia foi ${q.lab}.`);else if(S.qd[qid]==='miss')lia.push(`Em ${ERAS[q.e[0]].year}, Lia não chegou a ${q.lab}.`)});
 const ev=EV.filter(v=>S.evSeen[v.id]&&v.actors.includes(id)).length;if(ev)lia.push(`Lia ouviu ${ev===1?'uma conversa':ev+' conversas'} de ${pr} com outros moradores.`);
 if(id==='lucia'&&F.lucia)lia.push('No dia da vistoria de 1998, você jogou com ela.');
 const th=THWHO[id],ids=Object.keys(CLUES).filter(c=>CLUES[c][0]===th),fd=ids.filter(has);if(ids.length)lia.push(`No caderno: ${fd.length} de ${ids.length} pistas sobre ${THREADS[th].t.charAt(0).toLowerCase()+THREADS[th].t.slice(1)}.`);
 if(id!=='vo'&&end)lia.push(`No fim, ${pr} ${MOOD[clamp(tr(id),0,3)]} com a Lia.`);
 return lia}

/* ---------- dados do Caderno da Lia (livro aberto): índice à esquerda, detalhe à direita ---------- */
const BOOKT=[['Objetivos','#B9792A'],['Pistas','#B4452D'],['Gente','#3E7B5C'],['Acontecido','#2E4C80'],['Resumo','#C2577A']];
const ROLE={raimundo:'Vizinho do sobrado',dandara:'Associação de moradores',davi:'Tamboreiro da roda',marta:'Guia de turismo',lucia:'Técnica do Programa',vo:'Avó da Lia, dona da padaria'};
const THP={ray:'raimundo',dan:'dandara',vo:'vo',roda:'davi',prog:'lucia',bai:'vo'};
const THILL={ray:'sobrado',dan:'sobrado',vo:'padaria',roda:'largo',prog:'largo',bai:'calcada'};
const OBJILL={moradia:'sobrado',investigar:'largo',confianca:'calcada',evidencias:'padaria',reunioes:'largo',intervencoes:'calcada',mobilizar:'largo'};
const OBJWHO={moradia:['raimundo','dandara'],reunioes:['dandara','davi'],mobilizar:['dandara','raimundo','davi'],intervencoes:['raimundo','dandara','marta','lucia'],confianca:[],investigar:[],evidencias:[]};
const yr=e=>e===3?'1998':e===4?'2026':ERAS[e].year;
const placeOf=(loc,x)=>loc==='dentro'?'dentro':x<900?'sobrado':x<1500?'padaria':'largo';
const PLACEN={sobrado:'A calçada do sobrado',padaria:'A porta da padaria',largo:'O largo',dentro:'Dentro da padaria',calcada:'A calçada'};
const lastIntro=id=>{for(const e of [2,1,0]){const L=(INTRO[id]||[])[e];if(L&&S.intro[e+id]){const l=lines2(L)[0];if(l)return[e,l[1]]}}return null};
function bookModel(tab){
 if(tab===0){const L=objList();return{sub:L.length+' sorteados nesta partida',note:['Objetivo geral','Acompanhar a vida da rua: entender o que acontece, construir relações, reunir informações e interferir no que afeta a comunidade.'],
  items:L.map(o=>{const[c,g,ok]=objProg(o);return{id:o.k,t:o.t,s:c+' de '+g,bar:[c,g],ch:'★',mk:ok?'ok':'box'}})}}
 if(tab===1){const all=Object.keys(CLUES),fd=all.filter(has);const items=[];
  for(const th in THREADS){all.filter(k=>CLUES[k][0]===th).forEach(k=>{if(has(k))items.push({id:k,t:CLUES[k][1],s:THREADS[th].t,port:THP[th]});else items.push({id:'?'+k,t:'Ainda não anotada',s:THREADS[th].t,unk:1})})}
  items.sort((a,b)=>(a.unk?1:0)-(b.unk?1:0));return{sub:fd.length+' de '+all.length+' anotadas',items}}
 if(tab===2){const met=metIds();return{sub:'Quem a Lia conhece',items:PEOPLE.map(id=>met.includes(id)?{id,t:NMS[id],s:ROLE[id]+(id!=='vo'?' · '+MOOD[clamp(tr(id),0,3)]:''),port:id}:{id:'?'+id,t:'Ainda não conheceu',s:'Alguém da rua',unk:1})}}
 if(tab===3){const L=(S.log||[]);return{sub:'Diário da Lia, em ordem',empty:'Nada registrado ainda. Conversas ouvidas, ajudas e recados da vó entram aqui, com ano e hora.',
  items:L.map((x,i)=>({id:'l'+i,t:x.tt||x.t,s:yr(x.e)+' · '+fmtH(x.m/60)+(x.who&&x.who.length?' · '+x.who.map(a=>NMS[a]).join(' e '):x.sub?' · '+x.sub:''),ch:yr(x.e).slice(2)}))}}
 if(tab===4){const all=Object.keys(CLUES);return{sub:'As frentes da partida',items:Object.keys(THREADS).map(th=>{const ids=all.filter(k=>CLUES[k][0]===th),fd=ids.filter(has);return{id:th,t:THREADS[th].t,s:fd.length+' de '+ids.length+' pistas',bar:[fd.length,ids.length],port:THP[th],mk:fd.length===ids.length?'ok':'box'}})}}
 return{items:[]}}
function bookDetail(tab,id){const B=[];
 if(tab===0){const o=objList().find(x=>x.k===id);if(!o)return B;const[c,g,ok]=objProg(o);
  B.push({k:'ill',p:OBJILL[o.k]||'largo',cap:ok?'Cumprido':'Em andamento'},{k:'h2',t:o.t},{k:'p',t:o.d},{k:'bar',lab:'Progresso',n:c,g});
  if(ok)B.push({k:'h4',t:'Estado'},{k:'step',t:'Cumprido. O que vier a mais também conta.',done:1});
  else{B.push({k:'h4',t:'Como avançar hoje'});objHow(o).forEach(t=>B.push({k:'step',t}))}
  const w=(OBJWHO[o.k]||[]).filter(x=>metIds().includes(x));if(w.length)B.push({k:'h4',t:'Envolvidos'},{k:'chips',ids:w});return B}
 if(tab===1){if(id[0]==='?'){const k=id.slice(1),th=CLUES[k][0];B.push({k:'ill',p:THILL[th],cap:'Ainda em branco'},{k:'h2',t:'Ainda não anotada'},{k:'p',t:'Esta pista faz parte da frente “'+THREADS[th].t+'”. Continue ouvindo, perguntando e examinando o que está ligado a ela.'},{k:'h4',t:'Quem pode saber'},{k:'chips',ids:[THP[th]]});return B}
  const c=CLUES[id],th=c[0],ids=Object.keys(CLUES).filter(k=>CLUES[k][0]===th),fd=ids.filter(has);
  B.push({k:'ill',p:THILL[th],cap:PLACEN[THILL[th]]},{k:'h2',t:c[1]},{k:'quote',t:c[2]},{k:'h4',t:'Frente'},{k:'p',t:THREADS[th].t+'. '+(fd.length===ids.length?THREADS[th].full:THREADS[th].part)},{k:'h4',t:'Relaciona-se com'},{k:'chips',ids:[THP[th]]});return B}
 if(tab===2){if(id[0]==='?')return[{k:'h2',t:'Ainda não conheceu'},{k:'p',t:'Circule pela rua e pela padaria. Quando a Lia chegar perto de alguém pela primeira vez, a apresentação entra aqui.'}];
  const li=lastIntro(id);B.push({k:'port',id,t:NMS[id],sub:ROLE[id],txt:li?li[1]:(id==='vo'?'Avó da Lia, dona da padaria.':''),bar:id==='vo'?null:[clamp(tr(id),0,4),4]});
  const rel=Object.keys(S.known).filter(k=>k.split('>')[0]===id).map(k=>{const b=k.split('>')[1],r=rel_(id,b);return{mood:moodR(r),r,lab:'sobre '+NMS[b]}});
  if(rel.length)B.push({k:'h4',t:'Como '+PRON[id]+' vê os outros'},{k:'rel',rows:rel});
  const lia=liaLines(id,false);B.push({k:'h4',t:'Com a Lia'});(lia.length?lia:['Ainda quase não conversaram.']).forEach(t=>B.push({k:'step',t,dot:1}));return B}
 if(tab===3){const x=(S.log||[])[+id.slice(1)];if(!x)return B;const pl=x.at?placeOf(x.at[0],x.at[1]):'calcada';
  B.push({k:'ill',p:pl,cap:PLACEN[pl]},{k:'when',t:yr(x.e)+' · '+fmtH(x.m/60)+' · '+PLACEN[pl].toLowerCase()},{k:'h2',t:x.tt||x.t},{k:'p',t:x.t});
  if(x.L&&x.L.length){B.push({k:'h4',t:'O que a Lia ouviu'});x.L.slice(0,4).forEach(l=>B.push({k:'quote',t:(l[0]==='narra'?'':(NMS[l[0]]||(WHO[l[0]]||{}).n||l[0])+': ')+l[1]}))}
  if(x.who&&x.who.length)B.push({k:'h4',t:'Envolvidos'},{k:'chips',ids:x.who});return B}
 if(tab===4){const th=id,T=THREADS[th],ids=Object.keys(CLUES).filter(k=>CLUES[k][0]===th),fd=ids.filter(has);
  B.push({k:'ill',p:THILL[th],cap:PLACEN[THILL[th]]},{k:'h2',t:T.t},{k:'bar',lab:'Pistas',n:fd.length,g:ids.length},{k:'p',t:fd.length===0?T.none:fd.length===ids.length?T.full:T.part});
  if(fd.length){B.push({k:'h4',t:'Anotado'});fd.forEach(k=>B.push({k:'step',t:CLUES[k][1],done:1}))}
  B.push({k:'h4',t:'Ligado a'},{k:'chips',ids:[THP[th]]});return B}
 return B}
const rel_=(a,b)=>rel(a,b);

/* ---------- cenas narradas (prólogo e passagens entre as fases): não jogáveis, avançam com E ---------- */
const IN0=id=>{const L=(INTRO[id]||[])[0];return L?lines2(L)[0][1]:''};
const CUTS={
 prologo:()=>[
  {img:['rua91','largo'],year:'1991',t:'Salvador, 1991. O Pelourinho ainda é bairro. Tem gente morando nos sobrados, roupa no varal, mesa de dominó na calçada e roda no largo.'},
  {img:['rua91','padaria'],t:'No meio da rua fica a padaria de Dona Aurea. O forno acende antes do sol, e o que não se paga hoje fica anotado na caderneta até sexta.'},
  {img:['interior','dentro'],port:'vo',t:'Aurea conhece cada freguês pelo nome e pelo pão que ele leva.'},
  {img:['interior','dentro'],port:'lia',t:'Lia é a neta. Ajuda no balcão: anota pedido, pega o pão, leva recado pela rua. É pelos olhos dela que você vai ver tudo.'},
  {img:['rua91','sobrado'],port:'raimundo',t:IN0('raimundo')},
  {img:['rua91','sobrado'],port:'dandara',t:IN0('dandara')},
  {img:['rua91','largo'],port:'davi',t:IN0('davi')},
  {img:['rua91','sobrado'],port:'lucia',t:IN0('lucia')},
  {img:['rua91','largo'],t:'Naquele ano, o governo da Bahia anuncia um Programa para recuperar o Centro Histórico. Ninguém na rua sabe ainda o que ele vai medir.'},
  {img:['rua91','padaria'],t:'Você vai acompanhar um dia em 1991, um em 1996 e um em 2000. Ouça, ajude, guarde as pistas e decida o que fica. Personagens e falas são fictícios.'}],
 i1:()=>[
  {img:['rua91','largo'],year:'1992',t:'1992. As obras começam pelos quarteirões mais degradados do Maciel, do Passo e do Carmo, perto do Largo do Pelourinho.'},
  {img:['rua96','sobrado'],year:'1993–1995',t:'Fachada por fachada, a rua ganha tinta, luz nova e calçamento. Muitas famílias são cadastradas, indenizadas e saem.'},
  {img:['rua96','padaria'],port:'marta',t:(()=>{const L=(INTRO.marta||[])[1];return L?lines2(L)[0][1]:''})()},
  {img:['rua96','largo'],year:'1996',t:'Chegam os ônibus de turismo e os shows de graça no largo. A padaria continua da vó, e o balcão agora enche em ondas.'}],
 i2:()=>[
  {img:['rua96','sobrado'],year:'1997',t:'A reforma avança rua por rua. No escritório do Programa, resultado vira número: cadastro assinado e atividade cultural.'},
  {img:['rua96','largo'],port:'lucia',year:'1998',t:'Em 1998, a vistoria chega a esta rua. Por um dia, você vê tudo pelos olhos de Lúcia, com a prancheta na mão e quatro endereços na lista.'}],
 i3:()=>[
  {img:['rua00','largo'],year:'1999',t:'Até 1999, o Programa reformaria cerca de 600 imóveis. Cerca de 1.900 famílias seriam removidas e indenizadas.'},
  {img:['rua00','sobrado'],year:'2000',t:'Em 1980, moravam cerca de 9,8 mil pessoas no Centro Histórico. Em 2000, cerca de 3 mil.'},
  {img:['rua00','padaria'],t:'A rua virou vitrine. O ponto da padaria vale mais do que o pão que sai dele, e o aluguel acompanha.'},
  {img:['rua00','sobrado'],t:'Na calçada do sobrado, os tambores do Olodum ensaiam para quem passa, e tem pintura corporal para turista. No fim do largo, a varanda azul onde Michael Jackson gravou um clipe em 1996 virou ponto de foto.'},
  {img:['rua00','largo'],t:'É o Pelourinho que muita gente conhece hoje: colorido, cheio de música e de câmera.'},
  {img:['rua00','largo'],t:'O Programa não terminou de uma vez, e a luta de quem quer continuar morando no Centro Histórico segue até hoje. Se houver protesto no largo, não é o de 1996: o pedido é o mesmo, ficar, mas a rua e as pessoas já são outras.'},
  {img:['interior','dentro'],port:'lia',t:'Último dia. O que a rua virou também depende do que os outros fizeram sem você.'}]};
function playCut(id,done){const L=(CUTS[id]?CUTS[id]():[]).filter(s=>s.t);if(!L.length){done();return}
 S.card=null;S.d=null;S.menu=null;S.nbOpen=false;S.cut={id,L,i:0,typed:0,t:0,done,v:((S.cut&&S.cut.v)||0)+1};S.scene='cut'}
function cutNext(skip){const c=S.cut;if(!c)return;const s=c.L[c.i];if(!skip&&c.typed<s.t.length){c.typed=s.t.length;return}
 if(!skip&&c.i<c.L.length-1){c.i++;c.typed=0;c.t=0;return}const f=c.done;S.cut=null;S.scene='fade';setTimeout(()=>{S.scene='play';f()},250)}
function tickCut(dt){const c=S.cut;if(!c)return;c.t+=dt;const s=c.L[c.i];if(c.typed<s.t.length)c.typed=Math.min(s.t.length,c.typed+dt*60)}
const _sg=startGame;startGame=function(){if(!S.prologoVisto){S.prologoVisto=1;playCut('prologo',_sg)}else _sg()};
const _ei=endInterlude;endInterlude=function(){playCut('i3',_ei)};
S.evSeen=S.evSeen||{};S.objSeen=S.objSeen||{};S.log=S.log||[];
const _rg=resetGame;resetGame=function(){_rg();S.evSeen={};S.objSeen={};S.log=[]};
