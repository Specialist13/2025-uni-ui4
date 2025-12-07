const gameBoard = document.getElementById('game-board');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const pictureIdList=[];

function createBoard(size) {
    if (!Number.isInteger(size) || size < 20 || size%2 !== 0) {
        alert('Invalid size. Please enter a number more than or equal to 20 and even.');
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
}

const startButton = document.getElementById('start-button');
const sizeInput = document.getElementById('size-input');

startButton.addEventListener('click', () => {
    const size = parseInt(sizeInput.value);
    createBoard(size);
});

let firstCard = null;
let matched = 0;
let isLocked = false;

gameBoard.addEventListener('click', (e) => {
    if (isLocked) return; // ignore clicks while animating
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

