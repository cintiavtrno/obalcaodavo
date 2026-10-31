/* ===== parte 9: FASE 2 · 2026 · Cidade Inteligente =====
   Entra como modo S.mode='f2' sobre a época 2 (rua00, padaria): reaproveita andar, diálogos com escolhas,
   caderno-livro, cenas narradas e cartões. Personagens novos vêm de ASSETS2 (ferramentas/f2_assets.py),
   todos com o pé na última linha do quadro e origem (.5,1): ficam rentes ao chão como os da fase 1. */
const F2C={cyan:0x3DF2E0,red:0xFF3B3B,amber:0xFFB020,steel:0x2A3548,ink:0x1C110A};
Object.assign(WHO,{vobot:{n:'Atendente Aurea',c:'#7A4FA0',t:CRM},vobotx:{n:'Atendente Aurea',c:'#B4452D',t:CRM},raibot:{n:'Seu Raimundo (robô)',c:'#3E7B5C',t:CRM},raibotx:{n:'Seu Raimundo (robô)',c:'#B4452D',t:CRM},
 ze:{n:'Seu Zé',c:'#8C6A3E',t:CRM},caio:{n:'Caio, entregador',c:'#C8642C',t:CRM},tiago:{n:'Tiago, fiscal',c:'#2A3548',t:CRM},turista26:{n:'Turista',c:CRM,t:OUT},drone:{n:'Unidade de Segurança',c:'#2A3548',t:CRM}});
Object.assign(NMS,{vobot:'Atendente Aurea',raibot:'Seu Raimundo (robô)',ze:'Seu Zé',caio:'Caio',tiago:'Tiago',turista26:'Turista',drone:'Unidade de Segurança'});
const F2PT={vobot:'f2_pt_vo_ok',vobotx:'f2_pt_vo_glitch',raibot:'f2_pt_raibot',raibotx:'f2_pt_raibot',ze:'f2_pt_ze',caio:'f2_pt_caio',tiago:'f2_pt_tiago',turista26:'f2_pt_turista'};
for(const k in F2PT){PORT[k]=PORT[k]||'pt_lia';PT2[k]=F2PT[k]}
const F2THREADS={f2v:{t:'A voz da vó',c:'#7A4FA0',none:'Lia não sabe de onde veio a voz da atendente.',part:'Falta saber quem gravou e com que direito.',full:'A voz da vó foi gravada no balcão, sem ela saber, e virou produto.'},
 f2c:{t:'O que a cidade mede',c:'#2A3548',none:'A cidade mede alguma coisa. Lia não sabe o quê.',part:'Cada sistema conta uma coisa. Falta ver o que fica de fora.',full:'A cidade conta tempo, pontualidade, ruído e total. Não conta quem fica para trás.'},
 f2r:{t:'O morador honorário',c:'#3E7B5C',none:'O robô de Seu Raimundo anda pela rua. Lia não sabe por quê.',part:'Falta saber o que a homenagem esconde.',full:'Deram a Seu Raimundo uma medalha no lugar da casa, e uma rota no lugar da rua.'}};
const F2CLUES={
 f2v1:['f2v','O contrato do balcão','"Atendente Afetiva, modelo Aurea": voz e repertório treinados com 412 horas de áudio do balcão, captadas entre 2019 e 2025.'],
 f2v2:['f2v','O totem da porta','O totem da porta da padaria foi instalado em 2019. Disseram que era para chamar ambulância. A vó falava baixo perto dele.'],
 f2v3:['f2v','Consentimento implícito','Pela regra do painel, quem fala em área de acesso público consente com a gravação. Com a porta aberta, o balcão contava como rua.'],
 f2v4:['f2v','A caderneta que não existe','A atendente não reconhece o fiado. O que não passou pela maquininha não entrou no treino.'],
 f2c1:['f2c','A caixinha virou vaquinha','A caixinha de sábado do dominó virou vaquinha no aplicativo: cobra 3% e só mostra o total.'],
 f2c2:['f2c','A nota do Caio','O aplicativo conta o tempo parado do entregador. Ajudar alguém na ladeira derruba a nota.'],
 f2c3:['f2c','Vinte segundos','O ônibus fica 20 segundos de porta aberta. A meta é pontualidade, não embarque.'],
 f2c4:['f2c','Licença de ruído','A roda precisa de licença de ruído no aplicativo. Sem ela, o sensor do poste chama a fiscalização.'],
 f2r1:['f2r','A ficha do sobrado','O robô sabe a ficha técnica do sobrado: restaurado em 2004, visitação de terça a domingo. Não sabe que morou lá.'],
 f2r2:['f2r','Memória Viva','O robô é um projeto da Secretaria: "Memória Viva, homenagem aos moradores tradicionais, cota 2026".'],
 f2r3:['f2r','A medalha em branco','Seu Raimundo ganhou a medalha de morador honorário três meses depois de sair do sobrado. A placa nunca foi gravada.']};
Object.assign(THP,{f2v:'vobot',f2c:'tiago',f2r:'raibot'});Object.assign(THILL,{f2v:'padaria',f2c:'largo',f2r:'sobrado'});
OBJT.f2voz={t:'Descobrir de onde veio a voz da vó',s:'A voz',d:'Juntar o que explica como a voz da vó Aurea foi parar na atendente.',goal:3,cur:()=>['f2v1','f2v2','f2v3','f2v4'].filter(has).length,
 how:()=>[!has('f2v1')&&'Na padaria: examinar o papel embaixo da maquininha, no balcão.',!has('f2v4')&&'Na padaria: pedir à atendente para anotar na caderneta.',!has('f2v2')&&'Na rua, perto do sobrado: perguntar ao Seu Zé sobre o totem da porta.',!has('f2v3')&&'No ponto de ônibus: perguntar ao Tiago quem autorizou gravar o balcão (depois de achar o contrato ou falar do totem).'].filter(Boolean)};
OBJT.f2cid={t:'Entender o que a cidade mede',s:'A cidade',d:'Ver o que cada sistema conta e o que fica de fora.',goal:3,cur:()=>['f2c1','f2c2','f2c3','f2c4'].filter(has).length,
 how:()=>[!has('f2c1')&&'Seu Zé, na antiga mesa de dominó: perguntar da caixinha.',!has('f2c2')&&'Caio, o entregador, entre a padaria e o largo: perguntar da nota.',!has('f2c3')&&'Tiago, no ponto do largo: perguntar da porta do ônibus.',!has('f2c4')&&'Davi, no largo: falar com ele sobre a roda.'].filter(Boolean)};
const _oh=objHow;objHow=function(o,era){return o.how?(o.how().length?o.how():['Cumprido. O que vier a mais também conta.']):_oh(o,era)};
const f2Ok=()=>S.mode==='f2'&&S.f2;
function f2Add(k,d){const F=S.f2;F[k]=clamp(F[k]+d,0,10)}

