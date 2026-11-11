// Game State
let board = Array(9).fill("");
let currentPlayer = "X";
let isGameActive = true;

// Load scores from localStorage if available, otherwise start at 0
let scores = JSON.parse(localStorage.getItem('tictactoe_scores')) || { X: 0, O: 0, ties: 0 };

const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// DOM Elements
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const gameModeSelect = document.getElementById('gameMode');
const scoreXDisplay = document.getElementById('scoreX');
const scoreODisplay = document.getElementById('scoreO');
const scoreTiesDisplay = document.getElementById('scoreTies');
const labelODisplay = document.getElementById('labelO');
const nextRoundBtn = document.getElementById('nextRoundBtn');
const resetAllBtn = document.getElementById('resetAllBtn');
const winningLine = document.getElementById('winningLine');
const resultModal = document.getElementById('resultModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalNextBtn = document.getElementById('modalNextBtn');

modalNextBtn.addEventListener('click', () => {
    resultModal.classList.remove('show');
    startNextRound();
});

// Initialize UI with loaded scores and correct mode label
updateScoreboard();
handleModeChange();

// Initialize Event Listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
gameModeSelect.addEventListener('change', handleModeChange);
nextRoundBtn.addEventListener('click', startNextRound);
resetAllBtn.addEventListener('click', resetAll);

function handleCellClick(e) {
    const clickedCell = e.target;
    const index = parseInt(clickedCell.getAttribute('data-index'));

    if (board[index] !== "" || !isGameActive) return;

    makeMove(index, currentPlayer);

    if (isGameActive && gameModeSelect.value === 'ai' && currentPlayer === 'O') {
        statusDisplay.textContent = "Computer is thinking...";
        setTimeout(triggerAIMove, 400);
    }
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;
    cells[index].style.color = player === 'X' ? '#007bff' : '#dc3545';
    playClickSound(); // Play sound on move

    const winData = checkWin(board, player);

    if (winData) {
        highlightWin(winData.condition);
        drawWinningLine(winData.index);
        triggerConfetti();
        playWinSound(); // Play victory chime
        
        const winnerName = player === 'X' ? 'Player X' : (gameModeSelect.value === 'ai' ? 'Computer' : 'Player O');
        statusDisplay.textContent = `${winnerName} Wins! 🎉`;
        scores[player]++;
        updateScoreboard();
        isGameActive = false;
        
        // Show Modal Popup after a tiny delay
        setTimeout(() => {
            modalTitle.textContent = `${winnerName} Wins! 🎉`;
            modalMessage.textContent = "Awesome job! Ready for the next round?";
            resultModal.classList.add('show');
        }, 400);
        return;
    }

    if (checkTie(board)) {
        statusDisplay.textContent = "It's a Draw! 🤝";
        scores.ties++;
        updateScoreboard();
        isGameActive = false;
        playDrawSound();

        // Show Modal Popup for Draw
        setTimeout(() => {
            modalTitle.textContent = "It's a Draw! 🤝";
            modalMessage.textContent = "So close! Try again to break the tie.";
            resultModal.classList.add('show');
        }, 400);
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateStatusText();
}

function triggerAIMove() {
    if (!isGameActive) return;
    const bestMove = calculateAIMove();
    makeMove(bestMove, 'O');
}

function calculateAIMove() {
    // 1. Check Win
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            let tempBoard = [...board];
            tempBoard[i] = "O";
            if (checkWin(tempBoard, "O")) return i;
        }
    }

    // 2. Check Block
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            let tempBoard = [...board];
            tempBoard[i] = "X";
            if (checkWin(tempBoard, "X")) return i;
        }
    }

    // 3. Take Center
    if (board[4] === "") return 4;

    // 4. Take Corner
    const corners = [0, 2, 6, 8].filter(i => board[i] === "");
    if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)];
    }

    // 5. Random Available
    const available = board.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
    return available[Math.floor(Math.random() * available.length)];
}

function triggerConfetti() {
    confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
    });
}

function checkWin(currentBoard, player) {
    for (let i = 0; i < winConditions.length; i++) {
        let condition = winConditions[i];
        if (condition.every(index => currentBoard[index] === player)) {
            return { condition, index: i };
        }
    }
    return null;
}

function drawWinningLine(index) {
    const lineClasses = [
        'row-0', 'row-1', 'row-2', // Rows
        'col-0', 'col-1', 'col-2', // Columns
        'diag-1', 'diag-2'         // Diagonals
    ];
    
    winningLine.className = `winning-line ${lineClasses[index]}`;
    winningLine.style.opacity = '1';
}

function checkTie(currentBoard) {
    return currentBoard.every(cell => cell !== "");
}

function highlightWin(winningCondition) {
    winningCondition.forEach(index => {
        cells[index].classList.add('winning');
    });
}

function updateStatusText() {
    if (gameModeSelect.value === 'ai' && currentPlayer === 'O') {
        statusDisplay.textContent = "Computer is thinking...";
    } else {
        statusDisplay.textContent = `${currentPlayer === 'X' ? 'Player X' : 'Player O'}'s turn`;
    }
}

function updateScoreboard() {
    scoreXDisplay.textContent = scores.X;
    scoreODisplay.textContent = scores.O;
    scoreTiesDisplay.textContent = scores.ties;
    
    // Save scores to browser localStorage
    localStorage.setItem('tictactoe_scores', JSON.stringify(scores));
}

function handleModeChange() {
    labelODisplay.textContent = gameModeSelect.value === 'ai' ? 'Computer' : 'Player O';
    startNextRound();
}

function startNextRound() {
    board = Array(9).fill("");
    currentPlayer = "X";
    isGameActive = true;
    
    resultModal.classList.remove('show');
    winningLine.className = 'winning-line';
    winningLine.style.opacity = '0';

    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove('winning');
        cell.style.color = '';
    });

    updateStatusText();
}

function resetAll() {
    scores = { X: 0, O: 0, ties: 0 };
    localStorage.removeItem('tictactoe_scores');
    updateScoreboard();
    startNextRound();
}

// --- Web Audio API Sound Generator ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(frequency, duration, type = 'sine') {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.value = frequency;
    
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playClickSound() {
    playTone(440, 0.08); // Short click beep
}

function playWinSound() {
    setTimeout(() => playTone(523.25, 0.15), 0);   // C5
    setTimeout(() => playTone(659.25, 0.15), 150); // E5
    setTimeout(() => playTone(783.99, 0.3), 300);  // G5 (Victory Chime)
}

function playDrawSound() {
    setTimeout(() => playTone(300, 0.2), 0);
    setTimeout(() => playTone(220, 0.3), 150); // Low draw tone
}