const fs = require('fs').promises;
const path = require('path');

const player1 = {
    NOME: "Mario",
    VELOCIDADE: 4,
    MANOBRABILIDADE: 3,
    PODER: 3,
    PONTOS: 0,
    ABILIDADE: "EQUILIBRADO", // se tirar 1 no dado, pode rolar novamente
    BUFF_RETA: 0,
};

const player2 = {
    NOME: "Luigi",
    VELOCIDADE: 3,
    MANOBRABILIDADE: 4,
    PODER: 4,
    PONTOS: 0,
    ABILIDADE: "VACUO", // se perder uma rodada de velocidade, ganha +1 na próxima RETA
    BUFF_RETA: 0,
};

// Sugestão: novo player Bowser com habilidade 'PESADO'
const player3 = {
    NOME: "Bowser",
    VELOCIDADE: 2,
    MANOBRABILIDADE: 2,
    PODER: 5,
    PONTOS: 0,
    ABILIDADE: "PESADO", // quando vence um confronto, o oponente perde 2 pontos
    BUFF_RETA: 0,
};

const RACES_FILE = path.join(__dirname, '..', 'races.json');
const RANKING_FILE = path.join(__dirname, '..', 'ranking.json');

function rollDice(){
 return Math.floor(Math.random() * 6) + 1;
};

async function getRandomBlock(){
    let random = Math.random()
    let result

    switch (true) {
        case random < 0.33:
         result = "RETA" 
         break;
        case random < 0.66:
         result = "CURVA";
         break;
        default:
         result = "CONFRONTO"
    }
    return result;
}
async function getRandomTrack(){
    // sorteia o tipo de pista: CHUVA, DESERTO ou CASTELO
    const r = Math.random();
    if(r < 0.34) return "CHUVA";
    if(r < 0.67) return "DESERTO";
    return "CASTELO";
}
async function getRandomItem(){
    // retorna aleatoriamente 'CASCO' (-1 ponto) ou 'BOMBA' (-2 pontos)
    const r = Math.random();
    return r < 0.5 ? "CASCO" : "BOMBA";
}
async function logRollResult(characterName, block, diceResult, attribute)
{
console.log(
    `${characterName} 🎲 rolou um dado de ${block} ${diceResult} + ${attribute} = ${
        diceResult + attribute
    }`
);
}
    


