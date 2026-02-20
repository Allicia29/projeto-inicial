🏎️ Mario Kart JS — Simulator
Um simulador de corrida de console desenvolvido em Node.js que utiliza lógica de dados, estruturas condicionais e programação assíncrona para determinar o vencedor de uma disputa épica entre personagens.

🛠️ Funcionalidades Originais
O núcleo do motor de corrida baseia-se nas funções fundamentais presentes no arquivo index.js:

rollDice(): Gera um número aleatório entre 1 e 6, simulando o lançamento de um dado de seis faces.
getRandomBlock(): Sorteia o tipo de terreno da rodada entre RETA, CURVA ou CONFRONTO.
getRandomItem(): Define aleatoriamente um item de penalidade (CASCO ou BOMBA) que pode surgir durante a corrida.
playRaceEngine(): Gerencia o fluxo principal da corrida ao longo de 5 rodadas, calculando as pontuações com base nos atributos de cada personagem.
declareWinner(): Compara os pontos finais de cada competidor e anuncia o grande vencedor ou empate.

🌟 Novas Implementações (Expansão)
Para tornar a simulação mais estratégica e dinâmica, foram integrados novos sistemas:

1. 🎭 Habilidades Especiais (Passivas)
Cada personagem agora possui uma característica única que influencia o resultado:
Mario (Equilibrado): Chance de ignorar uma penalidade de item uma vez por corrida.
Luigi (Vácuo): Se perder uma rodada de velocidade, recebe um bônus de +1 na próxima reta.
Peach (Aceleração): Ganha um bônus extra ao tirar 6 no dado em blocos de curva.

2. 🛣️ Tipos de Pista (Modificadores)
Antes da largada, o ambiente da corrida é definido, alterando as regras do jogo:
Rainbow Road: Aumenta a pontuação ganha em vitórias de CURVA.
Bowser's Castle: A probabilidade de blocos de CONFRONTO aumenta significativamente.
Donut Plains: Pista clássica onde os atributos padrão de VELOCIDADE são testados ao máximo.

3. 📜 Histórico de Corrida
O sistema agora registra o desempenho dos pilotos para consultas futuras:
Logs Detalhados: Armazenamento das vitórias por rodada e total de pontos.
Placar Geral: Um contador persistente que rastreia quem é o maior campeão entre múltiplas execuções do script.

🚀 Como Executar
Certifique-se de ter o Node.js instalado.
Clone o repositório ou copie os arquivos.
No terminal, execute o comando:
Bash
node index.js
