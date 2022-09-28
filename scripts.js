const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const card = document.getElementById("card");
const cardScore = document.getElementById("card-score");

//Efeitos sonoros
// let scoreSFX = new audio();
// let gameOverSFX = new audio();
// let jumpSFX = new audio();

//Usado para "setInterval"
let presetTime = 1000;
//Aumenta a velocidade do inimigo a cada 10 pontos
let enemySpeed = 5;
let score = 0;
//Confere se o jogador marcou mais 10 pontos
let scoreIncrement = 0;
//Não marca mais de um ponto ao mesmo tempo
let canScore = true;

function startGame(){
    player = new Player(150,350,50,"black");
    arrayBlocks = [];
    score = 0;
    scoreIncrement = 0;
    enemySpeed = 5;
    canScore = true;
    presetTime = 1000;
}

function restartGame(button){
    card.style.display = "none";
    button.blur();
    startGame();
    requestAnimationFrame(animate);
}

function drawBackgroundLine(){
    ctx.beginPath();
    ctx.moveTo(0,400);
    ctx.lineTo(600,400);
    ctx.lineWidth = 1.9;
    ctx.strokeStyle = "black";
    ctx.stroke();
}

function drawScore() {
    ctx.font = "80px Arial";
    ctx.fillStyle = "black";
    let scoreString = score.toString();
    let xOffset = ((scoreString.length - 1) *20);
    ctx.fillText(scoreString, 28 - xOffset, 100);
}

//Função de gerar aleatoriamente o max e min
function getRandomNumber(min,max){
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomNumberInterval(timeInterval){
    let returnTime = timeInterval;
    if(Math.random() < 0.5){
        returnTime += getRandomNumber(presetTime / 3, presetTime * 1.5);
    }else{
        returnTime -= getRandomNumber(presetTime / 5, presetTime / 2);
    }
    return returnTime;
}
    

class Player{
    constructor(x,y,size,color){
        this.x=x;
        this.y=y;
        this.size=size;
        this.color=color;
        this.jumpHeight = 12;
        //Configuração do Pulo
        this.shouldJump = false;
        this.jumpCounter = 0;
        //Animação de girar
        this.spin = 0;
        this.spinIncrement = 90 / 32;
    }
}

function rotation() {
    let offsetXPosition = this.x + (this.size / 2);
    let offsetYPosition = this.y + (this.size / 2);
    ctx.translate(offsetXPosition,offsetYPosition);
    //Divisão que converte graus em radianos
    ctx.rotate(this.spin * Math.PI / 180);
    ctx.rotate(this.spinIncrement * Math.PI / 180);
    ctx.translate(-offsetXPosition,-offsetYPosition);
    this.spin += this.spinIncrement;
}

function jump() {
    if(this.shouldJump){
        this.jumpCounter++;
        if(this.jumpCounter <15){
            this.y -= this.jumpHeight;
        }else if(this.jumpCounter > 14 && this.jumpCounter <19){
            this.y += 0;
        }else if(this.jumpCounter < 33){
            this.y += this.jumpHeight
        }
        this.rotation();
        //Acaba o ciclo do Pulo
        if(this.jumpCounter >=32){
            this.counterRotation();
            this.spin = 0;
            this.shouldJump = false;
        }
    }
    function draw() {
        this.jump();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y,this.size,this.size);
        if(this.shouldJump) this.counterRotation();
    }
}

let player = new Player(150,350,50,"black");

class AvoidBlock{
    constructor(size,speed){
        this.x = canvas.width + size;
        this.y = 400 - size;
        this.size = size; 
        this.color = "red";
        this.splideSpeed = speed;
    }
    draw(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y,this.size,this.color);
    }
    slide(){
        this.draw();
        this.x -= this.splideSpeed;
    }
}

let arrayBlocks = [];

//Spwan de blocos
function generateBlocks(){
    let timeDelay = randomNumberInterval(presetTime);
    arrayBlocks.push(new AvoidBlock(50, enemySpeed));

    setTimeout(generateBlocks, timeDelay);
}

//Se colidir
function squaresColliding(player, block){
    let s1 = Object.assign(Object.create(Object.getPrototypeOf(player)),player);
    let s2 = Object.assign(Object.create(Object.getPrototypeOf(block)), block);
    s2.size = s2.size - 10;
    s2.x = s2.x + 10;
    s2.y = s2.y + 10;
    return !(
        s1.x>s2.x+s2.size ||
        s1.x+s1.size<s2.x ||
        s1.y>s2.y+s2.size ||
        s1.y+s1.size<s2.y
    )
}

function isPastBlock(player, block){
    return (
        player.x + (player.size / 2) > block.x (block.size / 4) &&
        player.x + (player.size / 2) < block.x (block.size / 4) * 3
    )
}

function shouldIncreaseSpeed(){
    if(scoreIncrement + 10 === score){
        scoreIncrement = score;
        enemySpeed++;
        presetTime >= 100 ? presetTime -= 100 : presetTime = presetTime / 2;
        arrayBlocks.forEach(block => {
            block.splideSpeed = enemySpeed;
        });
    }
}

let animationId = null;
function animate(){
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0,0,canvas.width,canvas.height);

    //Lógica do canvas
    drawBackgroundLine();
    drawScore();
    player.draw;

    //Checagem da velocidade do jogo
    shouldIncreaseSpeed();

    arrayBlocks.forEach((arrayBlock, index) => {
        arrayBlock.slide();
        //Fim de jogo quando colidir com o jogador
        if(squaresColliding(player, arrayblock)){
            // gameOverSFX.play();
            cardScore.textContent = score;
            card.style.display = "block";
            cancelAnimationFrame(animationId);
        }
        if(isPastBlock(player, arrayBlock) && canScore){
            canScore = false;
            // scoreSFX.currentTime = 0;
            // scoreSFX.play();
            score ++;
        }
        if((arrayBlock.x + arrayBlock.size) <= 0){
            setTimeout(() =>{
                arrayBlocks.splice(index, 1);
            }, 0)
        }
    })
}