async function playRaceEngine(character1, character2) {
    // novo parâmetro track será passado pela chamada em main
    // se não for passado, assume pista neutra
    // mas vamos aceitar track via variável externa definida em main
    // (main passará 'track' por closure)
    const track = playRaceEngine.track || null;
    const trackEffects = {
        manobrabilidadeDelta: 0,
        confrontoWeight: null, // null significa padrão
        desertoBonus: false,
    };

    if(track === "CHUVA"){
        trackEffects.manobrabilidadeDelta = -1;
        console.log("🌧️ Pista: Chuva — manobrabilidade de todos diminuída em 1.");
    } else if(track === "DESERTO"){
        trackEffects.desertoBonus = true;
        console.log("🏜️ Pista: Deserto — quem tiver mais VELOCIDADE em RETA ganha +1.");
    } else if(track === "CASTELO"){
        trackEffects.confrontoWeight = 0.6; // mais confrontos
        console.log("🏰 Pista: Castelo do Bowser — mais confrontos! (maior chance de CONFRONTO)");
    } else {
        console.log("🛣️ Pista: Neutra.");
    }

    for(let round = 1; round <=5; round++) {
        console.log(`🏁 Rodada ${round}`);

        // // sortear bloco (ajusta probabilidades se CASTELO)
        let block;
        if(trackEffects.confrontoWeight){
            const r = Math.random();
            const confrontoW = trackEffects.confrontoWeight; // e.g. 0.6
            const other = (1 - confrontoW) / 2;
            if(r < other) block = "RETA";
            else if(r < other * 2) block = "CURVA";
            else block = "CONFRONTO";
        } else {
            block = await getRandomBlock();
        }
        console.log(`Bloco: ${block}`)
         // // rolar os dados
            let diceResult1 = await rollDice();
            let diceResult2 = await rollDice();

            // Habilidade passiva: EQUILIBRADO -> rerolar se tirar 1
            if(character1.ABILIDADE === "EQUILIBRADO" && diceResult1 === 1){
             console.log(`${character1.NOME} ativou Equilibrado (tirou 1) — rolando novamente...`);
             diceResult1 = await rollDice();
             console.log(`${character1.NOME} novo resultado: ${diceResult1}`);
            }

            if(character2.ABILIDADE === "EQUILIBRADO" && diceResult2 === 1){
             console.log(`${character2.NOME} ativou Equilibrado (tirou 1) — rolando novamente...`);
             diceResult2 = await rollDice();
             console.log(`${character2.NOME} novo resultado: ${diceResult2}`);
            }

       // //teste habilidade
       let testSkill1 = 0;
       let testSkill2 = 0;


       if(block === "RETA") {
                testSkill1 = diceResult1 + character1.VELOCIDADE + (character1.BUFF_RETA || 0);
                testSkill2 = diceResult2 + character2.VELOCIDADE + (character2.BUFF_RETA || 0);

                // Deserto: RETA dá +1 para quem tem mais VELOCIDADE
                if(trackEffects.desertoBonus){
                    if(character1.VELOCIDADE > character2.VELOCIDADE){
                        testSkill1 += 1;
                        console.log(`${character1.NOME} recebeu +1 por ser mais veloz no Deserto.`);
                    } else if(character2.VELOCIDADE > character1.VELOCIDADE){
                        testSkill2 += 1;
                        console.log(`${character2.NOME} recebeu +1 por ser mais veloz no Deserto.`);
                    }
                }

        await logRollResult(character1.NOME, "velocidade", diceResult1, character1.VELOCIDADE);

        await logRollResult(character2.NOME, "velocidade", diceResult2, character2.VELOCIDADE);

                // consumiu o buff de reta (se houver)
                if(character1.BUFF_RETA && character1.BUFF_RETA > 0) character1.BUFF_RETA = 0;
                if(character2.BUFF_RETA && character2.BUFF_RETA > 0) character2.BUFF_RETA = 0;
       };

       if(block === "CURVA") {
                testSkill1 = diceResult1 + character1.MANOBRABILIDADE + (trackEffects.manobrabilidadeDelta || 0);
                testSkill2 = diceResult2 + character2.MANOBRABILIDADE + (trackEffects.manobrabilidadeDelta || 0);

         await logRollResult(character1.NOME,"manobrabilidade",diceResult1, character1.MANOBRABILIDADE);

         await logRollResult(character2.NOME,"manobrabilidade",diceResult2, character2.MANOBRABILIDADE);
       };

       if(block === "CONFRONTO") {
        let powerResult1 = diceResult1 + character1.PODER;
        let powerResult2 = diceResult2 + character2.PODER;

          if(powerResult1 > powerResult2 && character2.PONTOS > 0){
                // dano depende se vencedor tem PESADO
                const damage = character1.ABILIDADE === "PESADO" ? 2 : 1;
                console.log(`${character1.NOME} venceu o confronto! ${character2.NOME} perde ${damage} ponto(s)!`);
                character2.PONTOS = Math.max(0, character2.PONTOS - damage);
          }

            if(powerResult2 > powerResult1 && character1.PONTOS > 0){
                const damage = character2.ABILIDADE === "PESADO" ? 2 : 1;
                console.log(`${character2.NOME} venceu o confronto! ${character1.NOME} perde ${damage} ponto(s)!`);
                character1.PONTOS = Math.max(0, character1.PONTOS - damage);
            }

     console.log(powerResult2 == powerResult1 ? "Empate! Nenhum ponto foi ganho ou perdido!"
            : ""
        );

        console.log(`${character1.NOME} confrontou com ${character2.NOME}!🥊`);

        await logRollResult(character1.NOME,"poder", diceResult1, character1.PODER);

        await logRollResult(character2.NOME,"poder", diceResult2, character2.PODER);

    

       
        // notas: já aplicamos dano acima com respeito a habilidade PESADO
       };

     // // verificar quem ganhou a rodada

       if(testSkill1 > testSkill2){
        console.log(`${character1.NOME} marca um ponto! 🏆`);
        character1.PONTOS ++;
       } else if(testSkill2 > testSkill1){
        console.log(`${character2.NOME} marca um ponto! 🏆`);
        character2.PONTOS ++;
       }

            // Habilidade VACUO: se perder uma rodada de velocidade, ganha +1 na próxima RETA
            if(block === "RETA"){
                if(testSkill1 > testSkill2 && character2.ABILIDADE === "VACUO"){
                    character2.BUFF_RETA = 1;
                    console.log(`${character2.NOME} ativou Vácuo: ganhará +1 na próxima RETA`);
                }

                if(testSkill2 > testSkill1 && character1.ABILIDADE === "VACUO"){
                    character1.BUFF_RETA = 1;
                    console.log(`${character1.NOME} ativou Vácuo: ganhará +1 na próxima RETA`);
                }
            }

            // sorteio de item com chance de 30% por rodada
            const itemChance = Math.random();
            if(itemChance < 0.3){
                // apenas aplica se houve um vencedor na rodada
                if(testSkill1 !== testSkill2){
                    const item = await getRandomItem();
                    let target = testSkill1 > testSkill2 ? character2 : character1;
                    let damage = item === "CASCO" ? 1 : 2;
                    const before = target.PONTOS;
                    target.PONTOS = Math.max(0, target.PONTOS - damage);
                    console.log(`🧰 Item apareceu: ${item}! ${target.NOME} perde ${damage} ponto(s) (${before} -> ${target.PONTOS})`);
                }
            }

       console.log("-----------------------------");
    }
};