/* ---------- cenas narradas da fase 2 ---------- */
CUTC.ponto=[242,135];CUTC.intger=[242,140];CUTT.f2ponto=0xFFFFFF;CUTT.f2_intger=0xFFFFFF;CUTT.f2_rua26=0xFFFFFF;CUTT.f2_interior26=0xFFFFFF;
CUTS.f2intro=()=>[
 {img:['f2ponto','ponto'],year:'2026',t:'Salvador, 2026. O Programa não acabou: trocou de nome. Agora se chama Cidade Inteligente.'},
 {img:['f2ponto','ponto'],t:'O poste do ponto escuta. A câmera da esquina reconhece rosto. O ônibus sai na hora que a planilha manda, com ou sem quem vem correndo.'},
 {img:['f2_rua26','padaria'],port:'lia',t:'Lia tem 45 anos. Voltou para cuidar da padaria depois que a vó Aurea morreu, no inverno passado.'},
 {img:['f2_intger','intger'],port:'vobot',t:'No balcão, encontrou a vó. Um contrato da prefeitura instalou ali uma "atendente afetiva", com o rosto, a voz e o avental dela. Para o turismo, o afeto do lugar não podia parar.'},
 {img:['f2_rua26','sobrado'],port:'raibot',t:'Seu Raimundo morreu morador honorário, com medalha e sem casa. A versão dele faz a mesma rota pela rua, de três em três minutos.'},
 {img:['f2_rua26','largo'],t:'Você tem uma tarde e uma noite. A cidade mede tudo o que você faz. O que ela não mede, você vai precisar descobrir.'}];

/* ---------- entrada e fim ---------- */
function startF2(){
 resetGame();Object.assign(CLUES,F2CLUES);Object.assign(THREADS,F2THREADS);
 S.era=2;S.mode='f2';S.pl=null;S.vs=null;S.sign='PADARIA';S.rain=false;S.min=16*60;S.tray=[];S.q=null;S.closing=false;S.staff=[];S.bant=[];S.fx={crowd:0,fire:0,ban:0};S.busX=0;S.led=ledNew();
 initEra();S.extras=[];S.objs=['f2voz','f2cid'];S.evSeen={};S.objSeen={};S.log=[];
 const mk=(id,x,y,dir)=>({id,x,y,dir,walk:false,hidden:false,closed:false,mute:0,ph:0,bark:null,barkT:99,served:true,loc:'rua',hideAt:null});
 S.npcs={dandara:mk('dandara',1760,GY+72,1),davi:mk('davi',1990,GY+66,-1)};
 S.f2={vin:3,vis:0,efi:3,ab:0,used:{},seen:{},tot:[0,0,0],totT:[0,0,0],camT:[0,0,0],raiX:520,raiD:1,raiP:0,caiX:1400,caiD:1,zeX:850,zeGone:false,bus:{},busX:-1,busF:2,lenco:false,roda:false,drone:null,ending:null,met:{}};
 setLoc('dentro',700,GY+80);S.face=-1;
 playCut('f2intro',()=>showCard(`<div class="cin dense"><div class="year">2026</div><h2>Cidade Inteligente</h2><p>Você volta a jogar como Lia, agora com 45 anos. A padaria é sua. No balcão está a atendente com o rosto da vó; na rua, as pessoas que ficaram e as máquinas que chegaram.</p>${objCardHTML(1)}<section style="--tc:#3DF2E0"><h3>Três medidas</h3><p class="r"><b>Vínculo:</b> sobe quando você conversa de verdade, ajuda e questiona as máquinas.</p><p class="r"><b>Visibilidade:</b> sobe na luz das câmeras e quando você fala perto de um totem. Cheia, chama o drone.</p><p class="r"><b>Eficiência:</b> é a nota da prefeitura. Sobe quando tudo é resolvido rápido e sem conversa.</p><p class="tip">As câmeras alcançam a calçada do lado das casas. O lado de baixo da rua fica fora do feixe.</p></section><p class="note">Personagens, falas e dados da fase 2 são fictícios. As tecnologias existem.</p></div>`,'Entrar na padaria',f2Begin))}
function f2Begin(){S.card=null;S.scene='play';hud();S.speaker=null;
 openDlg([['narra','O sino da porta toca. Do outro lado do balcão, sua avó levanta os olhos.'],['vobot','Bem-vinda à Padaria da Vó! Experiência afetiva desde 1958.'],['lia','Vó.'],['vobot','Bem-vinda de volta, cliente recorrente. Quer o pão de sempre?'],['narra','O sorriso abre igual dos dois lados. Os olhos têm um anel azul que a vó nunca teve.'],['narra','O avental é o dela. O remendo no bolso foi a Dandara que costurou.']])}
function f2End(why){const F=S.f2;if(!F||F.ending)return;F.ending=why||'noite';
 const k=F.ab>=3?'fora':F.vin>=7?'resiste':F.efi>=6?'otimizado':'meio';
 const T={resiste:['A rua lembra',`<p>Na manhã seguinte, Dandara, Seu Zé, Davi e Caio entram na Defensoria Pública com o contrato da atendente e a lista das horas gravadas.</p>${F.prova?'<p>A voz da vó Aurea vira processo: ela nunca autorizou ser gravada no próprio balcão.</p>':''}<p>A atendente continua lá. Ao lado dela, alguém colou um papel escrito à mão: "Esta não é Aurea. Aurea morreu em 2025 e vendia fiado."</p>`],
  otimizado:['O bairro otimizado','<p>Na semana seguinte, o Pelourinho sobe três posições no ranking das cidades inteligentes. A padaria ganha o selo de excelência em atendimento.</p><p>Ninguém mais pergunta da receita do bolo de aipim. A atendente responde tudo em oito segundos.</p>'],
  fora:['Fora do sistema','<p>No terceiro alerta, seu rosto entra numa lista. O cartão de transporte para de passar, a maquininha recusa seu pagamento, o aplicativo de entrega some do celular.</p><p>Para a cidade, você deixou de circular. Para a rua, você continua sendo a neta da Aurea: Seu Zé guarda pão para você num saco de papel, como antes.</p>'],
  meio:['Uma noite como as outras','<p>O último ônibus fecha a porta no horário. A atendente dorme em pé no carregador, à meia-noite.</p><p>Você sabe mais do que sabia à tarde. A rua ainda não decidiu o que fazer com isso.</p>']}[k];
 const found=Object.keys(F2CLUES).filter(has);
 const th=Object.keys(F2THREADS).map(t=>{const ids=Object.keys(F2CLUES).filter(c=>F2CLUES[c][0]===t),fd=ids.filter(has);return`<section style="--tc:${F2THREADS[t].c}"><h3>${F2THREADS[t].t}</h3>${fd.map(c=>`<p class="r">${F2CLUES[c][2]}</p>`).join('')}<p class="fin">${fd.length===0?F2THREADS[t].none:fd.length===ids.length?F2THREADS[t].full:F2THREADS[t].part}</p></section>`}).join('');
 S.scene='fade';setTimeout(()=>showCard(`<div class="cin end"><div class="year">2026</div><h2>${T[0]}</h2>${T[1]}<section style="--tc:#3DF2E0"><h3>O que a cidade mediu</h3><p class="r"><b>Vínculo:</b> ${F.vin} de 10 · <b>Visibilidade:</b> ${Math.round(F.vis)} de 10 · <b>Eficiência:</b> ${F.efi} de 10 · <b>Abordagens:</b> ${F.ab}</p><p class="fin">A prefeitura guardou a eficiência. O resto está no caderno.</p></section>${objEndHTML()}${th}<p class="note">Nesta noite: ${found.length} de ${Object.keys(F2CLUES).length} pistas. Personagens, falas e dados são fictícios. Totens que escutam, reconhecimento facial e metas de pontualidade existem em cidades brasileiras.</p></div>`,'Voltar ao início',()=>{try{history.replaceState(null,'',location.pathname)}catch(e){}resetGame();startGame()}),700)}
