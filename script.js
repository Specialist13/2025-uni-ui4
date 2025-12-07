// Lentos logika
const gameBoard = document.getElementById('game-board');
const timerEl = document.getElementById('timer');
const pauseButton = document.getElementById('pause-button');
const stopButton = document.getElementById('stop-button');

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
        image.dataset.pictureId = String(pictureIdList[i]);
        cell.appendChild(image);
        gameBoard.appendChild(cell);
    }

    document.getElementById('info').style.display = 'none';
    // Enable controls and start timer
    pauseButton.disabled = false;
    stopButton.disabled = false;
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

pauseButton.addEventListener('click', () => {
    // Toggle pause: when paused, hide board and prevent interaction
    isPaused = !isPaused;
    if (isPaused) {
        gameBoard.style.display = 'none';
        pauseButton.textContent = 'Tęsti';
        isLocked = true;
    } else {
        gameBoard.style.display = '';
        pauseButton.textContent = 'Pauzė';
        isLocked = false;
    }
});

stopButton.addEventListener('click', () => {
    // Stop game: clear board, stop timer, show start menu
    stopTimer();
    timerEl.textContent = '00:00';
    pauseButton.disabled = true;
    stopButton.disabled = true;
    pauseButton.textContent = 'Pauzė';
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
    // Push to in-memory leaderboard
    leaderboardEntries.push({ name: currentPlayerName, size: currentBoardSize, time: elapsedSeconds });
    // Update DOM list
    if (leaderboardList) {
        const li = document.createElement('li');
        li.textContent = `${currentPlayerName} — ${currentBoardSize} langelių — ${formatTime(elapsedSeconds)}`;
        leaderboardList.appendChild(li);
    }
    // Return to main menu
    if (startMenu) {
        // Clear the game board UI
        gameBoard.innerHTML = '';
        // Optionally reset state
        firstCard = null;
        matched = 0;
        isLocked = false;
        // Focus name input for convenience
        nameInput && nameInput.focus();
    }
    document.getElementById('info').style.display = 'block';
    document.getElementById('hud').style.display = 'none';
    // Disable controls and stop timer
    stopTimer();
    pauseButton.disabled = true;
    stopButton.disabled = true;
    pauseButton.textContent = 'Pauzė';
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
            // If all images are matched, finalize
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

