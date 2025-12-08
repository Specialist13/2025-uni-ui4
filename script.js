// Lentos logika
const gameBoard = document.getElementById('game-board');
const timerEl = document.getElementById('timer');
const pauseButton = document.getElementById('pause-button');
const stopButton = document.getElementById('stop-button');
const infoSection = document.getElementById('info');
const hud = document.getElementById('hud');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const pictureIdList=[];

function createBoard(size) {
    if (!Number.isInteger(size) || size < 20 || size>100 || size%2 !== 0) {
        alert('Neteisingas dydis. Įveskite skaičių, kuris yra ne mažesnis nei 20 ir lyginis.');
        return;
    }
    pictureIdList.length = 0;
    for (let i=1;i<=Math.min(size/2, 15);i++){
        pictureIdList.push(i);
        pictureIdList.push(i);
    }
    if (size/2>15) {
        for (let i=16;i<=size/2;i++){
            const j=Math.floor(Math.random()*15)+1;
            pictureIdList.push(j);
            pictureIdList.push(j);
        }
    }
    shuffle(pictureIdList);

    gameBoard.innerHTML = '';
    for (let i = 0; i < size; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        const image = document.createElement('img');
        image.src = 'public/' + pictureIdList[i] + '.png';
        image.draggable = false;
        image.dataset.pictureId = String(pictureIdList[i]);
        cell.appendChild(image);
        gameBoard.appendChild(cell);
    }

    document.getElementById('info').style.display = 'none';
    pauseButton.disabled = false;
    stopButton.disabled = false;
    setPauseButtonState(false);
    document.getElementById('hud').style.display = 'flex';
    startTimer();
}

// Valdymo elementai

const nameInput = document.getElementById('name-input');
const startButton = document.getElementById('start-button');
const sizeInput = document.getElementById('size-input');
const leaderboard = document.getElementById('leaderboard');
const leaderboardEntries = [];
const leaderboardList = document.getElementById('leaderboard-list');
const startMenu = document.getElementById('start');
let currentPlayerName = '';
let currentBoardSize = 0;
let timerInterval = null;
let elapsedSeconds = 0;
let isPaused = false;