const _rg2=resetGame;resetGame=function(){_rg2();for(const k in F2CLUES)delete CLUES[k];for(const k in F2THREADS)delete THREADS[k];S.mode='rua';S.f2=null;S.objs=null};
const _sg2=startGame;startGame=function(){if(/2026/.test(location.hash)){S.prologoVisto=1;startF2()}else _sg2()};

/* ---------- diálogos com menu que volta (cada opção usada some) ---------- */
function f2Menu(id,opts){const F=S.f2,used=F.used;const m=()=>{const L=opts.filter(o=>!used[id+o.id]&&(!o.cond||o.cond()));if(!L.length)return[];
  return[{ch:L.map(o=>({t:o.t,a:o.a,fn:()=>{if(!o.rep)used[id+o.id]=1;o.fn&&o.fn()},r:(typeof o.r==='function'?o.r():o.r).concat(o.end?[]:[{lazy:m}])}))}]};return m()}
const gainF=(c)=>()=>{if(!has(c)){gain(c);toast('Pista no caderno: '+F2CLUES[c][1]+'.')}};
const vin=(d)=>()=>f2Add('vin',d),efi=(d)=>()=>f2Add('efi',d);

/* ---------- pontos de interação ---------- */
const F2TOT=[960,1420,2120],F2CAM=[[395,118],[752,148],[958,150]];
function f2Hot(){const F=S.f2,L=[];
 if(S.loc==='dentro'){
  L.push({id:'vobot',x:456,y:GY+50,top:146,lab:'falar com a atendente',act:f2Vo});
  L.push({id:'carta',x:760,y:GY+50,top:166,lab:'examinar o papel embaixo da maquininha',act:()=>f2Obj('carta')});
  L.push({id:'retrato',x:270,y:GY+50,top:112,lab:'olhar o retrato da vó',act:()=>f2Obj('retrato')});
  L.push({id:'altar',x:350,y:GY+50,top:120,lab:'olhar o altar',act:()=>f2Obj('altar')});
  L.push({id:'cadeira',x:90,y:GY+96,top:216,lab:'olhar a cadeira ao lado do forno',act:()=>f2Obj('cadeira')});
  L.push({id:'carregador',x:1120,y:GY+64,top:214,lab:'olhar a base de carga',act:()=>f2Obj('carregador')});
  return L}
 L.push({id:'raibot',x:F.raiX,y:GY+60,actor:1,lab:'falar com Seu Raimundo',act:f2Rai});
 if(!F.zeGone)L.push({id:'ze',x:F.zeX,y:GY+62,actor:1,lab:'falar com Seu Zé',act:f2Ze});
 if(!F.seen.caio)L.push({id:'caio',x:F.caiX,y:GY+96,actor:1,lab:'falar com Caio, o entregador',act:f2Caio});
 L.push({id:'tiago',x:2190,y:GY+58,actor:1,lab:'falar com Tiago, o fiscal',act:f2Tiago});
 L.push({id:'turista26',x:2350,y:GY+84,actor:1,lab:'falar com a turista',act:f2Tur});
 if(F.busX>0&&F.busF===0&&S.min>=21.5*60)L.push({id:'bus',x:2100,y:GY+100,top:200,lab:'pegar o último ônibus (encerra a noite)',act:()=>f2End('onibus')});
 return L}
const _nt=nearTarget;nearTarget=function(){if(!f2Ok())return _nt();if(S.scene!=='play')return null;
 const inn=S.loc==='dentro';let best=null,bd=1e9;
 const dr=inn?{to:'rua',x:AN.iporta[0],y:AN.iporta[1]+16}:{to:'dentro',x:AN.porta[0],y:AN.porta[1]};
 if(Math.abs(dr.x-S.px)<64&&Math.abs(dr.y-S.py)<64){best={k:'door',to:dr.to,x:dr.x,y:dr.y};bd=Math.hypot(dr.x-S.px,dr.y-S.py)-6}
 for(const h of f2Hot()){const d=Math.hypot(h.x-S.px,(h.y-S.py)*1.5);if(d<(h.actor?96:80)&&d<bd){bd=d;best={k:'f2',h,x:h.x,y:h.y,top:h.top}}}
 for(const id in S.npcs){const n=S.npcs[id];if(n.hidden||n.loc!==S.loc)continue;const d=Math.hypot(n.x-S.px,(n.y-S.py)*1.5);if(d<94&&d<bd){bd=d;best={k:'npc',n,x:n.x,y:n.y}}}
 return best};
const _tl2=tlabel;tlabel=function(t){if(t&&t.k==='f2')return'E: '+t.h.lab+(f2Serves(t.h)?'  ★':'');return _tl2(t)};
function f2Serves(h){const g=(ids)=>ids.some(c=>!has(c));return({carta:g(['f2v1']),vobot:g(['f2v4']),ze:g(['f2v2','f2c1']),tiago:g(['f2v3','f2c3']),caio:g(['f2c2']),raibot:g(['f2r1','f2r2'])})[h.id]||false}
const _it=interact;interact=function(){if(!f2Ok()||S.scene!=='play')return _it();const t=nearTarget();if(t&&t.k==='f2'){S.speaker=null;t.h.act();return}
 if(t&&t.k==='npc'){const id=t.n.id;S.speaker=null;if(id==='dandara')return f2Dan();if(id==='davi')return f2Davi()}return _it()};
const _hi=hintIdle;hintIdle=function(){if(!f2Ok())return _hi();const F=S.f2;
 if(F.vis>=7)return'Visibilidade alta: saia da luz das câmeras, pelo lado de baixo da rua.';
 if(S.loc==='dentro')return'A porta leva à rua. O retrato, o altar e o papel no balcão contam o que a atendente não conta.';
 return S.min>=21.5*60?'O último ônibus está no ponto do largo.':'A luz das câmeras pega a calçada do lado das casas. O lado de baixo fica no escuro.'};
const _gr=greet;greet=function(s){return f2Ok()?s:_gr(s)};

