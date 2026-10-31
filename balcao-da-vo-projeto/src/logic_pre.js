(()=>{
'use strict';
const OUT='#3B1F0E',PINK='#FF4DB8',YEL='#FFD21F',ORA='#FF6A1F',BLU='#2F3BFF',GRN='#19E68C',CRM='#F4EFE0',PLUM='#6A2A5B',BRK='#C2542B';
/* largura lógica acompanha a proporção da janela (altura fixa de 270 px lógicos): tela mais larga mostra mais rua */
const LWX=(()=>{let w=960,h=540;try{w=document.documentElement.clientWidth||innerWidth||960;h=document.documentElement.clientHeight||innerHeight||540}catch(e){}const a=Math.max(w,h)/Math.max(1,Math.min(w,h));return Math.max(400,Math.min(640,Math.round(270*a)))})();
const TOUCH=(()=>{try{return matchMedia('(pointer:coarse)').matches||'ontouchstart' in window}catch(e){return false}})();
const VW=LWX*2,VH=540,GY=400,WW=2528,Y0=GY+4,Y1=GY+104,IW=1280,IY0=GY-22,IY1=GY+116,FY=GY-34;
const CT={x0:150,x1:860,y0:GY+8,y1:GY+42};
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
function mix(c1,c2,t){const p=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));const a=p(c1),b=p(c2);return'#'+a.map((v,i)=>Math.round(lerp(v,b[i],clamp(t,0,1))).toString(16).padStart(2,'0')).join('')}
const hsh=(a,b,c)=>{const n=Math.sin(a*127.1+b*311.7+(c||0)*74.7)*43758.5453;return n-Math.floor(n)};
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];

/* ---------- estado ---------- */
const S={scene:'card',era:0,t:0,min:420,px:560,py:GY+80,face:1,walk:false,tx:null,ty:null,cam:900,stock:[2,2,2],
 flags:{},tr:{},clues:{},seen:{},asked:{},helped:{},evDone:{},toast:'',toastT:0,keys:{},npcs:{},extras:[],rain:false,sign:'PADARIA',
 menu:null,d:null,glows:[],dog:null,pigeons:[],clock:0,orders:0,closing:false,bus:0,voAlert:0,
 loc:'dentro',trans:null,icam:200,open:{},deflect:{},insisted:{},pressUsed:{},rel:{},known:{},news:[],rumors:[],ov:{},bant:[],nbTab:0,where:'',tray:[],tn:0,led:null,hist:[],intro:{},beat:{},radioT:0,staff:[],mode:'rua',hired:0,vs:null,spkQ:[],spkR:[],quiet:0,deck:{},q:null,qd:{},fx:{crowd:0,fire:0,ban:0},tk:''};
const F=S.flags;
const has=c=>!!S.clues[c];
const tr=id=>S.tr[id]||0;
const addTr=(id,d)=>{S.tr[id]=clamp(tr(id)+d,-2,5)};

/* ---------- âncoras e rotinas ---------- */
const AN={sobrado:[670,GY+66],calcada:[500,GY+66],casaDan:[940,GY+54],porta:[1210,GY+84],largo:[1950,GY+66],palco:[2070,GY+60],degrau:[2240,GY+74],fachada:[1330,GY+76],onibus:[1960,GY+92],offL:[-90,GY+66],offR:[WW+100,GY+66],
 balcao:[600,GY+66],forno:[240,GY-8],vitrine:[444,GY-10],cafem:[700,GY-12],caixa:[560,GY-6],cadeira:[620,GY-8],sobe:[60,GY-6],mesa:[900,GY+92],iporta:[1060,GY+10]};
const INN={balcao:1,forno:1,vitrine:1,cafem:1,caixa:1,cadeira:1,sobe:1,mesa:1,iporta:1};
const HID={sobe:1,offL:1,offR:1};
const OUTDOOR={calcada:1,largo:1,palco:1,degrau:1,fachada:1,onibus:1,porta:1};
const BOFF={raimundo:-124,dandara:-62,davi:0,marta:62,lucia:124},POFF={marta:-130,lucia:-130,davi:-130};
const STXI=[240,444,700];
/* ---------- relações entre os moradores ---------- */
const RELB={'raimundo>vo':1,'vo>raimundo':1,'dandara>vo':1,'vo>dandara':1,'marta>davi':1,'vo>marta':0,'marta>dandara':0,'dandara>marta':0,'dandara>lucia':-2,'davi>lucia':-1,'lucia>marta':1,'marta>lucia':1,'raimundo>lucia':1};
const rel=(a,b)=>{const k=a+'>'+b;return k in S.rel?S.rel[k]:(RELB[k]||0)};
const addRel=(a,b,d)=>{S.rel[a+'>'+b]=clamp(rel(a,b)+d,-2,2)};
const know=(a,b)=>{S.known[a+'>'+b]=1};
const MOODR=['rompido','tenso','distante','próximo','aliado'];
const moodR=v=>MOODR[clamp(Math.round(v),-2,2)+2];
const SCHED=[
{raimundo:[[7,'sobrado'],[8,'balcao'],[9.6,'sobrado'],[10,'calcada'],[11.5,'sobrado'],[14,'degrau'],[16.4,'largo'],[18,'sobrado']],
 dandara:[[7,'casaDan'],[8.6,'balcao'],[9.6,'calcada'],[11,'casaDan'],[15,'largo'],[18,'casaDan']],
 davi:[[7.5,'palco'],[9,'balcao'],[10.2,'palco'],[13,'palco'],[16,'largo'],[18,'palco']],
 lucia:[[7,'offL'],[10.5,'fachada'],[13.5,'fachada'],[16,'offL']],
 vo:[[7,'forno'],[10,'caixa'],[12.3,'sobe'],[13.3,'caixa'],[15.5,'forno'],[17,'caixa']]},
{marta:[[7,'offR'],[9,'onibus'],[9.7,'largo'],[10.4,'balcao'],[11.2,'palco'],[13,'porta'],[14.8,'balcao'],[16,'palco'],[17.5,'offR']],
 raimundo:[[7,'offL'],[9,'sobrado'],[9.8,'balcao'],[11.2,'sobrado'],[12.5,'offL']],
 dandara:[[7,'casaDan'],[8.2,'balcao'],[9,'casaDan'],[12,'calcada'],[14,'casaDan'],[17.5,'balcao']],
 davi:[[7.5,'offL'],[7.9,'balcao'],[9.5,'palco'],[12.5,'balcao'],[13.5,'palco'],[17,'palco'],[18.5,'largo']],
 lucia:[[7,'offL'],[10,'sobrado'],[13,'fachada'],[15.2,'balcao'],[16.4,'offR']],
 vo:[[7,'forno'],[10,'caixa'],[12.3,'sobe'],[13.3,'caixa'],[15.5,'forno'],[17,'caixa']]},
{raimundo:[[7,'offL'],[14.5,'sobrado'],[15.5,'degrau'],[18,'offL']],
 dandara:[[7,'casaDan'],[9.5,'balcao'],[10.3,'casaDan'],[14.5,'largo'],[17.5,'casaDan']],
 davi:[[8,'palco'],[11.8,'balcao'],[12.6,'palco'],[16.5,'largo'],[18,'palco']],
 marta:[[7,'offR'],[10.3,'onibus'],[10.9,'balcao'],[12.8,'palco'],[14.5,'largo'],[16.3,'offR']],
 vo:[[7,'forno'],[9.5,'cadeira'],[12.5,'sobe'],[13.5,'cadeira'],[17,'cadeira']]}];
const LOOK={
 raimundo:{body:BLU,pants:OUT,skin:'#8A4B2A',hair:'#D9D4CC'},
 dandara:{body:GRN,skirt:ORA,pants:OUT,skin:'#5A2E1A',puff:true},
 davi:{body:ORA,pants:BLU,skin:'#8A4B2A',hat:'band',hatc:YEL},
 marta:{body:PINK,pants:BLU,skin:'#D9A67A',hat:'sun',hatc:YEL,cam:true,hair:'#8A5A2A'},
 lucia:{body:CRM,pants:PLUM,skin:'#C98A5A',hair:OUT,clip:true},
 vo:{body:ORA,skirt:PLUM,pants:OUT,skin:'#8A4B2A',puff:true,hair:'#EDE6D6',apron:true},
 lia:{body:YEL,skirt:BLU,pants:OUT,skin:'#8A4B2A',puff:true},
 bia:{body:'#2B2B2B',skirt:'#2B2B2B',pants:OUT,skin:'#C98A5A',hair:OUT,apron:true,hat:'band',hatc:'#2B2B2B'},
 caio:{body:'#2B2B2B',pants:'#2B2B2B',skin:'#8A4B2A',hair:OUT,apron:true,hat:'cap'}};
const WHO={lia:{n:'Lia',c:YEL,t:OUT},vo:{n:'Vó Aurea',c:ORA,t:OUT},dandara:{n:'Dandara',c:GRN,t:OUT},raimundo:{n:'Seu Raimundo',c:BLU,t:CRM},davi:{n:'Davi',c:PINK,t:OUT},marta:{n:'Marta, guia',c:CRM,t:OUT},lucia:{n:'Lúcia, do Programa',c:CRM,t:OUT},turista:{n:'Turista',c:CRM,t:OUT},radio:{n:'Rádio',c:YEL,t:OUT},bia:{n:'Bia, atendente',c:CRM,t:OUT},caio:{n:'Caio, barista',c:CRM,t:OUT}};
const ORDERS=[{raimundo:'pao',dandara:'bolo',davi:'cafe'},{raimundo:'pao',dandara:'pao',davi:'cafe',marta:'cafe',lucia:'cafe'},{raimundo:'pao',dandara:'pao',davi:'cafe',marta:'cafe'}];
const SHOPS={
 'PADARIA':{wall:'#FF9A3D',t1:YEL,t2:CRM,names:{pao:'Pão',bolo:'Bolo de aipim',cafe:'Café coado'},st:['pao','bolo','cafe']},
 'PADARIA & CAFÉ':{wall:'#1FB89A',t1:CRM,t2:YEL,names:{pao:'Pão',bolo:'Bolo de aipim',cafe:'Café'},st:['pao','bolo','cafe']},
 'CAFÉ PELÔ':{wall:BLU,t1:CRM,t2:YEL,names:{pao:'Pão',bolo:'Bolo',cafe:'Cappuccino'},st:['pao','bolo','cafe']},
 'LEMBRANÇAS':{wall:PINK,t1:CRM,t2:'#FFD0EC',names:{pao:'Pão',ima:'Ímã',cafe:'Café'},st:['pao','ima','cafe']}};
function PAL(){const e=S.era,sg=S.sign;
 if(S.mode==='f2')return{wall:'#DDE3EA',t1:CRM,t2:'#2A3548',cnt:'#3A4658',cnt2:'#E8EEF2'};
 if(e===0)return{wall:'#EADDBE',t1:'#8DB8A8',t2:CRM,cnt:'#A87A48',cnt2:'#C99A60'};
 if(e===1)return{wall:'#FF9A3D',t1:YEL,t2:CRM,cnt:'#A8506A',cnt2:CRM};
 const P={'PADARIA':{wall:'#F08A3A',t1:YEL,t2:CRM,cnt:'#A8506A'},'PADARIA & CAFÉ':{wall:'#16705F',t1:CRM,t2:'#16705F',cnt:'#5A3A24'},'CAFÉ PELÔ':{wall:'#26366B',t1:'#E9E1CF',t2:'#26366B',cnt:'#5A3A24'},'LEMBRANÇAS':{wall:PINK,t1:CRM,t2:'#FFD0EC',cnt:'#3E7B5C'}}[sg];return Object.assign({cnt2:CRM},P)}
const shop=()=>{const b=SHOPS[S.sign],p=PAL();return Object.assign({},b,{wall:p.wall,t1:p.t1,t2:p.t2})};
const iname=id=>shop().names[id]||({bolo:'Bolo',ima:'Ímã',pao:'Pão',cafe:'Café'})[id];
const sname=id=>iname(id).split(' ')[0];
/* preços fictícios: servem para mostrar a diferença entre épocas, não são dados do artigo */
const PRICE0=[{pao:.2,bolo:.8,cafe:.4},{pao:.3,bolo:1.5,cafe:.9,ima:3},null];
const PRICE2={'PADARIA':{pao:.6,bolo:2.5,cafe:1.5},'PADARIA & CAFÉ':{pao:.8,bolo:3.5,cafe:3},'CAFÉ PELÔ':{pao:1.5,bolo:5,cafe:6},'LEMBRANÇAS':{pao:1.5,ima:14,cafe:4}};
const price=id=>(S.era<2?PRICE0[S.era]:PRICE2[S.sign])[id]||1;
const brl=v=>'R$ '+v.toFixed(2).replace('.',',');
const QTY={loc:{pao:10,bolo:3,cafe:4,ima:1},vis:{pao:2,bolo:2,cafe:2,ima:2}};

/* ---------- pistas ---------- */
const CLUES={
 ray1:['ray','O aviso na porta','Colaram um aviso de vistoria na porta do sobrado de Seu Raimundo: "imóvel em avaliação para o Programa".'],
 ray2:['ray','O fiado que ninguém cobrou','Na caderneta da vó, a página de Seu Raimundo repete "sexta, sexta, sexta". Nenhuma linha foi riscada.'],
 ray3:['ray','Quem assinou primeiro','Seu Raimundo assinou primeiro e pediu aos vizinhos que assinassem também. Tinha medo de ficar sem nada.'],
 ray4:['ray','"Risco de desabamento"','Disseram a Seu Raimundo que o sobrado corria risco. Ele diz que a casa está de pé há mais de cem anos.'],
 dan1:['dan','A mãe e a rua','A mãe da Dandara precisa de companhia. A rua inteira passava lá, cada um no seu horário.'],
 dan2:['dan','O formulário guardado','Dandara tem o formulário de cadastro já preenchido, pela mãe. A associação não sabe.'],
 dan3:['dan','A ata','A associação nasceu num caderno de ata. Dandara aprendeu a escrever com uma freira.'],
 vo1:['vo','A gaveta do balcão','Na gaveta do balcão há uma proposta para alugar o ponto como café, pelo dobro do aluguel.'],
 vo2:['vo','"Pedi pra pensar"','A vó recebeu a proposta e pediu tempo. Não contou a ninguém.'],
 vo3:['vo','O que ela teme','A vó acha que, se aceitar, a rua continua vindo, mas para tirar foto. Se recusar, a rua continua indo.'],
 roda1:['roda','A roda no roteiro','O roteiro da guia lista a "roda autêntica de sábado, no largo". A roda virou parada do ônibus.'],
 roda2:['roda','O palco paga o aluguel','O cachê do palco paga o aluguel do Davi. Se o palco acaba, ele também sai.'],
 roda3:['roda','Quem contou à guia','Foi o Davi quem contou à guia onde era a roda. Achou que viria gente para tocar. Veio gente para olhar.'],
 prog1:['prog','O que o Programa conta','Para o Programa, resultado é quantos entram na rua por mês. Quantos moram aparece só como contexto.'],
 prog2:['prog','Por onde a vistoria começa','A vistoria começa pelos casarões com menos moradores cadastrados, porque é mais rápido.'],
 prog3:['prog','Marta cresceu aqui','Marta cresceu na rua de baixo. A mãe saiu quando ela era menina. Voltou como guia.'],
 prog4:['prog','O ponto vale mais como café','Alguém do Programa disse que o ponto da padaria vale mais como café, e a guia levou o recado à vó.']};
const THREADS={
 ray:{t:'A casa de Seu Raimundo',c:PINK,none:'Seu Raimundo foi embora. Lia não sabe por quê.',part:'Falta saber quem decidiu e quando.',full:'Ninguém o expulsou, e ele também não escolheu sozinho.'},
 dan:{t:'Dandara',c:GRN,none:'Dandara resiste. Lia não sabe o que isso custa.',part:'Falta saber o que ela esconde.',full:'Resistir tem preço, e Dandara já estava calculando.'},
 vo:{t:'O ponto da vó',c:ORA,none:'A padaria mudou. Lia não sabe quem decidiu.',part:'A vó sabe mais do que contou.',full:'Ela guardou a proposta até não poder mais.'},
 roda:{t:'A roda',c:YEL,none:'A roda virou espetáculo. Lia não sabe como.',part:'Alguém abriu a porta da roda, mas falta saber quem.',full:'Ninguém quis acabar com a roda. Cada um só quis que ela durasse.'},
 prog:{t:'O Programa',c:BLU,none:'O Programa fez a rua ficar bonita. Lia não sabe o que ele media.',part:'O Programa media alguma coisa. Falta saber o quê.',full:'Media quem entrava. Quem ficava não entrava na conta.'}};
const TOPIC={rua:{n:'A rua'},casa:{n:'A casa'},ponto:{n:'O ponto da padaria'},roda:{n:'A roda'},programa:{n:'O Programa'},papel:{n:'O aviso na porta',k:'ray1'},caderneta:{n:'A caderneta',k:'ray2'},gaveta:{n:'A gaveta do balcão',k:'vo1'},roteiro:{n:'O roteiro da guia',k:'roda1'},assinar:{n:'Quem assinou primeiro',k:'ray3'}};

/* ---------- ouvir ---------- */
const LISTEN={
raimundo:[
 {id:'r1',e:0,m:0,L:[['raimundo','Minha mãe vendia acarajé nesta ladeira. Eu aprendi a contar troco no degrau dessa porta.'],['lia','O senhor nunca pensou em sair daqui?'],['raimundo','Sair pra onde, menina? Tudo que eu conheço cabe entre a igreja e o sobrado.']]},
 {id:'r2',e:0,m:2,L:[['raimundo','O sobrado tem rachadura no canto. Todo inverno entra água. Eu remendo com o que tenho.'],['raimundo','Remendo, mas não confio muito no meu remendo. Não conta pra ninguém.']]},
 {id:'r3',e:1,m:0,L:[['raimundo','Cheguei cedo. O ônibus leva mais de uma hora até aqui. E eu ainda venho comprar pão, olha só.'],['raimundo','Pão de outro lugar tem gosto de pão de outro lugar.']]},
 {id:'r4',e:2,m:0,L:[['raimundo','Dei uma volta pelo largo. Reconheci as cores e mais nada.'],['raimundo','A cor é a mesma que minha mãe via. Eu não sei se isso consola ou machuca.']]}],
dandara:[
 {id:'d1',e:0,m:0,c:'dan1',L:[['dandara','Minha mãe pergunta de cada um da rua. Se alguém falta, ela sabe antes de mim.'],['dandara','Tem dia que a rua inteira passa lá pra dar bom dia. Cada um num horário, sem ninguém combinar.']]},
 {id:'d2',e:0,m:2,c:'dan3',L:[['dandara','A gente vai levantar um nome pra quem ficou. Associação. Eu aprendi a escrever ata com uma freira.'],['dandara','Ela dizia que quem escreve o que aconteceu não deixa ninguém dizer o contrário depois.']]},
 {id:'d3',e:1,m:0,L:[['dandara','Uns assinam, outros não. Eu não julgo.'],['dandara','Julgo, mas não digo.']]},
 {id:'d4',e:2,m:0,L:[['dandara','Eu fico. Só não sei quanto custa ficar.'],['dandara','A rua tem gente, mas é gente passando. Parece uma casa onde todo dia é visita.']]}],
davi:[
 {id:'v1',e:0,m:0,L:[['davi','A roda começa quando o sol cai e termina quando alguém reclama. Ninguém reclama.'],['davi','Meu pai dizia que o tambor é o jeito da rua falar sem pedir licença.']]},
 {id:'v2',e:0,m:2,L:[['davi','Meu pai tocava no largo antes de eu nascer. Dizia que o tambor chama quem passa.'],['davi','Eu acho que ele tinha razão. Só não sei se chamar é sempre uma coisa boa.']]},
 {id:'v3',e:1,m:0,L:[['davi','Palco tem cachê e tem hora. Cachê paga aluguel. Aluguel paga eu continuar aqui.'],['davi','Eu sei como isso soa.']]},
 {id:'v4',e:2,m:0,L:[['davi','Hoje toquei pra duas pessoas. Uma tirou foto do tambor e não escutou o som.']]}],
vo:[
 {id:'a1',e:0,m:0,L:[['vo','A massa descansa a noite inteira. Pão bom é o que espera.'],['vo','Eu aprendi com a minha mãe, que aprendeu com a mãe dela. Quando eu paro, a fila aqui da frente também para.']]},
 {id:'a2',e:0,m:2,L:[['vo','O ponto não é meu. Era do meu sogro, passou pra um primo que mora longe. Eu pago, e pago em dia.'],['vo','Tudo que a gente tem aqui é emprestado, Lia. Até a gente.']]},
 {id:'a3',e:1,m:0,L:[['vo','Letreiro bonito. Só gostaria que lessem o que tem dentro.']]},
 {id:'a4',e:2,m:0,L:[['vo','Eu faço o pão e a rua me olha como se eu fosse antiga.'],['vo','Eu sou, mas ainda estou aqui.']]}],
marta:[
 {id:'m1',e:1,m:0,L:[['marta','Eu sei, eu sei, parece que estou vendendo vocês. Estou, um pouco.'],['marta','Mas se eu não levar gente, quem leva? Alguém que nem sabe o nome da rua?']]},
 {id:'m2',e:1,m:2,c:'prog3',L:[['marta','Eu cresci na rua de baixo. Minha mãe saiu quando eu era menina.'],['marta','Voltei guia pra ver se ainda tinha caminho. Achei roteiro.']]},
 {id:'m3',e:2,m:0,L:[['marta','Os grupos diminuem. Eu não sei se é a rua ou se sou eu.']]}],
lucia:[
 {id:'l1',e:0,m:0,L:[['lucia','Eu meço fachada, janela, altura. Depois alguém faz a conta.'],['lia','Que conta?'],['lucia','Isso já não é comigo.']]},
 {id:'l2',e:1,m:0,L:[['lucia','A obra está dentro do prazo. Vocês vão gostar do resultado.']]}]};

/* ---------- perguntar ---------- */
const ASK={
raimundo:{
 rua:[{m:0,L:[['raimundo','A rua é uma casa grande. Cada porta é um cômodo.']]},{m:3,e:[1,2],L:[['raimundo','Agora é uma casa com visita. Eu sei onde ficam os quartos e não posso entrar em nenhum.']]}],
 casa:[{m:0,e:[0],L:[['raimundo','O sobrado é o que sobrou da minha mãe.']]},{m:0,e:[1],L:[['raimundo','O sobrado é o que sobrou da minha mãe. A vizinha do lado já foi embora e o Programa não me larga.']]},{m:0,e:[2],L:[['raimundo','Aceitei a indenização. Deu pro aluguel lá longe. Aqui tem placa de ALUGA-SE.']]}],
 programa:[{m:0,L:[['raimundo','A moça da prancheta é educada. Tudo que ela diz parece que já foi decidido.']]}],
 ponto:[{m:0,L:[['raimundo','Sua avó sabe o que faz. Eu sei que ela sabe. Só não sei se deixam.']]}],
 roda:[{m:0,L:[['raimundo','Roda é pra quem tem fôlego. Eu fico olhando, que também é um jeito de tocar.']]}],
 papel:[{m:0,L:[['raimundo','Isso? Vistoria. Todo mundo recebeu. Não é nada.']]},
  {m:2,c:'ray4',L:[['raimundo','Vieram, mediram e disseram que o sobrado corria risco.'],['raimundo','Risco de quê? Está de pé há mais de cem anos. Eu remendo, mas está de pé.']]},
  {m:4,e:[2],c:'ray3',L:[['raimundo','Eu assinei primeiro. Fiquei com medo de ficar sem nada.'],['raimundo','E depois fui dizendo aos outros que assinassem também. Dói pensar nisso.']]}],
 caderneta:[{m:0,L:[['raimundo','Eu pago. Sempre paguei.']]},{m:2,L:[['raimundo','Sua avó nunca cobrou, eu sei. Por isso eu mal consigo olhar pra ela.']]}],
 assinar:[{m:0,L:[['raimundo','Quem te contou isso? ... Deixa. Eu disse. E diria de novo, se tivesse medo de novo.']]},{m:3,L:[['raimundo','Tem gente que não me perdoa. Tem gente que entende. Eu fico no meio.']]}]},
dandara:{
 rua:[{m:0,L:[['dandara','A rua é a única coisa que eu tenho que ninguém me deu.']]}],
 casa:[{m:0,L:[['dandara','Eu não saio daqui.']]},{m:3,L:[['dandara','Saio se a mãe precisar de hospital. E hospital fica longe daqui.']]},
  {m:4,c:'dan2',L:[['dandara','Tenho o formulário do cadastro já preenchido. Preenchi pela mãe. Se precisar, eu assino.'],['dandara','Ninguém sabe disso, nem a associação. Se souberem, eu perco a voz.']]}],
 programa:[{m:0,L:[['dandara','Programa é palavra bonita pra mudança. Aprendi a desconfiar de palavra bonita.']]},{m:3,e:[1,2],L:[['dandara','Me chamaram numa reunião. Fui. Voltei com um papel e com mais dúvida do que antes.']]}],
 papel:[{m:0,L:[['dandara','Chegou na porta de Seu Raimundo antes da minha. Eu fiquei pensando por que ele primeiro.']]}],
 ponto:[{m:0,L:[['dandara','Sua avó tem o ponto mais bonito da rua. É por isso que me preocupa.']]}],
 roda:[{m:0,L:[['dandara','A roda é o único momento em que parece que ninguém foi embora.']]}],
 assinar:[{m:0,t:1,L:[['dandara','O Raimundo tem medo e eu entendo. Só que o medo dele virou problema meu.'],['dandara','Tem coisa que a gente não perdoa de um vizinho. A gente só compreende.']]}]},
davi:{
 rua:[{m:0,L:[['davi','A rua tem som. Quem passa sem prestar atenção acha que é silêncio.']]}],
 casa:[{m:0,L:[['davi','Moro de aluguel perto da igreja. Quando o aluguel sobe, o tambor sobe junto.']]}],
 ponto:[{m:0,L:[['davi','A padaria da Dona Aurea é o único lugar onde ninguém pergunta quanto eu ganho.']]}],
 papel:[{m:0,L:[['davi','Todo mundo falou desse papel. Eu só vi quando já estava colado.']]}],
 roda:[{m:0,L:[['davi','A roda é de todo mundo.']]},{m:2,e:[1,2],L:[['davi','Virou parada de roteiro. Tem hora, tem placa. A roda de verdade eu ainda faço, escondido do roteiro.']]},
  {m:4,e:[1,2],c:'roda3',L:[['davi','Fui eu que contei pra guia onde era a roda.'],['davi','Achei que ia vir gente pra tocar. Veio gente pra ver, e a roda virou plateia.']]}],
 programa:[{m:0,L:[['davi','Me pagam pra tocar no largo. Eu agradeço e desconfio.']]},{m:2,e:[1,2],c:'roda2',L:[['davi','O cachê paga meu aluguel. Se o palco acaba, eu saio daqui também.'],['davi','Então eu toco e fico calado. Não é bonito, mas é verdade.']]}],
 roteiro:[{m:0,c:'roda3',L:[['davi','Ah. Isso. ... Sim, fui eu.'],['davi','Eu achava que mais gente conhecer a roda era bom. No começo, fiquei até feliz.']]}]},
vo:{
 rua:[{m:0,L:[['vo','Tem rua que a gente atravessa. A minha eu moro.']]}],
 casa:[{m:0,L:[['vo','Eu moro em cima. Todo dia desço a escada que meu marido consertou. Se eu sair, a escada fica.']]}],
 roda:[{m:0,L:[['vo','Eu ouço a roda do quarto, lá de cima. Durmo melhor com ela do que sem.']]}],
 ponto:[{m:0,L:[['vo','É meu enquanto eu pagar.']]},{m:3,c:'vo2',L:[['vo','Chegou uma proposta pra alugar o ponto como café. Eu pedi pra pensar.'],['vo','Não contei a ninguém. Nem a você.']]}],
 gaveta:[{m:0,t:-1,L:[['vo','Sai dessa gaveta. Não é lugar de menina.']]},{m:3,c:'vo3',L:[['vo','Está na gaveta porque eu não sabia onde pôr.'],['vo','Se eu aceito, a rua continua vindo, mas pra tirar foto. Se eu não aceito, a rua continua indo, e quem vem é a idade.']]}],
 caderneta:[{m:0,t:1,L:[['vo','Raimundo deve? Ele paga quando pode. A caderneta é pra eu lembrar quem alimentei.']]}],
 programa:[{m:0,L:[['vo','A moça é educada. A conta que ela faz é outra.']]},{k:'prog1',m:1,f:'voSabeProg',L:[['vo','Então é isso que eles contam. Quem entra. E eu pensando que era sobre quem fica.']]}],
 roteiro:[{m:0,L:[['vo','"O pão mais antigo do centro." Vende, eu sei. Só não sei se eu ainda sou isso ou se estou virando isso.']]}]},
marta:{
 rua:[{m:0,L:[['marta','A rua é bonita. É o que eu repito o dia inteiro. É verdade e é pouco.']]}],
 casa:[{m:0,L:[['marta','Minha casa era ali embaixo. Hoje é um restaurante.']]}],
 roda:[{m:0,L:[['marta','Roda autêntica é a que dá foto sem atrapalhar o tambor.']]}],
 papel:[{m:0,L:[['marta','Aviso de vistoria? Eu só vejo a porta quando a obra acaba.']]}],
 ponto:[{m:0,L:[['marta','Café vende mais que padaria. É conta.']]},{m:3,c:'prog4',L:[['marta','Foi alguém do Programa que falou do ponto. Disse que um café é o que se espera de uma rua assim.'],['marta','Eu só prometi levar o recado.']]}],
 roteiro:[{m:0,L:[['marta','Roteiro é roteiro. Eu escrevo o que dá pra vender.']]},{m:2,c:'roda3',L:[['marta','Foi o Davi quem me contou da roda. Achei que ele queria visitante.'],['marta','Se eu soubesse que ia virar isso, talvez não tivesse perguntado.']]}],
 programa:[{m:0,L:[['marta','Eu levo gente pra ver. O resto não é comigo.']]},{m:2,e:[2],c:'prog1',L:[['marta','A meta era visitante. Eu mesma bati meta.'],['marta','Faltou alguém perguntar quem fica depois que o ônibus vai embora.']]}]},
lucia:{
 rua:[{m:0,L:[['lucia','A rua tem fachada demais pra uma pessoa só medir. Eu meço mesmo assim.']]}],
 casa:[{m:0,L:[['lucia','Casa é o que eu mais meço e menos vejo.']]}],
 roda:[{m:0,L:[['lucia','Programação cultural é um bom indicador de ocupação.']]}],
 papel:[{m:0,L:[['lucia','Vistoria é padrão.']]},{m:3,c:'prog2',L:[['lucia','A vistoria começa pelos casarões com menos moradores cadastrados. É mais rápido.'],['lucia','Esquece que eu disse.']]}],
 ponto:[{m:0,L:[['lucia','Essa padaria é um ponto estratégico. Alguém vai querer alugar.']]},{m:2,e:[1],c:'prog4',L:[['lucia','Vale mais como café. Eu repassei isso à guia, que é quem conversa com a Dona Aurea.']]}],
 programa:[{m:0,L:[['lucia','É um programa de recuperação. Cuida do patrimônio.']]},{m:2,c:'prog1',L:[['lucia','O que a gente apresenta no relatório é visitante. Quantos entram na rua por mês.'],['lia','E quantos moram?'],['lucia','Isso entra como contexto.']]}]}};

/* ---------- ajudar ---------- */
const hh=()=>S.min/60;
const MDI=who=>({id:'md1',e:[0,1,2],lab:who==='raimundo'?'Chamar Dandara para conversar com ele':'Chamar Seu Raimundo para conversar com ela',
 need:()=>!F.mediou&&pairNear('raimundo','dandara',320)&&tr('raimundo')>=2&&tr('dandara')>=2&&rel('dandara','raimundo')<=-1,t:1,cost:40,f:'mediou',
 rel:[['dandara','raimundo',2],['raimundo','dandara',2]],x:{[who==='raimundo'?'dandara':'raimundo']:1},kn:[['raimundo','dandara'],['dandara','raimundo']],
 L:[['narra','Você puxa os dois pela manga, do jeito que só neta consegue.'],['raimundo','Dandara. Eu devia ter esperado.'],['dandara','Devia. Mas eu também devia ter ouvido o medo antes de ouvir a assinatura.'],['narra','Não é perdão. É uma porta que fica encostada em vez de trancada.']]});