async function declareWinner(character1, character2) {
    console.log(`🏁 Corrida terminou! 🏁`);
    console.log(`${character1.NOME} tem ${character1.PONTOS} pontos.`);
    console.log(`${character2.NOME} tem ${character2.PONTOS} pontos.`);

    if(character1.PONTOS > character2.PONTOS){
        console.log(`${character1.NOME} é o vencedor! 🎉`);
    } else if(character2.PONTOS > character1.PONTOS){
        console.log(`${character2.NOME} é o vencedor! 🎉`);
    } else {
        console.log(`A corrida terminou empatada! 🤝`);
    }   

}

async function saveRaceResult(winner, players, track){
    try{
        let races = [];
        try{
            const raw = await fs.readFile(RACES_FILE, 'utf8');
            races = JSON.parse(raw);
        } catch(err){
            if(err.code !== 'ENOENT') throw err; // other errors bubble up
        }

        const entry = {
            date: new Date().toISOString(),
            track: track || null,
            winner: winner,
            players: players.map(p => ({ nome: p.NOME, pontos: p.PONTOS }))
        };

        races.push(entry);
        await fs.writeFile(RACES_FILE, JSON.stringify(races, null, 2), 'utf8');

        // atualizar ranking agregando vencedores
        await updateRanking(races);
        console.log(`✅ Resultado salvo em ${RACES_FILE}`);
    } catch(err){
        console.error('Erro ao salvar resultado:', err);
    }
}

async function updateRanking(races){
    const counts = {};
    for(const r of races){
        if(r.winner && r.winner !== 'EMPATE'){
            counts[r.winner] = (counts[r.winner] || 0) + 1;
        }
    }
    try{
        await fs.writeFile(RANKING_FILE, JSON.stringify(counts, null, 2), 'utf8');
        console.log(`📊 Ranking atualizado em ${RANKING_FILE}`);
    } catch(err){
        console.error('Erro ao salvar ranking:', err);
    }
}
      
(async function main() {
    console.log(
        `🚨🏁 Corrida entre ${player1.NOME} e ${player2.NOME} começando... `
    );

    // sorteia a pista e passa para o engine via propriedade
    const track = await getRandomTrack();
    playRaceEngine.track = track;

    await playRaceEngine(player1, player2);

    // determina vencedor para salvar persistência
    let winner = 'EMPATE';
    if(player1.PONTOS > player2.PONTOS) winner = player1.NOME;
    else if(player2.PONTOS > player1.PONTOS) winner = player2.NOME;

    await saveRaceResult(winner, [player1, player2], track);

    declareWinner(player1, player2);
})();