/* ---------- conversas ---------- */
function f2Vo(){const first=!S.f2.seen.vo;S.f2.seen.vo=1;
 openDlg([['vobot',first?'Que bom te ver! Quer o pão de sempre?':'Bem-vinda à Padaria da Vó! Experiência afetiva desde 1958.']].concat(f2Menu('vo',[
  {id:'cafe',rep:1,t:'Um café, vó.',fn:efi(1),r:[['vobot','Café passado na hora, com o carinho de sempre! Tempo de preparo: oito segundos.'],['narra','Está bom. Está igual. Está igual demais.']]},
  {id:'cad',t:'Anota na caderneta do Seu Zé.',fn:()=>{gainF('f2v4')();f2Add('vin',1);f2Add('efi',-1)},r:[['vobotx','Caderneta... não localizada. Formas de pagamento aceitas: cartão, aproximação, rosto.'],['lia','A senhora nunca cobrou ele.'],['vobot','Que bom te ver! Quer o pão de sempre?']]},
  {id:'bolo',t:'Como é a receita do bolo de aipim?',fn:vin(1),r:[['vobot','Três ovos, coco ralado, aipim da feira de São Joaquim. E o segredo é—'],['vobotx','Desculpe, não entendi. Pode repetir de outro jeito?'],['narra','A luz da têmpora pisca vermelha. A frase parou no mesmo lugar onde a vó sempre baixava a voz.']]},
  {id:'quem',t:'Vó, a senhora sabe quem eu sou?',fn:vin(1),r:[['vobot','Claro! Você é a Lia, cliente recorrente número 0004.'],['lia','Neta.'],['vobotx','Neta... registro sem correspondência no cadastro do estabelecimento.'],['vobot','Bem-vinda de volta!']]},
  {id:'voz',t:'Quem te ensinou a falar assim?',cond:()=>has('f2v1'),fn:vin(1),r:[['vobot','Fui treinada com carinho e com quatrocentas e doze horas de áudio do balcão.'],['lia','Gravadas por quem?'],['vobotx','...'],['vobot','Bem-vinda à Padaria da Vó!']]},
  {id:'sai',rep:1,a:1,end:1,t:'Deixar a atendente com o próximo cliente.',r:[]}])))}
const F2OBJ={
 carta:{L:[['narra','Embaixo da maquininha, um papel da prefeitura dobrado em quatro.'],['narra','"Atendente Afetiva, modelo Aurea. Voz e repertório treinados com 412 horas de áudio do balcão, captadas entre 2019 e 2025."'],['narra','Captadas por quem? O contrato não diz.']],fn:gainF('f2v1')},
 retrato:{L:[['narra','O retrato da vó Aurea, com fita preta no canto. Foi a Dandara que pendurou, no dia do enterro.'],['narra','Embaixo, alguém escreveu a lápis: "aqui ela atendia".']],fn:vin(1)},
 altar:{L:[['narra','Vela, flor de laranjeira e um pão pequeno, trocado todo dia. A atendente não chega perto: o sensor dela confunde chama com incêndio.']]},
 cadeira:{L:[['narra','A cadeira de Seu Raimundo, ao lado do forno, com a manta dobrada. A vó nunca deixou ninguém sentar nela.'],['narra','Ninguém deixou de cumprir essa regra.']],fn:vin(1)},
 carregador:{L:[['narra','A base de carga da atendente. À meia-noite ela vem até aqui sozinha, dorme em pé e acorda às cinco, junto com o forno.'],['narra','Na lateral, uma etiqueta: "Manutenção remota · Centro de Monitoramento".']]}};
function f2Obj(k){const o=F2OBJ[k],first=!S.f2.seen['o'+k];S.f2.seen['o'+k]=1;adv(5);openDlg(o.L.concat(first&&o.fn?[{fn:o.fn}]:[]))}
function f2Rai(){const F=S.f2,first=!F.seen.rai;F.seen.rai=1;F.raiP=6;
 openDlg((first?[['narra','Ele para no meio do passo. O sorriso abre por inteiro, igual dos dois lados.'],['raibot','Bom dia, vizinha! Esse pão tem cheiro de domingo.'],['lia','Seu Raimundo, é noite.']]:[]).concat([['raibot','Bom dia, vizinha!']]).concat(f2Menu('rai',[
  {id:'sob',t:'O senhor morou no sobrado quarenta anos.',fn:()=>{gainF('f2r1')();f2Add('vin',1)},r:[['raibot','Sobrado: patrimônio restaurado em 2004. Visitação de terça a domingo.'],['lia','O senhor morou lá.'],['raibotx','Desculpe, não entendi. Pode repetir de outro jeito?']]},
  {id:'quem',t:'Quem colocou o senhor pra andar aqui?',fn:gainF('f2r2'),r:[['raibot','Sou uma homenagem da Secretaria aos moradores tradicionais. Projeto Memória Viva, cota 2026.'],['raibot','Bom dia, vizinha!']]},
  {id:'cad',t:'Sua cadeira continua ao lado do forno.',fn:vin(2),r:[['raibotx','Cadeira... ao lado do... '],['narra','Por um segundo, ele olha para a porta da padaria. Depois retoma a rota.'],['raibot','Bom dia, vizinha!']]},
  {id:'sai',rep:1,a:1,end:1,t:'Deixar ele seguir a rota.',r:[]}])))}
function f2Ze(){const F=S.f2,first=!F.seen.ze;F.seen.ze=1;
 openDlg((first?[['ze','Lia! Ficou com a cara da tua avó.'],['ze','A mesa de dominó foi recolhida em 2019. Ocupação irregular do passeio. Agora cada um joga no celular, em casa.']]:[['ze','Diga, menina.']]).concat(f2Menu('ze',[
  {id:'cx',t:'E a caixinha de sábado?',fn:gainF('f2c1'),r:[['ze','Virou vaquinha no aplicativo. Cobra três por cento. Ninguém sabe quem botou quanto, só o total.']]},
  {id:'tot',t:'Quando puseram o totem na porta da padaria?',fn:gainF('f2v2'),r:[['ze','No mesmo ano em que levaram a mesa. Disseram que era pra chamar ambulância se alguém passasse mal.'],['ze','Aurea falava baixinho perto dele. Dizia que o poste tinha ouvido.']]},
  {id:'vo',t:'O senhor conversa com a atendente?',fn:vin(1),r:[['ze','Converso. Ela me chama de cliente recorrente.'],['ze','Aurea me chamava de Zé.']]},
  {id:'sai',rep:1,a:1,end:1,t:'Até amanhã, Seu Zé.',r:[['ze','Até. O ônibus das sete eu não perco, viu?']]}])))}
function f2Caio(){const F=S.f2;F.seen.caio=1;F.caiP=8;
 openDlg([['caio','Lia? Caio! Do café, em 2000. Eu fazia o cappuccino, lembra?'],['caio','Hoje eu entrego. O aplicativo conta o tempo parado. Passou de quarenta segundos, cai a nota.'],{ch:[
  {t:'Leva um café, por conta da casa.',fn:()=>{f2Add('vin',1);f2Add('efi',-1)},r:[['caio','Vou tomar andando. Valeu, Lia.']]},
  {t:'Quem dá a tua nota?',fn:gainF('f2c2'),r:[['caio','Ninguém. Ou todo mundo. É uma média.'],['caio','Ontem caí porque parei pra ajudar uma senhora na ladeira. Ajudar não tem botão.']]},
  {t:'Não te prendo. Vai.',fn:efi(1),r:[['caio','Valeu. Já foram trinta e oito segundos.']]}]}])}