const HELP={
raimundo:[
 {id:'hr1',e:[0],lab:'Segurar a escada enquanto ele conserta a calha',need:n=>n.loc==='rua'&&n.x<460,t:2,cost:40,L:[['narra','Você segura a escada. Seu Raimundo sobe devagar, com o cuidado de quem conhece cada degrau.'],['raimundo','Obrigado. Ninguém segura escada de ninguém hoje em dia.'],['raimundo','Sabe o que dá pra ver lá de cima? O largo inteiro, e quem entra e sai das casas.']]},
 {id:'hr2',e:[1],lab:'Dizer que a caderneta dele está quitada',need:n=>n.loc==='dentro'&&has('ray2'),t:2,f:'quitou',rel:[['vo','raimundo',1]],L:[['lia','Seu Raimundo, a caderneta está quitada.'],['raimundo','Quitada? Sua avó que mandou?'],['lia','Eu que decidi.'],['raimundo','Então eu deixo. Mas vou pagar do mesmo jeito, quando puder, em outro lugar.']]},
 {id:'hr3',e:[2],lab:'Acompanhar até o ponto do ônibus',need:n=>n.loc==='rua'&&hh()>=15.5,t:2,cost:30,L:[['narra','Vocês descem juntos até onde o ônibus pára. Seu Raimundo olha pro sobrado duas vezes.'],['raimundo','Obrigado pela companhia. Depois de velho a gente aprende que ir embora sozinho é a parte difícil.']]},
 MDI('raimundo')],
dandara:[
 {id:'hd1',e:[0],lab:'Levar um pedaço de bolo para a mãe dela',need:n=>(S.tray.includes('bolo')||S.tray.includes('pao'))&&n.loc==='rua'&&n.x<700,use:true,t:2,cost:30,L:[['narra','Você sobe com ela. A mãe de Dandara acorda e sorri antes de abrir os olhos.'],['dandara','Ela sabe o passo de todo mundo. O seu ela reconhece desde menina.'],['narra','Na parede, uma lista de nomes escrita à mão. Alguns já estão riscados.']]},
 {id:'hd2',e:[1],lab:'Colar o cartaz da associação na vitrine',need:n=>tr('dandara')>=1&&n.loc==='dentro',t:2,f:'cartaz',rel:[['vo','dandara',1],['marta','dandara',-1]],x:{marta:-1},L:[['dandara','Quero que quem passe veja que tem gente morando aqui.'],['lia','Cola aqui, na vitrine. Fica virado pra rua.'],['dandara','Se a sua avó reclamar, o problema é meu.']]},
 {id:'hd3',e:[2],lab:'Sentar com ela no largo',need:n=>n.loc==='rua'&&n.x>1800,t:2,cost:30,L:[['narra','Vocês sentam no degrau. O largo está quase vazio, mas ainda tem eco.'],['dandara','Antigamente isso aqui não tinha lugar pra sentar. Agora tem, e ninguém senta.']]},
 MDI('dandara')],
davi:[
 {id:'hv1',e:[0],lab:'Ajudar a afinar o tambor',need:()=>true,t:2,L:[['narra','Você segura o couro enquanto ele aperta as cordas.'],['davi','Tambor desafinado ainda toca. Mas a rua percebe.']]},
 {id:'hv2',e:[1],lab:'Guardar o tambor atrás do balcão',need:n=>n.loc==='dentro',t:1,f:'tambor',L:[['davi','Atrás do balcão ele fica seguro, e fica perto da roda.'],['lia','Quando precisar, é só pedir.'],['davi','Pedir não vai ser difícil. Difícil é ter onde tocar.']]},
 {id:'hv3',e:[2],lab:'Entrar na roda e tocar junto',need:n=>n.loc==='rua'&&n.x>1800&&hh()>=15.5,t:2,cost:40,rel:[['dandara','davi',1],['davi','dandara',1]],L:[['narra','Você bate palma fora do tempo. Ele ri e ajusta o ritmo pra você.'],['davi','Roda é isso. Quem chega aprende, e quem estava aprende com quem chegou.']]}],
vo:[
 {id:'ha1',e:[0],lab:'Sovar a massa com ela',need:n=>n.loc==='dentro'&&n.x<420,t:2,cost:40,L:[['narra','Você aperta e dobra, aperta e dobra, até o braço doer.'],['vo','Pão é o único trabalho que cresce enquanto a gente dorme.'],['vo','Quando eu me for, alguém precisa saber o jeito. Você tem a mão boa.']]},
 {id:'ha2',e:[1],lab:'Ler a proposta com ela e dar uma opinião',need:n=>n.loc==='dentro'&&(has('vo1')||has('vo2')||tr('vo')>=3),t:1,c:'vo3',cost:40,once:true,L:[['narra','A vó põe a proposta em cima do balcão e alisa a folha com a palma da mão.'],['vo','Pagam o dobro. Pedem pra mudar o letreiro e o cardápio, e pra eu sorrir nas fotos.'],['vo','Me diz, Lia. O que você faria?'],
  {ch:[{t:'Recusa. A padaria é a padaria.',f:'recusa',r:[['vo','Eu também queria dizer isso. Só que eu sou quem paga as contas.']]},
       {t:'Aceita, mas pede pra manter o forno.',f:'negocia',r:[['vo','Manter o forno. Isso eu consigo pedir.']]},
       {t:'Aceita. Pelo menos o ponto continua aberto.',f:'aceita',r:[['vo','Aberto, sim. Ainda que eu não saiba pra quem.']]}]}]},
 {id:'ha3',e:[2],lab:'Cuidar do caixa para ela descansar',need:n=>n.loc==='dentro'&&n.x>600&&n.x<820,t:2,cost:40,L:[['narra','Você fica no caixa. A vó se senta na cadeira e fecha os olhos por um instante.'],['vo','Acorda quando alguém entrar. Se ninguém entrar, deixa eu dormir.']]}],
marta:[
 {id:'hm1',e:[1],lab:'Ajudar a escrever o cardápio em inglês',need:n=>n.loc==='dentro',t:2,f:'martaCardapio',cost:30,rel:[['dandara','marta',-1]],L:[['lia','"Pão de queijo" não precisa de tradução.'],['marta','Mas "café coado" precisa. "Brewed coffee, the old way". Eles amam o old way.'],['lia','Todo mundo ama o que já não existe.'],['marta','Pois é. Tô anotando.']]},
 {id:'hm2',e:[1],lab:'Propor um roteiro que não pare diante das janelas dos moradores',need:n=>n.loc==='rua',t:2,f:'rota',cost:30,rel:[['marta','dandara',1]],x:{lucia:-1},L:[['lia','Dá pra levar o grupo sem parar na frente das janelas?'],['marta','Dá. Eles reclamam, mas dá. Eu coloco a parada na praça, em vez de na casa.'],['marta','Ninguém nunca me pediu isso.']]}],
lucia:[
 {id:'hl1',e:[0],lab:'Segurar a trena enquanto ela mede',need:n=>n.loc==='rua'&&n.x<700,t:2,cost:30,L:[['narra','Você segura a ponta da trena. Lúcia anota números numa folha com o cuidado de quem escreve uma carta.'],['lucia','Você é a primeira pessoa daqui que me ajuda. Costumam fechar a porta.']]},
 {id:'hl2',e:[1],lab:'Mostrar a ela onde acontece a roda',need:n=>n.loc==='rua',t:2,f:'mostrouRoda',cost:20,L:[['lia','A roda acontece ali, no largo, quando o sol cai.'],['lucia','Obrigada. Isso entra na programação cultural.'],['narra','Ela anota. Você percebe tarde que acabou de oferecer a roda de presente.']]}]};

/* ---------- pressionar ---------- */
const PRESS={
raimundo:{mid:{m:3,c:'ray3',t:-1,L:[['lia','Seu Raimundo, o que foi que o senhor assinou?'],['raimundo','Você não desiste, né? Sua avó também não.'],['raimundo','Eu assinei primeiro. Fiquei com medo de ficar sem nada. E fui dizendo aos outros que assinassem também.']]},
 no:{t:-2,L:[['raimundo','Menina, eu não te devo explicação.'],['narra','Ele pega o saco de pão e vai embora sem olhar pra trás.']]},
 lev:{ray1:{m:1,c:'ray4',t:0,L:[['lia','O aviso na sua porta. O que dizia de verdade?'],['raimundo','Que a casa podia cair. Que era melhor sair antes.'],['raimundo','Podia cair. Também podia ficar de pé. Ninguém quis esperar pra ver.']]},
  ray3:{m:-2,t:1,L:[['lia','Eu ouvi o senhor dizer à Dandara pra assinar logo.'],['raimundo','Ouviu. Então ouviu tudo.'],['raimundo','Eu tive medo. Se você acha que isso é traição, tem razão, e também não tem.']]}}},
dandara:{mid:{m:3,c:'dan1',t:-1,L:[['lia','A senhora já pensou em sair daqui?'],['dandara','Você não pode perguntar isso assim, de frente.'],['dandara','Penso todo dia. Aí vou ver minha mãe e a ideia passa. Até o outro dia.']]},
 no:{t:-2,f:'rompida',L:[['dandara','Você é a neta da Dona Aurea. Não é você quem decide se eu resisto.'],['narra','Ela sai sem olhar pra você, e a porta bate mais forte que o necessário.']]},
 lev:{ray3:{m:-2,c:'dan2',t:1,L:[['lia','Seu Raimundo assinou primeiro e convenceu os outros.'],['dandara','Eu sei. E você acha que eu não tenho medo também?'],['dandara','Tenho o formulário preenchido, pela mãe. Não conta pra associação.']]}}},
davi:{mid:{m:3,c:'roda2',t:-1,L:[['lia','Por que o senhor toca no palco, se não gosta?'],['davi','Pega pesado, Lia.'],['davi','O cachê paga meu aluguel. É isso.']]},
 no:{t:-2,L:[['davi','Eu não tô a fim de ser interrogado.'],['narra','Ele pega o tambor e some no largo.']]},
 lev:{roda1:{m:-2,c:'roda3',t:0,L:[['lia','O roteiro da guia fala da roda de sábado.'],['davi','Foi... foi eu. Eu falei com a guia.'],['davi','Achei que ia vir gente pra tocar. Veio gente pra ver.']]},
  prog1:{m:-2,t:1,L:[['lia','O Programa só conta quem entra na rua.'],['davi','É por isso que o palco existe. Pra alguém contar quem entra.']]}}},
vo:{mid:{m:3,c:'vo2',t:-1,L:[['lia','A senhora está me escondendo alguma coisa.'],['vo','Escondo. Todo mundo esconde. Mas você vai ter que esperar eu ficar pronta.'],['vo','Pedi pra pensar numa proposta. Só isso, por enquanto.']]},
 no:{t:-2,f:'voPressionada',L:[['vo','Menina, quando você ficar velha vai ver que a gente não conta tudo.'],['narra','Ela vira de costas e volta pro forno. O silêncio fica mais pesado que a massa.']]},
 lev:{vo1:{m:2,c:'vo2',t:0,L:[['lia','Vó, eu vi a proposta na gaveta.'],['vo','Então já sabe. Eu só queria que fosse eu a contar.'],['vo','Pedi pra pensar. Ainda estou pensando.']],fail:{t:-2,f:'voPressionada',L:[['vo','Quem lhe deu licença de mexer onde eu guardo as coisas?'],['narra','O olhar dela cai em você como uma tampa.']]}}}},
marta:{mid:{m:9,L:[]},no:{t:-1,L:[['marta','Eu só trabalho aqui, Lia. Quem decide é outra pessoa.']]},
 lev:{prog4:{m:-2,c:'prog4',t:0,L:[['lia','Foi alguém do Programa que falou do ponto pra senhora?'],['marta','Eu só repassei. Se eu não passasse, passava outra pessoa.']]},roda1:{m:-2,c:'roda3',t:0,L:[['lia','O roteiro tem a roda de sábado.'],['marta','Eu perguntei. Ele contou. Eu não obriguei.']]}}},
lucia:{mid:{m:9,L:[]},no:{t:-2,leave:true,L:[['lucia','Isso é com a coordenação.'],['narra','Ela sorri sem mostrar os dentes e vira a prancheta pro outro lado.']]},
 lev:{ray1:{m:-2,c:'prog2',t:-1,L:[['lia','O aviso na porta do Seu Raimundo. Por que a casa dele primeiro?'],['lucia','... Porque tinha menos gente cadastrada. É mais rápido.'],['lucia','Eu não devia ter dito.']]}}}};

/* ---------- objetos ---------- */
const OBJ=[
 {id:'o_aviso',loc:'rua',e:[0],x:670,y:GY+36,lab:'Examinar o aviso na porta do sobrado',c:'ray1',cost:10,L:[['narra','Um papel colado na porta: "VISTORIA. Imóvel em avaliação para o Programa de Recuperação."'],['narra','Sem assinatura. Só um carimbo.']]},
 {id:'o_aluga',loc:'rua',e:[2],x:670,y:GY+36,lab:'Olhar a placa na porta do sobrado',cost:5,L:[['narra','Uma placa de ALUGA-SE onde antes tinha o aviso. Atrás da placa, um quadrado mais claro na madeira.']]},
 {id:'o_cad',loc:'dentro',e:[0,1],x:560,y:GY+0,lab:'Folhear a caderneta do balcão',c:'ray2',cost:10,L:[['narra','Fiado de meio bairro, em letra miúda. Na página de Seu Raimundo: "sexta, sexta, sexta." Nenhuma linha riscada.']]},
 {id:'o_gav',loc:'dentro',e:[0,1,2],x:520,y:GY+0,lab:'Abrir a gaveta do balcão',cost:10,special:'gaveta',c:'vo1',L:[['narra','Embaixo dos panos de prato, um envelope: "Proposta de locação do ponto. Valor: o dobro do atual. Uso: café."']]},
 {id:'o_rot',loc:'dentro',e:[1,2],x:660,y:GY+0,lab:'Ler o roteiro impresso no balcão',c:'roda1',cost:10,need:()=>true,L:[['narra','Um roteiro de visita, dobrado: "Padaria da Dona Aurea, o pão mais antigo do centro. Roda autêntica, sábado, no largo."']]},
 {id:'o_placa',loc:'rua',e:[2],x:2060,y:GY+34,lab:'Ler a placa do palco',cost:5,L:[['narra','"Programação gratuita suspensa até nova data." Embaixo, outro papel: "Obrigado pela visita."']]},
 {id:'o_olodum',loc:'rua',e:[2],x:262,y:GY+34,lab:'Parar para ouvir os tambores',cost:5,L:[['narra','Três tambores, camisas verde, amarelo e vermelho, e um turista filmando de bem perto.'],['narra','Tambor na calçada do Pelourinho sempre teve. O que mudou é que agora tem hora marcada no roteiro.'],['narra','Quem mora aqui passa pelo lado sem diminuir o passo.']]},
 {id:'o_pintura',loc:'rua',e:[2],x:512,y:GY+34,lab:'Olhar a pintura corporal',cost:5,L:[['narra','Um pintor desenha no braço de um turista. A tinta sai no banho, a foto fica.'],['narra','Na calçada onde Seu Raimundo sentava, hoje só tem freguês de passagem.']]},
 {id:'o_varanda',loc:'rua',e:[2],x:2394,y:GY+34,lab:'Olhar a varanda azul',cost:5,L:[['narra','Um grupo de turistas aponta pra varanda de um casarão azul, de reboco descascado.'],['narra','Dizem que em 1996 um clipe internacional foi gravado ali, com o Olodum tocando na rua. Foi o ano da festa no largo.'],['narra','Quatro anos depois, a varanda virou ponto de foto. Ninguém do grupo pergunta quem mora lá embaixo.']]}];

/* ---------- eventos e conversas entre os moradores ---------- */
/* manual: Lia ouve e anota. auto: eles conversam sozinhos; se Lia estiver perto, vê e escuta. fx: o mundo muda mesmo que ela não esteja. */
const EV=[
 {id:'e0a',e:0,loc:'rua',h0:10,h1:11.4,at:[520,GY+64],actors:['raimundo','dandara'],pos:{raimundo:[470,GY+64],dandara:[552,GY+68]},lab:'Ouvir a conversa na calçada',c:[],cost:20,kn:[['raimundo','dandara'],['dandara','raimundo']],fx:()=>{addRel('raimundo','dandara',-1);addRel('dandara','raimundo',-1)},
  L:[['raimundo','Disseram no rádio que vai ter cadastro. Quem se apresentar cedo sai na frente.'],['dandara','Na frente de quê, Raimundo? Ninguém mostrou papel nenhum ainda.'],['raimundo','Eu não quero que ninguém vá atrás. Só não quero ver ninguém perder tudo.'],['dandara','Perder tudo a gente já perdeu, Raimundo. O que falta é perder o nome.']]},
 {id:'x0a',auto:1,e:0,loc:'dentro',h0:8.4,h1:9.8,at:[650,GY+30],actors:['raimundo','vo'],pos:{raimundo:[565,GY+66],vo:[650,GY-6]},kn:[['raimundo','vo'],['vo','raimundo']],
  L:[['raimundo','Dona Aurea, sexta eu acerto.'],['vo','Sexta, Raimundo. Todo mundo tem a sua sexta.'],['raimundo','A senhora nunca me cobra.'],['vo','Quem cobra perde o freguês e o vizinho.']]},
 {id:'e0b',e:0,loc:'rua',h0:13.2,h1:15.4,at:[1330,GY+76],actors:['lucia','davi'],pos:{lucia:[1290,GY+78],davi:[1370,GY+82]},lab:'Ouvir a conversa na fachada',c:['prog1'],cost:20,kn:[['davi','lucia'],['lucia','davi']],
  L:[['lucia','Quantos moram nessa rua?'],['davi','Todo mundo e mais um.'],['lucia','Isso eu preciso de número.'],['davi','Número não chama ninguém pra roda.'],['lucia','Pro relatório, o que conta é quem entra na rua. Quem fica a gente discute depois.']]},
 {id:'e0c',e:0,loc:'rua',h0:16.5,h1:17.8,at:[1950,GY+66],actors:['davi','dandara','raimundo'],pos:{davi:[1950,GY+66],dandara:[2025,GY+80],raimundo:[1880,GY+82]},lab:'Entrar na roda',cost:40,tr:{davi:1,dandara:1,raimundo:1},f:'roda91',fp:()=>{addRel('dandara','davi',1);addRel('davi','dandara',1)},kn:[['dandara','davi'],['davi','dandara']],
  L:[['narra','O tambor começa baixo. Dandara bate palma fora do tempo e ri disso. Seu Raimundo, que diz que só olha, acompanha com o pé.'],['davi','Chegou na hora, Lia! Entra aqui.'],['narra','Por uns minutos a rua inteira cabe num círculo.']]},
 {id:'x1c',auto:1,e:1,loc:'dentro',h0:8.4,h1:9.8,at:[650,GY+60],actors:['dandara','davi'],pos:{dandara:[620,GY+68],davi:[690,GY+66]},kn:[['dandara','davi'],['davi','dandara']],fx:()=>{addRel('dandara','davi',1);addRel('davi','dandara',1)},
  L:[['dandara','Davi, o palco paga, mas a roda é de quem mora.'],['davi','A roda é de quem toca, dona Dandara.'],['dandara','Então me ensina a tocar fora do tempo.'],['davi','Isso a senhora já sabe.']]},
 {id:'e1a',e:1,loc:'rua',h0:10.5,h1:11.5,at:[2000,GY+60],actors:['marta','davi'],pos:{marta:[1950,GY+64],davi:[2030,GY+66]},lab:'Ouvir a conversa perto do palco',c:['roda3'],cost:20,kn:[['marta','davi'],['davi','marta']],fx:()=>addRel('davi','marta',-1),
  L:[['marta','Davi, preciso de uma roda de verdade pro sábado. O ônibus paga.'],['davi','Roda de verdade não tem preço.'],['marta','Tem cachê.'],['davi','... Chega às cinco, que é quando o sol cai.']]},
 {id:'x1a',auto:1,e:1,loc:'rua',h0:12.8,h1:14.6,at:[1130,GY+84],actors:['dandara','marta'],pos:{dandara:[1090,GY+84],marta:[1170,GY+86]},kn:[['dandara','marta'],['marta','dandara']],
  fx:()=>{if(F.rota){addRel('dandara','marta',1);addRel('marta','dandara',1)}else{addRel('dandara','marta',-1);addRel('marta','dandara',-1)}},
  L:()=>F.rota?[['dandara','Obrigada por tirar o grupo de debaixo da minha janela.'],['marta','Foi a neta da Dona Aurea quem pediu.'],['dandara','Então eu devo a ela, não a você.'],['marta','Aceito a dívida. Pelo menos alguém me cobra algo diferente.']]
   :[['dandara','Você para o grupo debaixo da minha janela.'],['marta','Eu paro onde o roteiro manda.'],['dandara','Então muda o roteiro.'],['marta','Isso não é comigo.']]},
 {id:'x1b',auto:1,e:1,loc:'rua',h0:13.8,h1:15.6,at:[1170,GY+82],actors:['lucia','davi'],pos:{lucia:[1130,GY+80],davi:[1215,GY+84]},kn:[['davi','lucia'],['lucia','davi']],
  fx:()=>{addRel('davi','lucia',-1);if(F.mostrouRoda){addTr('davi',-2);F.daviSabe=true}},
  L:()=>F.mostrouRoda?[['lucia','Boa tarde. A roda de sábado é no largo, certo?'],['davi','Quem disse à senhora?'],['lucia','Uma moça daqui me mostrou. Foi muito prestativa.'],['davi','... Entendi.']]
   :[['lucia','Boa tarde. A roda de sábado é no largo, certo?'],['davi','Roda não tem endereço, moça. Tem hora.'],['lucia','Hora eu anoto.'],['davi','Anota. Só não vai achar.']]},
 {id:'e1b',e:1,loc:'dentro',h0:15,h1:16.3,at:[630,GY+34],actors:['marta','vo'],pos:{marta:[610,GY+66],vo:[650,GY-6]},lab:'Ouvir a conversa no balcão',c:['vo2','prog4'],cost:20,kn:[['marta','vo'],['vo','marta']],fx:()=>addRel('vo','marta',-1),
  L:[['marta','Dona Aurea, pagam o dobro pelo ponto como café.'],['vo','Eu penso.'],['marta','Pensa rápido. A rua não espera.'],['vo','A rua esperou duzentos anos. Espera uma semana.']]},
 {id:'e2a',e:2,loc:'dentro',h0:10.6,h1:12.2,at:[640,GY+34],actors:['dandara','marta'],pos:{dandara:[590,GY+66],marta:[690,GY+68]},lab:'Ouvir a conversa no balcão',cost:20,kn:[['dandara','marta'],['marta','dandara']],
  fx:()=>{if(rel('marta','dandara')>=1&&tr('marta')>=3)F.martaSai=true},
  L:()=>(rel('marta','dandara')>=1&&tr('marta')>=3)?[['dandara','Quantos você trouxe hoje?'],['marta','Três. Eu pedi pra sair do roteiro, Dandara. Falta a assinatura.'],['dandara','E vai fazer o quê?'],['marta','Voltar pra rua de baixo e ver o que sobrou. Perguntar antes de levar alguém.']]
   :[['dandara','Quantos você trouxe hoje?'],['marta','Três. Ontem foram sete.'],['dandara','Eles não ficam pra ver nada.'],['marta','Eu sei. E eu continuo levando.']]},
 {id:'x2a',auto:1,e:2,loc:'rua',h0:12.8,h1:14.4,at:[2050,GY+62],actors:['marta','davi'],pos:{marta:[2010,GY+64],davi:[2090,GY+66]},kn:[['marta','davi'],['davi','marta']],
  fx:()=>{if(F.rota&&rel('marta','dandara')>=0)addRel('davi','marta',1);else addRel('davi','marta',-1)},
  L:()=>(F.rota&&rel('marta','dandara')>=0)?[['marta','Davi, hoje o grupo é pequeno. Toca pra eles de perto.'],['davi','De perto eu toco.'],['marta','Sem palco, sem cachê. Só eles e o tambor.'],['davi','Então não é programação. É roda.']]
   :[['marta','O Programa suspendeu o palco, Davi. Eu só trago o recado.'],['davi','Sempre tem alguém que só traz o recado.'],['marta','Eu sei como soa.'],['davi','Sabe. Só não muda.']]},
 {id:'e2b',e:2,loc:'rua',h0:15.6,h1:17.6,at:[702,GY+68],actors:['raimundo','dandara'],pos:{raimundo:[664,GY+70],dandara:[742,GY+74]},lab:'Ouvir a conversa em frente ao sobrado',cost:20,kn:[['raimundo','dandara'],['dandara','raimundo']],
  L:()=>F.mediou?[['raimundo','Eu devia ter esperado.'],['dandara','Devia. Mas agora a gente espera junto.'],['raimundo','A casa ainda está lá.'],['dandara','Está. E a gente também, um pouco.']]
   :[['raimundo','Eu devia ter esperado.'],['dandara','Todo mundo devia ter esperado, Raimundo. Ninguém esperou.'],['raimundo','A casa ainda está lá.'],['dandara','A casa está. A gente não.']]},
 {id:'e2c',e:2,loc:'rua',h0:17,h1:18.9,at:[1990,GY+66],actors:['davi','dandara'],pos:{davi:[1960,GY+66],dandara:[2030,GY+72]},lab:'Entrar na roda dos moradores',cost:40,tr:{davi:1,dandara:2},f:'rodaViva',
  cond:()=>rel('dandara','davi')>=2&&!(F.mostrouRoda&&rel('davi','marta')<=-1),kn:[['dandara','davi'],['davi','dandara']],
  L:[['narra','Sem palco e sem roteiro, a roda volta a ser uma conversa entre quem mora. Quatro pessoas e um tambor.'],['davi','Isso aqui ninguém pôs no roteiro.'],['dandara','E por isso ainda é nosso.'],['narra','Os turistas já foram. Dá pra ouvir o couro do tambor batendo na pedra do largo.']]}];

/* ---------- falas soltas ---------- */
const BARKS={
 raimundo:[['Bom dia, vizinha!','Esse pão tem cheiro de domingo.','Cuidado com a calha, menina.','Quem fecha a porta cedo perde a conversa.','Fiado até sexta, e sexta eu pago.','A ladeira cansa mais a cada ano.'],['O ônibus demora, mas eu volto.','Essas cores não eram assim.','Pintaram a minha rua e esqueceram de mim.','Todo dia passa um grupo com máquina.','Tinta nova, o mesmo rachado por dentro.','Quem mora lá longe acorda antes do pão.'],['Procuro minha cadeira.','Alguém aí lembra do meu nome?','A janela do sobrado ficou sem cortina.','O largo tem mesa e não tem conversa.','Já não sei quem é vizinho.','Meu degrau agora tem placa.']],
 dandara:[['A minha mãe mandou lembranças.','Tem reunião quinta, aparece.','Você viu quem passou de colete?','Quem não aparece na reunião vira assunto.','A rua inteira sabe e ninguém fala.','Terça é dia de lista.'],['Segura a porta, por favor.','Papel de novo, papel de novo.','Leia tudo antes de assinar.','Perguntaram meu nome e meu CPF, nessa ordem.','Hoje a fila foi de gente nova.','Cadastro, formulário, protocolo.'],['Ainda moro aqui, viu?','Dá pra sentir a rua respirando.','Meu vizinho de frente mudou na terça.','Quem fica também faz conta.','A associação ainda tem sala, e pouca gente.','Eu conto os que ficaram, de cabeça.']],
 davi:[['Hoje tem roda!','Um dois três, um dois três.','Tambor afinado, rua afinada.','Quem passa, para. Quem para, fica.','Se faltar um, a roda desafina.','O largo hoje está bonito de ouvir.'],['Cachê não paga saudade.','Palco às onze, chega cedo.','Tem hora marcada pra tocar agora.','No palco não pode improvisar.','O som é igual, a plateia é que muda.','A roda de antes tinha lugar pra todo mundo.'],['Alguém quer ouvir tambor?','Hoje o ônibus nem veio.','Toca ou não toca, a rua escuta.','Me pedem foto, ninguém pede o ritmo.','Palco vazio também ressoa.','Hoje toquei pra quem passou de lado.']],
 vo:[['Fica de olho no forno, Lia.','Cuidado, tá quente.','Pão bom não tem pressa.','Anota na caderneta, que eu não esqueço.','Quem chega cedo leva o primeiro.','Hoje a massa subiu bonita.'],['A massa pede paciência.','Quem diria, letreiro novo.','Não se afobe, Lia. Um de cada vez.','O balcão enche e esvazia como maré.','Anota, pega, entrega.','Esse povo de ônibus pergunta tudo e leva pouco.'],['Hoje ninguém quis pão.','Eu faço do mesmo jeito.','O forno é o mesmo, o nome na porta não.','Se a gente parar, a rua nota.','Eu ainda acordo às quatro.','Gente nova não sabe de onde vem o cheiro.']],
 marta:[[],['Pessoal, olha a fachada!','Esse é o casarão mais fotografado.','Quinze minutos aqui, depois o largo.','Quem quiser foto, é agora.','Isso aqui já foi sobrado de morador.','Atenção com os degraus.'],['Hoje foi curto.','Vem mais gente amanhã, vem.','O roteiro encurtou de novo.','Perguntaram onde mora o povo daqui.','Eu falo da história e eles pedem o cardápio.','Preciso de um roteiro mais honesto.']],
 lucia:[['Mais três fachadas.','Por favor, não encoste na parede.','Altura confirmada.','Anotado: reboco comprometido.','Mais uma medição e eu saio.'],['Dentro do prazo.','Segunda etapa, quarteirão três.','A lista tem mais nomes que ontem.','O cadastro é rápido, mas é pra hoje.','Preciso de uma assinatura.']]};
const TBARKS=[[ 'Que cheiro bom!','Posso tirar uma foto?'],['Quanto é o café?','Dá pra pagar com cartão?','Qual é a rua mais antiga?'],['Cadê o povo?','Parece cenário.','Bonito, mas tá vazio.']];
const IDLE={raimundo:'O senhor olha pro lado e muda de assunto.',dandara:'Ela balança a cabeça: por hoje, já falou o que podia.',davi:'Ele dá de ombros e volta a batucar no joelho.',vo:'A vó sorri sem responder e mexe na massa.',marta:'Ela confere o relógio e o roteiro.',lucia:'Ela anota algo na prancheta e sorri educadamente.'};

/* ---------- fechamentos ---------- */
function rumo(){let s=1;if(F.martaCardapio)s++;if(F.voPressionada)s++;if(F.rompida)s++;if(F.mostrouRoda)s++;if(F.aceita)s+=2;if(F.recusa)s-=2;if(tr('vo')>=3)s--;if(tr('dandara')>=3)s--;if(F.voSabeProg)s--;if(F.cartaz)s--;if(F.mediou)s--;if(rel('vo','dandara')>=2)s--;if(rel('vo','marta')<=-1)s--;if(F.lVo==='pres')s++;if(F.lVo==='ouve')s--;if(F.assemb==='acordo')s++;if(F.assemb==='prazo')s--;if(F.inc==='fogo')s--;if(F.incRes==='mediacao')s--;if(F.incRes==='rigido')s++;return s}
function decide1(){const s=rumo();return s>=2?'cafe':(s<=0?'padaria':'meio')}
function decide2(){let s=rumo()+(F.rumo1==='cafe'?1:0)-(F.rumo1==='padaria'?1:0);return s>=3?'LEMBRANÇAS':s>=1?'CAFÉ PELÔ':s===0?'PADARIA & CAFÉ':'PADARIA'}
function questEcho(era){const L=[];
 if(era===1&&F.q0c)L.push(['vo','A mesa do Zé foi para dentro de casa. Ele diz que não aguenta o barulho da barraca. Eu acho que não aguenta o silêncio da calçada.']);
 if(era===2&&F.q0c==='mesa')L.push(['vo','A mesa do Seu Zé foi parar no quintal do Nego. A calçada de pedra nova não aceita pé de cadeira, disseram. Eles jogam do mesmo jeito.']);
 if(era===2&&F.q0c==='lata')L.push(['vo','A caixinha continuou, mas virou lata de cada um. O Zé diz que isso é poupança. Eu chamo de saudade com saldo.']);
 if(era===0){if(F.q0b==='dan')L.push(['vo','Disseram que você ficou do lado da Dandara no largo. Notícia anda mais rápido que pão.']);else if(F.q0b==='pergunta')L.push(['vo','Perguntou à moça da prancheta o que ela quer com o largo? Eu queria ter tido essa coragem.']);else if(F.q0b==='ouviu')L.push(['vo','Você ficou só ouvindo no largo. Ouvir também é jeito de tomar partido, só que sem avisar.']);
  if(F.q0a==='silencio')L.push(['vo','O Raimundo contou que você tomou café com ele sem perguntar nada. Ficou agradecido.']);else if(F.q0a)L.push(['vo','Você viu o papel na porta do Raimundo. Eu também vi. Todo mundo viu e ninguém comentou.']);
  if(F.miss_q0a)L.push(['vo','A sacola do Raimundo ficou aqui no balcão. Amanhã ele pergunta por ela, e por quem não levou.'])}
 else if(era===1){if(F.assemb==='prazo')L.push(['vo','Pediu o texto inteiro e prazo na assembleia. A Dandara veio agradecer. Eu fingi que não sabia de nada.']);else if(F.assemb==='acordo')L.push(['vo','Disseram que você defendeu a reforma na assembleia. Eu entendo o argumento. Fiquei calada.']);else if(F.assemb==='junto')L.push(['vo','Disse que a padaria não decide sozinha. Foi bonito de ouvir. Agora a rua espera que eu decida junto, e isso dá trabalho.']);else if(F.assemb==='calada')L.push(['vo','Você não abriu a boca na assembleia, mas reparou em quem estava na última fila. Isso eu conheço.']);
  if(F.miss_q1a)L.push(['vo','A assembleia aconteceu sem a nossa cadeira. A Dandara reparou.'])}
 else{if(F.cadeira)L.push(['vo','A cadeira do Raimundo continua ali, ao lado do forno. Hoje eu varri em volta dela.']);if(F.rodaPorta)L.push(['vo','O Davi tocou aqui na porta. Cheiro de pão misturado com tambor. Foi o melhor momento do dia.'])}
 return L}
