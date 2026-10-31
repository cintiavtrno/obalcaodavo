# Prompt para continuar "O balcão da vó"

Cole este texto no outro chat e anexe o arquivo `balcao-da-vo-projeto.zip` (ou a pasta `pacote`).

---

## Quem sou eu e o que é o projeto

Sou Cíntia Vitorino (UFBA, Lab404). "O balcão da vó" é um jogo 2D online sobre o Pelourinho (Salvador, 1991–2000), parte de "O que a cidade mede". Você controla a Lia, neta de Dona Aurea, que ajuda a avó na padaria enquanto o Programa de Recuperação do Centro Histórico muda a rua. São três épocas (1991, 1996, 2000). Personagens e dados do jogo são fictícios.

Escreva em português do Brasil, direto, sem cara de texto de IA (sem epifonemas, travessão estético, frases de efeito). **Estou perto do meu limite de uso: não gaste token à toa, não releia arquivos grandes, não faça explicações longas.** Entregue um HTML que abre direto no navegador.

## Como o projeto está montado

- Saída: um único `o-balcao-da-vo.html` (Phaser 3.80.1 pelo CDN cdnjs; imagens e fontes embutidas em base64).
- Para gerar: `python3 build.py` (na pasta do pacote). Ele junta `src/` + `fonts/` no HTML. `python3 build.py dev` usa um `phaser.min.js` local, para testar sem internet.
- `src/logic_pre.js`: lógica, narrativa, textos, eventos, objetos (`OBJ`), conversas, tempo (`S.min`), épocas (`S.era` 0/1/2). Todo o render entra no marcador `/*@@RENDER@@*/`.
- `src/r1_core.js`: texto (DM Sans nos títulos/HUD/botões, Atkinson Hyperlegible no resto), painéis lisos (`HPanel`, estilos em `PSTY`), constantes `LW=480, LH=270`, `HK` (fator de resolução).
- `src/r2_boot.js`: carga, texturas, animações, configuração do Phaser. O jogo renderiza em `(LW*HK)×(LH*HK)` e cada câmera usa zoom `HK`. Coordenadas do ponteiro dividem por `HK`.
- `src/r3_ents.js` personagens; `r4_rua.js` rua e adereços por época; `r5_padaria.js` interior; `r6_ui.js` HUD, diálogos, cartões, caderno, painel da TV, painel do dominó; `r7_input.js` teclado.
- `src/assets.js`: gerado (atlas `chars`, `ui`, `xtra`, fundos `rua91/rua96/rua00`, `varanda`, `interior`). **Não abra nem imprima este arquivo: é enorme.**
- Rua: o pano de fundo tem 1264×270 px. A lógica usa x do dobro (mundo 2528): `x_do_pano = x_lógico / 2`. O chão andável da rua é a faixa y 244–266 do pano (função `SY`). Adereços fixos apoiam no chão em `PY=254` (`r4_rua.js`), com sprite de origem `(.5,1)` e profundidade igual ao y dos pés.
- `ferramentas/`: scripts usados para gerar assets e a reforma visual (só referência; dependem das folhas originais).
- `testes/`: ganchos para teste com Playwright (Chromium com WebGL por software). Ganchos no jogo: `__g.startEra(n)`, `__g.setLoc("rua", x_lógico, y_lógico)`, `__g.S`, `__openDlg([...], cb)`, `__g.setPan("tv2")`, `__g.endGame()`, `__g.caixaCard(cb)`, `__g.openNb()`.

## Tarefa 1 (urgente): tudo que "flutua" precisa ficar rente ao chão

Já corrigi o dominó, os adereços da rua e a cena de pintura facial dos anos 2000. Falta revisar o resto com método, não só no olho:

1. Para cada época (0, 1, 2) e cada trecho da rua (setLoc em x lógico 330, 800, 1300, 1800, 2300), tirar captura recortada na faixa do chão (1366×768) e verificar se os pés/pés das mesas/cadeiras/vasos tocam calçada ou paralelepípedo visível, não parede, degrau ou vão.
2. Itens a conferir: mesa do dominó, orelhão, barraca de acarajé e baiana, mesa de artesanato (1996), mesas e cadeiras do café e vasos (2000), Olodum (trio, par que caminha, percussionistas avulsos), pintura corporal (braço e rosto), turistas, Seu Zé e demais NPCs sentados, sombras de todos eles.
3. Regra: pés em y entre 246 e 262 do pano onde houver calçada; onde a calçada some (esquina do sobrado verde, x lógico ≈ 850), mudar o x, não o y.
4. Também no interior da padaria (personagens atrás/à frente do balcão).

## Tarefa 2: recursos novos

**a) Apresentação dos personagens no final.** Depois do relatório, uma sequência por personagem que passou pelo jogo: "este passou, era fulano; ele fez tal coisa; a sua personagem (a Lia) viveu esse episódio assim". Montar a partir do estado real da partida (`S.rel`, `S.know`, `S.flags`, eventos vividos, pistas), sem inventar conteúdo que o jogador não tenha visto. Marcar como fictícios.

**b) Modo completo ou rápido.** Tela de escolha antes de começar: **Completo**, **Rápido 10 min**, **Rápido 7 min**. No rápido, comprimir o dia (relógio mais rápido ou janela menor do dia) e manter as três épocas, com os eventos e conversas essenciais garantidos.

**c) Objetivos por partida, mostrados antes de jogar.** Estrutura de jogo:
- Início do dia: o jogador recebe as condições do período, conhece seus objetivos e vê as possibilidades de ação.
- Exploração: circula, encontra personagens, observa acontecimentos, busca informações.
- Interações e decisões: conversa, age, coleta evidências, cria relações, interfere no ambiente.
- Objetivo geral: acompanhar e participar das dinâmicas sociais do território, entender o que acontece, construir relações, reunir informações e interferir nas situações que afetam a comunidade.
- Objetivos específicos: **cada partida sorteia 2**, e eles aparecem antes de começar e ficam visíveis no HUD/caderno. Tipos: investigar acontecimentos; estabelecer relações de confiança; reunir evidências e informações; participar de reuniões e articulações; fazer intervenções no território; lidar com situações de moradia e permanência; mobilizar pessoas e construir solidariedade.
- Os objetivos orientam a experiência, mas não determinam todas as ações. O jogo deve se organizar em torno deles (eventos e conversas que servem ao objetivo ganham destaque), sem ficar embolado, e o final mostra o que foi cumprido e o que ficou de fora. Isso vale também para a versão completa.

## Tarefa 3: pendências da reforma visual

- Conferir por captura as telas que não revisei: menu de conversa com opções, painel da polícia, janelas de ajuda, caderno aba "Entre eles", tela de fim com muitas pistas.
- O zero de Atkinson vem riscado (é da fonte, acessibilidade); ver se incomoda nos números de dinheiro.
- Textos longos em botões (quebra de linha) e telas abaixo de 800 px.
- Monitores maiores que 1920 px ampliam suave; avaliar `HK=5` se ficar borrado.

## Resíduos narrativos conhecidos

- Algumas conversas "assinei primeiro" de Seu Raimundo ainda podem aparecer nas épocas 0/1.
- O dia da vistoria de 1996 muda `S.era` para 1; checar consistência de fundo, placa e falas.
- Há uma emenda visível entre a fachada de perto (trecho 2) e o largo distante (trecho 3) do pano de fundo.

## Como entregar

1. Alterar só o necessário em `src/`. 2. `python3 build.py`. 3. Testar: abrir intro, jogar a padaria, rua nas três épocas, um diálogo, caderno, caixa do dia, final; sem erro no console. 4. Entregar o `o-balcao-da-vo.html` e dizer em poucas linhas o que mudou e o que não consegui testar.