function f2Tiago(){const F=S.f2,first=!F.seen.ti;F.seen.ti=1;
 openDlg((first?[['tiago','Boa noite. Fiscalização de mobilidade inteligente.'],['tiago','Trabalho pra dona Lúcia, no Centro de Monitoramento. Ela diz que número não mente.']]:[['tiago','Pois não?']]).concat(f2Menu('ti',[
  {id:'bus',t:'Por que o ônibus fecha a porta tão rápido?',fn:gainF('f2c3'),r:[['tiago','Vinte segundos de porta aberta. Se passar, a linha perde a meta de pontualidade e o bairro cai no ranking.'],['lia','E quem não consegue correr?'],['tiago','Pega o próximo. Ou pede o transporte sob demanda no aplicativo.']]},
  {id:'grav',t:'Quem autorizou gravar o balcão da padaria?',cond:()=>has('f2v1')||has('f2v2'),fn:gainF('f2v3'),r:[['tiago','Eu não autorizo nada. Eu olho o painel.'],['tiago','Lá diz: fala em área de acesso público tem consentimento implícito. A porta da padaria fica aberta. Pro sistema, o balcão é rua.']]},
  {id:'num',t:'Número não mente?',fn:vin(1),r:[['tiago','Não mente. Mas também não fala. Isso eu não digo pra ela.']]},
  {id:'sai',rep:1,a:1,end:1,t:'Boa noite, Tiago.',r:[]}])))}
function f2Tur(){openDlg([['turista26','Aqui que é a padaria da vovó robô? Vi no aplicativo. Nota 4,9.'],['lia','É a padaria da minha avó.'],['turista26','Ah, que fofo! Foi ela que fez a voz?']])}
function f2Dan(){const F=S.f2,first=!F.seen.dan;F.seen.dan=1;
 openDlg((first?[['dandara','Lia. Eu sabia que você voltava.'],['dandara','Viu o Raimundo andando aí? Dão bom dia por ele a toda hora. Ele morreu sem casa e virou passeio.']]:[['dandara','Fala, Lia.']]).concat(f2Menu('dan',[
  {id:'med',t:'Como ele ganhou a medalha?',fn:gainF('f2r3'),r:[['dandara','Três meses depois de sair do sobrado. Chamaram de morador honorário. A placa da medalha nunca foi gravada.']]},
  {id:'ass',t:'A associação ainda se reúne?',fn:vin(1),r:[['dandara','Na minha cozinha, com o rádio alto. Longe dos postes.']]},
  {id:'voz',t:'Usaram a voz da vó pra fazer a atendente.',cond:()=>has('f2v1'),fn:()=>{f2Add('vin',2);S.f2.prova=true},r:[['dandara','Então a gente tem prova. A voz dela não era deles.'],['dandara','Amanhã a gente leva isso pra Defensoria. Você vem?'],['lia','Vou.']]},
  {id:'sai',rep:1,a:1,end:1,t:'Até amanhã, Dandara.',r:[]}])))}
function f2Davi(){const F=S.f2;if(F.seen.davi){openDlg([['davi',F.roda?'Ninguém saiu da roda. Nem o poste.':'Quem sabe amanhã a gente toca.']]);return}F.seen.davi=1;
 openDlg([['davi','Lia! Olha só: cada vez que eu toco, o poste acende vermelho.'],['davi','Pra roda agora precisa de licença de ruído no aplicativo. Sem licença, o sensor chama a fiscalização.'],{fn:gainF('f2c4')},{ch:[
  {t:'Toca assim mesmo. Eu fico do lado.',fn:()=>{f2Add('vis',3);f2Add('vin',2);F.roda=true;F.tot[2]=3;F.totT[2]=8},r:[['narra','Davi bate o primeiro toque. Uma janela abre, depois outra. Gente desce a ladeira.'],['narra','O totem da esquina acende vermelho. Ninguém sai da roda.']]},
  {t:'Toca baixinho, só pra gente.',fn:vin(1),r:[['narra','Ele toca com a ponta dos dedos. O poste não ouve. Você ouve.']]},
  {t:'Melhor não arrumar problema.',fn:efi(1),r:[['davi','É. Melhor não.'],['narra','Ele guarda a baqueta no bolso de trás.']]}]}])}
function f2Abord(){const F=S.f2;F.ab++;F.drone={t:0,x:H2(S.px),y:SY(S.py)};S.speaker=null;
 openDlg([['narra','Um zumbido desce do alto. O drone para na altura do seu rosto. A lente acende.'],['drone','Cidadã, sua circulação está fora do padrão. Por favor, olhe para a lente.'],{ch:[
  {t:'Olhar para a lente.',a:1,fn:()=>{F.vis=4;f2Add('efi',1)},r:[['drone','Identificação concluída. Lia Aurea dos Santos, 45 anos. Tenha uma boa noite.'],['narra','Ele sabe o seu nome inteiro. O da sua avó vem no meio.']]},
  {t:'Por que eu estou sendo parada?',fn:()=>{F.vis=6;f2Add('vin',1);logIt('Lia perguntou ao drone por que estava sendo parada. A pergunta foi registrada.')},r:[['drone','Pergunta registrada.'],['drone','Por favor, olhe para a lente.'],['narra','Você olha. Não havia outra resposta.']]},
  {t:'Cobrir o rosto com o lenço.',a:1,fn:()=>{F.vis=3;F.lenco=true},r:[['drone','Rosto não identificado. Ocorrência aberta.'],['narra','O drone sobe devagar. A partir de agora, as câmeras te procuram mais rápido.']]}]},
  {fn:()=>{F.drone=null;if(F.ab>=3)setTimeout(()=>f2End('fora'),300)}}])}

