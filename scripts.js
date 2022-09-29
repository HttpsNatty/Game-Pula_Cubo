const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

const card = document.getElementById("card");
const cardScore = document.getElementById("card-score");

//SFX
let pontuacaoSFX = new Audio("https://ia601500.us.archive.org/21/items/som-de-moeda-do-sonic/Som%20de%20moeda%20do%20sonic.wav");
let fimJogoSFX = new Audio("https://ia601400.us.archive.org/5/items/minecraft-death-sound-effect-online-audio-converter.com/Minecraft%20Death%20Sound%20Effect%20%28online-audio-converter.com%29.wav");
let pularSFX = new Audio("https://ia601506.us.archive.org/30/items/sfxpulo-online-audio-converter.com_202209/sfxpulo%20%281%29%20%28online-audio-converter.com%29.wav");


let jogador = null;
let pontuacao = 0;
//Confere se o jogador marcou mais 10 pontos
let aumentoPontuacao = 0;
let arrayBlocos = [];
//Aumenta a velocidade do inimigo a cada 10 pontos
let velocidadeInimigo = 5;
//Não marca mais de um ponto ao mesmo tempo
let podePontuar = true;
let presetTime = 1000;

function iniciarJogo() { //Função para começar o jogo
    jogador = new Jogador(150,350,50,"yellow");
    arrayBlocos = [];
    pontuacao = 0;
    aumentoPontuacao = 0;
    velocidadeInimigo = 5;
    podePontuar = true;
    presetTime = 1000;
}

function GeradorNumero(min,max){
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function Colisores(jogador,bloco){
    let s1 = Object.assign(Object.create(Object.getPrototypeOf(jogador)), jogador);
    let s2 = Object.assign(Object.create(Object.getPrototypeOf(bloco)), bloco);
    s2.size = s2.size - 10;
    s2.x = s2.x + 10;
    s2.y = s2.y + 10;
    return !(
        s1.x>s2.x+s2.size || //R1 is to the right of R2
        s1.x+s1.size<s2.x || //R1 to the left of R2
        s1.y>s2.y+s2.size || //R1 is below R2
        s1.y+s1.size<s2.y //R1 is above R2
    )
}

//Confere se passou o bloco
function passouBloco(jogador, bloco){
    return(
        jogador.x + (jogador.size / 2) > bloco.x + (bloco.size / 4) && 
        jogador.x + (jogador.size / 2) < bloco.x + (bloco.size / 4) * 3
    )
}

class Jogador {
    constructor(x,y,size,color){
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.alturaPular = 12;
        //Configuração do Pulo
        this.podePular = false;
        this.contadorPular = 0;
        this.pularUp = true;
        //Configuração para rotação
        this.giro = 0;
        this.girodetalhe = 90 / 32;
    }

    desenha() {
        this.pular();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y,this.size,this.size);
        if(this.podePular) this.contraRotacao();
    }

    pular() {
        if(this.podePular){
            this.contadorPular++;
            if(this.contadorPular < 15){
                //Go up
                this.y -= this.alturaPular;
            }else if(this.contadorPular > 14 && this.contadorPular < 19){
                this.y += 0;
            }else if(this.contadorPular < 33){
                //Come back down
                this.y += this.alturaPular;
            }
            this.rotacao();
            //End the cycle
            if(this.contadorPular >= 32){
                //Reseta o giro para o próximo pulo
                this.contraRotacao();
                this.giro = 0;
                this.podePular = false;
            }
        }    
    }    

    rotacao() {
        let offsetXPosition = this.x + (this.size / 2);
        let offsetYPosition = this.y + (this.size / 2);
        ctx.translate(offsetXPosition,offsetYPosition);
        //Divisão transforma graus em radianos
        ctx.rotate(this.giro * Math.PI / 180);
        ctx.rotate(this.girodetalhe * Math.PI / 180 );
        ctx.translate(-offsetXPosition,-offsetYPosition);
        
        this.giro += this.girodetalhe;
    }

    contraRotacao() {
        //Gira o cubo ao contrario
        let offsetXPosition = this.x + (this.size / 2);
        let offsetYPosition = this.y + (this.size / 2);
        ctx.translate(offsetXPosition,offsetYPosition);
        ctx.rotate(-this.giro * Math.PI / 180 );
        ctx.translate(-offsetXPosition,-offsetYPosition);
    }
}