function closing(era){
 if(era===0){const A=[['vo','Lia, vem cá. Fecha a porta e senta um pouco.'],...questEcho(0)];
  if(F.voPressionada)A.push(['vo','Hoje você me cobrou o que eu não queria contar.'],['lia','Desculpa, vó.'],['vo','Eu sei que foi por cuidado. Mesmo assim, aprende a bater antes de abrir.']);
  else if(tr('vo')>=3)A.push(['vo','Hoje você ficou do meu lado o dia todo. Eu reparei.']);
  else A.push(['vo','Hoje foi dia de pão e de gente. Do jeito que a rua gosta.']);
  A.push(['vo','Dizem que vem reforma por aí. Dizem muita coisa.'],{ch:[{t:'A senhora está com medo, vó?',f:'perguntouMedo',r:[['vo','Medo eu tenho desde que me entendo. O difícil é escolher de quê.']]},{t:'A gente fica junto, seja o que vier.',f:'juntos',r:[['vo','Juntas, então. Embora junto também tenha prazo.']]}]});return A}
 if(era===1){const d=decide1();F.rumo1=d;const A=[...questEcho(1),['vo','Respondi hoje à proposta.']];
  if(d==='cafe')A.push(['vo','Aceitei. Vão pintar o balcão e trocar o letreiro. O forno fica, por enquanto.']);
  else if(d==='padaria')A.push(['vo','Recusei. Disse que o ponto é padaria. A moça sorriu e anotou, como quem anota uma data.']);
  else A.push(['vo','Fiz um acordo. Padaria de manhã, café da tarde em diante. Metade de cada um, metade de nenhum.']);
  if(F.recusa&&d!=='padaria')A.push(['lia','Eu disse pra recusar, vó.'],['vo','Disse. E eu ouvi. Só que quem paga o aluguel não é quem opina.']);
  if(F.aceita&&d==='padaria')A.push(['lia','Achei que a senhora ia aceitar.'],['vo','Eu também achei. Fiquei na porta e não consegui.']);
  A.push({ch:[{t:'Eu queria ter sido ouvida.',f:'queriaOuvida',r:[['vo','Foi ouvida. Só que a decisão tem um dono só, e esse dono tem sessenta anos de massa nas mãos.']]},{t:'Foi sua escolha, vó. Eu fico com a senhora.',f:'fica',r:[['vo','Então fica. Amanhã tem pão.']]}]});return A}
 const f=S.sign;const A=[['vo','Uma vida inteira de forno. Hoje o pão é o que menos vende.'],['lia','A gente continua fazendo.'],['vo','A gente continua porque alguém ainda aparece.']];
 if(f==='LEMBRANÇAS')A.splice(1,2,['vo','O balcão agora vende ímã com a fachada da casa onde eu moro.'],['lia','A senhora ainda faz pão?'],['vo','Faço. Pra mim e pra quem pedir baixinho.']);
 A.push(...questEcho(2));A.push({ch:[{t:'Acende o forno amanhã também.',f:'amanha',r:[['vo','Acende. Enquanto tiver cheiro de pão, a rua lembra de quem ela era.']]},{t:'Fica comigo um pouco na porta.',f:'largo',r:[['vo','Vamos. Sentar na porta ainda é de graça.']]}]});A.push(...epilogo2());return A}

/* ---------- o que cada pessoa oferece ---------- */
/* ouvir/perguntar/ajudar: o que existe para essa pessoa. pressionar: 'mostrar' (só com pista na mão) ou 'ambos' (também cobrar uma resposta depois de ela se esquivar). */
const VERBS={vo:{ouvir:1,perguntar:1,ajudar:1,pressionar:'mostrar'},raimundo:{ouvir:1,perguntar:1,ajudar:1,pressionar:'ambos'},dandara:{ouvir:1,perguntar:1,ajudar:1,pressionar:'ambos'},
 davi:{ouvir:1,perguntar:1,ajudar:1,pressionar:'ambos'},marta:{ouvir:1,perguntar:1,ajudar:1,pressionar:'mostrar'},lucia:{ouvir:0,perguntar:1,ajudar:1,pressionar:'mostrar'}};
const BASE={raimundo:['rua'],dandara:['rua'],davi:['rua'],vo:['rua'],marta:['rua'],lucia:['rua']};
/* o que a conversa, o objeto ou a cena põe no ar: assuntos que passam a poder ser perguntados */
const UNLOCK={o_aviso:['papel','casa'],o_aluga:['casa'],o_cad:['caderneta'],o_gav:['gaveta'],o_rot:['roteiro'],o_placa:['programa','roda'],
 r1:['casa'],r2:['papel'],r3:['programa'],r4:['casa'],d1:['casa'],d2:['programa'],d3:['papel'],v1:['roda'],v2:['casa'],v3:['programa'],a1:['ponto'],a2:['ponto','casa'],a3:['ponto'],m1:['roteiro'],m2:['casa'],l2:['programa'],
 e0a:['papel'],e0b:['programa'],e0c:['roda'],e1a:['roda','roteiro'],e1b:['ponto','programa'],e2a:['programa'],e2b:['casa'],x0a:['caderneta'],x1b:['roda'],x1a:['roteiro']};
/* o que cada um pensa dos outros: [quando está tenso, quando é neutro, quando é próximo] */
const OPIN={
raimundo:{dandara:['Ela me olha como quem lê uma conta. Está certa.','Dandara é teimosa. Teimosia também é um jeito de cuidar.','Dandara me perdoa mais do que eu mereço.'],
 vo:['Sua avó me trata como visita. Isso dói mais que cobrança.','Aurea me alimenta e não cobra. Isso também é um poder.','Sua avó é a única que nunca me perguntou por que eu assinei.']},
dandara:{raimundo:['O medo dele virou problema meu. Eu entendo e não perdoo.','Raimundo é gente boa com medo. Dá pra ser as duas coisas.','Raimundo errou e sabe. A gente se fala.'],
 vo:['Sua avó está se afastando da rua. Dá pra ver pelo balcão.','Aurea é vizinha. Cada uma com a sua conta.','Aurea é das poucas que ainda escuta a gente.'],
 marta:['Marta leva gente pra olhar a minha janela e chama isso de trabalho.','Marta é educada demais pra ser inocente.','Marta ouviu. Foi mais do que eu esperava.']},
davi:{marta:['Marta pergunta como quem já decidiu o que vai escrever.','Marta é correta. Só não sabe pra quem trabalha.','Marta pelo menos escuta o tambor.'],
 dandara:['Dandara acha que eu me vendi pro palco. Em parte, vendi.','Dandara é firme. Bom ter alguém assim por perto.','Dandara bate palma fora do tempo e ainda assim é a melhor da roda.']},
vo:{raimundo:['Raimundo me evita. Eu não quis que fosse assim.','Raimundo é freguês e é vizinho. Os dois pesam.','Raimundo é de casa. Fiado não é favor, é costume.'],
 marta:['Marta traz recado de gente que nunca aparece.','Marta é moça trabalhadeira. Só não gosto do que ela carrega.','Marta me ajuda a entender o que vem lá de fora.'],
 dandara:['Dandara anda impaciente comigo. Ela tem razão em parte.','Dandara é firmeza. Só às vezes pesa.','Dandara é a que fica. Eu me apoio nela mais do que digo.']},
marta:{davi:['Davi me olha como quem pagou caro por ter me contado.','Davi é bom de tambor e de silêncio.','Davi me deixa chegar perto. Não é pouco.'],
 dandara:['Dandara me trata como parte do problema. E eu sou.','Dandara é dura. Eu aprendo com ela, mesmo quando dói.','Dandara conversa comigo agora. Isso muda o que eu levo pro grupo.'],
 vo:['A Dona Aurea desconfia de mim. Faz sentido.','Dona Aurea é gente de respeito. Pesa mais do que o roteiro.','Dona Aurea me ouve. Raramente alguém me ouve.']},
lucia:{marta:['A guia complica o que eu preciso simples.','A guia entrega o que o Programa pede.','A guia é parceira. Ela vê a rua por dentro.']}};
/* correntes: o que acontece entre um dia e outro por causa do que foi feito (e do que os outros fizeram sem você) */
const CHAIN=[
 {e:[1],if:()=>F.rompida,do:()=>{S.ov.raimundo=[[7,'offL'],[10.8,'sobrado'],[12,'offL']]},news:'Seu Raimundo deixou de passar na padaria. Dizem que foi por uma conversa torta.'},
 {e:[1,2],if:()=>rel('dandara','raimundo')<=-1&&!F.mediou&&S.evDone.e0a,do:()=>{},news:'Dandara muda de calçada quando vê Seu Raimundo, e ele finge que não nota.',kn:[['dandara','raimundo']]},
 {e:[2],if:()=>(F.aceita||S.sign!=='PADARIA')&&rel('dandara','vo')<=1,do:()=>{addRel('dandara','vo',-1);S.ov.dandara=[[7,'casaDan'],[9.5,'calcada'],[10.6,'casaDan'],[14.5,'largo'],[17.5,'casaDan']]},news:'Dandara não entrou mais na padaria depois que o letreiro mudou.',kn:[['dandara','vo']]},
 {e:[2],if:()=>F.cartaz&&!F.rota,do:()=>{addRel('marta','dandara',-1);S.ov.marta=[[7,'offR'],[10.3,'onibus'],[10.9,'palco'],[12.8,'palco'],[14.5,'largo'],[16.3,'offR']]},news:'Marta passou a dar a volta pela praça, longe do cartaz da vitrine.',kn:[['marta','dandara']]},
 {e:[2],if:()=>F.mostrouRoda&&rel('davi','marta')<=-1,do:()=>{addRel('davi','lucia',-1);S.ov.davi=[[8,'offL']]},news:'O Davi não apareceu mais no largo. Dizem que alguém contou à moça da prancheta onde era a roda.',kn:[['davi','lucia']]},
 {e:[2],if:()=>F.mediou,do:()=>{S.ov.dandara=[[7,'casaDan'],[9.5,'balcao'],[10.3,'casaDan'],[14.5,'largo'],[15.6,'degrau'],[17.5,'casaDan']]},news:'Seu Raimundo e Dandara foram vistos sentados juntos no degrau.',kn:[['dandara','raimundo'],['raimundo','dandara']]},
 {e:[2],if:()=>(F.lRai==='cad'||F.lRai==='pres')&&!F.lRaiNo,do:()=>{S.ov.raimundo=[[7,'offL'],[16,'sobrado'],[17,'offL']]},news:'Seu Raimundo assinou o cadastro. O sobrado dele agora tem tapume na janela.'},
 {e:[2],if:()=>F.lDan==='pres',do:()=>{addRel('dandara','lucia',-1)},news:'Dandara levou a ameaça por escrito à associação. A moça da prancheta passou a vir acompanhada.',kn:[['dandara','lucia']]},
 {e:[2],if:()=>F.lDan==='ouve',do:()=>{addTr('dandara',1)},news:'A associação entregou ao Programa uma lista de três pedidos. Ninguém respondeu ainda.'},
 {e:[2],if:()=>F.lDavi==='cult',do:()=>{},news:'Davi agora toca no palco da programação oficial, em horário marcado. A roda do largo anda sem ele.'},
 {e:[2],if:()=>F.lDavi==='pres',do:()=>{S.ov.davi=[[8,'offL'],[16.5,'largo'],[18,'palco']]},news:'Davi quase não toca mais no largo. Diz que prefere tocar onde ninguém pergunta.'},
 {e:[2],if:()=>F.lVo==='pres',do:()=>{addTr('vo',-1)},news:'Depois da visita da moça da prancheta, a vó fala baixo sempre que o assunto é a vistoria do forno.'},
 {e:[2],if:()=>F.lRaiNo&&F.lRai==='pres',do:()=>{addTr('raimundo',-1)},news:'Seu Raimundo recusou assinar depois do aviso de prazo. Duas vizinhas contam que o viram no degrau a tarde inteira.'},
 {e:[2],if:()=>F.lDanGrava,do:()=>{addRel('dandara','lucia',-1)},news:'A associação guardou em fita a conversa com a moça da prancheta. Dizem que a fita já foi ouvida duas vezes em reunião.',kn:[['dandara','lucia']]},
 {e:[2],if:()=>F.lDaviAlto,do:()=>{addTr('davi',1)},news:'O ensaio aberto do Davi, depois do aviso da fiscalização, juntou mais gente no largo do que o palco oficial.'},
 {e:[2],if:()=>F.inc==='fogo',do:()=>{S.ov.davi=[[7,'palco'],[12,'largo'],[16.5,'palco']]},news:'O palco do largo foi incendiado numa noite de 1996. A programação oficial foi suspensa e, quatro anos depois, um fiscal ainda fica na praça.'},
 {e:[2],if:()=>F.incRes==='pm',do:()=>{S.ov.davi=[[10,'offL'],[16,'largo']]},news:'Em 1996, Davi passou uma noite na delegacia depois da confusão no largo. Voltou calado.'},
 {e:[2],if:()=>F.incRes==='mediacao',do:()=>{addTr('dandara',1)},news:'Desde 1996, o Programa mantém em quinze dias o prazo de leitura do contrato. A associação tem uma cópia do texto inteiro.'},
 {e:[2],if:()=>F.incRes==='lista',do:()=>{addTr('dandara',-1)},news:'Circula entre os moradores a notícia de que o Programa guarda uma lista com os nomes de quem foi ao protesto. Ninguém confirma.'},
 {e:[2],if:()=>F.incRes==='ajuda',do:()=>{},news:'Em 1996, Lúcia voltou ao largo com a mão enfaixada. Ainda se conta que apagou fogo com os vizinhos antes de saber de que lado estava.'},
 {e:[2],if:()=>F.incRes==='fuga',do:()=>{},news:'Dizem que Lúcia foi vista no carro enquanto o palco queimava. Ela não voltou ao largo.'},
 {e:[2],if:()=>F.incRes==='dialogo',do:()=>{addTr('dandara',1)},news:'Em 1996, a associação entregou ao Programa os três pedidos por escrito, depois de uma conversa no banco do largo.'},
 {e:[2],if:()=>F.pol==='bateu',do:()=>{addTr('dandara',F.polGrito?0:-1);if(F.incRes!=='pm')S.ov.davi=[[10,'offL'],[16,'largo']]},news:'Em 1996, a Polícia Militar entrou no largo e bateu em quem estava no protesto. Dandara ficou com o braço imobilizado. Davi passou a noite detido.'},
 {e:[2],if:()=>F.polGrito,do:()=>{addTr('dandara',1)},news:'Dizem que a moça do Programa gritou para a polícia parar. Ouvida, não foi.'},
 {e:[2],if:()=>F.polLiga,do:()=>{},news:'Circula entre os moradores que alguém do Programa ligou para a Coordenação no meio da confusão. Ninguém sabe quem atendeu.'},
 {e:[2],if:()=>F.polOlhou,do:()=>{addTr('dandara',-1)},news:'Dizem que a moça da prancheta ficou parada no largo, olhando, com a prancheta no peito.'},
 {e:[2],if:()=>F.pol==='recuou',do:()=>{addTr('dandara',1)},news:'Em 1996, no largo, a polícia chegou e ficou parada. Dizem que o oficial perguntou quem estava responsável pela leitura.'}];
/* destinos: só aparecem se Lia chegou perto o bastante de cada um para saber */
function fates(){const L=[];const t=id=>tr(id);
 L.push(['Seu Raimundo',F.lRai==='pres'?'Seu Raimundo assinou o cadastro com medo do prazo. A planilha do Programa contou como um acordo.':F.lRai==='cad'?'Seu Raimundo assinou o cadastro depois de ler duas vezes. A planilha só guardou a assinatura.':F.mediou?'Seu Raimundo e Dandara voltaram a se falar. A casa dele continua com a placa de ALUGA-SE.':F.rompida?'Seu Raimundo nunca mais voltou à padaria depois de ser pressionado. Lia só soube por terceiros.':has('ray3')&&t('raimundo')>=3?'Seu Raimundo contou que assinou primeiro. Ele leva isso sozinho, e Lia sabe.':t('raimundo')>=2?'Seu Raimundo ainda aparece no largo de vez em quando. Da casa, Lia sabe pouco.':'Lia não sabe o que aconteceu com Seu Raimundo.']);
 L.push(['Dandara',F.lDan==='pres'?'Dandara levou a ameaça à associação e passou a ler tudo antes de assinar, com testemunha.':F.lDan==='ouve'?'A associação de Dandara entregou três pedidos ao Programa: texto inteiro, prazo para ler e endereço perto.':F.rompida&&t('dandara')<1?'Dandara parou de falar com Lia. Resiste do mesmo jeito, sem testemunha.':F.rodaViva?'Dandara e Davi mantiveram a roda dos moradores, sem palco e sem roteiro.':F.cartaz&&t('dandara')>=3?'O cartaz da associação ficou na vitrine até a vitrine mudar de dono.':has('dan2')?'Dandara guardou o formulário preenchido pela mãe. Ninguém sabe se vai usá-lo.':t('dandara')>=2?'Dandara continua morando na rua. O que isso custa, ela não disse.':'Lia não sabe o que aconteceu com Dandara.']);
 L.push(['Davi',F.lDavi==='cult'?'Davi passou a tocar no palco oficial, em horário marcado. O cachê ajudou e a roda do largo mudou de lugar.':F.lDavi==='pres'?'Davi parou de tocar no largo depois do aviso da fiscalização.':F.rodaViva?'Davi tocou na roda dos moradores até onde a rua deixou.':F.daviSabe&&t('davi')<=0?'Davi descobriu que Lia contou da roda e não confiou mais nela.':has('roda3')&&t('davi')>=3?'Davi contou à guia onde era a roda. Ainda não sabe se se arrepende.':t('davi')>=2?'Davi seguiu tocando. O palco foi suspenso e ele continuou.':'Lia não sabe o que aconteceu com Davi.']);
 L.push(['Marta',F.martaSai?'Marta saiu do roteiro e voltou à rua de baixo para perguntar antes de levar alguém.':F.rota&&t('marta')>=2?'Marta mudou a parada do grupo para a praça. Ainda leva gente, mas não para na janela.':has('prog3')?'Marta cresceu na rua de baixo e hoje a mostra por R$ por cabeça. Sabe disso.':'Lia não sabe o que aconteceu com Marta.']);
 L.push(['Lúcia, do Programa',F.lVo==='pres'?'Lúcia falou em interditar o forno da vó e saiu com a assinatura. A planilha não tem coluna para o que Lia viu.':has('prog2')?'Lúcia ainda mede fachadas. A vistoria segue começando pelos casarões com menos moradores.':F.mostrouRoda?'Lúcia anotou a roda na programação cultural do relatório.':'Lia não sabe o que a conta de Lúcia deu.']);
 if(F.incRes==='pm')L[2][1]='Em 1996, Davi passou uma noite na delegacia depois da confusão no largo. Desde então toca sem microfone e sem palco.';
 if(F.incRes==='mediacao')L[1][1]='Dandara conseguiu quinze dias para ler o contrato e uma cópia do texto inteiro. A associação passou a ler tudo em voz alta, na calçada.';
 if(F.lDanGrava&&F.incRes!=='mediacao')L[1][1]+=' A fita da conversa com a moça da prancheta ficou guardada na pasta.';
 if(F.pol==='bateu'){L[1][1]+=' O braço dela ficou marcado desde 1996, quando a polícia entrou no largo.';if(F.incRes!=='pm'&&F.incRes!=='mediacao')L[2][1]='Em 1996, Davi passou uma noite detido depois que a polícia entrou no largo. Desde então toca sem palco e sem microfone.'}
 if(F.rodaPorta)L[2][1]=F.incRes==='pm'?'Davi voltou a tocar de manhã cedo na porta da padaria, sem microfone e sem palco.':'Davi passou a tocar de manhã cedo na porta da padaria, sem palco e sem hora marcada. A roda voltou a ser de quem aparece.';
 if(F.cadeira)L[0][1]+=' A cadeira de balanço dele ficou ao lado do forno, e a vó não deixa ninguém sentar nela.';
 if(F.lucia==='culpa')L[4][1]='Lúcia pediu para sair da etapa depois do largo. Nunca disse o motivo, nem à Coordenação.';
 else if(F.lucia==='medo')L[4][1]='Lúcia ficou no cargo por medo de quem viria no lugar dela. A prancheta ficou mais pesada.';
 else if(F.lucia==='conv')L[4][1]='Lúcia foi promovida a coordenar a etapa seguinte. Ainda mede fachadas, agora com equipe.';
 return L}

/* ---------- pedidos, comanda, caixa e funcionários ---------- */
const PATN=34,PATT=42;const bOff=x=>(Math.floor(x/62)%2)*46;
const atCounter=n=>n.loc==='dentro'&&Math.abs(n.x-AN.balcao[0])<330&&n.y>CT.y1;
function newOrd(item,kind,who){const m=kind==='loc'?PATN:PATT;return{item,kind,who,noted:false,num:0,pat:m,max:m,done:false,lost:false,q:QTY[kind==='loc'?'loc':'vis'][item]||1,by:null}}
const ordOpen=o=>!!o&&!o.done&&!o.lost;
const PAYS=[{raimundo:'fiado'},{},{}];
function ledNew(){return{vendas:0,fiado:0,loc:0,vis:0,lost:0,lostV:0,staff:0,vo:0}}
function ledAdd(o){const v=price(o.item)*o.q,fi=o.kind==='loc'&&(PAYS[S.era]||{})[o.who]==='fiado';if(fi)S.led.fiado+=v;else S.led.vendas+=v;if(o.kind==='loc')S.led.loc++;else S.led.vis++;if(o.by==='vo')S.led.vo++;else if(o.by)S.led.staff++;return v}
function ledLost(o){S.led.lost++;S.led.lostV+=price(o.item)*o.q}
function ledClose(){if(!S.led)S.led=ledNew();const L=S.led,e=S.era,ing=L.vendas*[.38,.42,.52][e],rent=[1.5,3,6][e],sal=e===2?S.hired*9:0;return S.hist[e]=Object.assign({},L,{ing,rent,sal,net:L.vendas-ing-rent-sal,sign:S.sign,hired:S.hired,era:e})}
function custAll(){const L=[];for(const id in S.npcs){const n=S.npcs[id];if(n.ord&&ordOpen(n.ord)&&!n.hidden&&atCounter(n))L.push({o:n.ord,n,k:'npc'})}
 for(const a of S.extras)if(a.tour&&a.ord&&ordOpen(a.ord)&&a.waiting&&a.loc==='dentro')L.push({o:a.ord,a,k:'tour'});return L}
const SLOTS=[330,395,460,525,590,655,720,785,850];
function freeSlot(me){const used=[];for(const id in S.npcs){const n=S.npcs[id];if(!n.hidden&&n.loc==='dentro'&&n.y>CT.y1-10)used.push(n.x)}
 for(const a of S.extras){if(a===me||!a.tour||!a.path)continue;const q=a.path[a.pi];if(q&&q.order&&q.set)used.push(q.x)}
 const ok=SLOTS.filter(x=>used.every(u=>Math.abs(u-x)>46));return pick(ok.length?ok:SLOTS)}
function tickOrders(dt){
 for(const id in S.npcs){const n=S.npcs[id];if(!n.ord&&!n.served&&!n.hidden&&ORDERS[S.era][id]&&atCounter(n))n.ord=newOrd(ORDERS[S.era][id],'loc',id);
  const o=n.ord;if(!ordOpen(o))continue;
  if(n.hidden||n.closed||!atCounter(n)){loseOrd(o,n,null);continue}
  if(o.by)continue;o.pat-=dt*(o.noted?.6:1)*(S.loc==='dentro'?1:.55);if(o.pat<=0)loseOrd(o,n,null)}
 for(const a of S.extras){if(!a.tour||!ordOpen(a.ord)||!a.waiting||a.loc!=='dentro')continue;const o=a.ord;if(o.by)continue;o.pat-=dt*(o.noted?.6:1);if(o.pat<=0)loseOrd(o,null,a)}}
function loseOrd(o,n,a){o.lost=true;ledLost(o);
 if(n){if(o.noted)addTr(n.id,-1);sayOn(n,deckPick('lose',['Fica pra outra hora.','Outro dia eu volto.','Ninguém me atendeu.','Deixa, eu passo depois.','Hoje não deu.']),1);toast(NMS[n.id]+(o.noted?' cansou de esperar.':' saiu sem ser atendido.'))}
 else if(a){a.waiting=false;a.wait=0;sayOn(a,deckPick('lose2',['Vou procurar outro lugar.','Demora muito aqui.','Deixa pra lá.','Será que tem outra padaria?']),1);toast('Uma visitante desistiu do pedido.')}}
const ORDSAY={pao:'Me vê pão quente.',bolo:'Uma fatia de bolo, por favor.',cafe:'Um café, por favor.',ima:'Quero um ímã com a fachada.'};
function anotar(o,who,ref){o.noted=true;o.num=++S.tn;adv(1);
 const say=(who==='raimundo'&&S.era===0)?'Pão quente. Anota na caderneta.':ORDSAY[o.item];
 sayOn(ref&&(ref.n||ref.a),say,2);
 toast('Anotado'+(S.era>=1?' #'+o.num:'')+': '+iname(o.item)+(o.q>1?' ×'+o.q:'')+'.')}
function entregar(c){const o=c.o,i=S.tray.indexOf(o.item);if(i<0)return false;S.tray.splice(i,1);o.done=true;const v=ledAdd(o),fi=c.n&&(PAYS[S.era]||{})[c.n.id]==='fiado';adv(4);
 if(c.n){const n=c.n;n.served=true;addTr(n.id,1);S.speaker=n.id;openDlg([['narra',fi?'Você entrega e anota na caderneta: '+brl(v)+'. Dinheiro, só na sexta.':'Você entrega o pedido e recebe '+brl(v)+'.'],[n.id,THANKS[n.id]]])}
 else{const a=c.a;a.served=true;a.waiting=false;sayOn(a,deckPick('thx',['Que simpática!','Delícia! Obrigada.','Que lugar bonito.','Obrigada, querida.','Que cheiro bom.']),2);toast('Entregue · '+brl(v))}
 return true}
function serveFar(n){const od=ORDERS[S.era][n.id],i=S.tray.indexOf(od);if(i<0)return;S.tray.splice(i,1);const far=n.loc==='rua';n.served=true;addTr(n.id,far?2:1);adv(10);S.speaker=n.id;openDlg([['narra',far?'Você leva até ele. O gesto vale mais do que o pão.':'Você entrega o pedido.'],[n.id,THANKS[n.id]]])}
function takeItem(ids){const j=S.tray.findIndex(x=>ids.includes(x));if(j>=0)S.tray.splice(j,1);return j>=0}
function backTray(){if(!S.tray.length)return;const id=S.tray.pop(),k=shop().st.indexOf(id);if(k>=0)S.stock[k]++;toast('Devolveu: '+iname(id)+'.')}
/* funcionários: só na época 2 */
function mkStaff(){S.staff=[];if(S.era<2)return;[['bia',420],['caio',700]].slice(0,S.hired).forEach(([id,x])=>S.staff.push({id,x,y:GY-6,dir:1,st:'idle',t:0,tgt:null,c:null,bark:null,bt:rnd(3,7)}))}
function updStaff(dt){for(const s of S.staff){
  if(s.bark){s.bark.t-=dt;if(s.bark.t<=0)s.bark=null}
  s.bt-=dt;if(s.bt<=0){s.bt=rnd(10,18);if(S.loc==='dentro'&&!s.bark&&canSpeak()){const t=deckPick('st',['Próximo!','Senha chamada.','No cartão ou dinheiro?','Já vai sair.','Mais um café saindo.']);sayOn(s,t,0)}}
  if(s.st==='idle'){const c=custAll().find(c=>c.k==='tour'&&!c.o.by);if(c){s.tgt=c.o;s.c=c;c.o.by=s.id;s.st='go'}continue}
  const o=s.tgt;if(!ordOpen(o)){s.st='idle';s.tgt=null;continue}
  const cx=clamp(s.c.a.x,330,860),d=cx-s.x;if(d)s.dir=d>0?1:-1;
  if(s.st==='go'){if(Math.abs(d)>8)s.x+=Math.sign(d)*Math.min(Math.abs(d),140*dt);else{s.st='note';s.t=1.2}}
  else if(s.st==='note'){s.t-=dt;if(s.t<=0){if(!o.noted){o.noted=true;o.num=++S.tn}s.st='make';s.t=rnd(3.6,5.2)}}
  else if(s.st==='make'){s.t-=dt;if(s.t<=0){o.done=true;ledAdd(o);const a=s.c.a;a.served=true;a.waiting=false;sayOn(a,deckPick('thx',['Obrigada!','Que cheiro bom!','Delícia.','Perfeito, obrigada.']),1);s.st='idle';s.tgt=null}}}}
function caixaCard(next){const R=ledClose(),e=S.era,P=S.hist[e-1];
 const row=(a,b,cl)=>`<div class="cxr${cl?' '+cl:''}"><span>${a}</span><b>${b}</b></div>`;
 const rows=[row('Vendas no balcão',brl(R.vendas))];
 if(R.fiado>0)rows.push(row('Anotado na caderneta (ainda não entrou)',brl(R.fiado),'dim'));
 rows.push(row('Ingredientes','− '+brl(R.ing)),row('Aluguel do ponto','− '+brl(R.rent)));
 if(R.sal>0)rows.push(row('Funcionários ('+R.hired+')','− '+brl(R.sal)));
 rows.push(row('Sobrou no dia',brl(R.net),'tot'));
 const gente=`Gente do bairro atendida: <b>${R.loc}</b> · Visitantes: <b>${R.vis}</b>${R.staff?' (funcionários atenderam '+R.staff+')':''}${R.vo?' · A vó atendeu enquanto você estava fora: <b>'+R.vo+'</b>':''} · Desistiram: <b>${R.lost}</b>${R.lost?' ('+brl(R.lostV)+' perdidos)':''}`;
 let cmp='';if(P)cmp=`<p class="cxc">Dia anterior (${ERAS[e-1].year}): vendas ${brl(P.vendas)}, sobra ${brl(P.net)}, gente do bairro ${P.loc}, visitantes ${P.vis}.</p>`
 let tx;
 if(e===0)tx=R.fiado>0?'O fiado não entra no caixa, mas é o que segura a rua.':'Aqui o balcão vive de gente do bairro.';
 else if(e===1)tx=R.vis>R.loc?'O balcão enche de gente de passagem. Quem mora aqui já é minoria na fila.':R.vis>0?'Chegam visitantes, e a vizinhança ainda aparece no balcão.':'Hoje o balcão ficou parado.';
 else tx=(P&&R.vendas>P.vendas?'Passa mais dinheiro pelo balcão que no dia anterior.':'O movimento do dia anterior não se repetiu.')+(P&&R.loc<P.loc?' Há menos gente do bairro na fila.':'')+(R.sal>0?' Parte do que entra já vai para a folha de pagamento.':'');
 showCard(`<div class="cin cx"><h2>Caixa do dia</h2><div class="cxp">${rows.join('')}</div><p class="cxg">${gente}</p>${cmp}<p class="cxc">${tx}</p><p class="note">Preços, aluguel e salários são fictícios. Servem para mostrar a diferença entre as épocas.</p></div>`,'Fechar o caixa',next)}

/* ---------- momentos narrativos ---------- */
WHO.radio=WHO.radio||{n:'Rádio',c:YEL,t:OUT};
const INTRO={
 raimundo:[[['narra','Seu Raimundo tem 68 anos e mora no sobrado ao lado há quarenta. Compra pão quente e paga na sexta. Sempre na sexta.']],
  [['narra','O sobrado de Seu Raimundo ganhou um papel colado na porta. Desde então ele fala baixo e demora menos no balcão.']],
  [['narra','Seu Raimundo aparece pouco. Agora o pão custa mais do que ele costuma guardar no bolso.']]],
 dandara:[[['narra','Dandara tem 34 anos. Cuida da mãe e da associação de moradores. Aprendeu a escrever ata com uma freira.']],
  [['narra','Dandara anda com uma pasta de papéis. A associação virou o que ela faz entre um turno e outro.']],
  [['narra','Dandara continua morando na rua, mesmo depois que metade dos vizinhos saiu.']]],
 davi:[[['narra','Davi é tamboreiro da roda do largo. Toca desde menino e nunca cobrou de ninguém.']],
  [['narra','Davi agora também toca no palco da programação oficial. O cachê ajuda e a roda sente falta.']],
  [['narra','Com o palco suspenso, Davi toca onde dá.']]],
 marta:[null,[['narra','Marta é guia de turismo. Cresceu na rua de baixo e hoje mostra a rua por roteiro.']],
  [['narra','Marta leva grupos menores e mais curtos. Já não sabe bem a quem responde.']]],
 lucia:[[['narra','Lúcia trabalha para o Programa. Mede fachadas com trena e prancheta.']],
  [['narra','Lúcia agora vem com lista de imóveis e prazos. O balcão virou ponto de parada.']],
  [['narra','Lúcia ainda mede fachadas. Agora a conta é de quantas já foram pintadas.']]]};