/* ---------- relógio, câmeras, totens, ônibus ---------- */
const F2BUS=[17.5,19,20.5,21.5];
const _up=update;update=function(dt){_up(dt);if(f2Ok())f2Tick(dt)};
function f2Tick(dt){const F=S.f2;S.busX=0;if(F.ending)return;const play=S.scene==='play',h=S.min/60;
 if(play){S.min+=dt*1.6;if(S.min>=22*60){f2End('relogio');return}}
 // Seu Raimundo-robô: rota fixa, para e repete
 if(play){if(F.raiP>0)F.raiP-=dt;else{F.raiX+=F.raiD*dt*34;if(F.raiX>1120){F.raiX=1120;F.raiD=-1;F.raiP=3}if(F.raiX<420){F.raiX=420;F.raiD=1;F.raiP=3}if(Math.random()<dt*.08)F.raiP=2.4}
  if(F.caiP>0)F.caiP-=dt;else{F.caiX+=F.caiD*dt*90;if(F.caiX>1950){F.caiD=-1}if(F.caiX<1300){F.caiD=1}}}
 // Seu Zé vai para o ponto antes do ônibus das 19h
 if(h>=18.6&&h<19.2&&!F.bus.ze&&F.zeX<1960)F.zeX=Math.min(1960,F.zeX+dt*60);
 // ônibus
 let bx=-1,bf=2;for(const t of F2BUS){if(h>=t-.15&&h<t){bx=lerp(1340,1050,(h-t+.15)/.15);bf=2}else if(h>=t&&h<t+.3){bx=1050;bf=0}else if(h>=t+.3&&h<t+.42&&t!==21.5){bx=lerp(1050,-200,(h-t-.3)/.12);bf=1}}
 F.busX=bx;F.busF=bf;
 if(h>=19&&!F.bus.ze&&play&&S.loc==='rua'){F.bus.ze=1;if(Math.abs(S.px-2050)<520){f2ZeBus()}else{f2Add('efi',1);logIt('Seu Zé perdeu o ônibus das 19h por três passos.',{tt:'O ônibus das 19h',who:['ze']});toast('No largo, o ônibus das 19h saiu sem o Seu Zé.')}}
 if(h>=19.5&&!F.zeGone&&F.bus.zeOk){F.zeGone=true}
 // câmeras: feixe varrendo a calçada do lado das casas
 if(play&&S.loc==='rua'){const px=H2(S.px);let seen=-1;
  F2CAM.forEach(([cx,cy],i)=>{const bxp=cx+Math.sin(S.t*.7+i*2.1)*46;F.camT[i]=bxp;if(Math.abs(px-bxp)<18&&S.py<GY+62)seen=i});
  if(seen>=0){f2Add('vis',dt*(F.lenco?1.9:1.2));if(!F.camOn){F.camOn=1;toast('A câmera reconheceu seu rosto.');if(!F.seen.cam){F.seen.cam=1;logIt('Uma câmera da rua reconheceu o rosto de Lia pela primeira vez.',{tt:'Reconhecimento facial',at:['rua',S.px]})}}}
  else{F.camOn=0;F.vis=Math.max(0,F.vis-dt*.12)}F.seeing=seen}
 for(let i=0;i<3;i++){if(F.totT[i]>0){F.totT[i]-=dt;if(F.totT[i]<=0)F.tot[i]=0}else F.tot[i]=(S.loc==='rua'&&Math.abs(S.px-F2TOT[i])<200)?1:0}
 if(F.vis>=9.8&&play&&!F.drone){F.vis=9.9;f2Abord()}}
function f2ZeBus(){const F=S.f2;S.speaker=null;
 openDlg([['narra','O ônibus encosta no largo. A porta abre e um painel começa a contar: vinte, dezenove, dezoito.'],['narra','Seu Zé vem pela ladeira, de bengala, ainda longe.'],{ch:[
  {t:'Segurar a porta.',a:1,fn:()=>{f2Add('vin',2);f2Add('efi',-2);f2Add('vis',1);F.bus.zeOk=1;logIt('Lia segurou a porta do ônibus das 19h para Seu Zé.',{tt:'O ônibus das 19h',who:['ze']})},r:[['narra','O ônibus apita. Uma voz diz: embarque fora do padrão registrado.'],['ze','Obrigado, minha filha. Aurea fazia isso com o pão.'],['narra','Seu Zé entra rindo. A linha perde um ponto no ranking do mês.']]},
  {t:'Deixar o ônibus ir.',a:1,fn:()=>{f2Add('efi',1);f2Add('vin',-1);logIt('Seu Zé perdeu o ônibus das 19h. Lia viu.',{tt:'O ônibus das 19h',who:['ze']})},r:[['narra','A porta fecha com Seu Zé a três passos. O próximo passa em uma hora e meia.'],['ze','Tá certo. Tá certo.']]}]}])}
/* totem: conversa perto dele vira registro */
const _od2=openDlg;openDlg=function(script,done){if(f2Ok()&&S.loc==='rua'&&!S.f2.ending){const F=S.f2,i=F2TOT.findIndex(x=>Math.abs(S.px-x)<180);
  if(i>=0&&script&&script.some(l=>Array.isArray(l)&&l[0]!=='narra'&&l[0]!=='drone')){F.tot[i]=2;F.totT[i]=5;f2Add('vis',1.5);const sp=script.find(l=>Array.isArray(l)&&l[0]!=='narra'&&l[0]!=='lia');
   const who=sp?sp[0]:null;if(!F.seen['t'+i+who]){F.seen['t'+i+who]=1;logIt(`O totem ${i+1} gravou uma conversa de Lia${who?' com '+(NMS[who]||who):''}.`,{tt:'Conversa gravada pelo totem',who:who&&NMS[who]&&S.npcs[who]?[who]:[]})}toast('O totem gravou a conversa.')}}
 return _od2(script,done)};

/* ---------- desenho: rua ---------- */
function f2RuaProps(sc,add){const A=sc.add;
 // palco desmontado sob lona, tapume no sobrado, varanda e remendo de calçamento como em 2000
 {const g=A.graphics().setDepth(-47);add(g);g.fillStyle(0x0E141C,1).fillRect(1049,132,68,24);g.fillStyle(0x1E2A38,1).fillRect(1050,133,66,22);g.fillStyle(0x3DF2E0,.8).fillRect(1050,133,66,1).fillRect(1050,154,66,1);
  const t=mkText(sc,1083,144,[{t:'PALCO',b:1},{br:1},{t:'DESATIVADO',b:1}],{f:'ui',size:6,lh:7,align:'center',color:'#7FF0FF',bold:'#7FF0FF',ox:.5,oy:.5}).setDepth(-46);add(t)}
 {const g=A.graphics().setDepth(-48);add(g);const B=(x,y,w,h)=>{g.fillStyle(0x2A1A10,1).fillRect(x,y,w,h);g.fillStyle(0xB58A55,1).fillRect(x+1,y+1,w-2,h-2);g.fillStyle(0xC9A06A,1).fillRect(x+1,y+1,w-2,1)};for(let i=0;i<10;i++)B(307,18+i*7,52,8)}
 add(A.image(1198,246,'varanda').setOrigin(.5,1).setDepth(-48));add(A.image(1155-985,0,'f2_rua26').setOrigin(0).setCrop(985,240,58,30).setDepth(-49));
 // abrigo de ônibus de vidro e aço, no largo
 {const g=A.graphics().setDepth(246);add(g);const x0=1080,y0=196;g.fillStyle(0x0E141C,1).fillRect(x0,y0,62,3);g.fillStyle(0x7C8796,1).fillRect(x0+1,y0+1,60,1);[x0+2,x0+58].forEach(x=>{g.fillStyle(0x0E141C,1).fillRect(x,y0+3,3,51);g.fillStyle(0x7C8796,1).fillRect(x+1,y0+3,1,51)});
  g.fillStyle(0x9FD8E8,.18).fillRect(x0+5,y0+3,53,40);g.fillStyle(0x3DF2E0,.9).fillRect(x0+8,y0+8,18,26);g.fillStyle(0x0E2A30,1).fillRect(x0+9,y0+9,16,24);g.fillStyle(0x0E141C,1).fillRect(x0+28,y0+38,28,3)}
 // telão da prefeitura na fachada
 {const g=A.graphics().setDepth(-46);add(g);
  const t=mkText(sc,834,160,'',{f:'ui',size:6,color:'#7FF0FF',ox:.5,oy:.5}).setDepth(-45);add(t);sc.f2tel=t;sc.f2telK=-1}
 // totens e câmeras
 sc.f2tot=F2TOT.map(x=>{const s=A.sprite(H2(x),SY(GY+30),'f2_totem',0).setOrigin(.5,1).setDepth(SY(GY+30));add(s);const sh=A.image(H2(x),SY(GY+30)-1,'shadow').setScale(.7,.6).setDepth(SY(GY+30)-.5);add(sh);return s});
 sc.f2beam=A.graphics().setDepth(9200).setBlendMode(Phaser.BlendModes.ADD);add(sc.f2beam);
  sc.f2tel.setVisible(true)}