class EvitaBloco {
    constructor(size, velocidade){
        this.x = canvas.width + size;
        this.y = 400 - size;
        this.size = size;
        this.color = "purple";
        this.deslizaVelocidade = velocidade;
    }
    desenha() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y,this.size,this.size);
    }
    desliza() {
        this.desenha();
        this.x -= this.deslizaVelocidade;
    }
}

function geracaoblocos() {
    let timeDelay = intervaloAleatorio(presetTime);
    arrayBlocos.push(new EvitaBloco(50, velocidadeInimigo));

    setTimeout(geracaoblocos, timeDelay);
}

function intervaloAleatorio(tempoIntervalo) {
    let returnTime = tempoIntervalo;
    if(Math.random() < 0.5){
        returnTime += GeradorNumero(presetTime / 3, presetTime * 1.5);
    }else{
        returnTime -= GeradorNumero(presetTime / 5, presetTime / 2);
    }
    return returnTime;
}

function desenhaBackground() {
    ctx.beginPath();
    ctx.moveTo(0,400);
    ctx.lineTo(600,400);
    ctx.lineWidth = 1.9;
    ctx.strokeStyle = "black";
    ctx.stroke();
}

function desenhaPonto() {
    ctx.font = "80px Arial";
    ctx.fillStyle = "black";
    let scoreString = pontuacao.toString();
    let xOffset = ((scoreString.length - 1) * 20);
    ctx.fillText(scoreString, 280 - xOffset, 100);
}

function aumentarVelocidade() {
    //Confere se é preciso aumentar a velocidade do jogo
        if(aumentoPontuacao + 10 === pontuacao){
            aumentoPontuacao = pontuacao;
            velocidadeInimigo++;
            presetTime >= 100 ? presetTime -= 100 : presetTime = presetTime / 2;
            //Aumenta a velocidade do bloco
            arrayBlocos.forEach(bloco => {
                bloco.deslizaVelocidade = velocidadeInimigo;
            });
            console.log("Velocidade Aumentada");
        }
}

let animacaoId = null;
function animar() {
    animacaoId = requestAnimationFrame(animar);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    //Lógica para canvas
    desenhaBackground();
    desenhaPonto();
    jogador.desenha();

    aumentarVelocidade();

    arrayBlocos.forEach((arrayBloco, index) => {
        arrayBloco.desliza();
        //Fim de jogo se colidirem
        if(Colisores(jogador, arrayBloco)){
            fimJogoSFX.play();
            cardScore.textContent = pontuacao;
            card.style.display = "block";
            cancelAnimationFrame(animacaoId);
        }
        //Se passou o bloco pode pontuar
        if(passouBloco(jogador, arrayBloco) && podePontuar){
            podePontuar = false;
            pontuacaoSFX.currentTime = 0;
            pontuacaoSFX.play();
            pontuacao++;            
        }
        //Apaga o bloco que não é mais visivel na cena
        if((arrayBloco.x + arrayBloco.size) <= 0){
            setTimeout(() => {
                arrayBlocos.splice(index, 1);
            }, 0)
        }
    });
}

//Chama assim que abre o jogo
iniciarJogo();
animar();
setTimeout(() => {
    geracaoblocos();
}, intervaloAleatorio(presetTime))

addEventListener("keydown", e => {
    if(e.code === 'Space'){
        if(!jogador.podePular){
            pularSFX.play();
            jogador.contadorPular = 0;
            jogador.podePular = true;
            podePontuar = true;
        }
    }
});

//Reinicia o jogo
function reiniciarJogo(button) {
    card.style.display = "none";
    button.blur();
    iniciarJogo();
    requestAnimationFrame(animar);
}