function setPauseButtonState(paused) {
    const iconEl = pauseButton ? pauseButton.querySelector('img') : null;
    if (iconEl) {
        iconEl.src = paused ? 'public/play.png' : 'public/pause.png';
        iconEl.alt = paused ? 'Tęsti' : 'Pauzė';
    }
    if (pauseButton) {
        pauseButton.setAttribute('aria-label', paused ? 'Tęsti' : 'Pauzė');
    }
}

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function startTimer() {
    stopTimer();
    elapsedSeconds = 0;
    timerEl.textContent = formatTime(elapsedSeconds);
    timerInterval = setInterval(() => {
        if (!isPaused) {
            elapsedSeconds += 1;
            timerEl.textContent = formatTime(elapsedSeconds);
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

startButton.addEventListener('click', () => {
    const size = parseInt(sizeInput.value);
    const playerName = nameInput.value.trim();
    if (!playerName) {
        alert('Įveskite savo vardą.');
        return;
    }
    currentPlayerName = playerName;
    currentBoardSize = size;
    createBoard(size);
});

// Disable dragging on images globally
document.addEventListener('dragstart', (e) => {
    const img = e.target.closest && e.target.closest('img');
    if (img) {
        e.preventDefault();
    }
});

pauseButton.addEventListener('click', () => {
    isPaused = !isPaused;
    if (isPaused) {
        gameBoard.style.display = 'none';
        setPauseButtonState(true);
        isLocked = true;
    } else {
        gameBoard.style.display = '';
        setPauseButtonState(false);
        isLocked = false;
    }
});

stopButton.addEventListener('click', () => {
    stopTimer();
    timerEl.textContent = '00:00';
    pauseButton.disabled = true;
    stopButton.disabled = true;
    setPauseButtonState(false);
    isPaused = false;
    firstCard = null;
    matched = 0;
    isLocked = false;
    gameBoard.innerHTML = '';
    gameBoard.style.display = '';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('info').style.display = 'block';
});

// Žaidimo logika

let firstCard = null;
let matched = 0;
let isLocked = false;
function onGameComplete() {
    leaderboardEntries.push({ name: currentPlayerName, size: currentBoardSize, time: elapsedSeconds });
    if (leaderboardList) {
        const li = document.createElement('li');
        li.textContent = `${currentPlayerName} — ${currentBoardSize} langelių — ${formatTime(elapsedSeconds)}`;
        leaderboardList.appendChild(li);
    }
    if (startMenu) {
        gameBoard.innerHTML = '';
        firstCard = null;
        matched = 0;
        isLocked = false;
        nameInput && nameInput.focus();
    }
    document.getElementById('info').style.display = 'block';
    document.getElementById('hud').style.display = 'none';
    stopTimer();
    pauseButton.disabled = true;
    stopButton.disabled = true;
    setPauseButtonState(false);
    isPaused = false;
}

gameBoard.addEventListener('click', (e) => {
    if (isLocked) return;
    const img = e.target.closest('img');
    if (!img) return;
    const pictureId = img.dataset.pictureId;
    console.log('Clicked picture id:', pictureId);
    if (img.classList.contains('matched') || img === firstCard) {
        return;
    }
    img.classList.add('clicked');
    if (!firstCard) {
        firstCard = img;
        return;
    }
    if (firstCard.dataset.pictureId === pictureId && firstCard !== img) {
        matched += 2;
        isLocked = true;
        setTimeout(() => {
            if (firstCard) {
                firstCard.classList.remove('clicked');
                firstCard.classList.add('matched');
            }
            img.classList.remove('clicked');
            img.classList.add('matched');
            firstCard = null;
            isLocked = false;

            const totalCards = gameBoard.querySelectorAll('img').length;
            if (matched >= totalCards && totalCards > 0) {
                onGameComplete();
            }
        }, 300);
    } else {
        isLocked = true;
        setTimeout(() => {
            if (firstCard) {
                firstCard.classList.remove('clicked');
                firstCard.classList.add('hidden');
            }
            img.classList.remove('clicked');
            img.classList.add('hidden');
            firstCard = null;
            isLocked = false;
        }, 500);
    }
});

function isVisible(el) {
    return el && getComputedStyle(el).display !== 'none';
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Enter') {
        if (infoSection && isVisible(infoSection) && !startButton.disabled) {
            e.preventDefault();
            startButton.click();
        }
    } else if (e.code === 'Space' || e.code === 'Spacebar') {
        if (pauseButton && !pauseButton.disabled) {
            e.preventDefault();
            pauseButton.click();
        }
    } else if (e.code === 'Escape') {
        const modal = document.getElementById('help-modal');
        if (modal && modal.classList.contains('open')) {
            e.preventDefault();
            closeHelpModal();
            return;
        }
        if (stopButton && !stopButton.disabled) {
            e.preventDefault();
            stopButton.click();
        }
    }
});

// Pagalbos mygtukas ir modalo logika
(function initHelpModal(){
    const helpBtn = document.getElementById('help-button');
    const modal = document.getElementById('help-modal');
    const closeBtn = document.getElementById('help-close');
    let lastFocused = null;

    if (!helpBtn || !modal || !closeBtn) return;

    window.closeHelpModal = function closeHelpModal(){
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden','true');
        if (lastFocused && typeof lastFocused.focus === 'function') {
            lastFocused.focus();
        }
    }

    function openHelpModal(){
        lastFocused = document.activeElement;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden','false');
        closeBtn.focus();
    }

    helpBtn.addEventListener('click', openHelpModal);
    closeBtn.addEventListener('click', () => window.closeHelpModal());
    modal.addEventListener('click', (e) => {
        const target = e.target;
        if (target && target.dataset && target.dataset.close === 'true') {
            window.closeHelpModal();
        }
    });
})();