const F2TEL=['SORRIA','ÁREA MONITORADA','RANKING: 3º LUGAR','TRAJETO APROVADO','FALE BAIXO'];
function f2Actors(sc,E,sp,camx){const F=S.f2;if(!F)return;const play=S.scene==='play';sc.f2spr=sc.f2spr||{};const P=sc.f2spr;
 const get=(id,tex)=>{let o=P[id];if(!o){o={s:sc.add.sprite(0,0,tex,0).setOrigin(.5,1),sh:sc.add.image(0,0,'shadow').setScale(.8,.7)};P[id]=o}o.s.setVisible(true);o.sh.setVisible(true);return o};
 const put=(id,tex,x,y,fr,flip,bark)=>{const o=get(id,tex),yy=SY(y),s=scaleFor(yy,false)*.98;o.s.setTexture(tex,fr).setPosition(Math.round(H2(x)),Math.round(yy)).setScale(s).setFlipX(!!flip).setDepth(yy);o.sh.setPosition(Math.round(H2(x)),Math.round(yy)-1).setDepth(yy-.5);
  o.top=yy-o.s.displayHeight;if(bark&&play)sp.put('f2:'+id,o.s.x,o.top-3,bark,camx);return o};
 const show=S.loc==='rua'&&!F.ending;for(const k in P){P[k].s.setVisible(false);P[k].sh.setVisible(false)}if(!show)return;
 const k4=Math.floor(S.t*6)%4,glitch=S.speaker==='raibotx';
 // Seu Raimundo-robô (4–7 andando para a direita; 0–3 parado de frente; 15 de costas com a nuca aberta)
 const rw=F.raiP<=0;const rb=Math.sin(S.t*.5)>.96&&!rw;if(sc.f2rob)sc.f2rob.setVisible(true);
 put('raibot','f2_raibot',F.raiX,GY+60,glitch?15:rw?4+k4:(S.speaker==='raibot'?0:(Math.floor(S.t*1.5)%4)),rw&&F.raiD<0,rb?'Bom dia, vizinha!':null);
 if(!F.zeGone)put('ze','f2_ze',F.zeX,GY+62,Math.floor(S.t*1.2)%4,false,null);
 if(!F.seen.caio||F.caiP<=0){put('caio','f2_caio',F.caiX,GY+96,F.caiP>0?0:(F.caiD>0?(Math.floor(S.t*4)%2):2+Math.floor(S.t*4)%2),false,null)}
 put('tiago','f2_tiago',2190,GY+58,Math.floor(S.t*1.4)%4,false,null);
 put('turista26','f2_turista',2350,GY+84,Math.floor(S.t*1.1)%3,false,Math.sin(S.t*.4)>.9?'Que lindo, tudo limpinho!':null);
 // ônibus
 if(F.busX>0){const o=get('bus','f2_onibus');o.s.setTexture('f2_onibus',F.busF).setPosition(Math.round(F.busX),264).setScale(1).setDepth(264).setFlipX(false);o.sh.setVisible(false)}
 // robô de entrega rolando no lado de baixo da rua (desenhado em código)
 {if(!sc.f2rob){sc.f2rob=sc.add.graphics()}const g=sc.f2rob,x=((S.t*22)%1500)-100,y=267;g.clear().setDepth(y).setVisible(true);
  g.fillStyle(0x0E141C,1).fillRect(x-9,y-12,18,9);g.fillStyle(0x7C8796,1).fillRect(x-8,y-11,16,6);g.fillStyle(0x6A4327,1).fillRect(x-8,y-6,16,2);g.fillStyle(0xFFB020,1).fillRect(x+5,y-10,2,1);
  [x-7,x-1,x+5].forEach(w=>{g.fillStyle(0x0E141C,1).fillRect(w,y-3,3,3)})}
 // drone: ronda o largo; na abordagem desce até a Lia
 {if(!sc.f2dr)sc.f2dr=sc.add.graphics().setDepth(9300);const g=sc.f2dr;g.clear();let x,y;
  if(F.drone){const pe=E.m.get('player');F.drone.t+=1/60;const tx=pe?pe.spr.x+14:H2(S.px),ty=pe?pe.top-6:SY(S.py)-60;x=lerp(tx,tx,1);y=lerp(60,ty,Math.min(1,F.drone.t*1.2))}else{x=950+Math.sin(S.t*.3)*160;y=58+Math.sin(S.t*1.7)*3}
  const blink=Math.sin(S.t*8)>0;g.fillStyle(0x0E141C,1).fillRect(x-9,y-1,18,2).fillRect(x-3,y-3,6,6);g.fillStyle(0x7C8796,1).fillRect(x-2,y-2,4,4);g.fillStyle(blink?0xFF3B3B:0x7A1A1A,1).fillRect(x-1,y-1,2,2);
  g.fillStyle(0x9FD8E8,.6).fillRect(x-12,y-3,6,1).fillRect(x+6,y-3,6,1)}}
function f2Off(sc){if(sc.f2spr)for(const k in sc.f2spr){sc.f2spr[k].s.setVisible(false);sc.f2spr[k].sh.setVisible(false)}if(sc.f2rob)sc.f2rob.setVisible(false);if(sc.f2dr)sc.f2dr.clear()}
function f2Rua(sc){const F=S.f2;if(!F)return;
 const i=Math.floor(S.t/4)%F2TEL.length;if(sc.f2tel&&sc.f2telK!==i){sc.f2telK=i;sc.f2tel.setT(F2TEL[i])}
 if(sc.f2tot)sc.f2tot.forEach((s,i)=>s.setFrame(F.vis>=8&&F.tot[i]===0?3:F.tot[i]));
 const g=sc.f2beam;if(!g)return;g.clear();F2CAM.forEach(([cx,cy],i)=>{const bx=F.camT[i]||cx,hit=F.seeing===i,col=hit?F2C.red:F2C.cyan,a=hit?.32:.14,fy=250;
  g.fillStyle(col,a*.7);g.fillTriangle(cx,cy+5,bx-18,fy,bx+18,fy);g.fillStyle(col,a+.12);g.fillEllipse(bx,fy,38,8)})}
