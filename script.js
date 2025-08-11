class OthelloGame {
    constructor() {
        this.boardSize = 8;
        this.board = [];
        this.currentPlayer = 'red';
        this.gameOver = false;
        this.validMoves = [];
        this.playerNames = {
            red: 'あか',
            white: 'しろ'
        };
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(null));
        
        const mid = Math.floor(this.boardSize / 2);
        this.board[mid - 1][mid - 1] = 'white';
        this.board[mid - 1][mid] = 'red';
        this.board[mid][mid - 1] = 'red';
        this.board[mid][mid] = 'white';
        
        this.currentPlayer = 'red';
        this.gameOver = false;
        
        this.renderBoard();
        this.updateValidMoves();
        this.updateScore();
        this.updateMessage(`${this.playerNames[this.currentPlayer]}のばんです！コマをおいてね`);
    }
    
    setupEventListeners() {
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.reset());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        
        const redNameElement = document.getElementById('redName');
        const whiteNameElement = document.getElementById('whiteName');
        
        redNameElement.addEventListener('input', () => {
            this.playerNames.red = redNameElement.textContent || 'あか';
            if (this.currentPlayer === 'red') {
                this.updateTurnIndicator();
            }
        });
        
        whiteNameElement.addEventListener('input', () => {
            this.playerNames.white = whiteNameElement.textContent || 'しろ';
            if (this.currentPlayer === 'white') {
                this.updateTurnIndicator();
            }
        });
        
        redNameElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                redNameElement.blur();
            }
        });
        
        whiteNameElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                whiteNameElement.blur();
            }
        });
    }
    
    renderBoard() {
        const boardElement = document.getElementById('gameBoard');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (this.board[row][col]) {
                    const piece = document.createElement('div');
                    piece.className = `piece ${this.board[row][col]}`;
                    cell.appendChild(piece);
                }
                
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                boardElement.appendChild(cell);
            }
        }
    }
    
    handleCellClick(row, col) {
        if (this.gameOver || this.board[row][col]) return;
        
        if (this.isValidMove(row, col, this.currentPlayer)) {
            this.placePiece(row, col, this.currentPlayer);
            this.flipPieces(row, col, this.currentPlayer);
            
            this.switchPlayer();
            this.updateValidMoves();
            
            if (this.validMoves.length === 0) {
                this.switchPlayer();
                this.updateValidMoves();
                
                if (this.validMoves.length === 0) {
                    this.endGame();
                } else {
                    this.updateMessage(`${this.playerNames[this.currentPlayer]}はおけるところがないよ。もういちど${this.playerNames[this.currentPlayer === 'red' ? 'white' : 'red']}のばん！`);
                }
            }
            
            this.updateScore();
            this.playSound('place');
        } else {
            this.updateMessage('そこにはおけないよ！');
            this.playSound('invalid');
        }
    }
    
    isValidMove(row, col, player) {
        if (this.board[row][col]) return false;
        
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [dr, dc] of directions) {
            if (this.checkDirection(row, col, dr, dc, player).length > 0) {
                return true;
            }
        }
        
        return false;
    }
    
    checkDirection(row, col, dr, dc, player) {
        const opponent = player === 'red' ? 'white' : 'red';
        const piecesToFlip = [];
        
        let r = row + dr;
        let c = col + dc;
        
        while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize) {
            if (!this.board[r][c]) break;
            
            if (this.board[r][c] === opponent) {
                piecesToFlip.push([r, c]);
            } else if (this.board[r][c] === player) {
                return piecesToFlip;
            }
            
            r += dr;
            c += dc;
        }
        
        return [];
    }
    
    placePiece(row, col, player) {
        this.board[row][col] = player;
        
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const piece = document.createElement('div');
        piece.className = `piece ${player}`;
        cell.appendChild(piece);
    }
    
    flipPieces(row, col, player) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [dr, dc] of directions) {
            const piecesToFlip = this.checkDirection(row, col, dr, dc, player);
            
            for (const [r, c] of piecesToFlip) {
                this.board[r][c] = player;
                
                const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                const piece = cell.querySelector('.piece');
                
                piece.classList.add('flip');
                setTimeout(() => {
                    piece.className = `piece ${player}`;
                }, 300);
            }
        }
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'red' ? 'white' : 'red';
        this.updateTurnIndicator();
        this.updateMessage(`${this.playerNames[this.currentPlayer]}のばんです！`);
    }
    
    updateTurnIndicator() {
        const turnIndicator = document.getElementById('turnIndicatorText');
        turnIndicator.textContent = this.playerNames[this.currentPlayer];
        turnIndicator.className = `turn-indicator ${this.currentPlayer}`;
    }
    
    updateValidMoves() {
        this.validMoves = [];
        
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('valid-move');
            cell.classList.remove('valid-move-hint');
            cell.classList.remove('white-turn');
        });
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.isValidMove(row, col, this.currentPlayer)) {
                    this.validMoves.push([row, col]);
                    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    cell.classList.add('valid-move-hint');
                    if (this.currentPlayer === 'white') {
                        cell.classList.add('white-turn');
                    }
                }
            }
        }
    }
    
    showHint() {
        if (this.gameOver || this.validMoves.length === 0) return;
        
        this.validMoves.forEach(([row, col]) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('valid-move');
        });
        
        setTimeout(() => {
            document.querySelectorAll('.valid-move').forEach(cell => {
                cell.classList.remove('valid-move');
            });
        }, 2000);
        
        this.playSound('hint');
    }
    
    updateScore() {
        let redCount = 0;
        let whiteCount = 0;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 'red') redCount++;
                else if (this.board[row][col] === 'white') whiteCount++;
            }
        }
        
        document.getElementById('redScore').textContent = redCount;
        document.getElementById('whiteScore').textContent = whiteCount;
    }
    
    updateMessage(message) {
        document.getElementById('messageArea').innerHTML = `<p>${message}</p>`;
    }
    
    endGame() {
        this.gameOver = true;
        
        const redScore = parseInt(document.getElementById('redScore').textContent);
        const whiteScore = parseInt(document.getElementById('whiteScore').textContent);
        
        let winMessage = '';
        let finalScoreMessage = '';
        
        if (redScore > whiteScore) {
            winMessage = `${this.playerNames.red}のかち！`;
            finalScoreMessage = `${this.playerNames.red} ${redScore} - ${this.playerNames.white} ${whiteScore}`;
        } else if (whiteScore > redScore) {
            winMessage = `${this.playerNames.white}のかち！`;
            finalScoreMessage = `${this.playerNames.white} ${whiteScore} - ${this.playerNames.red} ${redScore}`;
        } else {
            winMessage = 'ひきわけ！';
            finalScoreMessage = `${this.playerNames.red} ${redScore} - ${this.playerNames.white} ${whiteScore}`;
        }
        
        document.getElementById('winMessage').textContent = winMessage;
        document.getElementById('finalScore').textContent = finalScoreMessage;
        document.getElementById('winModal').classList.add('show');
        
        this.playSound('win');
    }
    
    reset() {
        document.getElementById('winModal').classList.remove('show');
        this.init();
    }
    
    playSound(type) {
        const audio = new Audio();
        
        switch(type) {
            case 'place':
                this.playTone(440, 100);
                break;
            case 'invalid':
                this.playTone(200, 100);
                break;
            case 'hint':
                this.playTone(600, 50);
                break;
            case 'win':
                this.playTone(523, 100);
                setTimeout(() => this.playTone(659, 100), 100);
                setTimeout(() => this.playTone(784, 150), 200);
                break;
        }
    }
    
    playTone(frequency, duration) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new OthelloGame();
});