const NARR=[
 [{id:'r',h:9.2,loc:'dentro',radio:1,L:[['narra','O rádio do balcão chia entre uma música e outra.'],['radio','O governo do Estado anuncia o Programa de Recuperação do Centro Histórico. As obras começam em 1992, pelos quarteirões mais degradados do Maciel, do Passo e do Carmo, perto do Largo do Pelourinho.'],['narra','A vó baixa o volume e volta para a massa.']]},
  {id:'v',h:10.6,L:()=>[['narra',S.loc==='dentro'?'Pela janela, Lia vê uma mulher de colete medir a fachada do sobrado com uma trena.':'Na calçada, uma mulher de colete mede a fachada do sobrado com uma trena.'],['narra','Nenhum vizinho foi avisado.']]}],
 [{id:'b',h:8.6,L:[['narra','O ônibus de turismo encosta no largo. Em poucos minutos o balcão vai encher.'],['narra','Quem não for anotado logo, desiste. Anotar acalma, mesmo que o pedido demore.']]},
  {id:'r',h:11.2,loc:'dentro',radio:1,L:[['radio','O Pelourinho Dia & Noite segue com shows de graça no largo. O Estado garante limpeza, luz nova e fachada pintada.'],['narra','Até 1999, o Programa reformaria cerca de 600 imóveis. Cerca de 1.900 famílias seriam removidas e indenizadas. Quem saiu não está no balcão para comentar.']]},
  {id:'s',h:13.4,loc:'dentro',L:[['narra','Uma pesquisa de 1996, na semana depois do Carnaval, contou quem frequentava o Centro. Só 16% eram turistas. A maioria, 61%, vinha de outros bairros de Salvador.'],['narra','O balcão cheio de visitantes é a imagem que a vitrine quer. O número real é outro.']]}],
 [{id:'b',h:10.1,L:[['narra','O ônibus chegou. Fila de senhas, câmera na mão, pergunta de preço.']]},
  {id:'r',h:11.6,loc:'dentro',radio:1,L:[['radio','A sétima etapa do Programa prevê reformar mais 130 imóveis no Saldanha. Das 1.674 famílias cadastradas, a maioria será indenizada ou levada para Coutos, bairro distante do Centro Histórico.'],['narra','Na lousa, o preço do café é o primeiro número que o visitante lê.']]}]];
function updNarr(){if(S.scene!=='play'||S.trans||S.closing||S.mode==='vist')return;const h=S.min/60;
 for(const id in S.npcs){const n=S.npcs[id],k=S.era+id;if(S.intro[k]||n.hidden||n.loc!==S.loc)continue;const L0=(INTRO[id]||[])[S.era],L=L0&&lines2(L0);if(!L){S.intro[k]=1;continue}
  if(Math.abs(n.x-S.px)<250&&Math.abs(n.y-S.py)<120){S.intro[k]=1;S.speaker=null;openDlg(L);return}}
 for(const b of NARR[S.era]||[]){const k=S.era+b.id;if(S.beat[k]||h<b.h)continue;if(b.loc&&b.loc!==S.loc)continue;S.beat[k]=1;if(b.if&&!b.if())continue;if(b.radio)S.radioT=9;S.speaker=null;openDlg(lines2(b.L));return}}
const PRO=[
 ()=>[['narra','Salvador, 1991. O Pelourinho ainda é bairro: tem gente morando nos sobrados, fiado no balcão, mesa de dominó na calçada e roda no largo.'],['narra','Aqui as coisas se resolvem sem papel: a caixinha de sábado, o quintal que é de todo mundo, o telhado que a rua levanta junto. Ninguém chama isso de organização. É como a rua funciona.'],['narra','O governo do Estado anunciou um Programa para recuperar o Centro Histórico. Aqui na rua, ninguém sabe o que isso quer dizer.'],['vo','Lia, acende o forno. Hoje o balcão é seu e meu.'],['lia','Já vou, vó.'],
  ['narra','Como funciona: quando alguém chegar ao balcão, chegue perto e aperte E para anotar o pedido. Pegue o item no forno, na vitrine ou na máquina de café. A bandeja leva dois. Entregue a quem pediu antes que a paciência acabe.'],['narra','A porta leva à rua. Lá fora, a calçada e o largo também têm gente.'],['narra','Às vezes sua avó vai pedir que você leve ou veja algo lá fora. A tarefa aparece no canto da tela, com um ponto rosa no lugar.']],
 ()=>[['narra','1996. Quatro anos depois, a rua está pintada. Tinta nova nas fachadas, luz nova nos postes e uma banca de artesanato onde antes era calçada.'],['narra','O Estado paga a limpeza, a iluminação e os shows do "Pelourinho Dia & Noite". A padaria continua da sua avó, mas o balcão agora enche em ondas.'],['vo','Quando o ônibus chegar, não se afobe. Anota, pega, entrega. Um de cada vez.']],
 ()=>{const sg=S.sign,m={'PADARIA':'Mantive a padaria. Mesmo assim, o preço mudou, o cardápio ficou escrito e agora tem fila.','PADARIA & CAFÉ':'Ficou metade padaria, metade café. O forno acende de manhã e a máquina de café toma a tarde.','CAFÉ PELÔ':'Agora é café. Cappuccino, bolo em fatia, preço escrito na lousa. O pão virou "pão artesanal".','LEMBRANÇAS':'Agora é loja de lembranças. Ímã com a fachada da casa onde eu moro, e café para acompanhar.'}[sg];
  return[['narra','2000. A rua é vitrine. O ponto da padaria vale mais do que o pão que sai dele, e o aluguel acompanha.'],['vo',m],['vo','Antes era eu, você e a caderneta. Agora o movimento é de gente de fora, e eu não dou conta sozinha.'],['vo','Funcionário tem horário, uniforme e salário. E não sabe o nome de ninguém. O fiado acabou: agora é dinheiro ou cartão.'],
   {ch:[{t:'Contrata duas pessoas, vó.',fn:()=>{S.hired=2;mkStaff()},r:[['vo','Duas. Bia no balcão e Caio na máquina. A conta do mês aumenta e o balcão respira.']]},
        {t:'Uma só já ajuda.',fn:()=>{S.hired=1;mkStaff()},r:[['vo','Uma: a Bia. Quando encher, você me ajuda.']]},
        {t:'A gente dá conta, vó.',fn:()=>{S.hired=0;mkStaff()},r:[['vo','Então vai ser como antes, só que com mais gente na porta e menos paciência.']]}]},
   ['narra','Os funcionários atendem os visitantes. Quem mora na rua ainda espera por você.'],['narra','Cada funcionário custa R$ 9,00 por dia no caixa. Os valores são fictícios.']]}];
function beginDay(){S.card=null;S.scene='play';hud();const P=PRO[S.era];if(P){S.speaker=null;openDlg(P())}}


/* ---------- falas ambientes: uma por vez, sem repetir até acabar o baralho ---------- */
function deckPick(key,list){const D=S.deck;let d=D[key];if(!d||!d.q.length){const last=d&&d.last;const q=list.slice().sort(()=>Math.random()-.5);if(q.length>1&&q[q.length-1]===last)q.reverse();d=D[key]={q,last}}const s=d.q.pop();d.last=s;return s}
const barkDur=s=>clamp(2.2+s.length*.055,3.2,6.8);
const canSpeak=()=>S.quiet<=0&&S.scene==='play'&&S.mode!=='vist';
function tryBark(n){if(!canSpeak()||n.hidden||n.loc!==S.loc||Math.abs(n.x-S.px)>400||n.bark||(n.walk&&n.id==='vo'))return;
 const bl=(BARKS[n.id]||[])[S.era]||[];if(!bl.length)return;const s=deckPick('b'+n.id+S.era,bl);sayOn(n,s,0)}
const IDLE2={raimundo:['O senhor olha pro lado e muda de assunto.','Ele ajeita o chapéu e finge que alguém o chamou.','Seu Raimundo dá uma risadinha curta e olha o relógio.','"Outro dia a gente conversa", ele diz, sem se mexer.'],
 dandara:['Ela balança a cabeça: por hoje, já falou o que podia.','Dandara abre a pasta, confere um papel e fecha de novo.','Ela te olha por um instante e volta para a lista.','"Depois", diz Dandara, já de costas.'],
 davi:['Ele dá de ombros e volta a batucar no joelho.','Davi sorri de lado e afina o tambor.','Ele conta o compasso baixinho e não responde.','"Tá na hora de tocar", ele avisa.'],
 vo:['A vó sorri sem responder e mexe na massa.','Ela enxuga as mãos no avental e olha o forno.','A vó cantarola baixinho e muda de assunto.','"Depois a gente conversa, Lia", ela diz.'],
 marta:['Ela confere o relógio e o roteiro.','Marta ajeita o chapéu e conta a cabeça do grupo.','Ela sorri, profissional, e olha para a porta.','"Daqui a pouco saio", diz Marta.'],
 lucia:['Ela anota algo na prancheta e sorri educadamente.','Lúcia confere uma lista e não levanta os olhos.','Ela fecha a prancheta e agradece a conversa.','"Preciso seguir", diz Lúcia.']};
const idleLine=id=>deckPick('i'+id,IDLE2[id]||[IDLE[id]]);

