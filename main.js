let timeLeft = 60;              
let barProgress = 0;            
const timerElement = document.getElementById("timer");
const bodyBar = document.getElementById("body-bar");

const pill = document.getElementById("pill");
const emoji = document.getElementById("emoji");


let spawnInterval, timer, progress;
let speedUpDone = false;
let gameStarted = false;
let gamePaused = false; 
let gameOver = false; // 🔹 indica fim de jogo

// Sons
const alertSound = new Audio("Audios/alerta.mp3");
const acertoSound = new Audio("Audios/acerto.mp3");
const erroSound = new Audio("Audios/erro.mp3");
const timerSound = new Audio("Audios/relogio.mp3");

timerSound.loop = true;

// Atualiza a barra
function updateBar() {
  bodyBar.style.height = barProgress + "%";
}

// Função que inicia o jogo
function startGame() {
  if (gameStarted || gameOver) return; 
  gameStarted = true;

  document.getElementById("hud").classList.remove("hidden");
  trackMessage.classList.add("hidden");

  timerSound.play();

  // Contagem regressiva
  timer = setInterval(() => {
    if (gamePaused || gameOver) return;

    timeLeft--;
    timerElement.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame("⏳ Tempo esgotado! Você perdeu 😢");
    }

    if (!speedUpDone && timeLeft <= 30) {
      speedUpDone = true;

      clearInterval(spawnInterval);
      spawnInterval = setInterval(() => {
        if (!gamePaused && !gameOver) spawnItem(Math.random() > 0.5 ? pill : emoji);
      }, 800);

      const hud = document.getElementById("hud");
      hud.style.transition = "0.3s";
      hud.style.boxShadow = "0 0 25px 8px yellow";
      setTimeout(() => { hud.style.boxShadow = "none"; }, 600);

      alertSound.play();
    }
  }, 1000);

  // Progressão da barra (100% em 60s)
  progress = setInterval(() => {
    if (gamePaused || gameOver) return;
    barProgress += 100 / 60;
    if (barProgress >= 100) {
      barProgress = 100;
      endGame("🤢 Enjoo venceu 😵");
    }
    updateBar();
  }, 1000);

  // Spawn inicial
  spawnInterval = setInterval(() => {
    if (!gamePaused && !gameOver) spawnItem(Math.random() > 0.5 ? pill : emoji);
  }, 1200);

  updateBar();
}

// Spawn aleatório
function spawnItem(item) {
  item.style.display = "block";
  item.style.left = Math.random() * (window.innerWidth - 80) + "px";
  item.style.top = Math.random() * (window.innerHeight - 80) + "px";
  setTimeout(() => { item.style.display = "none"; }, 2000);
}

// Clique na pílula → melhora
pill.addEventListener("click", () => {
  if (gamePaused || gameOver) return;
  barProgress -= 10;
  if (barProgress < 0) barProgress = 0;
  acertoSound.play();
  if (barProgress <= 0) {
    endGame("✅ Você venceu! Corpo totalmente azul 🎉");
    return;
  }
  updateBar();
  pill.style.display = "none";
});

// Clique no emoji → piora
emoji.addEventListener("click", () => {
  if (gamePaused || gameOver) return;
  barProgress += 10;
  if (barProgress > 100) barProgress = 100;
  erroSound.play();
  if (barProgress >= 100) {
    endGame("🤢 Enjoo venceu 😵");
    return;
  }
  updateBar();
  emoji.style.display = "none";
});

// Encerrar jogo
function endGame(message) {
  if (gameOver) return; // 🔹 evita múltiplos triggers
  gameOver = true;
  clearInterval(timer);
  clearInterval(progress);
  clearInterval(spawnInterval);

  // Para todos os sons
  timerSound.pause();
  timerSound.currentTime = 0;
  alertSound.pause();
  alertSound.currentTime = 0;

  if (message.includes("venceu") || message.includes("✅")) {
    acertoSound.play();
  } else {
    erroSound.play();
  }

  const gameOverScreen = document.getElementById("game-over-screen");
  const gameOverMessage = document.getElementById("game-over-message");
  gameOverMessage.textContent = message;
  gameOverScreen.classList.remove("hidden");

  document.getElementById("restart-btn").onclick = () => location.reload();
  document.getElementById("choose-btn").onclick = () => window.location.href = "escolha.html";
}

// 🔹 AR: controle do track
const trackTarget = document.getElementById("track-target");
const trackMessage = document.getElementById("track-message");

trackTarget.addEventListener("targetFound", () => {
  if (gameOver) return; // 🔹 não reinicia nada após o fim
  if (!gameStarted) {
    startGame();
  } else {
    gamePaused = false;
    timerSound.play();
  }
  trackMessage.classList.add("hidden");
});

trackTarget.addEventListener("targetLost", () => {
  if (gameOver) return; 
  gamePaused = true;
  timerSound.pause();
  trackMessage.textContent = "Perdeu o marcador! Aponte a câmera novamente 👀";
  trackMessage.classList.remove("hidden");
});

// Inicializa barra totalmente azul
updateBar();

//----------------------------------------------------------------------

// ------------------- ÁUDIO -------------------

// Avião
const aviaoSound = document.getElementById("aviao-sound");
aviaoSound.volume = 1;
aviaoSound.loop = true;

// Navio
const navioSound = document.getElementById("navio-sound");
navioSound.volume = 1;
navioSound.loop = true;

// Função para tocar áudio com catch em caso de bloqueio
function playAudio(audio) {
  audio.play().catch(err => console.log("Som bloqueado até interação do usuário:", err));
}

// Função para parar e resetar áudio
function stopAudio(audio) {
  audio.pause();
  audio.currentTime = 0;
}

// Unifica os eventos do marcador
trackTarget.addEventListener("targetFound", () => {
  if (gameOver) return;
  playAudio(aviaoSound);
  playAudio(navioSound);
});

trackTarget.addEventListener("targetLost", () => {
  stopAudio(aviaoSound);
  stopAudio(navioSound);
});

// ------------------- FIM DO JOGO -------------------
// Unifica parada de todos os sons
const originalEndGame = window.endGame;
window.endGame = function(message) {
  stopAudio(aviaoSound);
  stopAudio(navioSound);
  originalEndGame(message);
};

// ------------------- DESBLOQUEIO MOBILE -------------------
// Em mobile, som só toca após interação
document.body.addEventListener("click", () => {
  if (aviaoSound.paused) playAudio(aviaoSound);
  if (navioSound.paused) playAudio(navioSound);
});