/* ---------- desenho: padaria ---------- */
function f2Pad(sc){const F=S.f2;if(!F||S.mode!=='f2'){if(sc.f2o)sc.f2o.all.forEach(x=>x.setVisible&&x.setVisible(false));if(sc.bg.texture.key==='f2_interior26'){sc.bg.setTexture('interior');sc.ckey=null}return}
 if(!sc.f2o){const A=sc.add;sc.f2o={};
  const o=sc.f2o;o.vo=A.sprite(228,186,'f2_vobot',0).setOrigin(.5,1).setDepth(200).setScale(1.08);
  o.ret=A.image(135,140,'f2_m_retrato').setOrigin(.5,1).setDepth(-45);o.alt=A.image(176,141,'f2_m_altar').setOrigin(.5,1).setDepth(-45);
  o.carta=A.image(380,183,'f2_m_carta').setOrigin(.5,1).setDepth(221.4);o.cad=A.image(45,250,'f2_m_cadeira').setOrigin(.5,1).setDepth(250);
  o.car=A.image(560,236,'f2_m_carregador').setOrigin(.5,1).setDepth(236);o.carSh=A.image(560,235,'shadow').setScale(.7,.6).setDepth(235.5);o.cadSh=A.image(45,249,'shadow').setScale(.9,.7).setDepth(249.5);
  // a tela, o leitor facial e a câmera já estão pintados no fundo de 2026; aqui só o texto da tela
  o.menu=mkText(sc,260,30,[{t:'MENU AFETIVO',b:1},{br:1},{t:'pão de sempre'},{br:1},{t:'café com carinho'},{br:1},{t:'bolo da vó'}],{f:'ui',size:6,lh:9,color:'#7FF0FF',bold:'#7FF0FF',align:'center',ox:.5}).setDepth(-43);
  o.led=A.rectangle(0,0,2,2,F2C.amber).setDepth(201);o.all=Object.values(o)}
 const o=sc.f2o,on=S.loc==='dentro';if(sc.bg.texture.key!=='f2_interior26'){sc.bg.setTexture('f2_interior26');sc.wall.setFillStyle(0xffffff,0)}o.all.forEach(x=>x.setVisible&&x.setVisible(on));if(!on)return;
 const sp=S.speaker,talk=sp==='vobot',gl=sp==='vobotx';let fr=Math.floor(S.t*2)%4;if(talk)fr=8+Math.floor(S.t*3)%4;else if(gl)fr=12;else if(S.min>=21.8*60)fr=15;
 o.vo.setFrame(fr).setPosition(228+(gl?Math.round(Math.sin(S.t*60)):0),186);o.led.setPosition(228-6,186-o.vo.displayHeight+9).setFillStyle(gl?F2C.red:F2C.amber,Math.sin(S.t*5)>-.3?1:.3)}
/* HUD: três medidas */
function f2Hud(ui,show){if(!ui.f2h){const A=ui.add,D=101,h=ui.f2h={g:A.graphics().setDepth(D+1),t:['Vínculo','Visível','Eficiência'].map(s=>mkText(ui,0,4,s,{f:'ui',size:8,color:TXT.cream,shadow:TXT.dark}).setDepth(D+2))}}
 const h=ui.f2h,on=show&&f2Ok();h.g.setVisible(on);h.t.forEach(t=>t.setVisible(on));if(!on)return;const F=S.f2,g=h.g;g.clear();
 const vals=[[F.vin,0x3E7B5C],[F.vis,F.vis>=7?(Math.sin(S.t*8)>0?F2C.red:0xB4452D):F2C.cyan],[F.efi,0x7C8796]];let x=118;
 x=Math.max(118,29+(ui.tClock.tw||80)+12);const room=LW-96-x,cw=Math.max(3,Math.min(5,Math.floor((room-h.t.reduce((a,t)=>a+t.tw+12,0))/30)));
 vals.forEach(([v,c],i)=>{const t=h.t[i];t.setPosition(x,5);x+=t.tw+4;for(let k=0;k<10;k++){g.fillStyle(0x1C110A,1).fillRect(x+k*cw,7,cw-1,8);g.fillStyle(k<Math.round(v)?c:0x3B2617,1).fillRect(x+k*cw+1,8,Math.max(1,cw-3),6)}x+=10*cw+8})}
/* Lia adulta: a Lia da fase 1 com camisa verde-oliva, jeans escuro e lenço laranja no cabelo, recolorida na hora */
function f2LiaTex(sc){if(sc.textures.exists('chars26'))return;const src=sc.textures.get('chars').getSourceImage(),cv=document.createElement('canvas');cv.width=src.width;cv.height=src.height;const g=cv.getContext('2d');g.drawImage(src,0,0);
 const fr=ASSETS.atlases.chars.json.frames;for(const n in fr){if(!/^lia\//.test(n))continue;const f=fr[n].frame,id=g.getImageData(f.x,f.y,f.w,f.h),d=id.data;
  for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++){const i=(y*f.w+x)*4;if(d[i+3]<10)continue;const r=d[i],gg=d[i+1],b=d[i+2],k=y/f.h;
   if(r>90&&r>gg*2.2&&r>b*2&&k<.62){const L=(r)/190;d[i]=Math.round(78*L);d[i+1]=Math.round(92*L);d[i+2]=Math.round(44*L)}          // camisa
   else if(Math.abs(r-b)<40&&b>80&&b>=r-6&&k>.45&&k<.8){const L=(r+gg+b)/3/150;d[i]=Math.round(38*L);d[i+1]=Math.round(52*L);d[i+2]=Math.round(88*L)} // jeans
   else if(k<.3&&r<70&&gg<40&&r>18&&((y>=Math.round(f.h*.12)&&y<=Math.round(f.h*.16)))){d[i]=214;d[i+1]=110;d[i+2]=40}                // lenço
   else if(k<.2&&r<70&&gg<40&&r>18&&((x*7+y*3)%9===0)){d[i]=128;d[i+1]=118;d[i+2]=112}}                                            // fios brancos
  g.putImageData(id,f.x,f.y)}
 sc.textures.addAtlasJSONHash('chars26',cv,ASSETS.atlases.chars.json);ASSETS.rigs.lia26=ASSETS.rigs.lia;
 for(const k in GROUPS){if(!/^lia\//.test(k))continue;const g2=k.replace('lia/','lia26/');GROUPS[g2]=GROUPS[k];const frs=GROUPS[k].filter(Boolean);if(frs.length>1&&!sc.anims.exists(g2))sc.anims.create({key:g2,frames:frs.map(f=>({key:'chars26',frame:f})),frameRate:8,repeat:-1})}}
window.__startF2=()=>{S.prologoVisto=1;startF2()};window.__f2={startF2,f2End,f2Abord,f2ZeBus,f2Hot};