/* cumprimento conforme a hora: só vale no começo da frase */
function greet(s){if(typeof s!=='string'||S.mode==='vist'||!/Bom dia|Boa tarde|Boa noite/.test(s))return s;const h=S.min/60,g=h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';
 return s.replace(/(^|[.!?…]["”]?\s+|["“]\s*)(Bom dia|Boa tarde|Boa noite)(?=[,.!?\s"”]|$)/g,(m,a)=>a+g)}
/* a vó cobre o balcão enquanto a Lia está na rua: mais devagar, sem confiança ganha, mas o caixa rende */
const VOT={note:2.4,make:[8.5,11]};
const voFree=()=>{const v=S.npcs.vo;return!!v&&!v.hidden&&v.loc==='dentro'};
function voDrop(){const j=S.voJob;if(j&&j.o.by==='vo')j.o.by=null;S.voJob=null}
function updVo(dt){const j=S.voJob,away=S.loc!=='dentro';
 if(j){const ok=ordOpen(j.o)&&voFree()&&(j.n?(S.npcs[j.n.id]===j.n&&j.n.ord===j.o&&atCounter(j.n)):(S.extras.includes(j.a)&&j.a.waiting&&j.a.loc==='dentro'));
  if(!ok||(j.st==='note'&&!away)){voDrop();return}
  j.t-=dt;
  if(j.st==='note'&&j.t<=0){const o=j.o;if(!o.noted){o.noted=true;o.num=++S.tn}j.st='make';j.t=rnd(VOT.make[0],VOT.make[1]);const k=shop().st.indexOf(o.item);if(k>=0){if(S.stock[k]<=0){S.stock[k]=3;j.t+=3}S.stock[k]--}}
  else if(j.st==='make'&&j.t<=0){const o=j.o;o.done=true;ledAdd(o);S.voN=(S.voN||0)+1;
   if(j.n){j.n.served=true;sayOn(j.n,deckPick('voth',['Obrigado, Dona Aurea.','Deus lhe pague, Dona Aurea.','Está quente, hein. Obrigado.','A senhora não perde a mão.']),1)}
   else{j.a.served=true;j.a.waiting=false;sayOn(j.a,deckPick('thx',['Obrigada!','Que cheiro bom!','Delícia.','Perfeito, obrigada.']),1)}
   S.voJob=null}
  return}
 if(!away||!voFree()||S.closing||S.scene!=='play')return;
 const L=custAll().filter(c=>!c.o.by);if(!L.length)return;L.sort((a,b)=>a.o.pat/a.o.max-b.o.pat/b.o.max);const c=L[0];
 c.o.by='vo';S.voJob={o:c.o,n:c.n||null,a:c.a||null,st:'note',t:VOT.note};
 sayOn(S.npcs.vo,deckPick('voat',['Já vai, já vai. A Lia foi ali.','Pode sentar, que eu cuido disso.','Um minuto, meu filho.','Eu seguro o balcão, não se aflija.','Deixa comigo, que a menina volta já.']),1);
 if(!S.voMsg){S.voMsg=true;toast('Vó Aurea cobre o balcão enquanto você está na rua.')}}
/* pri 0 ambiente (espera a vez), 1 reação (só se ninguém fala), 2 resposta ao jogador (corta o ambiente) */
function sayOn(e,s,pri){if(!e||!s)return false;s=greet(s);if(pri<2&&S.quiet>0)return false;
 if(pri>=2){for(const id in S.npcs){const n=S.npcs[id];if(n!==e&&n.bark&&!n.bark.ev&&n.bark.t>.8)n.bark.t=.8}for(const x of S.extras)if(x!==e&&x.bark&&x.bark.t>.8)x.bark.t=.8;for(const x of S.staff)if(x!==e&&x.bark&&x.bark.t>.8)x.bark.t=.8}
 const t=barkDur(s);e.bark={s,t};S.quiet=Math.max(S.quiet,t+(pri>=2?.8:pri?1.4:2.6));return true}

/* ---------- tarefas na rua + perguntas com contexto ---------- */
WHO.operario={n:'Operário',c:ORA,t:OUT};
function placeNpc(id,x,y,dir){const n=S.npcs[id];if(!n)return;n.hidden=false;n.loc='rua';n.x=x;n.y=y;n.dir=dir||1;n.walk=false;n.hideAt=null}

/* cada tarefa: quem pede, quando, onde fica, e a cena longa que acontece lá */
const QUESTS=[
 {id:'q0a',e:[0],h:9.6,h1:15,lab:'levar a sacola ao sobrado de Seu Raimundo',cost:35,
  get tg(){return S.sac==='mesa'?{loc:'dentro',x:660,y:GY-14,lab:'pegar a sacola do Seu Raimundo no balcão'}:{loc:'rua',x:692,y:GY+84,lab:'bater na porta de Seu Raimundo'}},
  when:()=>{const r=S.npcs.raimundo;return!!r&&!r.hidden&&r.loc==='rua'&&!ordOpen(r.ord)},
  start:()=>{S.sac='mesa';S.ov.raimundo=[[7,'sobrado']]},
  pick:()=>{if(S.sac!=='mesa')return false;S.sac='mao';adv(1);toast('Com a sacola de pão do Seu Raimundo. Agora, o sobrado.');return true},
  clear:()=>{S.sac=null;delete S.ov.raimundo},

  give:()=>[['vo','Lia, o Raimundo acabou de sair e esqueceu a sacola de pão aqui no balcão. Pega ali, ao lado do rádio, e leva lá no sobrado antes que esfrie.'],['vo','E repara como ele está. Faz uns dias que fala baixo.'],['narra','A sacola está em cima do balcão. O sobrado fica na calçada da esquerda, depois do poste. Vá quando o balcão estiver calmo.']],
  stage:()=>placeNpc('raimundo',296,GY+86,-1),
  scene:()=>[
   ['narra','A porta do sobrado está encostada. Ao lado da campainha, um papel colado com fita crepe, já soltando nos cantos.'],
   {ch:[
    {t:'Ler o papel antes de bater.',a:1,fn:()=>gain('ray1'),r:[['narra','"Imóvel em avaliação para fins do Programa de Recuperação. Vistoria em data a definir." Embaixo, um carimbo e uma assinatura sem nome.']]},
    {t:'Bater logo e entregar a sacola.',a:1,r:[['narra','Você bate duas vezes. O papel balança no vento da porta e você finge que não viu.']]}]},
   ['raimundo','Lia! Sua avó mandou a sacola. Eu esqueci a cabeça no balcão, é isso.'],
   ['narra','Ele abre a porta e fica um segundo a mais no vão, como quem esconde a sala. Dá para ver retratos antigos na parede e uma mala fechada em cima da cadeira.'],
   ['raimundo','Entra um instante. O café está frio, mas está aqui.'],
   ['raimundo','O rapaz veio de manhã cedo, antes de eu abrir a janela. Colou o papel, tirou foto da fachada e passou para a casa do lado.'],
   ['raimundo','Não perguntou meu nome. Perguntou quantos moravam.'],
   {ch:[
    {t:'O que o papel quer dizer, Seu Raimundo?',fn:()=>{gain('ray1');addTr('raimundo',1);F.q0a='papel'},r:[['raimundo','Dizem que é vistoria. Vistoria eu conheço: vem engenheiro, olha o telhado, diz que está bom e vai embora.'],['raimundo','Esse veio sem engenheiro. Veio com prancheta.']]},
    {t:'E o senhor, o que vai fazer?',fn:()=>{addTr('raimundo',1);F.q0a='fazer'},r:[['raimundo','Esperar. Tem quem diga que quem espera ganha mais. Tem quem diga que quem assina primeiro ganha mais.'],['raimundo','Eu não sei em qual dos dois eu confio.']]},
    {t:'Ficar em silêncio e tomar o café.',a:1,fn:()=>{addTr('raimundo',2);F.q0a='silencio'},r:[['narra','Vocês ficam um tempo sem falar. O relógio da sala bate onze horas, atrasado.'],['raimundo','Obrigado por não perguntar nada. Hoje todo mundo pergunta.']]}]},
   ['narra','Na volta, a calçada parece mais comprida, e a sacola ficou vazia.']]},

 {id:'q0b',e:[0],h:13.6,h1:17.4,lab:'ver a discussão no largo',cost:40,tg:{loc:'rua',x:1860,y:GY+88,lab:'chegar ao círculo de gente no largo'},
  give:()=>[['vo','Lia, tem gente discutindo lá no largo. Escuto daqui. A Dandara está no meio.'],['vo','Vai ver o que é. Se não for nada, volta. Se for alguma coisa, volta e me conta.']],
  stage:()=>{placeNpc('dandara',1900,GY+84,1);placeNpc('lucia',1990,GY+78,-1);placeNpc('davi',1950,GY+96,-1)},
  scene:()=>[
   ['narra','No largo, um círculo pequeno de gente. No meio, Lúcia com a trena e Dandara com a pasta debaixo do braço.'],
   ['dandara','Mediu, fotografou e marcou com tinta a parede do vizinho. Quem autorizou?'],
   ['lucia','A vistoria é do Programa, Dona Dandara. Medir a rua não precisa de autorização.'],
   ['dandara','A rua tem dono. Tem muitos donos, e nenhum assinou isso.'],
   ['davi','A roda toca nessa praça há trinta anos. Vão medir o tamanho do tambor também?'],
   ['lucia','Estamos mapeando onde vai ficar o palco da programação. O palco traz gente de toda a cidade.'],
   ['dandara','Gente que chega, olha e vai embora.'],
   {ch:[
    {t:'Quem mora aqui tem que saber o que vão fazer com a rua.',fn:()=>{addTr('dandara',2);addTr('davi',1);F.q0b='dan'},r:[['dandara','Isso. Quem mora aqui.'],['lucia','Vocês serão informados. No tempo certo.'],['dandara','Qual é o tempo certo, moça?'],['narra','Lúcia anota alguma coisa e atravessa para o outro lado. A discussão se desfaz sem que ninguém tenha ganhado.']]},
    {t:'O que o Programa quer fazer com o largo?',fn:()=>{gain('prog1');addTr('lucia',1);F.q0b='pergunta'},r:[['lucia','Quer o largo cheio. De visita, de show, de feira. O Governo chama isso de céu aberto: a rua inteira vira um lugar para ser visitado.'],['davi','E quem mora aqui visita a própria casa?'],['lucia','Quem mora aqui vai ter a rua mais bonita da cidade.'],['dandara','Bonita para quem?'],['narra','Lúcia não responde. A pergunta parece não ter campo no formulário.']]},
    {t:'Ficar de longe, só ouvindo.',a:1,fn:()=>{F.q0b='ouviu'},r:[['narra','Você encosta num poste e escuta. Cada um fala mais alto que o anterior, e ninguém responde ao que o outro disse.'],['narra','Quando Lúcia quer dizer "eu não decidi isso", ela diz "o Programa".']]}]},
   ['narra','O círculo se abre devagar. O tambor de Davi recomeça baixo, para ninguém em particular.']]},

 {id:'q1a',e:[1],h:11.6,h1:15.6,lab:'ir à assembleia da associação, no largo',cost:50,tg:{loc:'rua',x:1860,y:GY+90,lab:'sentar na assembleia, no largo'},
  give:()=>[['vo','Lia, a Dandara marcou reunião da associação no largo, agora. Pediu que alguém desta casa fosse.'],['vo','Hoje eu não saio do forno. Vai você e fala por nós. Ou escuta por nós, se achar melhor.']],
  stage:()=>{placeNpc('dandara',1900,GY+78,1);placeNpc('lucia',1990,GY+76,-1);placeNpc('davi',1840,GY+98,1);placeNpc('raimundo',1760,GY+100,1);S.fx.crowd=14},
  scene:()=>[
   ['narra','Cadeiras de plástico em roda, no largo. Uns trinta moradores, alguns em pé, outros na janela. Atrás deles, o palco do "Dia & Noite" com a faixa nova.'],
   ['dandara','Boa tarde. Esta é a assembleia da associação. Hoje tem convidada: Lúcia, do Programa, vai explicar o que vem aí.'],
   ['lucia','Obrigada, Dona Dandara. Vou ser direta.'],
   ['lucia','O Centro Histórico estava caindo. O Estado vai reformar os casarões, trocar a fiação e calçar as ruas. Pronta a obra, a rua atrai visitante, comércio e evento.'],
   ['lucia','A ideia é que o Pelourinho inteiro funcione como uma vitrine a céu aberto. Em vez de ficar escondido, ele é mostrado ao mundo. O sucesso do Programa se mede em quantas pessoas entram na rua por mês.'],
   {fn:()=>gain('prog1')},
   ['narra','Esse é o desenvolvimento que o Programa defende: investir no que se vê, reformar a fachada, atrair quem gasta e esperar que o dinheiro dos visitantes volte para o bairro. Quem já mora ali entra na conta como contexto.'],
   ['lucia','Quem mora em imóvel que será reformado recebe indenização ou é levado para outro lugar. Para o Estado, isso é uma troca.'],
   ['narra','No fundo, uma senhora levanta a mão. Ninguém lhe passa o microfone.'],
   ['dandara','Dona Lúcia, a senhora disse "outro lugar". Que lugar?'],
   ['lucia','Bairros com mais estrutura.'],
   ['dandara','Coutos tem estrutura?'],
   ['lucia','Tem terreno. A estrutura está sendo discutida.'],
   ['narra','Alguém ri. O riso soa mais raivoso que divertido. Todos olham para a cadeira onde a padaria devia estar sentada.'],
   {ch:[
    {t:'Eu queria o texto inteiro do acordo antes de qualquer assinatura. E um prazo para a gente ler.',fn:()=>{F.assemb='prazo';addTr('dandara',2);addRel('dandara','vo',1)},r:[['lucia','O texto completo... Levo o pedido à Coordenação.'],['dandara','Anota aí. Texto inteiro e prazo de quinze dias.'],['narra','Palmas fracas, primeiro de poucos, depois de muitos. Lúcia anota com a caneta travada.']]},
    {t:'Se a rua não mudar, ela cai. Eu prefiro uma rua reformada a uma rua caída.',fn:()=>{F.assemb='acordo';addTr('dandara',-1);addTr('lucia',1)},r:[['lucia','É isso. Reformar é cuidar.'],['dandara','Cuidar de quem? Da fachada ou de quem dorme atrás dela?'],['narra','Alguns concordam com você. Dois vizinhos viram a cara e Seu Raimundo olha para o chapéu.']]},
    {t:'A padaria é da minha avó, mas ela não decide sozinha. Se for decidir, que seja junto com a rua.',fn:()=>{F.assemb='junto';addTr('dandara',1);addTr('davi',1)},r:[['davi','Quem decide sozinho decide mal.'],['narra','Dandara olha para você um segundo a mais do que o necessário. Parece anotar na cabeça.']]},
    {t:'Ficar calada e observar quem fala, quem esconde o rosto.',a:1,fn:()=>{F.assemb='calada';know('raimundo','dandara')},r:[['narra','Você não diz nada. Repara que Seu Raimundo está na última fila, de chapéu na mão, e que quando Lúcia fala de indenização ele olha para o chão.'],['narra','Quem já assinou não costuma sentar na frente.']]}]},
   ['dandara','Reunião encerrada. Quem quiser conversar sobre o texto, a associação fica aqui até as cinco.'],
   ['narra','Você volta para a padaria com o gosto de uma conversa que não acabou.']],
  after:()=>{S.fx.crowd=0}},

 {id:'q1b',e:[1],h:15.2,h1:17.7,lab:'ouvir Seu Raimundo no sobrado',cost:45,tg:{loc:'rua',x:692,y:GY+84,lab:'sentar com Seu Raimundo no degrau'},
  give:()=>[['vo','Lia, o Raimundo mandou recado. Quer falar com você. Disse que é sobre o papel.'],['vo','Passa lá no sobrado quando puder. Ele não pede conversa à toa.']],
  stage:()=>placeNpc('raimundo',296,GY+86,-1),
  scene:()=>{const used={};
   const POOL=[
    {id:'aviso',show:()=>!has('ray1'),t:'Como o aviso chegou aqui?',fn:()=>{gain('ray1');addTr('raimundo',1)},r:[['raimundo','De manhã cedo, colado na porta por um rapaz de colete. Nem tocou a campainha.'],['raimundo','Tiraram foto da fachada e foram embora. Fiquei lendo o papel como quem lê o próprio nome numa lista de que não sabia.']]},
    {id:'risco',show:()=>has('ray1')&&!has('ray4'),t:'Quem disse que o sobrado corria risco?',fn:()=>{gain('ray4');addTr('raimundo',1)},r:[['raimundo','Um senhor de capacete. Olhou a laje do térreo, bateu na parede com o nó do dedo e disse "risco de desabamento".'],['raimundo','Eu remendo esse telhado desde antes de você nascer. Está de pé há mais de cem anos.'],['raimundo','Nunca mais vi o senhor de capacete. O papel, vi todo dia.']]},
    {id:'assinou',show:()=>!has('ray3'),t:'O senhor chegou a assinar alguma coisa?',fn:()=>{used.ok=tr('raimundo')>=2;if(used.ok){gain('ray3')}else addTr('raimundo',1)},r:()=>used.ok?[['raimundo','Assinei. Primeiro, antes de todo mundo. Depois fui dizendo aos vizinhos que assinassem também.'],['raimundo','Dói pensar nisso. Mas se eu não tivesse assinado, tinha assinado depois, com medo igual.']]:[['raimundo','Hoje não, Lia. Hoje eu só queria falar do aviso.'],['narra','Ele muda de assunto com educação. Você anota, na cabeça, que ainda não é a hora de perguntar.']]},
    {id:'porque',show:()=>has('ray3'),t:'O que fez o senhor assinar primeiro?',fn:()=>addTr('raimundo',1),r:[['raimundo','Me disseram que quem assinasse primeiro ia para a frente da fila. Fila de quê, eu perguntei. Fila de casa nova, disseram.'],['raimundo','Tenho sessenta e oito anos, Lia. Não tenho idade para fila. Assinei primeiro.']]},
    {id:'vizinhos',show:()=>has('ray3'),t:'E os vizinhos, o que disseram?',fn:()=>{addTr('raimundo',1);addRel('raimundo','dandara',-1);know('raimundo','dandara')},r:[['raimundo','Uns assinaram porque eu assinei. Uns não falam mais comigo. A Dandara disse que eu devia ter lido até o fim.'],['raimundo','Ela tem razão. Isso é o pior.']]},
    {id:'ficar',show:()=>true,t:'E por que o senhor ainda está aqui?',fn:()=>addTr('raimundo',1),r:[['raimundo','Porque minha mãe morreu naquele quarto. Porque este degrau é o único lugar do mundo onde todo mundo me cumprimenta.'],['raimundo','Isso não entra no formulário.']]}];
   const round=(n,stop)=>({lazy:()=>{const el=POOL.filter(p=>!used[p.id]&&p.show()).slice(0,n);if(!el.length)return[];
    return[{ch:el.map(p=>({t:p.t,fn:()=>{used[p.id]=1;p.fn&&p.fn()},r:typeof p.r==='function'?[{lazy:p.r}]:p.r})).concat(stop?[{t:'Já está bom por hoje, Seu Raimundo.',fn:()=>{used.stop=1},r:[['raimundo','Obrigado por vir. Ninguém vem.']]}]:[])}]}});
   return[
    ['narra','Seu Raimundo está sentado no degrau do sobrado, com o chapéu no joelho. O papel antigo da porta foi trocado por outro, mais novo, com carimbo.'],
    ['raimundo','Mandei recado porque não sei com quem falar. Pergunta o que quiser, Lia. Eu respondo o que der.'],
    round(3,false),
    {lazy:()=>used.stop?[]:[round(2,true)]},
    ['raimundo','Agora vai. Sua avó precisa de você no balcão.'],
    ['narra','Quando você se afasta, ele já está olhando outra vez para a janela do segundo andar.']]}},

 {id:'q2a',e:[2],h:9.2,h1:15.5,lab:'passar no sobrado de Seu Raimundo',cost:45,tg:{loc:'rua',x:692,y:GY+84,lab:'chegar ao sobrado de Seu Raimundo'},
  give:()=>(F.lRai==='cad'||F.lRai==='pres'||F.rompida)&&!F.lRaiNo?[['vo','Lia, dizem que hoje levam as coisas do Raimundo. O sobrado está com tapume.'],['vo','Passa lá, leva um pão. Ele não pede, mas gosta de ver quem aparece.']]:[['vo','Lia, o Raimundo mandou dizer que chegou outra carta do Programa. Letra pequena.'],['vo','Vai ler com ele. Ele diz que não precisa, mas o olho dele já não segura letra miúda.']],
  stage:()=>placeNpc('raimundo',300,GY+86,-1),
  scene:()=>(F.lRai==='cad'||F.lRai==='pres'||F.rompida)&&!F.lRaiNo?[
   ['narra','Um tapume novo cobre a janela do sobrado. Dois homens de camiseta do Programa descem uma cômoda pela porta.'],
   ['narra','Na calçada, entre caixas de papelão, está a cadeira de balanço de Seu Raimundo.'],
   ['raimundo','Passei para me despedir da casa. Não sei por que vim. Ela não sabe falar.'],
   {ch:[
    {t:'Para onde vai a mudança?',fn:()=>{F.q2a='destino';addTr('raimundo',1)},r:[['operario','Depósito do Programa, moça. Depois cada um recebe o que a papelada disser.'],['raimundo','Dizem depósito. Eu escuto cemitério de cômoda.']]},
    {t:'A cadeira do senhor pode ficar lá em casa, ao lado do forno. Se não couber onde o senhor for morar.',fn:()=>{F.cadeira=true;F.q2a='cadeira';addTr('raimundo',2)},r:[['raimundo','... Aceito. Mas quando eu passar, ela me recebe.'],['narra','O operário ergue a cadeira e a põe nas suas mãos sem perguntar nada.']]},
    {t:'Ajudar a carregar as caixas.',a:1,fn:()=>{F.q2a='caixas';addTr('raimundo',1)},r:[['narra','Você carrega uma caixa pesada demais. Dentro, panelas, uma Bíblia e muitas fotos soltas.'],['raimundo','Cuidado com essa. É a cara da minha mãe.']]}]},
   ['narra','Quando o caminhão sai, o degrau da frente fica vazio pela primeira vez em quarenta anos.']]
  :[
   ['narra','O sobrado ainda tem a janela aberta. Na casa ao lado, uma placa nova: ALUGA-SE.'],
   ['raimundo','Chegou outra carta. Letra pequena. Lê para mim, Lia? Meus olhos pararam nas primeiras linhas.'],
   ['narra','"Notificamos que o prazo para desocupação é de trinta dias, a contar do recebimento desta."'],
   {ch:[
    {t:'Ler a carta inteira, devagar, até o rodapé.',a:1,fn:()=>{F.q2a='leu';addTr('raimundo',2);gain('prog2')},r:[['narra','No rodapé, em corpo pequeno, está a lista de imóveis da etapa. O sobrado aparece na quarta linha, entre dois casarões vazios.'],['raimundo','Quarta linha. Então foi escolhido porque a vizinhança já saiu.'],['narra','Ele diz como quem acaba de entender uma regra de jogo que ninguém explicou.']]},
    {t:'A associação lê isso com o senhor. A Dandara sabe o que fazer com carta.',fn:()=>{F.q2a='assoc';addTr('raimundo',1);addRel('raimundo','dandara',1);know('raimundo','dandara')},r:[['raimundo','Dandara me perdoa? Eu assinei... não, eu não assinei, mas pedi que os outros assinassem.'],['raimundo','Se ela quiser ler comigo, eu levo a carta.']]},
    {t:'O senhor quer ficar?',fn:()=>{F.q2a='ficar';addTr('raimundo',1)},r:[['raimundo','Querer eu quero. Poder, não sei.'],['raimundo','Sabe o que é pior? A carta é educada.']]}]},
   ['narra','Você dobra a carta com cuidado e devolve a ele. Ele a guarda no bolso, no mesmo lugar onde guardava o terço.']]},

 {id:'q2b',e:[2],h:13.4,h1:17.8,lab:'ver como está o largo',cost:45,tg:{loc:'rua',x:2040,y:GY+92,lab:'chegar ao largo'},
  give:()=>[['vo','Lia, vai ver o largo. Dizem que o clima está estranho.'],['vo','Leva este pãozinho. Quem vem de lá costuma estar com fome ou com raiva.']],
  stage:()=>{placeNpc('davi',2110,GY+88,-1);placeNpc('dandara',1960,GY+98,1);S.fx.crowd=F.inc==='calmo'?5:10;S.fx.ban=F.inc==='protesto'?1:0},
  scene:()=>{
   if(F.inc==='fogo')return[
    ['narra','O palco está preto. Sobraram dois postes de ferro e uma lona derretida. Tapume novo em volta, com uma placa: PROGRAMAÇÃO SUSPENSA.'],
    ['narra','Davi está sentado no degrau, com o tambor entre as pernas, e não toca.'],
    ['davi','Disseram que foi gente de fora. Disseram que foi gente da rua. Eu não vi quem foi, Lia. Eu vi o fogo.'],
    ['davi','O cachê acabou com o palco. Mas, para ser sincero, a roda dormiu mais tranquila essa semana.'],
    {ch:[
     {t:'Sentar do lado dele e esperar.',a:1,fn:()=>{addTr('davi',2);F.q2b='sentou'},r:[['narra','Vocês ficam um bom tempo olhando o tapume. O vento traz um cheiro de lona queimada.'],['davi','Obrigado por não dizer que vai melhorar.']]},
     {t:'Quem você acha que foi?',fn:()=>{addTr('davi',1);F.q2b='perguntou'},r:[['davi','Quem queria que a rua fosse só vitrine, ou quem cansou de ser vitrine. Os dois têm motivo.'],['davi','O pior é que o fogo serve aos dois.']]},
     {t:'Toca na porta da padaria. Minha avó não vai reclamar.',fn:()=>{addTr('davi',2);F.rodaPorta=true;F.q2b='porta'},r:[['davi','Na porta da padaria? Sem palco, sem hora marcada?'],['lia','Sem nada. Só o tambor.'],['davi','Então amanhã cedo. Pão primeiro, roda depois.']]}]},
    ['narra','Um fiscal de colete atravessa o largo e olha para vocês, anota algo e segue. A roda não se mexe.']];
   if(F.inc==='protesto'){const med=F.incRes==='mediacao';return[
    ['narra',med?'A faixa "TEXTO INTEIRO" ainda está pendurada no palco. Embaixo, uma mesa de plástico com copos de café e papel espalhado.':'O palco foi liberado, mas o largo está vazio. No chão, restos de pano pintado e uma faixa pisada: "NÓS FICAMOS".'],
    ['dandara',med?'Conseguimos quinze dias para ler o contrato e uma cópia inteira. Ninguém pediu desculpa, mas já é alguma coisa.':'Levaram três nomes na confusão. Um deles é do Davi. Hoje ele não aparece.'],
    ['dandara',med?'Lúcia leu os nossos pedidos no microfone. Eu não esperava isso dela.':'Ninguém quer falar. A rua aprendeu a ficar quieta. Isso eu sei fazer pior do que gritar.'],
    {ch:[
     {t:med?'Posso ajudar a copiar o texto para as famílias?':'O que a associação precisa agora?',fn:()=>{addTr('dandara',2);F.q2b='ajuda'},r:med?[['dandara','Pode. Cada cópia é um morador a menos que assina sem ler.'],['narra','Você passa a tarde copiando artigos à mão. A letra cansa, mas o papel fica.']]:[['dandara','De alguém que não tenha medo de ser vista com a gente. Você tem?'],['narra','Você não responde na hora. Dandara aceita o silêncio como uma resposta honesta.']]},
     {t:med?'E a Lúcia, como ficou?':'E se a gente fizer a roda na porta da padaria?',fn:()=>{F.q2b='lucia';if(!med){F.rodaPorta=true;addTr('dandara',1)}},r:med?[['dandara','Foi chamada para uma reunião. Voltou calada. Não sei de que lado ela está agora, e acho que ela também não.']]:[['dandara','Roda sem palco e sem autorização? Seria a primeira vez em meses que a rua respirava.']]},
     {t:'Só ouvir e levar o pãozinho.',a:1,fn:()=>{F.q2b='ouviu'},r:[['narra','Você deixa o pão na mesa. Dandara parte ao meio e oferece metade a quem passa.']]}]},
    ['narra','O sol cai sobre o largo, e as faixas no chão parecem desenhos de uma festa que deu errado ou de um começo que ainda não sabe o que é.']]}
   return[
    ['narra','O palco funciona. Fila de turistas, caixa de som nova, Davi em horário marcado.'],
    ['davi','Cinco da tarde, três músicas, trinta minutos. É o combinado.'],
    ['davi','Eu agradeço o cachê. Mas toco olhando o relógio, Lia. Isso muda o som.'],
    {ch:[
     {t:'E a roda de antes?',fn:()=>{addTr('davi',1);F.q2b='roda'},r:[['davi','Ainda existe, de madrugada, quando ninguém tem horário.'],['davi','Vem aqui uma vez, Lia. Sem foto.']]},
     {t:'Você está feliz com o palco?',fn:()=>{addTr('davi',1);F.q2b='feliz'},r:[['davi','Estou pago. Feliz é outra conta.'],['narra','Ele toca uma frase curta e para, como quem confere se o tambor ainda é dele.']]},
     {t:'Ficar no fim do público, ouvindo.',a:1,fn:()=>{F.q2b='ouviu'},r:[['narra','As pessoas à sua frente erguem celulares. Você é a única que fecha os olhos.']]}]},
    ['narra','No fim da terceira música, ninguém aplaude demais, ninguém aplaude de menos. É um aplauso de ônibus.']]}}
];

function questOn(){return S.q&&S.qd[S.q.id]==='on'?S.q:null}
function updQuests(){if(S.mode==='vist'||S.scene!=='play'||S.trans||S.closing)return;const h=S.min/60;
 const q=questOn();if(q){if(h>q.h1){S.qd[q.id]='miss';F['miss_'+q.id]=true;S.q=null;q.clear&&q.clear();toast('Passou da hora de '+q.lab+'.')}return}
 for(const d of QUESTS){if(!d.e.includes(S.era)||S.qd[d.id]||h<d.h)continue;if(h>d.h1){S.qd[d.id]='miss';continue}
  const near=S.loc==='dentro'||(S.loc==='rua'&&Math.abs(S.px-AN.porta[0])<420);if(!near)continue;const v=S.npcs.vo;if(!v||v.hidden||v.loc!=='dentro')continue;if(custAll().length>(S.era===2?3:1)||S.q)continue;if(d.when&&!d.when())continue;
  S.qd[d.id]='on';S.q=d;S.speaker=null;d.start&&d.start();const G=lines2(d.give);openDlg((S.loc==='rua'?[['narra','A vó põe a cabeça para fora da porta e chama você.']].concat(G):G).concat([['vo',deckPick('voseg',['Pode ir. O balcão eu seguro.','Vai lá, que eu atendo por aqui.','Eu fico no caixa. Volta antes de o pão esfriar.'])]]),()=>{toast('Tarefa: '+d.lab+'.')});return}}
function doQuest(q){S.speaker=null;if(q.pick&&q.pick())return;if(q.stage)q.stage();adv(q.cost||40);const L=q.scene();
 openDlg(L,()=>{S.qd[q.id]='done';S.q=null;q.clear&&q.clear();if(q.after)q.after();S.fx.crowd=0;S.fx.ban=0;toast('Tarefa cumprida. O balcão continua te esperando.');hud()})}
function missLines(){const L=[];for(const d of QUESTS){if(d.e.includes(S.era)&&F['miss_'+d.id]&&!F['said_'+d.id]){F['said_'+d.id]=true;L.push(['narra','Você não chegou a '+d.lab+'. O que ia ser dito lá ficou sem você.'])}}return L}

/* ---------- perguntas com contexto: cada pessoa, cada momento ---------- */
Object.assign(TOPIC,{aviso:{n:'Como o aviso chegou'},ficar:{n:'Por que ficar'},processo:{n:'Como foi o processo'},porque:{n:'O que levou a decidir'}});
const PERS=new Set(['aviso','ficar','processo','porque']);
const TLAB={
 raimundo:{aviso:'Como o aviso chegou à porta dele',ficar:'Por que ele ainda está no sobrado',processo:'Como foi o cadastro',porque:'O que o fez assinar primeiro'},
 dandara:{aviso:'Como a associação soube do Programa',ficar:'Por que ela não sai da rua',processo:'O que a associação já tentou',porque:'Por que guardar o formulário'},
 davi:{aviso:'Quando falaram do palco com ele',ficar:'Por que ainda toca no largo',processo:'Como foi virar programação',porque:'Por que contou da roda'},
 vo:{aviso:'Quando a proposta chegou',ficar:'Por que ainda abre às quatro',processo:'Como foi pensar na proposta',porque:'Por que guardou a proposta na gaveta'},
 marta:{ficar:'Por que voltou para esta rua',processo:'Como foi virar guia do Programa'},
 lucia:{aviso:'Como o aviso é entregue',processo:'Como o Programa decide'}};
const addAsk=(id,t,arr)=>{(ASK[id]=ASK[id]||{})[t]=arr};
addAsk('raimundo','aviso',[{m:0,e:[0],c:'ray1',L:[['raimundo','Veio de manhã cedo, na mão de um rapaz de colete. Nem tocou a campainha.'],['raimundo','Fiquei olhando da janela. O papel parecia visita que ninguém convidou.']]},
 {m:2,e:[1],L:[['raimundo','O segundo veio por carta. Papel timbrado, letra miúda, número de protocolo.'],['raimundo','Agora o aviso tem número. Eu virei número também.']]},
 {m:3,e:[2],L:[['raimundo','O último aviso foi o da mudança. Veio com data e com caminhão.']]}]);
addAsk('raimundo','ficar',[{m:1,e:[1],t:1,L:[['raimundo','Porque minha mãe morreu naquele quarto. Porque o degrau da frente é o único lugar do mundo onde todo mundo me cumprimenta.'],['raimundo','Isso não entra no formulário.']]},
 {m:3,e:[2],L:[['raimundo','Eu fico até me levarem. Quem tira um velho da casa dele tem que olhar na cara.']]}]);
addAsk('raimundo','processo',[{m:1,e:[1],L:[['raimundo','Foi fila, foi senha, foi um rapaz de gravata que lia meu nome como quem lê o de um produto.'],['raimundo','Perguntaram a renda, o número de moradores e se eu tinha escritura. Escritura eu tinha. Resposta para "e agora", não.']]},
 {m:3,e:[2],L:[['raimundo','Deu para pagar um quarto lá longe. Aluguel e ônibus. A conta não fecha, e ninguém me disse que não ia fechar.']]}]);
addAsk('raimundo','porque',[{k:'ray3',e:[1,2],m:2,t:1,L:[['raimundo','Me disseram que quem assinasse primeiro ia para a frente da fila. Fila de quê, eu perguntei. De casa nova, disseram.'],['raimundo','Tenho sessenta e oito anos. Não tenho idade para fila. Assinei primeiro.']]}]);
addAsk('dandara','aviso',[{m:0,e:[0],L:[['dandara','A associação soube pelo rádio e pelo boato, nessa ordem. Ninguém veio explicar.']]},
 {m:2,e:[1],L:[['dandara','Hoje o aviso vem em pasta timbrada. Antes vinha em boato. Os dois chegam sem pergunta.']]},
 {m:3,e:[2],L:[['dandara','O último aviso a gente soube pela vizinha que arrumava a mudança. Foi o único que ninguém precisou ler.']]}]);
addAsk('dandara','ficar',[{m:1,e:[1,2],t:1,L:[['dandara','Minha mãe nasceu aqui. Eu aprendi a ler aqui. Se eu saio, quem lê a ata para quem não sabe?']]},
 {m:3,e:[2],L:[['dandara','Ficar também cansa. A gente conta os que saíram, de cabeça, todo dia.']]}]);
addAsk('dandara','processo',[{m:1,e:[1],L:[['dandara','A gente pediu uma reunião. Deram um auditório com sessenta lugares para trezentas famílias.'],['dandara','Foi lá que eu aprendi que "participação" é quando você é convidado a ouvir.']]},
 {m:3,e:[2],L:[['dandara','Das mil seiscentas e tantas famílias cadastradas, só cento e três resistiram até agora. Eu conto a minha entre elas.']]}]);
addAsk('dandara','porque',[{k:'dan2',m:3,L:[['dandara','Preenchi o formulário pela mãe porque o dia pode chegar. Não assinei porque ainda não chegou.'],['dandara','Guardar um papel que você espera nunca usar é um jeito caro de ter esperança.']]}]);
addAsk('davi','aviso',[{m:0,e:[0],L:[['davi','Uma vez apareceu um homem pedindo "o responsável pela roda". Eu disse que não tem. Ele anotou mesmo assim.']]},
 {m:2,e:[1],L:[['davi','O convite para o palco veio por escrito, o que já foi estranho. Roda nunca teve papel.']]}]);
addAsk('davi','processo',[{m:1,e:[1],L:[['davi','Chamaram para tocar no palco. Cachê, horário, caixa de som. Eu disse que sim antes de pensar.'],['davi','Pensar é caro. Aluguel é mais.']]},
 {m:3,e:[2],L:[['davi','Agora eu pergunto o horário antes de pegar o tambor. Isso diz tudo.']]}]);
addAsk('davi','ficar',[{m:1,e:[1,2],t:1,L:[['davi','Porque o largo ainda tem eco. Em outro lugar eu teria que aprender a tocar de novo.']]}]);
addAsk('davi','porque',[{k:'roda3',m:3,L:[['davi','Contei da roda porque queria que a roda fosse vista. Acho que fui ingênuo. Acho que fui humano.']]}]);
addAsk('vo','aviso',[{m:1,e:[0],L:[['vo','A moça bateu aqui com um cartão. Disse "só passando". Ninguém só passa com cartão.']]},
 {m:2,e:[1],L:[['vo','A proposta chegou numa sexta, em envelope pardo. Fiquei com ele no bolso do avental até domingo.']]}]);
addAsk('vo','ficar',[{m:1,e:[1,2],t:1,L:[['vo','Porque o forno é mais velho que a moda desta rua. E porque, se eu fecho, a Raimunda da esquina fica sem pão e sem assunto.']]}]);
addAsk('vo','processo',[{m:2,e:[1],L:[['vo','Pensei com o caderno: o que entra, o que sai. Depois pensei sem caderno, e foi aí que doeu.']]},
 {m:3,e:[2],L:[['vo','Hoje o caixa fecha com mais número e menos gente. Eu faço a conta todo dia e não gosto de nenhuma.']]}]);
addAsk('vo','porque',[{k:'vo1',m:3,L:[['vo','Guardei na gaveta porque era o único lugar onde ninguém procura o que eu não quero ver.']]}]);
addAsk('marta','ficar',[{m:2,e:[1,2],L:[['marta','Volto porque a rua é a única coisa que eu sei explicar de olhos fechados.'],['marta','Explico com preço, aliás. É assim que eu fico.']]}]);
addAsk('marta','processo',[{m:1,e:[1],L:[['marta','Me contrataram para "dar vida" ao roteiro. Deram um crachá e uma lista de frases proibidas.']]}]);
addAsk('lucia','aviso',[{m:0,e:[0],L:[['lucia','O aviso é padrão. Colamos na porta e registramos com foto. A data fica no sistema.']]}]);
addAsk('lucia','processo',[{m:1,e:[1,2],L:[['lucia','Cada etapa tem meta de cadastro e de visitação. O que passa disso vai para o relatório.'],['lucia','O que não passa vai para ninguém.']]}]);

const CTX={
 raimundo:[()=>S.era===0&&!has('ray1')?'Tem um papel colado na porta do sobrado dele. Lia ainda não sabe o que diz.':null,()=>has('ray3')?'Lia sabe que ele assinou primeiro. Falta saber o que pesou.':null,()=>has('ray1')&&!has('ray3')?'Lia sabe do aviso. Não sabe o que ele fez depois.':null,()=>S.era===2?'A casa de Seu Raimundo já não é a mesma.':null],
 dandara:[()=>has('dan2')?'Lia sabe do formulário guardado. Dandara não sabe que Lia sabe.':null,()=>S.era===1?'Dandara carrega a pasta como quem carrega uma sala de reunião.':null,()=>S.era===2?'Dandara conta, de cabeça, quem ficou.':null],
 davi:[()=>has('roda3')?'Lia sabe quem contou da roda.':null,()=>S.era>=1?'Davi toca com hora marcada agora.':null],
 vo:[()=>has('vo1')&&!has('vo2')?'Lia viu a proposta na gaveta. A vó não sabe que ela viu.':null,()=>has('vo2')?'A vó pediu tempo para pensar.':null],
 marta:[()=>S.era>=1?'Marta olha o relógio do grupo.':null],
 lucia:[()=>has('prog2')?'Lia sabe por onde a vistoria começa.':null]};
function ctxLine(n){const m=NMS[n.id]+' '+MOOD[clamp(tr(n.id),0,3)]+'.';for(const f of CTX[n.id]||[]){const s=f();if(s)return m+' '+s}return m}

/* objeto da cadeira de Seu Raimundo, ao lado do forno */

/* ---------- interlúdio: um dia como Lúcia, do Programa (1998) ---------- */
WHO.coord={n:'Coordenação',c:BLU,t:CRM};WHO.fiscal={n:'Fiscal',c:BLU,t:CRM};
const VIS=[
 {id:'rai',who:'raimundo',x:690,y:GY+84,loc:'rua',lab:'bater no sobrado de Seu Raimundo'},
 {id:'dan',who:'dandara',x:930,y:GY+66,loc:'rua',lab:'visitar a casa de Dandara'},
 {id:'davi',who:'davi',x:2030,y:GY+72,loc:'rua',lab:'falar com Davi, no largo'},
 {id:'vo',who:'vo',x:600,y:GY+62,loc:'dentro',lab:'falar com Dona Aurea, no balcão'}];
const VBARK={raimundo:'Lá vem a moça da prancheta.',dandara:'Pode vir. Assinar na porta, eu não assino.',davi:'Chegou gente de prancheta. Segura o ritmo.',vo:'Bom dia, Lúcia.'};
function vistNpc(n,dt){n.walk=false;n.talk=false;if(n.bark){n.bark.t-=dt;if(n.bark.t<=0)n.bark=null}
 const v=VIS.find(v=>v.who===n.id);if(!n.warn&&v&&n.loc===S.loc&&Math.abs(n.x-S.px)<300&&!S.vs.done[v.id]){n.warn=1;n.bark={s:VBARK[n.id],t:3.6}}
 if(n.loc===S.loc)n.dir=n.x<S.px?1:-1}
const climaTxt=()=>{const h=S.vs?S.vs.heat:0;return h<=1?'calmo':h<=3?'tenso':h<=5?'pesado':'quente'};

/* cada abordagem devolve o que acontece, e às vezes o resultado muda de um jogo para o outro */
const VISITS={
 rai:{f:'Rai',intro:[['narra','O sobrado de Seu Raimundo tem a porta aberta e o papel do Programa colado ao lado da campainha.'],['raimundo','Dona Lúcia. A moça sempre vem com a prancheta.']],
  k:{cad:{t:'Entregar o formulário e explicar a indenização.',f:()=>({cad:1,h:0,L:[['lucia','O valor está na segunda página. É justo para o que o imóvel vale hoje.'],['raimundo','Para o que vale hoje. E para o que vale a minha vida inteira aqui?'],['narra','Ele lê duas vezes e assina. Você risca o primeiro ponto do dia e tenta não pensar na pergunta.']],out:'Seu Raimundo assinou depois de ler duas vezes. A planilha registra a assinatura e deixa de fora as duas leituras.'})},
     pres:{t:'Dizer que o prazo acaba hoje.',f:()=>Math.random()<.55?({cad:1,coer:1,h:1,L:[['lucia','Quem não assinar hoje entra na lista da próxima etapa, sem negociação.'],['raimundo','Lista de quê, moça?'],['lucia','De quem fica sem acordo. Assina agora, Seu Raimundo.'],['narra','Ele assina com a mão tremendo. Você risca o ponto e evita olhar para a janela.']],out:'Seu Raimundo assinou com medo do prazo. Para a planilha, vale o mesmo que uma assinatura tranquila.'}):({coer:1,h:2,no:1,L:[['lucia','Quem não assinar hoje entra na lista da próxima etapa, sem negociação.'],['raimundo','Eu já assinei uma vez na vida sem ler e me arrependi pelo resto dela.'],['narra','Ele se senta no degrau e cobre o rosto com o chapéu. Do outro lado da rua, uma vizinha abre a janela. Depois outra.'],['narra','Você sai sem ponto e com a sensação de ter sido vista.']],out:'Seu Raimundo recusou depois da ameaça e passou a tarde no degrau. Duas vizinhas viram a cena.'})},
     ouve:{t:'Aceitar o café e ouvir.',f:()=>({h:-1,L:[['raimundo','Entra um instante. O café está frio, mas está aqui.'],['narra','Ele fala dos quarenta anos no mesmo sobrado e do fiado na padaria da Aurea. Você sai sem ponto e sem pressa.']],out:'Seu Raimundo contou de quarenta anos no sobrado. Nenhuma coluna da planilha recebe isso.'})}}},
 dan:{f:'Dan',intro:[['narra','Dandara abre a porta com uma pasta embaixo do braço. Atrás dela, uma lista de nomes escrita à mão.'],['dandara','Se for sobre cadastro, eu já sei do que se trata.']],
  k:{cad:{t:'Entregar o formulário.',f:()=>({h:0,L:[['dandara','Eu leio antes de assinar. A associação lê comigo. Volta com o texto inteiro e com o endereço onde a gente vai morar.'],['narra','Ela devolve o papel sem assinar. Nenhum ponto.']],out:'Dandara devolveu o formulário e pediu o texto inteiro. A planilha registra uma recusa.'})},
     pres:{t:'Dizer que quem recusa fica sem aluguel pago.',f:()=>Math.random()<.5?({coer:1,h:2,L:[['dandara','Isso está escrito em algum lugar? Então escreve, assina e carimba.'],['lucia','É uma orientação.'],['dandara','Orientação a gente leva para a associação. Boa tarde.'],['narra','A porta fecha sem barulho. Você sai sem ponto.']],out:'Dandara levou a ameaça para a associação. Dali em diante, a moça da prancheta passou a ser vista acompanhada.'}):({coer:1,h:2,tag:'lDanGrava',L:[['dandara','Isso está escrito em algum lugar?'],['lucia','É uma orientação.'],['dandara','Então repete devagar. A associação tem um gravador.'],['narra','Ela tira da pasta um gravador de fita e aperta o botão vermelho. Você escuta o clique de uma prova.'],['lucia','Esquece.'],['dandara','Esquecer a gente não esquece. A gente arquiva.']],out:'Dandara gravou a conversa para a ata da associação. A ameaça agora existe em fita.'})},
     ouve:{t:'Ouvir o que a associação pede.',f:()=>({h:-1,L:[['dandara','A gente pede três coisas: o texto inteiro do contrato, um prazo que dê para ler e um endereço perto daqui.'],['narra','Você anota na margem do formulário. O relatório não tem essa coluna.']],out:'A associação pediu texto completo, prazo para ler e endereço perto. O relatório não tem campo para pedidos.'})}}},
 davi:{f:'Davi',intro:[['narra','No largo, Davi afina o tambor com a palma da mão. Ao redor dele, algumas crianças e dois vizinhos.'],['davi','Pode chegar. Hoje o ensaio é aberto.']],
  k:{cult:{t:'Convidar para a programação cultural do Programa.',f:()=>({cult:1,h:0,L:[['lucia','O palco paga cachê e entra no calendário oficial.'],['davi','Cachê eu aceito. Calendário também. E a roda do largo, vai para onde?'],['lucia','A roda continua, no horário do palco.'],['narra','Ele aceita e você registra uma atividade cultural.']],out:'Davi aceitou o palco. A planilha conta uma atividade cultural. A roda do largo muda de horário.'})},
     pres:{t:'Avisar que roda sem autorização será retirada do largo.',f:()=>Math.random()<.6?({coer:1,h:1,L:[['davi','Retirada por quem?'],['lucia','Pela fiscalização. Eu só estou avisando.'],['narra','O tambor para. As crianças olham para você e depois para ele. Nenhum ponto.']],out:'Davi parou de tocar no largo depois do aviso. A planilha não tem linha para silêncio.'}):({coer:1,h:2,tag:'lDaviAlto',L:[['davi','Retirada por quem?'],['lucia','Pela fiscalização. Eu só estou avisando.'],['narra','Davi bate duas vezes no couro. Do banco, outro tambor responde. Depois um terceiro. Em um minuto, o largo inteiro tem pulso.'],['davi','Pode avisar, moça. Eles já ouviram.']],out:'O aviso virou ensaio aberto: vinte pessoas no largo, tambor alto. A planilha não tem campo para eco.'})},
     ouve:{t:'Ficar para ouvir a roda inteira.',f:()=>({h:-1,L:[['narra','Você fica até o fim da música. Os vizinhos abrem espaço no banco e você senta.'],['davi','Quem escuta até o fim já entendeu metade do que a gente faz aqui.']],out:'Lúcia ouviu a roda inteira. O dia dela rendeu uma música e nenhum ponto.'})}}},
 vo:{f:'Vo',intro:[['narra','Dentro da padaria, Dona Aurea sova a massa. Atrás do balcão, a neta varre devagar e finge não ouvir.'],['vo','Bom dia, Lúcia. Pão ou prancheta?']],
  k:{prop:{t:'Apresentar a proposta de aluguel do Programa.',f:()=>({h:0,L:[['lucia','O Programa propõe alugar o ponto, com reforma paga e preço de mercado.'],['vo','Preço de mercado de quem? Meu pão não segue tabela.'],['narra','Ela guarda o papel na gaveta do caixa. Você anota "em análise". Nenhum ponto.']],out:'Dona Aurea guardou a proposta na gaveta do caixa. A planilha registra "em análise".'})},
     pres:{t:'Dizer que a vistoria pode interditar o forno.',f:()=>Math.random()<.6?({cad:1,coer:1,h:1,L:[['lucia','Se a vistoria encontrar irregularidade, o forno é interditado até a reforma.'],['vo','Faz trinta anos que ele acende todo dia.'],['lucia','Assinando a proposta, a vistoria é só formalidade.'],['narra','A vó limpa as mãos no avental e assina. Atrás do balcão, a neta para de varrer. Você risca o ponto.']],out:'Dona Aurea assinou depois de ouvir falar em interdição. A planilha conta um ponto. Lia viu tudo.'}):({coer:1,h:2,no:1,L:[['lucia','Se a vistoria encontrar irregularidade, o forno é interditado até a reforma.'],['vo','Interdita, então. Eu acendo o forno na calçada.'],['narra','A neta larga a vassoura e abre a porta para você. Ninguém precisa dizer nada.'],['narra','Você sai sem ponto, e a porta fecha atrás de você com o sino alto demais.']],out:'Dona Aurea recusou assinar sob ameaça e mandou a neta abrir a porta. A planilha registra uma recusa.'})},
     ouve:{t:'Aceitar o café e conversar.',f:()=>({h:-1,L:[['vo','Senta. A massa descansa, a conversa também.'],['narra','Ela conta que o forno é de antes do bairro virar vitrine. Você sai com um pão embrulhado e nenhum ponto.']],out:'Dona Aurea ofereceu pão e conversa. A planilha continua em branco.'})}}}};

const OPEN=()=>[
 ['narra','A rua parece mais curta quando se anda com uma prancheta.'],
 ['coord','Lúcia, a lista da Rua de Baixo está atrasada. Preciso de três pontos no relatório até o fim do dia.'],
 ['lucia','Pontos de quê?'],
 ['coord','Cadastro assinado vale um. Participação na programação cultural vale um. O resto não entra na planilha.'],
 ['coord','O secretário visita a etapa na semana que vem. Se a Rua de Baixo não fechar, a gente muda a coordenação.'],
 {ch:[
  {t:'Entendido. Hoje eu fecho a lista.',fn:()=>{F.lMeta='aceita'},r:[['coord','É isso que eu queria ouvir.']]},
  {t:'Três pontos num dia é muita coisa para uma rua dessas.',fn:()=>{F.lMeta='reclama';S.vs.pressure=1},r:[['coord','Se fosse fácil, eu mandava outra pessoa. Estou mandando você.'],['narra','Você ouve, por baixo da frase, o que ela não diz.']]},
  {t:'Para onde vai quem sai da rua?',fn:()=>{F.lMeta='pergunta'},r:[['coord','Isso é com a realocação. Foque no cadastro.'],['narra','A pergunta fica sem resposta, como boa parte das perguntas boas.']]}]},
 ['narra','O dia começa com uma apresentação do Programa aos moradores, no largo. Depois, quatro endereços na lista.']];

const ASSEMB=()=>[
 ['narra','Largo do Pelourinho, onze da manhã. Cadeiras de plástico em roda, faixa do Programa, microfone que chia. Uns quarenta moradores e dois fiscais de colete.'],
 ['coord','(no ouvido) Dez minutos. Convença sem prometer o que não temos.'],
 ['narra','Você tem um roteiro com três frases para abrir a fala. Escolha a que vai usar.'],
 {ch:[
  {t:'A rua vai ser o cartão-postal da Bahia, e vocês vão estar nela.',fn:()=>{S.vs.pitch='postal'},r:[['narra','É a visão de céu aberto: a rua inteira como vitrine, sem ingresso, para quem passa. O que é visto atrai quem paga.']]},
  {t:'Cada real público investido volta em emprego e renda para o bairro.',fn:()=>{S.vs.pitch='numero'},r:[['narra','É a lógica do desenvolvimento por retorno: reforma-se o que dá resultado que se possa medir, e o resto vem depois, em tese.']]},
  {t:'Quem precisar sair será indenizado, e a rua vai melhorar para todos.',fn:()=>{S.vs.pitch='troca'},r:[['narra','"Para todos" é a parte mais difícil de conferir.']]}]},
 {lazy:()=>({postal:[['narra','Aplausos curtos, quase todos de quem não mora ali.']],numero:[['narra','Um senhor no fundo pergunta: "Retorno de quem?" Ninguém responde.']],troca:[['narra','O murmúrio vem de todos os lados ao mesmo tempo. "Indenizado por quanto?"']]})[S.vs.pitch]},
 ['narra','Dandara se levanta com uma pasta.'],
 ['dandara','Dona Lúcia, o texto do acordo está aqui na minha mão. Tem onze páginas e nenhuma diz para onde vão as pessoas.'],
 ['dandara','A senhora sabe para onde elas vão?'],
 {ch:[
  {t:'O roteiro prevê que o destino seja definido caso a caso.',fn:()=>{S.vs.ans='roteiro';S.vs.heat+=1},r:[['dandara','Caso a caso é o jeito de não responder a ninguém.'],['narra','Alguns aplaudem por educação. Outros deixam a cadeira vazia.'],['coord','(no ouvido) Bom. Sem promessa. Continua.']]},
  {t:'Eu ainda não sei para onde vão todos. Posso levar a pergunta à Coordenação.',fn:()=>{S.vs.ans='honesta';S.vs.pressure=1},r:[['narra','O largo faz um silêncio de quem ouviu algo novo.'],['coord','(no ouvido) O que foi isso? Eu disse sem prometer, não sem informar.'],['lucia','Informar é o que estou fazendo.'],['narra','O fone fica mudo um segundo a mais.']]},
  {t:'Quem sair vai ficar perto daqui. Eu garanto.',fn:()=>{S.vs.ans='promessa';S.vs.prom=1;S.vs.heat+=1},r:[['narra','Um alívio passa pela plateia como vento num varal.'],['dandara','A senhora garante por escrito?'],['lucia','Eu garanto de boca.'],['dandara','Então anotem: a moça garantiu de boca.'],['narra','Você sabe que não pode cumprir. A frase já saiu.']]}]},
 ['narra','A assembleia termina sem votação. O que fica é a sensação de que o público nunca foi um só.']];

function midCall(next){const V=S.vs;openDlg([
 ['narra','O telefone do carro toca. Coordenação.'],
 ['coord','Quatro e meia o secretário quer o parcial. Se a Rua de Baixo não fechar, a etapa muda de coordenação.'],
 ['coord','E a coordenação nova não vai querer sentar com a associação.'],
 {ch:[
  {t:'Entendi. Vou apertar o ritmo.',fn:()=>{V.heat+=1;V.pressure=1},r:[['coord','Assim eu gosto. Pontos, não histórias.']]},
  {t:'Dois pontos bem feitos valem mais que três mal fechados.',fn:()=>{V.pressure=1},r:[['coord','Dois bem feitos é um mal fechado. Você tem até as cinco.']]},
  {t:'Quem define essas metas já pisou nessa rua?',fn:()=>{V.heat=Math.max(0,V.heat-1)},r:[['coord','Quem define as metas mede o Programa inteiro, Lúcia. Não a rua.'],['narra','A ligação cai antes de você responder.']]}]}],next)}

/* o incidente: depende do clima do dia, com um empurrão que a jogadora não vê */
function stageLargo(kind){S.fx={crowd:kind==='calmo'?9:kind==='protesto'?20:24,fire:0,ban:kind==='calmo'?0:1};
 placeNpc('dandara',1930,GY+62,1);placeNpc('davi',2090,GY+60,-1);placeNpc('raimundo',1830,GY+68,1)}
function setInc(res,h){F.incRes=res;S.vs.heat+=h||0}
const INC={
 calmo:()=>[
  ['narra','Antes de chegar ao carro, Dandara te alcança no largo. Atrás dela, uma dúzia de vizinhos com cara de quem ensaiou.'],
  ['dandara','Você mede a casa dos outros e não sabe o nome de quem mora nelas.'],
  ['lucia','Eu sei o nome de todos que assinaram.'],
  ['dandara','E dos que não assinaram?'],
  ...(S.vs.prom?[['dandara','A senhora garantiu "perto". Onde fica o perto?'],['lucia','Eu estou apurando.']]:[]),
  ['narra','Seu Raimundo e Davi se aproximam. Ninguém levanta a voz. Isso é pior.'],
  {ch:[
   {t:'Sentar no banco e pedir que leiam os três pedidos da associação.',a:1,fn:()=>setInc('dialogo',-1),r:[['dandara','Texto inteiro do acordo. Prazo para ler. Endereço perto.'],['lucia','Eu levo à Coordenação. Não prometo resposta.'],['dandara','Promete só que leva. A resposta a gente cobra.'],['narra','Você anota os três pedidos na margem da prancheta. É a primeira vez que a prancheta serve para anotar o que as pessoas dizem.']]},
   {t:'O Programa não negocia caso a caso. Existe um regulamento.',fn:()=>setInc('rigido',1),r:[['dandara','Regulamento escrito por quem não mora aqui.'],['lucia','Escrito por quem precisa tratar todo mundo igual.'],['dandara','Igual é o que a gente não é.'],['narra','Os vizinhos se afastam em silêncio, em fila, como numa procissão sem santo.']]},
   {t:'Peço desculpas pela abordagem de hoje. Posso voltar outro dia, com mais tempo.',fn:()=>setInc('sai',0),r:[['dandara','Voltar outro dia com mais tempo muda o prazo?'],['lucia','Não depende de mim.'],['dandara','Nunca depende.']]}]}],
 protesto:()=>[
  ['narra','No largo, o som do tambor sobe antes de você ver quem toca. Uns vinte moradores subiram no palco da programação, com panos pintados.'],
  ['narra','"CASA NÃO É ESTATÍSTICA". "TEXTO INTEIRO". "NÓS FICAMOS".'],
  ['davi','Esse palco é para ter roda. Se for só para ter show, ele fica vazio.'],
  ['dandara','Chamamos o Programa para ouvir. A moça da prancheta está aí?'],
  ...(S.vs.prom?[['dandara','Ela garantiu "perto" de boca. Estamos aqui para cobrar a boca.']]:[]),
  ...TVP('protesto'),
  ['narra','Todos olham para você. Dois fiscais de colete também, esperando um sinal. A sirene fica mais perto.'],
  {ch:[
   {t:'Subir no palco e ler os três pedidos no microfone.',a:1,fn:()=>setInc('mediacao',-2),r:[['narra','O microfone chia. Você lê devagar: "Texto inteiro do contrato. Prazo para ler. Endereço perto."'],['narra','Quando você termina, o largo faz um silêncio inteiro. Depois, um aplauso curto, sem festa, de gente que ouviu o que pediu.'],['dandara','Era só isso que a gente queria ouvir alto.'],...POL('recua')]},
   {t:'Fazer sinal para a fiscalização retirar o pessoal do palco.',a:1,fn:()=>setInc('pm',2),r:[['fiscal','Pessoal, desce. A Polícia já está subindo.'],['davi','Programação de quem?'],...POL('pm')]},
   {t:'Ficar de lado, anotar quem está lá e filmar para o relatório.',a:1,fn:()=>setInc('lista',1),r:[['narra','Você anota nomes. Reconhece cada rosto, e cada rosto reconhece a prancheta.'],['dandara','Está anotando para quê, Dona Lúcia?'],['lucia','Para o relatório.'],['dandara','Então escreve certo: a gente estava aqui pedindo para ler.'],...POL('pass')]}]}],
 fogo:()=>[
  ['narra','Quando você chega ao largo, o tambor parou. Um grupo grande cerca o palco da programação. Alguém grita o seu nome, outro grita o do Programa.'],
  ['dandara','Para com isso! Ninguém combinou isso!'],
  ['narra','Uma garrafa passa por cima das cabeças e bate no tapume. Outra. A tinta velha sobe em estalos.'],
  {fn:()=>{S.fx.fire=1}},
  ['narra','O palco pega fogo por baixo, devagar primeiro, e depois de uma vez.'],
  ['narra','No meio da correria, você vê a neta de Dona Aurea com um balde na mão. Ela olha para você sem dizer nada.'],
  ...(S.vs.prom?[['dandara','"Perto" a senhora garantiu! Perto era isso?']]:[]),
  ['davi','Foi quem? Gente, foi quem?'],
  ...TVP('fogo'),
  {ch:[
   {t:'Chamar a polícia e a fiscalização pelo rádio.',a:1,fn:()=>setInc('pm',0),r:[['narra','Você aperta o botão do rádio. A resposta vem antes de a frase acabar: já estão subindo.'],...POL('pm'),['narra','Ninguém sabe ainda quem jogou a primeira garrafa.']]},
   {t:'Pegar um balde e ajudar a apagar.',a:1,fn:()=>setInc('ajuda',-1),r:[['narra','Você corre até a torneira do chafariz com um balde emprestado. Atrás de você, uma fila de moradores se forma sem ninguém organizar.'],...POL('ajuda'),['narra','O fogo cede antes que alcance a igreja. Sua mão fica vermelha da alça de metal.'],['dandara','Eu não sei de que lado a senhora está, mas a mão é a mesma.']]},
   {t:'Correr para o carro e esperar passar.',a:1,fn:()=>setInc('fuga',1),r:[['narra','Você tranca as portas. Pelo para-brisa, o largo parece um cartaz de si mesmo: tudo muito iluminado, nada no lugar.'],['narra','Alguém bate no vidro do carro, uma, duas vezes. Você não abre.'],...POL('pass')]}]}]};

function startIncident(){const V=S.vs;V.roll=Math.random()<.4?1:0;const lv=V.heat+V.roll;const kind=lv>=5?'fogo':lv>=3?'protesto':'calmo';V.kind=kind;F.inc=kind;F.incRes=null;
 S.scene='fade';0;
 setTimeout(()=>{setLoc('rua',1975,GY+72);S.face=1;stageLargo(kind);S.scene='play';
  openDlg([['narra',['Fim da lista. A tarde cai sobre o largo, e uma conversa te alcança antes do carro.','Fim da lista. Você ouve o tambor antes de dobrar a esquina do largo.','Fim da lista. O cheiro de fumaça chega primeiro, depois o barulho.'][kind==='calmo'?0:kind==='protesto'?1:2]]].concat(INC[kind]()),reflect)},650)}

function reflect(){const k=F.inc,res=F.incRes,V=S.vs;
 const CR={dialogo:'Você sentou com a associação? Hoje pode. Amanhã a gente alinha o discurso.',rigido:'Dia limpo. O resto é ruído.',sai:'Pediu desculpas a morador? Isso não está no manual.',mediacao:'Leu os pedidos em público, sem aviso? Conversamos amanhã, antes que o secretário saiba por outro lado.',pm:k==='fogo'?'Incêndio no palco. Isso é capa de jornal. Quem chamou a fiscalização?':'Fiscalização no largo vai sair no jornal. Quero uma frase pronta.',lista:'Ótimo, nomes. Vão para o jurídico.',ajuda:'Você apagou fogo com a mão? Vai para casa. Amanhã o secretário quer ouvir você.',fuga:'Você saiu do local? Isso consta no relatório.'};
 S.scene='fade';setTimeout(()=>{S.scene='play';openDlg([
  ['narra','O carro do Programa. Sob o limpador de para-brisa, uma folha de caderno dobrada: os três pedidos da associação, na letra de Dandara. Embaixo: "Leia inteiro antes de assinar o relatório."'],
  ['coord',CR[res]||'Resumo do dia. Quero números e uma frase para o secretário.'],
  ...(F.pol==='bateu'?[['coord','O Secretário gostou da rapidez. Vai dizer na TV que o largo foi restabelecido.']]:F.pol==='recuou'?[['coord','O oficial voltou sem avançar. O Secretário quer saber quem decidiu que não precisava.']]:[]),
  ...(V.pressure?[['coord','E lembra: a coordenação nova não vai querer sentar com a associação.']]:[]),
  {ch:[
   {t:'Eu gosto do que a rua vai ficar. Alguém tem que fazer esse trabalho.',fn:()=>{F.lucia='conv'},r:[['coord','Gosto de ouvir isso.'],['narra','Você diz como quem repete uma frase aprendida. Funciona. Quase sempre funciona.']]},
   {t:'Eu sinto muito pelo que fiz hoje.',fn:()=>{F.lucia='culpa'},r:[['coord','Sente depois. Hoje fecha o relatório.'],['narra','Você diz baixo, para o painel do carro, e fica um tempo olhando a folha dobrada.']]},
   {t:'Se eu não fizer, mandam alguém pior, e eu perco o emprego.',fn:()=>{F.lucia='medo'},r:[['coord','Exatamente. E eu não gostaria de ter que mandar.'],['narra','Você não sabe se foi um conselho ou uma ameaça. Em qualquer caso, guarda a folha no bolso.']]}]}],endVist)},500)}

function startInterlude(){
 S.mode='vist';S.pl='lucia';S.vs={done:{},out:{},cad:0,cult:0,coer:0,heat:0,pressure:0,pitch:null,ans:null,prom:0,mid:0};S.fx={crowd:0,fire:0,ban:0};S.era=1;S.min=630;S.rain=false;S.sign='PADARIA';S.tray=[];S.closing=false;S.menu=null;S.d=null;S.trans=null;S.bant=[];S.staff=[];S.busX=0;S.q=null;
 ['lMeta','lDanGrava','lDaviAlto','lRaiNo','lVoNo','inc','incRes','lucia','pol','polGrito','polLiga','polOlhou'].forEach(k=>delete F[k]);
 initEra();S.extras=S.extras.filter(a=>a.kid);
 const mk=(id,[x,y],loc,dir)=>({id,x,y,dir,walk:false,hidden:false,closed:false,mute:0,ph:hsh(id.length,id.charCodeAt(1),2)*6,bark:null,barkT:99,served:true,loc,hideAt:null});
 S.npcs={raimundo:mk('raimundo',AN.sobrado,'rua',1),dandara:mk('dandara',AN.casaDan,'rua',1),davi:mk('davi',AN.palco,'rua',-1),vo:mk('vo',AN.caixa,'dentro',1)};
 setLoc('rua',1080,GY+84);S.face=-1;chipsReset();
 showCard(`<div class="cin dense"><div class="year">1998</div><h2>O outro lado</h2><p>Hoje você joga como Lúcia, técnica do Programa. A Lia e a vó Aurea ficam do outro lado do balcão.</p><p>O dia começa numa assembleia no largo. Depois você tem quatro endereços na lista. Em cada porta, escolha como abordar. A rua reage ao que você faz, e o clima do dia pesa no fim da tarde.</p><p class="tip">A planilha do Programa só conta duas coisas: cadastro assinado e atividade cultural. O que acontece no meio do caminho fica de fora.</p><p class="note">Falas e personagens fictícios. A lógica de metas e cadastros vem do artigo de Sant\'Anna.</p></div>`,'Sair com a prancheta',()=>{
  S.card=null;0;0;S.scene='play';hud();0;S.speaker=null;
  openDlg(OPEN(),goAssembly)})}
function goAssembly(){S.scene='fade';0;
 setTimeout(()=>{setLoc('rua',2010,GY+72);S.face=-1;S.fx.crowd=14;S.scene='play';
  openDlg(ASSEMB(),()=>{S.fx.crowd=0;S.scene='fade';
   setTimeout(()=>{setLoc('rua',1700,GY+88);S.face=-1;S.scene='play';S.speaker=null;
    openDlg([['narra','Fim da assembleia. A lista tem quatro endereços e a manhã ainda não acabou.'],['narra','Chegue perto de cada pessoa e aperte E. O clima da rua muda conforme você aborda cada uma.']])},500)})},500)}
function chipsReset(){S.chipK=null}
function doVisit(v){const V=S.vs;if(V.done[v.id]){toast('Esse endereço já foi riscado da lista.');return}
 const D=VISITS[v.id],ks=Object.keys(D.k);S.speaker=null;
 const ch=ks.map(k=>({t:D.k[k].t,a:1,fn:()=>{V.cur=D.k[k].f();vres(v.id,k,V.cur)},r:[{lazy:()=>V.cur.L}]}));
 openDlg(D.intro.concat([{ch}]),afterVisit)}
function vres(id,k,v){const V=S.vs;V.done[id]=k;V.out[id]=v.out;V.cad+=v.cad||0;V.cult+=v.cult||0;V.coer+=v.coer||0;V.heat=Math.max(0,V.heat+(v.h||0));
 const f=VISITS[id].f;F['l'+f]=k;if(v.no)F['l'+f+'No']=true;if(v.tag)F[v.tag]=true;S.fx.crowd=Math.min(12,V.heat*2);S.chipK=null;hud()}
function afterVisit(){hud();const V=S.vs,n=Object.keys(V.done).length;
 if(n===2&&!V.mid){V.mid=1;midCall(afterVisit);return}
 if(n>=4)startIncident()}
function endVist(){const V=S.vs,pts=V.cad+V.cult;
 const row=(a,b,cl)=>`<div class="cxr${cl?' '+cl:''}"><span>${a}</span><b>${b}</b></div>`;
 const out=['rai','dan','davi','vo'].map(id=>'<li>'+V.out[id]+'</li>').join('');
 const INCT={calmo:'Conversa tensa no largo, sem violência.',protesto:'Manifestação no largo. A programação oficial foi interrompida.',fogo:'Quebra-quebra no largo. O palco da programação pegou fogo.'}[F.inc];
 const POLT={bateu:' A Polícia Militar entrou no largo e bateu em quem estava. Dandara ficou ferida e Davi foi detido.',recuou:' A Polícia Militar chegou e não avançou.'}[F.pol]||'';
 const RES={dialogo:'Lúcia sentou com a associação e levou os pedidos à Coordenação.',rigido:'Lúcia repetiu o regulamento. A associação foi embora em silêncio.',sai:'Lúcia pediu desculpas e saiu.',mediacao:'Lúcia leu os pedidos da associação no microfone.',pm:'A fiscalização retirou o pessoal. Três pessoas foram levadas, entre elas Davi.',lista:'Lúcia anotou os nomes de quem estava no protesto.',ajuda:'Lúcia ajudou os moradores a apagar o fogo e queimou a mão.',fuga:'Lúcia saiu do local e esperou no carro.'}[F.incRes];
 const ST={conv:'Lúcia saiu do dia convicta de que alguém precisa fazer esse trabalho.',culpa:'Lúcia saiu do dia sentindo muito pelo que fez.',medo:'Lúcia saiu do dia com medo do que acontece se ela falhar.'}[F.lucia];
 const meta=pts>=3?'Meta batida.':pts===2?'Faltou um ponto.':'Meta distante.';
 S.speaker=null;S.fx.fire=0;S.fx.pan=null;
 showCard(`<div class="cin cx dense"><h2>Relatório do dia</h2><div class="cxp">${row('Cadastros assinados',V.cad)}${row('Programação cultural',V.cult)}${row('Pontos',pts+' de 3 · '+meta,'tot')}${V.coer?row('Abordagens com ameaça',V.coer,'dim'):''}${row('Clima ao fim do dia',({calmo:'conversa tensa',protesto:'manifestação',fogo:'quebra-quebra'})[F.inc],'dim')}</div><div class="news"><b>O que a planilha não registra</b><ul>${out}<li>${INCT} ${RES||''}${POLT}</li>${ST?'<li>'+ST+'</li>':''}</ul></div><p class="note">Falas e personagens fictícios. A lógica de metas e cadastros vem do artigo de Sant\'Anna.</p></div>`,'Seguir para o ano 2000',endInterlude)}
function endInterlude(){S.mode='rua';S.pl=null;S.vs=null;S.fx={crowd:0,fire:0,ban:0};startEra(2)}

/* efeitos visuais: gente no largo, faixas, fogo e o palco queimado */
const BAN=['CASA NÃO É ESTATÍSTICA','TEXTO INTEIRO','NÓS FICAMOS','ENDEREÇO PERTO','RODA NÃO TEM PREÇO'];
const CROWD_LOOKS=[{body:PINK,pants:BLU},{body:GRN,pants:OUT},{body:ORA,pants:CRM},{body:YEL,pants:BLU},{body:CRM,pants:PLUM},{body:BLU,pants:CRM},{body:PLUM,pants:OUT}];
/* o que a rua sabe em 2000 depois do dia da Lúcia */
const incNews=()=>{const r=F.incRes,L=[];
 if(F.inc==='fogo'){L.push(['radio','Quatro anos depois do incêndio que destruiu o palco do largo, no Centro Histórico, a programação oficial continua suspensa. O Programa diz que mantém a vigilância.'],['narra','O rádio da vó repete a palavra "vigilância" duas vezes.'])}
 else if(r==='mediacao'){L.push(['radio','Desde 1996, a associação de moradores tem do Programa um prazo ampliado para ler contratos de indenização. O Programa afirma que a medida continua provisória.'])}
 if(F.pol==='bateu')L.push(['radio','Em 1996, a Polícia Militar dispersou uma manifestação no largo do Pelourinho. Segundo o Governo, houve resistência. Quatro anos depois, moradores ainda falam em feridos e em uma pessoa detida.'],['narra','O rádio da vó termina a notícia e começa uma música alegre. A vó desliga.']);
 else if(!L.length)L.push(['radio','Em 1996, a fiscalização retirou manifestantes do palco do largo. Três pessoas foram levadas para prestar esclarecimentos.']);
 return L};
NARR[2].push({id:'inc',h:8.9,loc:'dentro',radio:1,if:()=>F.inc==='fogo'||F.incRes==='mediacao'||F.incRes==='pm'||F.incRes==='lista'||F.pol==='bateu',L:incNews});
INTRO.davi[2]=()=>F.inc==='fogo'?[['narra','Com o palco queimado e a programação suspensa, Davi toca na calçada, olhando para o tapume.']]:(F.incRes==='pm'||F.pol==='bateu')?[['narra','Davi passou uma noite fora de casa depois da confusão no largo. Agora toca mais baixo.']]:[['narra','Davi toca no palco com hora marcada. Entre uma música e outra, olha para a roda que sobrou.']];
INTRO.dandara[2]=()=>F.pol==='bateu'?[['narra','Dandara mantém o braço junto ao corpo, com a tipoia que o largo lhe deu. Fala menos alto e anota mais.']]:[['narra','Dandara continua morando na rua, mesmo depois que metade dos vizinhos saiu.']];

/* ---------- a TV do Secretário, a polícia no largo, o bairro de antes e o arquivo ---------- */
WHO.tv={n:'TV · o Secretário',c:PLUM,t:CRM};WHO.pm={n:'Policial',c:BLU,t:CRM};
WHO.ze={n:'Seu Zé',c:YEL,t:OUT};WHO.zefa={n:'Dona Zefa',c:PINK,t:OUT};WHO.nego={n:'Seu Nego',c:GRN,t:OUT};

/* ---- painéis de tela cheia: a TV e a cena da polícia ---- */
function setPan(k,st){const f=S.fx;f.pan=k;f.panT=S.t;if(k==='pm'){f.pmP=st||0;f.pmS=st||0;f.pmT=S.t}}
function pmStage(n){const f=S.fx;f.pmP=f.pmS||0;f.pmS=n;f.pmT=S.t}
/* ---- o discurso na TV e a polícia: falas por tipo de dia ---- */
const TVP=kind=>kind==='fogo'?[
 ['narra','Na vitrine do bar, uma televisão interrompe a novela. A tela mostra o largo visto de cima, com a fumaça desenhada como um mapa.'],
 {fn:()=>setPan('tv')},
 ['tv','O Governo do Estado condena a violência e o vandalismo no Pelourinho. Os responsáveis serão identificados e responderão pelos atos.'],
 ['tv','Quem põe fogo no patrimônio da Bahia não fala por morador nenhum. Este largo foi devolvido ao povo depois de décadas de abandono.'],
 ['tv','O Governo determinou à Polícia Militar que atue com rigor. O Pelourinho não vai voltar ao que era.'],
 {fn:()=>setPan(null)},
 ['narra','Alguém no bar desliga a tela. A fumaça lá fora é a mesma, só que agora tem versão oficial.']]
:[
 ['narra','No bar da esquina, alguém sobe o volume da televisão. A programação para no meio de uma música.'],
 {fn:()=>setPan('tv')},
 ['tv','Boa tarde. O Governo do Estado lamenta o que acontece hoje no Centro Histórico, num largo que voltou à Bahia depois de décadas de abandono.'],
 ['tv','Este espaço foi recuperado com dinheiro público. Quem quer ser ouvido tem gabinete, tem protocolo e tem a porta do Programa aberta.'],
 ['tv','Quem morava ali recebeu indenização. Quem fica na rua atrapalhando a programação está contra o emprego, contra o turismo e contra o futuro desta cidade.'],
 ['tv','A Polícia Militar está a caminho. A ordem é restabelecer o largo agora, sem negociação com quem atrapalha.'],
 {fn:()=>setPan(null)},
 ['dandara','Ouviram? "Quem atrapalha". Somos nós.'],
 ['davi','Indenização de mil e duzentos. Dá para pagar o gás, não a casa.'],
 ['narra','No alto da ladeira, uma sirene começa.']];

function POL(kind){
 if(kind==='recua')return[
  ['narra','A viatura chega pela lateral da igreja, no último parágrafo do que você leu. Dois policiais descem com escudo na mão.'],
  {fn:()=>{F.pol='recuou';setPan('pm',0)}},
  ['pm','Disseram "baderna". Isso aqui é gente lendo.'],
  ['dandara','É gente que pediu para ser lida.'],
  ['narra','O oficial olha para a televisão do bar, depois para o palco, depois para você. Ninguém dá a ordem de avançar.'],
  ['pm','Dez minutos. Depois o largo fica limpo, por bem ou por mal.'],
  {fn:()=>setPan(null)},
  ['narra','Eles ficam. Ninguém apanha. Ficar parado também foi uma decisão, e dessa vez foi de quem estava lendo.']];
 const entra=kind==='ajuda'?[
   ['narra','Na fila de baldes, a senhora do tabuleiro passa a água de mão em mão. A linha da Polícia Militar entra pelo lado da igreja.']]
  :kind==='pm'?[
   ['narra','A viatura sobe a ladeira com a sirene aberta. A linha da Polícia Militar entra pelo lado da igreja, escudo na frente, cassetete na mão.'],
   ['fiscal','Pessoal, é a polícia. Quem quiser sair, sai agora.'],
   ['davi','Sair para onde? Aqui é a minha rua!']]
  :[['narra','A viatura sobe a ladeira antes de qualquer pedido. A ordem já tinha vindo pela televisão. A linha da Polícia Militar entra pelo lado da igreja.']];
 const bate=kind==='ajuda'?[
   ['narra','Um policial derruba o balde na calçada. Outro empurra quem estava na fila. Ninguém ali tinha pedra na mão. Tinham balde.'],
   {fn:()=>pmStage(1)},
   ['dandara','Estão apagando o fogo! Estão apagando!'],
   ['narra','O cassetete responde por eles. A água escorre pelo largo junto com o que sobrava da roda. Dandara leva uma cassetada no braço, tentando tirar um menino do meio.'],
   ['narra','Davi é derrubado no degrau do palco e algemado com o rosto no chão.']]
  :[
   ['narra','Ninguém dá a voz de dispersar. O primeiro cassetete desce no tambor, o segundo em quem estava segurando.'],
   {fn:()=>pmStage(1)},
   ['narra','Uma bomba de gás rola entre os pés da roda. As faixas caem. Uma senhora se curva e não consegue levantar.'],
   ['dandara','Para! Tem criança aqui! Para!'],
   ['narra','Dandara se põe na frente de um menino e leva uma cassetada no braço.'],
   ['narra','Davi é derrubado no degrau do palco e algemado com o rosto no chão.']];
 const fim=[{fn:()=>{pmStage(2);F.pol='bateu'}},
   ['narra','Dois minutos. O largo esvazia como se alguém tivesse puxado uma tampa. Ficam o tambor, uma faixa pisada e o cheiro de gás.']];
 const reag=kind==='pm'?[{ch:[
   {t:'Parem! Eles estão desarmados!',fn:()=>{F.polGrito=true},r:[['narra','Sua voz sai fina. O oficial olha para o crachá no seu peito, depois para a prancheta.'],['pm','Moça, a ordem não é minha. Veio de cima. Se a senhora é contra, procura quem assinou.'],['narra','Ele diz "procura quem assinou" como quem passa o número de alguém que nunca atende.']]},
   {t:'Ligar para a Coordenação e pedir que mandem recuar.',a:1,fn:()=>{F.polLiga=true},r:[['narra','O telefone toca duas vezes.'],['coord','Quem mandou entrar não foi a Coordenação, Lúcia. Veio da televisão, e a televisão não atende a gente.'],['narra','Você desliga com a sensação de ter ligado para um lugar onde ninguém mora.']]},
   {t:'Ficar parada e olhar.',a:1,fn:()=>{F.polOlhou=true},r:[['narra','Você aperta a prancheta contra o peito e percebe que ela serve de escudo, só que de papel.'],['narra','Dandara te vê do outro lado do largo, com uma mão segurando o próprio braço. Ela não grita o seu nome. Isso é pior.']]}]}]:[];
 return[...entra,{fn:()=>setPan('pm',0)},...bate,...fim,...reag,{fn:()=>{setPan(null);S.fx.crowd=3;S.fx.ban=0}}]}

/* ---- tarefa do bairro vivo ---- */
Object.assign(CLUES,{
 bai1:['bai','A caixinha','Todo sábado a rua bota o que pode numa lata e quem tem urgência levanta. Ninguém assina e todo mundo sabe quanto tem.'],
 bai2:['bai','O fiado como memória','O caderno do fiado guarda quem passou aperto, e não quem deve. No fim do mês, quem pode paga o seu e o do vizinho.'],
 bai3:['bai','O mutirão do telhado','Quando o telhado de Dona Zefa caiu, a rua levantou outro em dois sábados, sem contrato e sem medição.'],
 bai4:['bai','O quintal de ninguém','Atrás dos sobrados há um quintal com mangueira que ninguém sabe de quem é. A fruta é da rua.'],
 bai5:['bai','Organização sem carimbo','Pesquisas do Estado descreveram quem morava aqui como gente sem organização. A rua tinha, só que fora do papel.']});
THREADS.bai={t:'O bairro de antes',c:'#C7B3FF',none:'O bairro funcionava. Lia nunca viu como.',part:'Parte do que sustentava a rua nunca entrou em planilha.',full:'O bairro tinha organização própria. Só não tinha carimbo.'};
QUESTS.splice(1,0,{id:'q0c',e:[0],h:11,h1:16.8,lab:'sentar na mesa de dominó, na calçada',cost:40,tg:{loc:'rua',x:850,y:GY+102,lab:'sentar na mesa de dominó'},
 give:()=>[['vo','Lia, falta um para fechar a mesa de dominó do Seu Zé. Ele pediu que você sentasse um pouco.'],['vo','Vai sem pressa. Aquela calçada conta as coisas antes de qualquer jornal, e conta de graça.']],
 stage:()=>{},
 scene:()=>{const used={};
  const POOL=[
   {id:'caixinha',show:()=>true,t:'Como funciona essa caixinha?',fn:()=>gain('bai1'),r:[['ze','Todo sábado cada um bota o que pode numa lata. Quem tem urgência levanta. Ninguém assina e todo mundo sabe quanto tem.'],['zefa','Já pagou enterro, já pagou mensalidade de escola, já pagou a máquina de costura da Rita.'],['nego','Banco pergunta salário. A lata pergunta "precisa de quanto?".']]},
   {id:'fiado',show:()=>true,t:'E o fiado da minha avó?',fn:()=>gain('bai2'),r:[['ze','Aquele caderno não é cobrança, menina. É memória de quem passou aperto na mesma semana que você.'],['zefa','No fim do mês, quem pode paga o seu e o do vizinho. Sem recibo.'],['ze','Se a Aurea cobrasse, eu pagava. É por isso que ela não cobra.']]},
   {id:'mutirao',show:()=>true,t:'Já fizeram mutirão por aqui?',fn:()=>gain('bai3'),r:[['nego','Quando o telhado da Zefa caiu, a rua levantou outro em dois sábados. Eu pus a madeira, o Dinho pôs o almoço.'],['zefa','Ninguém contratou ninguém. Ninguém mediu o telhado antes. A casa estava caindo e a rua estava de pé.'],['ze','Se viesse engenheiro, vinha de fora e cobrava. O engenheiro daqui era o Nego, que nunca estudou.']]},
   {id:'quintal',show:()=>true,t:'E o quintal grande lá atrás, de quem é?',fn:()=>gain('bai4'),r:[['ze','Atrás dos sobrados tem um quintal que ninguém sabe de quem é. A mangueira dá manga para a rua inteira. O coqueiro, também.'],['zefa','Domingo à tarde as mulheres cozinham ali para três casas. Cada uma leva uma panela e ninguém conta quanto levou.']]},
   {id:'carimbo',show:()=>Object.keys(used).length>=1,t:'Disseram que aqui não tem organização.',fn:()=>gain('bai5'),r:[['ze','Dizem lá em cima que aqui não tem organização. Quem diz isso nunca precisou de lata.'],['nego','Tem organização. Só não tem carimbo.'],['zefa','A Dandara escreve a ata. A freira ensinou. Quem não lê, ouve a ata em voz alta na porta da igreja.'],['narra','Você guarda na cabeça: tem muita coisa que a rua faz e que nenhuma planilha tem coluna para contar.']]}];
  const round=(n,stop)=>({lazy:()=>{const el=POOL.filter(p=>!used[p.id]&&p.show()).slice(0,n);if(!el.length)return[];
   return[{ch:el.map(p=>({t:p.t,fn:()=>{used[p.id]=1;p.fn&&p.fn()},r:p.r})).concat(stop?[{t:'Já está bom por hoje, Seu Zé.',fn:()=>{used.stop=1},r:[['ze','Volta amanhã. A mesa não sai daqui.']]}]:[])}]}});
  return[
   ['narra','A mesa de dominó fica na calçada, debaixo da janela de Seu Zé. Quatro cadeiras, uma garrafa de café frio e um caderno de capa dura que ninguém abre.'],
   ['ze','Senta, menina. Eu, Nego, Dinho e você, que hoje faz o quarto.'],
   ['narra','Você joga duas rodadas e perde as duas. Ninguém cobra nada. Vão chegando mais cadeiras de dentro das casas, e a mesa vira uma roda.'],
   ['zefa','Zé, a caixinha desta semana fecha hoje. A Rita precisa do dela para o remédio.'],
   ['ze','Anota aí, Lia, que você tem letra bonita. A gente não escreve nada, mas todo mundo sabe de tudo.'],
   round(3,false),{lazy:()=>used.stop?[]:[round(2,true)]},
   ['ze','Reforma vem, Lia. Dizem que vem bonita. Quero ver quem senta nesta mesa quando a calçada for de pedra polida.'],
   {ch:[
    {t:'A mesa fica, Seu Zé. A gente leva a mesa para onde a rua for.',fn:()=>{F.q0c='mesa'},r:[['ze','Mesa a gente leva. A rua, não.']]},
    {t:'E se tiver que sair, a caixinha sai junto?',fn:()=>{F.q0c='lata'},r:[['ze','Lata não tem endereço, tem gente. Se a gente se espalha, cada um fica com a lata dele, e isso não é caixinha.'],['zefa','Isso é poupança. Poupança é coisa triste.']]},
    {t:'Ficar só olhando a mesa.',a:1,fn:()=>{F.q0c='olhou'},r:[['narra','Você olha as pedras de dominó viradas para baixo, como se cada uma guardasse o nome de alguém.']]}]},
   ['narra','Já escurece quando você levanta. A mesa continua montada. Alguém vai guardar os dominós, alguém vai deixar o café, e ninguém combinou nada.']]}});

/* ---- perguntar sobre o bairro: cada um conta de um ângulo, em cada época ---- */
Object.assign(TOPIC,{bairro:{n:'Como o bairro funcionava'}});PERS.add('bairro');
Object.assign(TLAB.vo=TLAB.vo||{},{bairro:'Como o bairro funcionava'});
Object.assign(TLAB.raimundo=TLAB.raimundo||{},{bairro:'Como era o bairro antes'});
Object.assign(TLAB.dandara=TLAB.dandara||{},{bairro:'Como a rua se organizava'});
Object.assign(TLAB.davi=TLAB.davi||{},{bairro:'Como era a roda por dentro'});
Object.assign(TLAB.marta=TLAB.marta||{},{bairro:'Como era a rua de baixo'});
addAsk('vo','bairro',[
 {m:0,e:[0],L:[['vo','O bairro? Quando a Rita ficou doente, a Zefa levou sopa e eu levei o pão. Ninguém combinou. A gente já sabia.'],['vo','Caderneta, caixinha, quintal. Chama de rua, que é nome mais honesto.']]},
 {m:1,e:[1],L:[['vo','Tem coisa que ainda é de antes. O Zé joga dominó dentro de casa agora. A calçada tem barraca.'],['vo','Quando o chão é de todo mundo, ninguém pede licença para sentar. Quando é do Programa, pede.']]},
 {m:1,e:[2],L:[['vo','A caixinha acabou quando metade saiu. Ninguém decretou. O sábado ficou sem lata.'],['vo','Rua vira vitrine quando para de ser conversa.']]}]);
addAsk('raimundo','bairro',[
 {m:0,e:[0],L:[['raimundo','Quando minha mãe adoeceu, três vizinhas revezaram a noite. Pagar isso, ninguém paga.'],['raimundo','Não tinha escritura disso. Só tinha a porta aberta.']]},
 {m:1,e:[1],L:[['raimundo','Os vizinhos que sobraram dividem cadeira. O prédio é o mesmo, mas a conversa mudou de lugar.']]},
 {m:1,e:[2],L:[['raimundo','Quem mora longe não tem quem revezar a noite. Dizem que é progresso. Eu chamo de silêncio.']]}]);
addAsk('dandara','bairro',[
 {m:0,e:[0],L:[['dandara','Aqui a gente se organiza sem papel. Papel vem depois, para provar que a gente existiu.'],['dandara','Quando o Programa disser que aqui não tinha associação, eu mostro o caderno de ata. É de capa dura, para durar.']]},
 {m:1,e:[1],L:[['dandara','Hoje a reunião tem sessenta cadeiras para trezentas famílias. Antes era na calçada, e cabia todo mundo.']]},
 {m:1,e:[2],L:[['dandara','A associação ainda existe. O que sumiu foi o sábado.']]}]);
addAsk('davi','bairro',[
 {m:0,e:[0],L:[['davi','A roda nasceu antes de o largo ter nome de programa. Quem sabia tocar, tocava. Quem não sabia, batia palma fora do tempo e ficava.']]},
 {m:1,e:[1],L:[['davi','Hoje a roda tem horário. Antes tinha hora de acabar, que era quando alguém cansava.']]},
 {m:1,e:[2],L:[['davi','Tem gente que acha que voltou o movimento. Voltou o movimento de fora.']]}]);
addAsk('marta','bairro',[
 {m:1,e:[1],L:[['marta','Eu nasci aqui embaixo. Minha mãe ficava na janela chamando todo mundo pelo nome.'],['marta','Hoje eu levo gente para olhar a janela, e ninguém pergunta quem morava nela.']]},
 {m:1,e:[2],L:[['marta','No roteiro isto aqui é "casa-museu". Quando eu era menina era a casa da Dona Ana, e ela cozinhava para a rua.']]}]);
[['raimundo',1,'A mesa do Zé foi para dentro de casa.'],['raimundo',2,'A lata do sábado ficou vazia.'],['dandara',0,'Quinta tem reunião na calçada, traz banco.'],['dandara',1,'Agora reunião precisa de lista de presença.'],['davi',0,'Mesa de dominó é a melhor televisão da rua.'],['davi',0,'Na rua não tem canal. Tem conversa.'],['vo',0,'Caixinha de sábado: quem pode, bota.'],['vo',2,'Alguém sabe onde ficou a mesa do Zé?']].forEach(([id,e,s])=>{if(BARKS[id]&&BARKS[id][e])BARKS[id][e].push(s)});

/* ---- 2000: a TV da padaria e o arquivo ---- */
function epilogo2(){return[
 ['narra','No fim do dia, a vó liga a televisão pequena do balcão. Passa um programa sobre o Pelourinho: o largo iluminado, o palco, os turistas.'],
 {fn:()=>setPan('tv2')},
 ['tv','O Programa entra numa nova fase. O Pelourinho vai ser exemplo para o país, e a obra continua com a mesma firmeza.'],
 ['tv','Com mais tecnologia, mais eficiência e mais turismo. Quem mede resultado sabe que o caminho está certo.'],
 {fn:()=>setPan(null)},
 ['narra','Ao lado do Secretário, um assessor bem mais jovem toma nota e acena com a cabeça. Quando ele fala, a frase sai igual à do chefe, só que com outro sotaque.'],
 ['vo','Mesma conversa, outra boca.'],
 {ch:[
  {t:'Quem decide o que a rua vale, vó?',fn:()=>{F.fim='mede'},r:[['vo','Quem mede. E quem mede quase nunca é quem mora.']]},
  {t:'A gente vai ficar só vendo isso?',fn:()=>{F.fim='forno'},r:[['vo','Não. A gente acende o forno amanhã. Isso também é resposta.']]}]},
 ['narra','Lá fora, o largo está iluminado e quase vazio. O discurso não mudou de dono. Só trocou de idade.']]}
const linkA=(u,t)=>`<a href="${u}" target="_blank" rel="noopener">${t}</a>`;
/* ---- colisão: os pés da Lia contra o que está no chão (x, y do pé, raio x, raio y) ---- */
function solids(){const L=[];
 if(S.loc==='dentro'){L.push([860,GY+88,46,9],[1180,GY+104,40,8],[56,GY+82,30,8]);if(F.cadeira&&S.era===2)L.push([230,GY+82,24,8]);return L}
 if(S.era===0)L.push([1040,GY+46,18,7],[850,GY+92,62,10],[1540,GY+88,40,10]);
 if(S.era===1)L.push([1560,GY+86,52,10]);
 if(S.era===2&&S.mode!=='f2'){L.push([1070,GY+94,36,9],[1490,GY+94,36,9]);if(F.pol==='bateu')L.push([2360,GY+98,76,10],[2090,GY+70,88,7])}
 
 return L}
const hitSolid=(x,y)=>solids().some(s=>{const a=(x-s[0])/s[2],b=(y-s[1])/s[3];return a*a+b*b<1});
function arquivoHTML(){return`<section class="arq" style="--tc:#C7B3FF"><h3>Arquivo: o que está documentado</h3>
 <div class="cols">
 <p class="r"><b>1992 a 1999.</b> O Programa executou seis etapas, reformou cerca de 600 imóveis e removeu e indenizou cerca de 1.900 famílias, com indenização média de R$ 1.200. As pesquisas descreviam os moradores como uma população "com pouca ou nenhuma organização comunitária". Márcia Sant'Anna, revista Rua, n. 8.</p>
 <p class="r"><b>1980 a 2005.</b> Os moradores do Centro Histórico caíram de 9.853 para 3.235 entre 1980 e 2000, segundo o IBGE. Em 2005, uma mediação federal com a associação de moradores (Amach) garantiu que parte das famílias ficasse: 103 apartamentos e 13 lojas em 21 prédios restaurados. ${linkA('https://portal.sescsp.org.br/online/artigo/compartilhar/4036_PELOURINHO+MUSEU+OU+CIDADE+VIVA','Henrique Ostronoff, Sesc São Paulo, 2006')}.</p>
 <p class="r"><b>2006, no Senado.</b> Antonio Carlos Magalhães, governador da Bahia de 1991 a 1994, quando o Programa começou, disse: "A Bahia tem seu Centro Histórico com 500 casas restauradas." E: "Isso é trabalho de ACM, sem recurso estrangeiro; é dinheiro baiano, glória da Bahia." E: "Que culpa tenho eu de Deus ter-me permitido fazer tudo isso pela minha Bahia?" ${linkA('https://www25.senado.leg.br/web/atividade/pronunciamentos/-/p/texto/365820','Senado Federal, pronunciamento de 18/12/2006')}.</p>
 <p class="r"><b>2010.</b> O Instituto Antonio Carlos Magalhães foi inaugurado no Terreiro de Jesus, no Centro Histórico. O neto, ACM Neto, então deputado federal, disse: "Ele tinha um carinho especial por este lugar." ${linkA('https://jornalgrandebahia.com.br/2010/09/instituto-acm-e-inaugurado-no-pelourinho/','Jornal Grande Bahia, 05/09/2010')}.</p>
 <p class="r"><b>ACM Neto.</b> Nasceu em 1979. Foi assessor da Secretaria de Educação da Bahia de 1999 a 2002, o deputado federal mais votado do estado em 2002 e prefeito de Salvador de 2013 a 2020. Disputou o governo da Bahia em 2022 e em 2026 e perdeu as duas vezes. Em 4 de outubro de 2026, teve 44,20% dos votos válidos contra 55,31% de Jerônimo Rodrigues (PT). ${linkA('https://www.itatiaia.com.br/politica/eleicoes/conheca-a-carreira-politica-de-acm-neto-pre-candidato-ao-governo-da-ba/','Itatiaia')} e ${linkA('https://movimentoeconomico.com.br/politica/eleicoes-2026/2026/10/04/jeronimo-rodrigues-supera-acm-neto-e-e-reeleito-governador-da-bahia/','Movimento Econômico')}.</p>
 </div>
 <p class="fin">Em 2000, quando o jogo termina, ele tinha 21 anos. A pergunta que o jogo deixa é quem mede o Pelourinho e quem fica fora da medida.</p></section>`}

/* ---------- eras ---------- */
const ERAS=[
 {year:'1991',tit:'O Programa vem aí',card:'O governo da Bahia anuncia um Programa para recuperar o Centro Histórico. As obras começam em 1992, pelos quarteirões mais degradados perto do Largo do Pelourinho. Por enquanto, aqui ainda se mora, se compra fiado e se toca na roda. Você é a Lia e ajuda sua avó na padaria.',note:'Personagens, falas, preços e faturamento são fictícios. Os dados reais vêm do artigo de Márcia Sant\'Anna (revista Rua, n. 8).',tip:'A porta liga a padaria à rua. Dentro, o forno, o balcão e o salão. Fora, a calçada e o largo. Nem tudo acontece no mesmo lugar.'},
 {year:'1996',tit:'Reforma e visitação',card:'As fachadas ganham tinta nova e chegam os ônibus. O Estado paga limpeza, iluminação e shows no largo. Muitas famílias já foram cadastradas e saíram. A padaria ainda é da sua avó, e o balcão agora enche em ondas.',tip:'Quem você ajudou, ou pressionou, no outro dia lembra. E eles conversam entre si, com você ou sem você.'},
 {year:'2000',tit:'O Largo de vitrine',card:'Em 1980, moravam cerca de 9,8 mil pessoas no Centro Histórico. Em 2000, cerca de 3 mil. Das 1.674 famílias cadastradas, só 103 resistiram.',note:'Dados do artigo de 2009 usado na disciplina.',tip:'Último dia. O que a rua virou também depende do que os outros fizeram sem você.'}];
const THANKS={raimundo:'Obrigado, menina. Quentinho assim é raro.',dandara:'Obrigada. Vou levando antes que esfrie.',davi:'Você salvou minha manhã.',marta:'Perfeito. Isso rende foto.',lucia:'Obrigada. Anotei aqui.'};
const MOOD=['mantém a guarda','está atento','está à vontade','está aberto'];
const NMS={raimundo:'Seu Raimundo',dandara:'Dandara',davi:'Davi',vo:'Vó Aurea',marta:'Marta',lucia:'Lúcia'};
const lines2=l=>typeof l==='function'?l():l;
const V=n=>VERBS[n.id]||{};

/* ---------- atores ---------- */
function evOk(v){return(!v.cond||v.cond())&&v.actors.every(a=>{const n=S.npcs[a];return n&&!n.closed&&!n.hidden&&n.mute<=S.min})}
function evFor(n){const h=S.min/60;const run=S.bant.find(b=>b.v.actors.includes(n.id));if(run)return run.v;
 if(n.id==='raimundo'&&S.q&&S.q.id==='q0a'&&S.qd.q0a==='on')return null;
 return EV.find(v=>v.e===S.era&&!S.evDone[v.id]&&h>=v.h0&&h<v.h1&&v.actors.includes(n.id)&&evOk(v))||null}
function evPos(v){return S.rain?[1040,GY+76,'dentro']:[v.at[0],v.at[1],v.loc||'rua']}
function wantAnchor(n){const h=S.min/60;
 if(n.closed)return[...AN[n.x<WW/2?'offL':'offR'],'off',null,'rua'];
 const ev=evFor(n);
 if(ev){if(S.rain){const o=ev.actors.indexOf(n.id);return[1000+o*70,GY+76+o*4,'ev',ev,'dentro']}const p=ev.pos[n.id];return[p[0],p[1],'ev',ev,ev.loc||'rua']}
 const list=S.ov[n.id]||SCHED[S.era][n.id];if(!list)return[n.x,n.y,'idle',null,n.loc];let name=list[0][1];for(const[hh,a]of list)if(h>=hh)name=a;
 if(S.rain&&OUTDOOR[name]&&!(S.era===0&&n.id==='raimundo'&&name==='sobrado'))name='mesa';
 const p=AN[name];let off=0;if(name==='mesa')off=hsh(n.id.length,n.id.charCodeAt(0),1)*90-45;else if(name==='balcao')off=BOFF[n.id]||0;else if(name==='porta')off=POFF[n.id]||0;
 return[p[0]+off,p[1],name,null,INN[name]?'dentro':'rua']}
function pathTo(a,tx,ty){if(a.loc!=='dentro')return[tx,ty];
 const R={x0:CT.x0-16,x1:CT.x1+16,y0:CT.y0-8,y1:CT.y1+10};let hit=false;
 for(let i=0;i<=16;i++){const k=i/16,x=a.x+(tx-a.x)*k,y=a.y+(ty-a.y)*k;if(x>R.x0&&x<R.x1&&y>R.y0&&y<R.y1){hit=true;break}}
 if(!hit)return[tx,ty];
 const cx=a.x<=R.x0?R.x0-6:a.x>=R.x1?R.x1+6:(Math.abs(a.x-R.x0)+Math.abs(tx-R.x0)<Math.abs(a.x-R.x1)+Math.abs(tx-R.x1)?R.x0-6:R.x1+6);
 if(Math.abs(a.x-cx)>12){const wy=(a.y>R.y0&&a.y<R.y1)?(ty<(R.y0+R.y1)/2?R.y0-6:R.y1+6):a.y;return[cx,wy]}
 return[cx,ty]}
function playerPath(tx,ty){const R={x0:CT.x0-16,x1:CT.x1+16,y0:CT.y0-8,y1:CT.y1+10};let hit=false;
 for(let i=0;i<=16;i++){const k=i/16,x=S.px+(tx-S.px)*k,y=S.py+(ty-S.py)*k;if(x>R.x0&&x<R.x1&&y>R.y0&&y<R.y1){hit=true;break}}
 if(!hit)return[tx,ty];const cx=R.x0-8;
 if(Math.abs(S.px-cx)>14){const wy=(S.py>R.y0&&S.py<R.y1)?(ty<(R.y0+R.y1)/2?R.y0-6:R.y1+6):S.py;return[cx,wy]}
 return[cx,ty]}
function moveActor(a,tx,ty,dt,sp){const[wx,wy]=pathTo(a,tx,ty);const fin=wx===tx&&wy===ty,dx=wx-a.x,dy=wy-a.y,d=Math.hypot(dx,dy);
 if(d<4){a.walk=false;return fin}
 const st=Math.min(d,sp*dt);a.x+=dx/d*st;a.y+=dy/d*st;a.walk=true;if(Math.abs(dx)>2)a.dir=dx>0?1:-1;return false}
function stepTo(a,w,dt,sp){const loc=w[4]||'rua';
 if(a.loc!==loc){const d=a.loc==='rua'?AN.porta:AN.iporta;
  if(moveActor(a,d[0],d[1],dt,sp)){a.loc=a.loc==='rua'?'dentro':'rua';const q=a.loc==='rua'?AN.porta:AN.iporta;a.x=q[0];a.y=q[1]+(a.loc==='rua'?4:14);a.dir=a.loc==='rua'?1:-1}
  return false}
 return moveActor(a,w[0],w[1],dt,sp)}
function pairNear(a,b,d){const x=S.npcs[a],y=S.npcs[b];return!!(x&&y&&!x.hidden&&!y.hidden&&!x.closed&&!y.closed&&x.loc===y.loc&&Math.hypot(x.x-y.x,x.y-y.y)<d)}
function initEra(){S.npcs={};const sc=SCHED[S.era];
 for(const id in sc){const n={id,x:0,y:0,dir:1,walk:false,hidden:false,closed:false,mute:0,ph:hsh(id.length,id.charCodeAt(1),2)*6,bark:null,barkT:rnd(4,9),served:false,loc:'rua',hideAt:null};
  const[x,y,nm,,loc]=wantAnchor(n);n.x=x;n.y=y;n.loc=loc;n.hidden=!!HID[nm];if(n.hidden)n.hideAt=nm;S.npcs[id]=n}
 S.extras=[];S.tourN=0;S.tourT=1;S.bant=[];
 if(S.era===0)for(let k=0;k<3;k++)S.extras.push({kid:true,loc:'rua',id:'k'+k,x:1700+k*140,y:GY+70+k*10,dir:1,ph:k*2,tgt:null,wait:0,s:.8,look:{body:[PINK,GRN,YEL][k],pants:BLU,skin:'#8A4B2A',hair:OUT,puff:k===0}});
 S.dog={x:1500,y:GY+84,dir:1,tx:null,ty:null,wait:0,t:0};
 S.pigeons=[[560,GY+70],[1500,GY+96],[1880,GY+84],[2300,GY+90]].map(([x,y],i)=>({x,y,hx:x,hy:y,fly:0,t:0,i}))}
function wantTourists(){if(S.mode==='f2')return 0;if(S.mode==='vist')return 0;const h=S.min/60,e=S.era;let n=0;
 if(e===0)n=(h>9&&h<17)?1.4:0;else if(e===1)n=h<8.7?0:h<10?6:h<16?12:h<17?5:0;else n=h<10.3?0:h<11.5?9:h<13?6:h<15?3:h<16.5?1.5:0;
 if(S.sign==='CAFÉ PELÔ'||S.sign==='LEMBRANÇAS')n*=1.3;if(S.sign==='PADARIA'&&e===2)n*=.55;if(F.rota)n*=.9;if(e===2&&F.inc==='fogo')n*=.6;if(S.rain)n*=.35;return Math.round(n)}
const TLOOK=[{body:PINK,pants:BLU},{body:GRN,pants:OUT},{body:ORA,pants:CRM},{body:YEL,pants:BLU},{body:CRM,pants:PLUM},{body:BLU,pants:CRM}];
function spawnTourist(){const side=Math.random()<.5;const sh=shop();
 const path=[];const k=2+Math.floor(Math.random()*3);for(let i=0;i<k;i++)path.push({x:rnd(700,2300),y:rnd(GY+68,GY+98),w:rnd(2,5),loc:'rua'});
 let ord=null;if(Math.random()<[.5,.62,.62][S.era]){ord=newOrd(pick(sh.st.filter(i=>i!=='pao'||Math.random()<.4)),'vis','t');path.splice(1,0,{x:AN.balcao[0],y:GY+64+rnd(0,6),w:0,order:true,loc:'dentro',set:false})}
 const l=TLOOK[Math.floor(Math.random()*TLOOK.length)];
 S.extras.push({tour:true,loc:'rua',id:'t'+(++S.tourN),x:side?-80:WW+80,y:GY+70,dir:side?1:-1,ph:rnd(0,6),path,pi:0,wait:0,ord,served:false,leaving:false,arr:false,s:.95,look:{body:l.body,pants:l.pants,skin:pick(['#F0C8A0','#D9A67A','#8A4B2A']),hat:'sun',hatc:pick([YEL,BLU,PINK]),cam:true,hair:'#8A5A2A'}})}
function updExtras(dt){
 S.tourT-=dt;if(S.tourT<=0){S.tourT=rnd(1.8,3.5);const act=S.extras.filter(a=>a.tour&&!a.leaving).length,want=wantTourists();if(act<want)spawnTourist();else if(act>want){const a=S.extras.find(a=>a.tour&&!a.leaving&&!a.ord);if(a)a.leaving=true}}
 for(const a of S.extras){
  if(a.tour){if(a.leaving||a.pi>=a.path.length){const ex=a.x<WW/2?-120:WW+120;a.waiting=false;if(stepTo(a,[ex,GY+80,'t',null,'rua'],dt,80)||a.x<-100||a.x>WW+100)a.dead=true;continue}
   const p=a.path[a.pi];if(a.bark){a.bark.t-=dt;if(a.bark.t<=0)a.bark=null}
   if(p.order&&a.arr){a.walk=false;if(a.served||a.ord.lost){a.arr=false;a.waiting=false;a.pi++}continue}
   if(a.wait>0){a.wait-=dt;a.walk=false;if(a.wait<=0){a.pi++;a.wait=0}continue}
   if(p.order&&!p.set){p.x=freeSlot(a);p.set=true}
   if(stepTo(a,[p.x,p.y,'t',null,p.loc||'rua'],dt,80)){if(p.order){a.arr=true;a.waiting=true;a.dir=1}else{a.wait=p.w;if(Math.random()<.35)a.flash=.4}}
   if(a.flash>0)a.flash-=dt}
  else if(a.kid){if(a.wait>0){a.wait-=dt;a.walk=false;continue}if(!a.tgt)a.tgt=[rnd(1620,2300),rnd(GY+66,GY+100)];if(moveActor(a,a.tgt[0],a.tgt[1],dt,150)){a.tgt=null;a.wait=rnd(.3,1.5)}}}
 S.extras=S.extras.filter(a=>!a.dead);
 const d=S.dog;d.t+=dt;if(d.wait>0){d.wait-=dt}else{if(d.tx==null||Math.abs(d.x-d.tx)<8&&Math.abs(d.y-d.ty)<8){if(S.loc==='rua'&&Math.abs(S.px-d.x)<320&&Math.random()<.6){d.tx=S.px+rnd(-80,80);d.ty=clamp(S.py+rnd(10,40),GY+60,GY+104)}else{d.tx=rnd(700,2300);d.ty=rnd(GY+64,GY+102)}d.wait=rnd(.5,3)}
  const dx=d.tx-d.x,dy=d.ty-d.y,dd=Math.hypot(dx,dy);if(dd>6){const st=Math.min(dd,110*dt);d.x+=dx/dd*st;d.y+=dy/dd*st;if(Math.abs(dx)>3)d.dir=dx>0?1:-1;d.walk=true}else d.walk=false}
 for(const p of S.pigeons){p.t+=dt;const near=Math.abs(S.px-p.x)<150&&S.scene==='play'&&S.loc==='rua';
  if(p.fly<=0&&near){p.fly=1}if(p.fly>0){p.fly+=dt;p.x+=dt*(p.i%2?190:-190);p.y-=dt*140;if(p.fly>3.2){p.fly=-1;p.t=0}}else if(p.fly===-1&&p.t>9){p.x=p.hx;p.y=p.hy;p.fly=0}}}
/* ---------- conversas entre eles, eventos, interações ---------- */
function evReady(v){return v.actors.every(a=>{const n=S.npcs[a];if(!n)return false;const w=wantAnchor(n);return w[2]==='ev'&&w[3]===v&&n.loc===w[4]&&Math.hypot(n.x-w[0],n.y-w[1])<26})}
function evNear(){const h=S.min/60;let best=null,bd=1e9;
 for(const v of EV){if(v.auto||v.e!==S.era||S.evDone[v.id]||h<v.h0||h>=v.h1||!evOk(v)||!evReady(v))continue;const p=evPos(v);if(p[2]!==S.loc)continue;
  if(Math.abs(p[0]-S.px)<230&&Math.abs(p[1]-S.py)<90){const d=Math.abs(p[0]-S.px)+Math.abs(p[1]-S.py)*1.2;if(d<bd){bd=d;best={k:'ev',v,x:p[0],y:p[1]}}}}
 return best}
function evOfNpc(n){const h=S.min/60;return EV.find(v=>!v.auto&&v.e===S.era&&!S.evDone[v.id]&&h>=v.h0&&h<v.h1&&v.actors.includes(n.id)&&evOk(v)&&evReady(v))||null}
function unlock(id){(UNLOCK[id]||[]).forEach(t=>S.open[t]=true)}
function finishEv(v,seen,played){S.evDone[v.id]=true;if(v.fx)v.fx();
 if(played){if(v.fp)v.fp();if(v.tr)for(const id in v.tr)addTr(id,v.tr[id]);if(v.f)F[v.f]=true}
 if(seen){(v.kn||[]).forEach(k=>know(k[0],k[1]));gain(v.c);unlock(v.id)}}
function updBanter(dt){const h=S.min/60;
 for(const v of EV){if(!v.auto||v.e!==S.era||S.evDone[v.id]||S.bant.some(b=>b.v===v))continue;
  if(h>=v.h0&&h<v.h1&&evOk(v)&&evReady(v))S.bant.push({v,lines:lines2(v.L),i:0,t:0,cur:null,seen:0,tot:0})}
 for(const b of S.bant){const L=b.lines[b.i];if(!L)continue;const dur=1.8+L[1].length*.045,n0=S.npcs[b.v.actors[0]];
  if(b.cur!==L){b.cur=L;const sp=S.npcs[L[0]];if(sp){sp.bark={s:greet(L[1]),t:dur+.1,ev:1};S.quiet=Math.max(S.quiet,dur+1.2)}}
  b.t+=dt;b.tot+=dt;if(n0&&S.loc===n0.loc&&Math.abs(n0.x-S.px)<560)b.seen+=dt;
  if(b.t>=dur){b.i++;b.t=0;b.cur=null}}
 const fin=S.bant.filter(b=>b.i>=b.lines.length);
 if(fin.length){S.bant=S.bant.filter(b=>b.i<b.lines.length);for(const b of fin){const w=b.seen>b.tot*.5;finishEv(b.v,w,false);if(w)toast('Você viu '+b.v.actors.map(a=>NMS[a]).join(' e ')+' conversando.')}}
 for(const v of EV){if(v.e!==S.era||S.evDone[v.id]||h<v.h1||S.bant.some(b=>b.v===v))continue;
  S.evDone[v.id]=true;if(v.fx&&(!v.cond||v.cond())&&v.actors.every(a=>S.npcs[a]&&!S.npcs[a].closed))v.fx()}}
function waitingOrder(n){return ordOpen(n.ord)&&atCounter(n)}
function talkingAuto(n){return S.bant.some(b=>b.v.actors.includes(n.id))}
function nearTarget(){if(S.scene!=='play')return null;const inn=S.loc==='dentro';let best=null,bd=1e9;const cand=[];
 const dr=inn?{to:'rua',x:AN.iporta[0],y:AN.iporta[1]+16}:{to:'dentro',x:AN.porta[0],y:AN.porta[1]};
 const nearDoor=Math.abs(dr.x-S.px)<64&&Math.abs(dr.y-S.py)<64;
 if(S.mode==='vist'){for(const v of VIS){if(v.loc!==S.loc)continue;cand.push({k:'vis',v,x:v.x,y:v.y,w:S.vs.done[v.id]?60:0})}
  if(nearDoor)cand.push({k:'door',to:dr.to,x:dr.x,y:dr.y,w:-6});
  for(const c of cand){const d=Math.hypot(c.x-S.px,(c.y-S.py)*1.5)+(c.w||0);if((d<140||c.k==='door')&&d<bd){bd=d;best=c}}return best}
 for(const id in S.npcs){const n=S.npcs[id];if(n.hidden||n.loc!==S.loc)continue;const od=ORDERS[S.era][id],o=ordOpen(n.ord)?n.ord:null;
  const w=o?(!o.noted?-40:S.tray.includes(o.item)?-90:0):(od&&!n.served&&n.loc==='rua'&&S.tray.includes(od)?-90:0);cand.push({k:'npc',n,x:n.x,y:n.y,w})}
 for(const a of S.extras){if(a.tour&&a.loc===S.loc&&a.waiting&&ordOpen(a.ord)&&!a.ord.by)cand.push({k:'tour',a,x:a.x,y:a.y,w:!a.ord.noted?-40:S.tray.includes(a.ord.item)?-90:0})}
 for(const o of OBJ){if(o.loc!==S.loc||!o.e.includes(S.era))continue;if(o.id==='o_rot'&&!(S.npcs.marta&&S.era>=1))continue;const dd=Math.hypot(o.x-S.px,(o.y-S.py)*1.7);if(dd<44)cand.push({k:'obj',o,x:o.x,y:o.y,w:-15})}
 if(nearDoor)cand.push({k:'door',to:dr.to,x:dr.x,y:dr.y,w:-6});
 {const q=questOn();if(q&&q.tg.loc===S.loc)cand.push({k:'quest',q,x:q.tg.x,y:q.tg.y,w:-30})}
 for(const c of cand){const d=Math.hypot(c.x-S.px,(c.y-S.py)*1.5)+(c.w||0);if((d<94||c.k==='obj'||c.k==='door'||(c.k==='quest'&&d<150))&&d<bd){bd=d;best=c}}
 if(inn)for(let i=0;i<3;i++){const front=S.py>CT.y1-4,dd=Math.abs(STXI[i]-S.px)+(front?Math.max(0,S.py-(CT.y1+40))*.9:Math.max(0,S.py-(GY+12))*.9);if(dd<66&&dd-12<bd){bd=dd-12;best={k:'st',i,x:STXI[i],y:GY-10}}}
 if(best)return best;return evNear()}
function tlabel(t){if(!t)return'';
 if(t.k==='door')return t.to==='dentro'?'E: entrar na padaria':'E: sair para a rua';
 if(t.k==='quest')return'E: '+t.q.tg.lab;
 if(t.k==='vis')return t.v.done||S.vs.done[t.v.id]?'Esse endereço já foi riscado':'E: '+t.v.lab;
 if(t.k==='npc'){const n=t.n,o=ordOpen(n.ord)?n.ord:null,od=ORDERS[S.era][n.id];
  if(o){if(o.by)return'Vó Aurea está atendendo '+NMS[n.id];if(!o.noted)return'E: anotar o pedido de '+NMS[n.id];if(S.tray.includes(o.item))return'E: entregar '+iname(o.item)+' a '+NMS[n.id]+' (#'+o.num+')';return'#'+o.num+' · '+NMS[n.id]+' espera '+iname(o.item)}
  if(od&&!n.served&&n.loc==='rua'&&S.tray.includes(od))return'E: levar '+iname(od)+' até '+NMS[n.id];
  if(evOfNpc(n))return'E: ouvir a conversa';if(talkingAuto(n))return NMS[n.id]+' está conversando';return'E: falar com '+NMS[n.id]}
 if(t.k==='tour'){const o=t.a.ord;return!o.noted?'E: anotar o pedido da visitante':S.tray.includes(o.item)?'E: entregar '+iname(o.item)+' (#'+o.num+')':'#'+o.num+' · ela espera '+iname(o.item)}
 if(t.k==='ev')return'E: '+t.v.lab;if(t.k==='obj')return'E: '+t.o.lab;
 const id=shop().st[t.i];return S.stock[t.i]<=0?'E: repor '+iname(id):S.tray.length>=2?'Bandeja cheia. Entregue ou aperte Q':'E: pegar '+iname(id)+' ('+S.stock[t.i]+')'}
function gain(c){if(!c)return;(Array.isArray(c)?c:[c]).forEach(id=>{if(!S.clues[id]){S.clues[id]=true;try{const k='balcao_pistas';const a=JSON.parse(localStorage.getItem(k)||'[]');if(!a.includes(id)){a.push(id);localStorage.setItem(k,JSON.stringify(a))}}catch(e){}S.newClue=true;toast('Nova pista no caderno')}});hud()}
function toast(m){S.toast=m;S.toastT=2.8}
function adv(m){if(S.mode==='vist')return;S.min+=m;const d=m/3.1*.55;for(const id in S.npcs){const o=S.npcs[id].ord;if(ordOpen(o)&&!o.by)o.pat-=d}for(const a of S.extras)if(a.tour&&ordOpen(a.ord)&&a.waiting&&!a.ord.by)a.ord.pat-=d}
function setLoc(loc,x,y){S.loc=loc;S.px=x;S.py=y;S.tx=null;S.ty=null;if(loc==='rua'){S.cam=clamp(x-VW*.46,0,WW-VW)}else S.icam=clamp(x-VW*.5,0,IW-VW)}
function goLoc(to){if(S.scene!=='play'||S.trans||to===S.loc)return;S.trans={to,t:0,sw:false};S.scene='fade'}
/* forno, vitrine e café: pegar, repor ou devolver (de perto ou clicando de longe) */
function useStation(i){const st=shop(),id=st.st[i];
 if(S.stock[i]<=0){S.stock[i]=3;adv(5);toast('Você repôs: '+iname(id)+'.');return}
 if(S.tray.length>=2){const j=S.tray.lastIndexOf(id);if(j>=0){S.tray.splice(j,1);S.stock[i]++;toast('Devolveu: '+iname(id)+'.');return}toast('A bandeja está cheia. Clique num item da bandeja para devolver, ou aperte Q.');return}
 S.stock[i]--;S.tray.push(id);toast('Na bandeja ('+S.tray.length+'/2): '+iname(id)+'. Errou? Clique nele na bandeja para devolver.')}
function backTrayAt(j){const id=S.tray[j];if(!id)return;S.tray.splice(j,1);const k=shop().st.indexOf(id);if(k>=0)S.stock[k]++;toast('Devolveu: '+iname(id)+'.')}
/* pedido no balcão por clique, sem dar a volta */
function orderAct(n,a){const o=n?n.ord:a.ord;if(!ordOpen(o))return false;if(o.by){toast('Vó Aurea já está cuidando desse pedido.');return true}
 if(!o.noted){n?anotar(o,n.id,{n}):anotar(o,'turista',{a});return true}
 if(S.tray.includes(o.item)){n?entregar({o,n,k:'npc'}):entregar({o,a,k:'tour'});return true}
 toast('#'+o.num+' espera '+iname(o.item)+'. Clique no forno, na vitrine ou no café.');return true}
function interact(){if(S.scene==='dialog'){advance();return}if(S.scene!=='play')return;const t=nearTarget();if(!t)return;
 if(t.k==='door'){goLoc(t.to);return}
 if(t.k==='vis'){doVisit(t.v);return}
 if(t.k==='quest'){doQuest(t.q);return}
 if(t.k==='st'){useStation(t.i);return}
 if(t.k==='tour'){const a=t.a,o=a.ord;if(!ordOpen(o))return;
  if(!o.noted){anotar(o,'turista',{a});return}
  if(S.tray.includes(o.item)){entregar({o,a,k:'tour'});return}
  toast('#'+o.num+' · ela espera '+iname(o.item)+'.');return}
 if(t.k==='obj'){doObj(t.o);return}
 if(t.k==='ev'){doEvent(t.v);return}
 const n=t.n;if(n.mute>S.min){toast(NMS[n.id]+' não quer conversa agora.');return}
 const o=ordOpen(n.ord)?n.ord:null,od=ORDERS[S.era][n.id];
 if(o){if(o.by){toast('Vó Aurea já está cuidando do pedido de '+NMS[n.id]+'.');return}
  if(!o.noted){anotar(o,n.id,{n});return}
  if(S.tray.includes(o.item)){entregar({o,n,k:'npc'});return}
  toast('#'+o.num+' · '+NMS[n.id]+' espera '+iname(o.item)+'.');return}
 if(od&&!n.served&&n.loc==='rua'&&S.tray.includes(od)){serveFar(n);return}
 const ev=evOfNpc(n);if(ev){doEvent(ev);return}
 if(talkingAuto(n)){toast(NMS[n.id]+' está no meio de uma conversa. Chegue perto e ouça.');return}
 openMenu(n)}

function doObj(o){adv(o.cost||10);S.speaker=null;
 if(o.special==='gaveta'){const v=S.npcs.vo;if(v&&!v.hidden&&v.loc===S.loc&&Math.hypot(v.x-S.px,(v.y-S.py))<270){addTr('vo',-1);F.gavetaFlagra=true;S.speaker='vo';openDlg([['vo','Lia! Fora da gaveta.'],['narra','Ela fecha a gaveta com o quadril e te olha como quem guarda um segredo.']]);return}}
 gain(o.c);unlock(o.id);openDlg(o.L)}
function doEvent(v){const L=lines2(v.L);adv(v.cost||20);finishEv(v,true,true);S.speaker=null;openDlg(L)}
/* ---------- menu de conversa: só o que existe, para essa pessoa, agora ---------- */
function beatFor(n){return V(n).ouvir?(LISTEN[n.id]||[]).find(b=>!S.seen[b.id]&&b.e===S.era&&tr(n.id)>=b.m):null}
function bestAsk(n,t){const T=(ASK[n.id]||{})[t]||[];const all=T.map((x,i)=>[x,i]).filter(([x])=>x.e==null||x.e.includes(S.era));
 const el=all.filter(([x])=>tr(n.id)>=x.m&&(!x.k||has(x.k)));return el.length?{ent:el[el.length-1],locked:all.length>el.length}:null}
function topicsFor(n){if(!V(n).perguntar)return[];const A=ASK[n.id]||{},out=[];
 for(const t in A){const b=bestAsk(n,t);if(!b)continue;const[,i]=b.ent;if(S.asked[n.id+t+i])continue;const T=TOPIC[t];if(T.k&&!has(T.k))continue;
  const pri=PERS.has(t)?0:T.k?0:S.open[t]?1:(BASE[n.id]||[]).includes(t)?3:-1;if(pri<0)continue;out.push({t,lab:(TLAB[n.id]||{})[t]||T.n,pri})}
 const O=OPIN[n.id]||{};for(const x in O){if(!S.npcs[x]||tr(n.id)<1||S.asked['p'+S.era+n.id+x])continue;out.push({t:x,p:1,lab:'Sobre '+NMS[x],pri:2})}
 const ak=(S.askN&&S.askN[n.id])||0;return out.sort((a,b)=>a.pri-b.pri||((b.t==='bairro')-(a.t==='bairro'))||((a.t.charCodeAt(0)*7+ak*5)%11)-((b.t.charCodeAt(0)*7+ak*5)%11)).slice(0,2)}
function helpsFor(n){return(HELP[n.id]||[]).filter(h=>h.e.includes(S.era)&&!S.helped[h.id]&&h.need(n))}
function pressFor(n){const P=PRESS[n.id],Vv=V(n).pressionar,out=[];if(!P||!Vv)return out;
 for(const k of Object.keys(P.lev||{}))if(has(k)&&!S.pressUsed[n.id+k])out.push({k:'lev',clue:k,lab:'Mostrar: '+CLUES[k][1],risk:tr(n.id)<P.lev[k].m});
 if(Vv==='ambos'&&S.deflect[n.id]&&!S.insisted[n.id+S.era]&&!(n.id==='raimundo'&&S.era===0))out.push({k:'ins',lab:'Cobrar uma resposta',risk:!(P.mid&&P.mid.m<9&&tr(n.id)>=P.mid.m)});
 return out}
function rootOpts(n){const o=[];
 if(beatFor(n))o.push(['Ouvir','30 min','listen']);
 if(topicsFor(n).length)o.push(['Perguntar…','','ask']);
 if(helpsFor(n).length)o.push(['Ajudar…','','help']);
 if(pressFor(n).length)o.push(['Pressionar…','','press']);
 return o}
function openMenu(n){if(!rootOpts(n).length&&!(n.id==='vo'&&S.min>=16*60)){S.speaker=null;adv(5);openDlg([['narra',idleLine(n.id)]]);return}
 S.menu={n,lvl:'root'};S.scene='menu';S.speaker=n.id;renderMenu()}
function closeMenu(){S.menu=null;S.scene='play';S.speaker=null}
function renderMenu(){const m=S.menu,n=m.n;
 const opts=[];const back=()=>{m.lvl='root';renderMenu()};
 if(m.lvl==='root'){m.txt=ctxLine(n);
  rootOpts(n).forEach(([lab,c,k])=>{if(k==='listen')opts.push([lab,c,()=>act(doListen(n))]);else opts.push([lab,c,()=>{m.lvl=k;renderMenu()}])});
  if(n.id==='vo'&&S.min>=16*60)opts.push(['Fechar a padaria por hoje','',()=>{closeMenu();fecho()}]);
  opts.push(['Sair','',closeMenu])}
 else if(m.lvl==='ask'){m.txt='Perguntar sobre…';topicsFor(n).forEach(t=>opts.push([t.lab,'20 min',()=>act(t.p?doOpin(n,t.t):doAsk(n,t.t))]));opts.push(['Voltar','',back])}
 else if(m.lvl==='help'){m.txt='Ajudar com…';helpsFor(n).forEach(h=>opts.push([h.lab,(h.cost||30)+' min',()=>act(doHelp(n,h))]));opts.push(['Voltar','',back])}
 else if(m.lvl==='press'){m.txt='Pressionar… isso pode custar a confiança.';pressFor(n).forEach(p=>opts.push([p.lab+(p.risk?' · arriscado':''),'20 min',()=>act(doPress(n,p))]));opts.push(['Voltar','',back])}
 m.opts=opts;m.v=(m.v||0)+1}
function act(r){S.menu=null;S.scene='dialog';adv(r.cost||20);openDlg(r.L,()=>{S.speaker=null;if(r.after)r.after()});}
function doListen(n){const b=beatFor(n);if(!b)return{L:[['narra',idleLine(n.id)]],cost:10};S.seen[b.id]=1;gain(b.c);addTr(n.id,1);unlock(b.id);return{L:b.L,cost:30}}
function doAsk(n,t){S.askN=S.askN||{};S.askN[n.id]=(S.askN[n.id]||0)+1;const b=bestAsk(n,t);if(!b)return{L:[[n.id,deckPick('nd'+n.id,['Hoje eu não tenho muito a dizer sobre isso.','Deixa isso pra outro dia.','Já falei o que dava.','Pergunta de novo quando a gente se conhecer melhor.'])]],cost:10};
 const[ent,i]=b.ent;S.asked[n.id+t+i]=1;gain(ent.c);if(ent.t)addTr(n.id,ent.t);if(ent.f)F[ent.f]=true;(ent.u||[]).forEach(u=>S.open[u]=true);if(b.locked)S.deflect[n.id]=true;return{L:ent.L,cost:20}}
function doOpin(n,x){S.asked['p'+S.era+n.id+x]=1;const r=rel(n.id,x);know(n.id,x);let o=OPIN[n.id][x][r<0?0:r===0?1:2];if(S.era===0&&/assin/.test(o))o='Aurea é da casa. Em quarenta anos, nunca me cobrou nada além do pão.';return{L:[[n.id,o]],cost:15}}
function doHelp(n,h){if(h.use)takeItem(['bolo','pao']);S.helped[h.id]=1;gain(h.c);addTr(n.id,h.t==null?2:h.t);if(h.f)F[h.f]=true;if(h.x)for(const id in h.x)addTr(id,h.x[id]);(h.rel||[]).forEach(r=>addRel(r[0],r[1],r[2]));(h.kn||[]).forEach(k=>know(k[0],k[1]));return{L:lines2(h.L),cost:h.cost||30}}
function doPress(n,sel){const P=PRESS[n.id];F.pressed=true;
 if(sel.k==='lev'){const clue=sel.clue,lv=P.lev[clue];S.pressUsed[n.id+clue]=1;if(tr(n.id)>=lv.m){gain(lv.c);addTr(n.id,lv.t||0);if(lv.f)F[lv.f]=true;return{L:lv.L,cost:20}}
  if(lv.fail){addTr(n.id,lv.fail.t);if(lv.fail.f)F[lv.fail.f]=true;n.mute=S.min+120;return{L:lv.fail.L,cost:20}}
  addTr(n.id,-1);return{L:[[n.id,'Isso é assunto meu.']],cost:20}}
 S.insisted[n.id+S.era]=1;
 if(P.mid&&P.mid.m<9&&tr(n.id)>=P.mid.m){gain(P.mid.c);addTr(n.id,P.mid.t);return{L:P.mid.L,cost:20}}
 addTr(n.id,P.no.t);if(P.no.f)F[P.no.f]=true;if(n.id==='raimundo')F.rompida=true;
 const leave=n.id!=='vo'&&n.id!=='marta';return{L:P.no.L,cost:20,after:()=>{if(leave)n.closed=true;else n.mute=S.min+120}}}
/* ---------- diálogo ---------- */
function openDlg(script,done){S.d={q:script.slice(),done,cur:null,typed:0,ch:false};S.scene='dialog';nextLine()}
function nextLine(){const d=S.d;const it=d.q.shift();
 if(!it){S.scene='play';const f=d.done;S.d=null;S.speaker=null;f&&f();return}
 if(it.lazy){d.q.unshift(...it.lazy());return nextLine()}
 if(it.fn){it.fn();return nextLine()}
 if(it.ch){d.ch=true;d.cur=null;d.opts=it.ch;d.v=(d.v||0)+1;return}
 d.ch=false;d.cur=(typeof it[1]==='string'?[it[0],greet(it[1])].concat(it.slice(2)):it);d.typed=0;d.v=(d.v||0)+1;S.speaker=it[0]}
function pickCh(o){const d=S.d;if(!d||!d.ch)return;if(o.f)F[o.f]=true;if(o.fn)o.fn();d.q.unshift(...(o.a?[]:[[S.pl||'lia',o.t]]),...o.r);d.ch=false;nextLine()}
function advance(){const d=S.d;if(!d||d.ch)return;if(d.typed<d.cur[1].length){d.typed=d.cur[1].length;return}nextLine()}
/* ---------- cartões, caderno, fim ---------- */
function showCard(html,btn,fn,opts){S.card={html,btn,fn,opts:opts||null,v:((S.card&&S.card.v)||0)+1};S.scene='card';S.nbOpen=false;S.d=null;S.menu=null}
function chainEra(i){S.ov={};S.newsNow=[];if(i<1)return;for(const c of CHAIN){if(!c.e.includes(i)||!c.if())continue;c.do();S.newsNow.push(c.news);S.rumors.push(c.news);(c.kn||[]).forEach(k=>know(k[0],k[1]))}}
function startEra(i){S.era=i;S.q=null;S.voJob=null;S.voN=0;S.voMsg=false;S.sac=null;S.fx={crowd:0,fire:0,ban:0};S.min=420;S.tray=[];S.tn=0;S.led=ledNew();S.staff=[];S.mode='rua';S.pl=null;S.radioT=0;S.stock=[2,2,2];S.closing=false;S.menu=null;S.d=null;S.busX=0;S.trans=null;S.nbTab=0;S.bant=[];
 setLoc('dentro',560,GY+80);S.icam=clamp(560-VW*.5,0,IW-VW);
 S.rain=Math.random()<[.2,.3,.4][i];S.sign=i<2?'PADARIA':decide2();if(i>=1){S.open.ponto=S.open.programa=S.open.casa=true}
 chainEra(i);initEra();
 const e=ERAS[i];const nw=S.newsNow&&S.newsNow.length?`<div class="news"><b>Entre um dia e outro, na rua</b><ul>${S.newsNow.map(x=>`<li>${x}</li>`).join('')}</ul></div>`:'';
 showCard(`<div class="cin${nw?' dense':''}"><div class="year">${e.year}</div><h2>${e.tit}</h2><p>${e.card}</p>${e.note?`<p class="note">${e.note}</p>`:''}${nw}<p class="tip">${e.tip}</p>${S.rain?'<p class="note">Hoje chove em Salvador.</p>':''}${objCardHTML(i)}</div>`,i===0?'Abrir a padaria':'Abrir mais um dia',beginDay);if(S.ritmo&&S.ritmo!=='completo')S.min=480}
function fecho(){if(S.closing)return;S.closing=true;S.scene='fade';{const q=questOn();if(q){S.qd[q.id]='miss';F['miss_'+q.id]=true;S.q=null}}setTimeout(()=>{setLoc('dentro',680,GY+54);S.scene='play';openDlg(missLines().concat(closing(S.era)),()=>{S.scene='fade';setTimeout(()=>{caixaCard(()=>{S.era===0?playCut('i1',()=>startEra(1)):S.era===1?playCut('i2',startInterlude):endGame()})},700)})},600)}
function relHTML(){const by={};for(const k in S.known){const[a,b]=k.split('>');(by[a]=by[a]||[]).push(b)}
 const secs=Object.keys(by).map(a=>`<section style="--tc:${WHO[a].c}"><h3>${NMS[a]}</h3>${by[a].map(b=>{const r=rel(a,b);return`<div class="note-i" style="background:${r<0?'#EBC3B6':r>0?'#C9DFC4':'#F4EFE0'}"><strong>sobre ${NMS[b]}</strong>${moodR(r)}</div>`}).join('')}</section>`).join('');
 const ru=S.rumors.length?`<section style="--tc:${YEL}"><h3>O que se comentava</h3>${S.rumors.map(x=>`<div class="note-i">${x}</div>`).join('')}</section>`:'';
 return(secs||ru?secs+ru:'<p class="nbs">Ainda não dá para dizer como eles se veem. Preste atenção em quem conversa, e pergunte o que cada um acha dos outros.</p>')+`<p class="nbs">Opiniões mudam. O que está aqui vale para o que Lia viu até agora.</p>`}
function nbHTML(){const keys=Object.keys(CLUES);const h=[`<div class="nbh"><b>Caderno da Lia</b><span class="tabs"><button class="btn sm${S.nbTab?'':' on'}" data-tab="0">Pistas</button><button class="btn sm${S.nbTab?' on':''}" data-tab="1">Entre eles</button></span><button id="nbx" class="btn sm">Fechar (C)</button></div>`];
 if(S.nbTab===1){h.push('<div class="nbg">'+relHTML()+'</div>');return h.join('')}
 if(S.nbTab===2){h.push('<div class="nbg">'+objTabHTML()+'</div>');return h.join('')}
 if(S.nbTab===3){h.push('<div class="nbg">'+logHTML()+'</div>');return h.join('')}
 h.push(objNbHTML());h.push('<p class="nbs">Nada aqui é resposta fechada. São pistas de gente que fala o que quer e esconde o resto.</p><div class="nbg">');
 for(const th in THREADS){const T=THREADS[th],ids=keys.filter(k=>CLUES[k][0]===th),fd=ids.filter(has);
  h.push(`<section style="--tc:${T.c}"><h3>${T.t}</h3>`+fd.map((k,i)=>`<div class="note-i" style="transform:rotate(${(i%3-1)*1.2}deg)"><strong>${CLUES[k][1]}</strong>${CLUES[k][2]}</div>`).join('')+Array(ids.length-fd.length).fill('<div class="note-e">?</div>').join('')+'</section>')}
 h.push('</div>');return h.join('')}
function openNb(){if(S.mode==='vist'){toast('O caderno é da Lia.');return}if(S.scene!=='play'&&S.scene!=='nb')return;S.scene='nb';S.nbOpen=true;S.nbHtml=nbHTML();S.nbV=(S.nbV||0)+1;S.newClue=false;hud()}
function closeNb(){S.nbOpen=false;S.scene='play'}
function missedHTML(){const R=[],cap=t=>t.charAt(0).toUpperCase()+t.slice(1);
 for(const q of QUESTS)if(!F[q.id])R.push([ERAS[q.e[0]].year,'Missão: '+cap(q.lab)+'.']);
 const I={fogo:'O palco do largo pega fogo numa noite de 1998 e a programação oficial é suspensa.',protesto:'Uns vinte moradores sobem no palco com panos pintados: "Casa não é estatística", "Nós ficamos".',calmo:'Fim de tarde no largo, sem protesto nem fogo.'};
 for(const k in I)if(F.inc!==k)R.push(['Vistoria',I[k]]);
 if(F.pol!=='bateu')R.push(['Vistoria','A Polícia Militar entra no largo e dispersa a manifestação.']);
 if(F.pol!=='recuou')R.push(['Vistoria','A polícia chega ao largo e fica parada, esperando alguém decidir.']);
 if(F.inc!=='fogo'&&F.inc!=='protesto')R.push(['TV','O Secretário fala na TV sobre o que aconteceu no largo.']);
 if(!R.length)return'';
 return`<section style="--tc:${GRN}"><h3>Caminhos que você não seguiu</h3>${R.map(([a,t])=>`<p class="r"><b>${a}.</b> ${t}</p>`).join('')}<p class="fin">Nada disso é castigo: são outras partidas possíveis. Jogue de novo e siga outro caminho.</p></section>`}
function endGame(){const found=Object.keys(CLUES).filter(has);let all=0;try{all=JSON.parse(localStorage.getItem('balcao_pistas')||'[]').length}catch(e){}
 const th=Object.keys(THREADS).map(k=>{const T=THREADS[k],ids=Object.keys(CLUES).filter(c=>CLUES[c][0]===k),fd=ids.filter(has);
  const fin=fd.length===0?T.none:fd.length===ids.length?T.full:T.part;
  return`<section style="--tc:${T.c}"><h3>${T.t}</h3>${fd.map(c=>`<p class="r">${CLUES[c][2]}</p>`).join('')}<p class="fin">${fin}</p></section>`}).join('');
 const cxs=S.hist.length?`<section style="--tc:${GRN}"><h3>O caixa, época por época</h3>${S.hist.map((r,i)=>r?`<p class="r"><b>${ERAS[i].year}.</b> vendas ${brl(r.vendas)} · sobra ${brl(r.net)} · gente do bairro ${r.loc} · visitantes ${r.vis}${r.lost?' · desistências '+r.lost:''}</p>`:'').join('')}<p class="fin">Preços, aluguel e salários são fictícios. Valem pela comparação entre as épocas.</p></section>`:'';
 const fa=`<section style="--tc:${PINK}"><h3>Quem ficou, quem foi</h3>${fates().map(([n,t])=>`<p class="r"><b>${n}.</b> ${t}</p>`).join('')}</section>`;
 const sg={'PADARIA':'A padaria continuou padaria, e a rua em volta continuou virando vitrine.','PADARIA & CAFÉ':'A padaria ficou pela metade: forno de manhã, café à tarde.','CAFÉ PELÔ':'A padaria virou café. O forno ainda acende, só que já não é o que se vê primeiro.','LEMBRANÇAS':'A padaria virou loja de lembranças. O forno é enfeite, e a vó faz pão só pra quem pede baixinho.'}[S.sign];
 showCard(`<div class="cin end"><h2>O que a cidade mede</h2><h2 class="big">É o que ela vira.</h2><p>${sg}</p><p class="note">Nesta partida: ${found.length} de ${Object.keys(CLUES).length} pistas. Em todas as partidas neste navegador: ${Math.max(all,found.length)}.</p><p class="note">Vire a página para ver cada frente e o que aconteceu com quem ficou.</p><div class="recon">${objEndHTML()}${th}${cxs}${fa}${missedHTML()}${arquivoHTML()}</div><p class="note">Personagens, falas (inclusive as da TV e a do Secretário), preços e faturamento são fictícios. No Arquivo, as citações e os números são documentados e trazem a fonte. Os demais dados reais vêm do artigo de 2009 usado na disciplina e do artigo de Márcia Sant\'Anna (revista Rua, n. 8). Protótipo demo.</p></div>`,'Conhecer quem passou pelo jogo',()=>castSeq(0));}
function resetGame(){S.flags={};S.tr={};S.clues={};S.seen={};S.asked={};S.helped={};S.evDone={};S.open={};S.deflect={};S.insisted={};S.pressUsed={};S.rel={};S.known={};S.news=[];S.rumors=[];S.ov={};S.bant=[];S.era=0;S.hist=[];S.hired=0;S.intro={};S.beat={};S.tray=[];S.staff=[];S.mode='rua';S.pl=null;S.vs=null;S.q=null;S.qd={};S.deck={};S.askN={};S.fx={crowd:0,fire:0,ban:0};for(const k in F)delete F[k];Object.assign(S,{flags:F});}
/* ---------- HUD (a UI do Phaser lê S) ---------- */
function hud(){S.hudV=(S.hudV||0)+1}
function chips(){}
function clockTxt(){if(S.mode==='vist')return'Dia de vistoria';const h=Math.floor(S.min/60),m=Math.floor(S.min%60);return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+(S.rain?' · chuva':h<11?' · manhã':h<14?' · meio-dia':h<17?' · tarde':' · fim de tarde')}
/* ---------- laço (o Phaser chama update) ---------- */
function update(dt){S.t+=dt;if(S.scene==='cut'){tickCut(dt);return}if(S.toastT>0)S.toastT-=dt;if(S.quiet>0)S.quiet-=dt;
 if(S.trans){const T=S.trans;T.t+=dt;if(!T.sw&&T.t>.22){T.sw=true;if(T.to==='dentro')setLoc('dentro',AN.iporta[0]-6,AN.iporta[1]+30);else setLoc('rua',AN.porta[0],AN.porta[1]+4);S.face=T.to==='dentro'?-1:1}
  if(T.t>.5){S.trans=null;S.scene='play'}}
 const play=S.scene==='play',inn=S.loc==='dentro';
 if(play){if(S.mode!=='vist'&&S.mode!=='f2'){S.min+=dt*3.1*clockK();if(S.min>=1140&&!S.closing){fecho()}}
  let dx=(S.keys.ArrowRight||S.keys.d||S.keys.R?1:0)-(S.keys.ArrowLeft||S.keys.a||S.keys.L?1:0),dy=(S.keys.ArrowDown||S.keys.s||S.keys.Dn?1:0)-(S.keys.ArrowUp||S.keys.w||S.keys.Up?1:0);
  if(!dx&&!dy&&S.tx!=null){const ex=S.tx-S.px,ey=S.ty-S.py,d=Math.hypot(ex,ey);if(d<6){S.tx=null}else{const wp=inn?playerPath(S.tx,S.ty):[S.tx,S.ty],fx=wp[0]-S.px,fy=wp[1]-S.py,fd=Math.hypot(fx,fy)||1;dx=fx/fd;dy=fy/fd}}else if(dx||dy)S.tx=null;
  S.walk=!!(dx||dy);if(S.walk){const l=Math.hypot(dx,dy);dx/=l;dy/=l;if(Math.abs(dx)>.1)S.face=dx>0?1:-1;
   const xa=inn?60:70,xb=inn?IW-60:WW-70,ya=inn?IY0:Y0,yb=inn?IY1:Y1;
   let nx=clamp(S.px+dx*215*dt,xa,xb),ny=clamp(S.py+dy*130*dt,ya,yb);
   const blk=(x,y)=>(inn&&x>CT.x0&&x<CT.x1&&y>CT.y0&&y<CT.y1)||hitSolid(x,y);if(!blk(S.px,S.py)&&blk(nx,ny)){if(!blk(nx,S.py))ny=S.py;else if(!blk(S.px,ny))nx=S.px;else{nx=S.px;ny=S.py}}
   if(nx===S.px&&ny===S.py&&S.tx!=null){S.tx=null;S.walk=false}
   S.px=nx;S.py=ny}
  for(const id in S.npcs){const n=S.npcs[id];if(S.mode==='vist'||S.mode==='f2'){if(S.mode==='f2'){n.walk=false;n.talk=false;if(n.bark){n.bark.t-=dt;if(n.bark.t<=0)n.bark=null}}else vistNpc(n,dt);continue}
   if(ordOpen(n.ord)&&atCounter(n)){n.walk=false;n.talk=false;if(n.bark){n.bark.t-=dt;if(n.bark.t<=0)n.bark=null}continue}
   const w=wantAnchor(n);n.talk=false;
   if(w[2]==='off'&&!n.hidden&&(n.x<-60||n.x>WW+60)){n.hidden=true;n.hideAt=n.x<WW/2?'offL':'offR';continue}
   if(n.hidden){if(HID[w[2]]||w[2]==='off')continue;n.hidden=false;
    if(n.hideAt==='sobe'){n.loc='dentro';n.x=AN.sobe[0];n.y=AN.sobe[1]+10}else{n.loc='rua';n.x=n.hideAt==='offR'?WW+100:-90;n.y=GY+66}}
   const arrived=stepTo(n,w,dt,n.id==='vo'?75:150);
   if(arrived&&HID[w[2]]){n.hidden=true;n.hideAt=w[2]}
   if(w[2]==='ev'&&arrived){const ev=w[3];n.talk=true;const o=ev.actors.find(a=>a!==n.id);if(o)n.dir=S.npcs[o].x>n.x?1:-1}
   if(w[2]==='balcao'&&arrived){n.dir=n.x<AN.balcao[0]?1:-1;if(n.id==='vo')n.dir=1}
   n.barkT-=dt;if(n.barkT<=0){n.barkT=rnd(9,18);tryBark(n)}
   if(n.bark){n.bark.t-=dt;if(n.bark.t<=0)n.bark=null}}
  if(S.mode!=='vist'&&S.mode!=='f2'){updBanter(dt);tickOrders(dt);updVo(dt);updStaff(dt);updNarr();updQuests()}updExtras(dt);if(S.radioT>0)S.radioT-=dt;
  const h=S.min/60;let bx=0;if(S.era===1){if(h>=8.5&&h<9)bx=lerp(2800,1830,(h-8.5)/.5);else if(h>=9&&h<17)bx=1830;else if(h>=17&&h<17.6)bx=lerp(1830,2800,(h-17)/.6)}
  else if(S.era===2){if(h>=10&&h<10.4)bx=lerp(2800,1830,(h-10)/.4);else if(h>=10.4&&h<13)bx=1830;else if(h>=13&&h<13.5)bx=lerp(1830,2800,(h-13)/.5)}S.busX=bx}
 S.tgt=nearTarget();
 if(inn)S.icam=clamp(lerp(S.icam,S.px-VW*.5+S.face*40,RM||S.trans?1:.09),0,IW-VW);else S.cam=clamp(lerp(S.cam,S.px-VW*.46+S.face*50,RM||S.trans?1:.09),0,WW-VW);
 if(S.scene==='dialog'&&S.d&&!S.d.ch&&S.d.cur&&S.d.typed<S.d.cur[1].length){S.d.typed+=dt*58}
 S.hintText=S.scene==='play'?(S.toastT>0?S.toast:(S.tgt?tlabel(S.tgt):hintIdle())):'';
 S.clockTxt=clockTxt();S.whereTxt=inn?'Dentro da padaria':'Na rua'}
function hintIdle(){
 if(S.mode==='vist'){const n=Object.keys(S.vs.done).length;return n<4?'Meta do Programa: 3 pontos. Faltam '+(4-n)+' endereços da lista.':'A lista acabou.'}
 const cs=custAll();
 if(!cs.length&&questOn()){const q=questOn();return'Tarefa: '+q.lab+'.'+(q.tg.loc!==S.loc?(S.loc==='dentro'?' A porta leva à rua.':' Volte pela porta da padaria.'):' Procure o ponto amarelo.')}
 if(S.loc==='dentro'){if(cs.length){const c=cs.find(c=>!c.o.by)||cs[0],nm=c.n?NMS[c.n.id]:'Uma visitante';if(c.o.by)return'Vó Aurea está atendendo '+nm.toLowerCase()+'.';return nm+(c.o.noted?' espera #'+c.o.num+': '+iname(c.o.item)+'.':' quer pedir. Chegue perto e anote.')}return'Forno, vitrine e café. A porta dá para a rua.'}
 if(cs.length)return cs.some(c=>!c.o.by)?'Tem gente esperando no balcão da padaria. A vó atende devagar.':'A vó está atendendo no balcão enquanto você está aqui fora.';return'A padaria fica no meio da rua. Nem tudo acontece no mesmo lugar.'}
/*@@RENDER@@*/
window.__g={hitSolid,solids,updVo,greet,voFree,setPan,pmStage,POL,TVP,epilogo2,arquivoHTML,QUESTS,questOn,doQuest,updQuests,startIncident,INC,reflect,midCall,goAssembly,ASSEMB,placeNpc,ctxLine,deckPick,sayOn,endVist,tickOrders,custAll,newOrd,anotar,entregar,ordOpen,atCounter,startInterlude,doVisit,VIS,VISITS,caixaCard,ledClose,updNarr,mkStaff,pathTo,backTray,beginDay,PRO,NARR,INTRO,update,S,startEra,EV,OBJ,CLUES,SCHED,AN,CT,openNb,gain,closing,fecho,doAsk,doPress,doHelp,doListen,initEra,ASK,HELP,PRESS,TOPIC,LISTEN,endGame,rumo,decide1,decide2,rel,addRel,know,fates,chainEra,goLoc,setLoc,topicsFor,helpsFor,pressFor,rootOpts,beatFor,wantAnchor,nearTarget,waitingOrder,openMenu,interact,doEvent,finishEv,CHAIN};
bootPhaser();
})();
