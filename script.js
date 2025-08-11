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
        this.gameMode = null; // 'pvp' or 'cpu'
        this.difficulty = null; // 1-5
        this.isAiThinking = false;
        this.currentEditingPlayer = null; // 'red' or 'white'
        this.selectedColors = ['red', 'white']; // デフォルト色
        
        this.loadSettings();
        this.setupMenuEventListeners();
        this.setupNameModalEventListeners();
        this.setupColorEventListeners();
        this.showMenu();
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
    
    setupMenuEventListeners() {
        // モード選択ボタン
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                if (mode === 'pvp') {
                    this.gameMode = 'pvp';
                    this.startGame();
                } else if (mode === 'cpu') {
                    this.gameMode = 'cpu';
                    document.getElementById('difficultySelector').style.display = 'block';
                }
            });
        });

        // 難易度選択ボタン
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.difficulty = parseInt(e.currentTarget.dataset.level);
                this.startGame();
            });
        });
    }
    
    setupColorEventListeners() {
        // 個別色選択
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const color = e.currentTarget.dataset.color;
                const player = parseInt(e.currentTarget.dataset.player);
                
                if (player === 1) {
                    this.selectedColors[0] = color;
                } else {
                    this.selectedColors[1] = color;
                }
                
                this.applyColorTheme(this.selectedColors[0], this.selectedColors[1]);
                this.updateColorSelection();
                this.saveSettings();
            });
        });
        
        // 初期選択状態を設定
        this.updateColorSelection();
    }

    setupGameEventListeners() {
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.reset());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('swapBtn').addEventListener('click', () => this.swapPlayerNames());
        document.getElementById('menuBtn').addEventListener('click', () => this.showMenu());
        
        // 名前変更ボタンのイベント
        document.getElementById('redNameBtn').addEventListener('click', () => {
            this.showNameModal('red');
        });
        
        document.getElementById('whiteNameBtn').addEventListener('click', () => {
            if (this.gameMode !== 'cpu') { // CPUモードでは白の名前変更不可
                this.showNameModal('white');
            }
        });
    }
    
    setupNameModalEventListeners() {
        const nameInput = document.getElementById('nameInput');
        const confirmBtn = document.getElementById('nameConfirmBtn');
        const cancelBtn = document.getElementById('nameCancelBtn');
        
        confirmBtn.addEventListener('click', () => this.confirmNameChange());
        cancelBtn.addEventListener('click', () => this.closeNameModal());
        
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.confirmNameChange();
            } else if (e.key === 'Escape') {
                this.closeNameModal();
            }
        });
        
        // プリセット名クリック時の処理（動的に追加されるため、イベントデリゲーション使用）
        document.getElementById('presetNames').addEventListener('click', (e) => {
            if (e.target.classList.contains('preset-name')) {
                nameInput.value = e.target.textContent;
            }
        });
    }

    showMenu() {
        document.getElementById('gameModeSelector').style.display = 'block';
        document.getElementById('gameBoard').style.display = 'none';
        document.getElementById('gameControls').style.display = 'none';
        document.getElementById('difficultySelector').style.display = 'none';
        
        // メッセージエリアを隠す
        document.getElementById('messageArea').innerHTML = '';
    }

    startGame() {
        document.getElementById('gameModeSelector').style.display = 'none';
        document.getElementById('gameBoard').style.display = 'grid';
        document.getElementById('gameControls').style.display = 'flex';
        
        // プレイヤー名を設定
        if (this.gameMode === 'cpu') {
            this.playerNames.white = 'コンピューター';
            document.getElementById('whiteName').textContent = 'コンピューター';
            document.getElementById('whiteNameBtn').style.opacity = '0.3';
            document.getElementById('whiteNameBtn').style.pointerEvents = 'none';
            // CPUモードでは名前交換ボタンを無効化
            document.getElementById('swapBtn').style.opacity = '0.3';
            document.getElementById('swapBtn').style.pointerEvents = 'none';
        } else {
            this.playerNames.white = 'しろ';
            document.getElementById('whiteName').textContent = 'しろ';
            document.getElementById('whiteNameBtn').style.opacity = '0.7';
            document.getElementById('whiteNameBtn').style.pointerEvents = 'auto';
            // PvPモードでは名前交換ボタンを有効化
            document.getElementById('swapBtn').style.opacity = '1';
            document.getElementById('swapBtn').style.pointerEvents = 'auto';
        }
        
        this.init();
        this.setupGameEventListeners();
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
        if (this.gameOver || this.board[row][col] || this.isAiThinking) return;
        
        // CPUモードで白のターンの場合はクリック無効
        if (this.gameMode === 'cpu' && this.currentPlayer === 'white') return;
        
        if (this.isValidMove(row, col, this.currentPlayer)) {
            this.makeMove(row, col, this.currentPlayer);
        } else {
            this.updateMessage('そこにはおけないよ！');
            this.playSound('invalid');
        }
    }
    
    makeMove(row, col, player) {
        this.placePiece(row, col, player);
        this.flipPieces(row, col, player);
        
        this.switchPlayer();
        this.updateValidMoves();
        
        if (this.validMoves.length === 0) {
            this.switchPlayer();
            this.updateValidMoves();
            
            if (this.validMoves.length === 0) {
                this.endGame();
                return;
            } else {
                this.updateMessage(`${this.playerNames[this.currentPlayer]}はおけるところがないよ。もういちど${this.playerNames[this.currentPlayer === 'red' ? 'white' : 'red']}のばん！`);
            }
        }
        
        this.updateScore();
        this.playSound('place');
        
        // CPUの手番処理
        if (this.gameMode === 'cpu' && this.currentPlayer === 'white' && !this.gameOver) {
            this.makeAiMove();
        }
    }
    
    makeAiMove() {
        this.isAiThinking = true;
        this.updateMessage('コンピューターがかんがえています...');
        
        setTimeout(() => {
            const move = this.getAiMove();
            if (move) {
                this.makeMove(move.row, move.col, 'white');
            }
            this.isAiThinking = false;
        }, 1000 + Math.random() * 1000); // 1-2秒のランダムな思考時間
    }
    
    getAiMove() {
        if (this.validMoves.length === 0) return null;
        
        switch (this.difficulty) {
            case 1: // 超やさしい：ランダム
                return this.getRandomMove();
            case 2: // やさしい：少し考慮したランダム
                return this.getEasyMove();
            case 3: // ふつう：基本的な戦略
                return this.getNormalMove();
            case 4: // 強い：高度な戦略
                return this.getHardMove();
            case 5: // 鬼つよ：ミニマックス
                return this.getExpertMove();
            default:
                return this.getRandomMove();
        }
    }
    
    getRandomMove() {
        const randomIndex = Math.floor(Math.random() * this.validMoves.length);
        const [row, col] = this.validMoves[randomIndex];
        return { row, col };
    }
    
    getEasyMove() {
        // 角を優先、それ以外はランダム
        const corners = this.validMoves.filter(([row, col]) => {
            return (row === 0 || row === 7) && (col === 0 || col === 7);
        });
        
        if (corners.length > 0) {
            const [row, col] = corners[Math.floor(Math.random() * corners.length)];
            return { row, col };
        }
        
        return this.getRandomMove();
    }
    
    getNormalMove() {
        // より良い手を選ぶ簡単な評価
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const [row, col] of this.validMoves) {
            const score = this.evaluateMove(row, col, 'white');
            if (score > bestScore) {
                bestScore = score;
                bestMove = { row, col };
            }
        }
        
        return bestMove || this.getRandomMove();
    }
    
    getHardMove() {
        // より深い評価
        return this.minimax('white', 3, -Infinity, Infinity, true).move || this.getNormalMove();
    }
    
    getExpertMove() {
        // 最も深い評価
        return this.minimax('white', 5, -Infinity, Infinity, true).move || this.getHardMove();
    }
    
    evaluateMove(row, col, player) {
        let score = 0;
        
        // 角の価値：高い
        if ((row === 0 || row === 7) && (col === 0 || col === 7)) {
            score += 100;
        }
        
        // 辺の価値：中程度
        if (row === 0 || row === 7 || col === 0 || col === 7) {
            score += 10;
        }
        
        // 角の隣は避ける
        if (this.isNextToCorner(row, col)) {
            score -= 50;
        }
        
        // ひっくり返せるコマの数
        const flipped = this.getFlippedPieces(row, col, player);
        score += flipped.length * 5;
        
        return score;
    }
    
    isNextToCorner(row, col) {
        const corners = [[0, 0], [0, 7], [7, 0], [7, 7]];
        for (const [cr, cc] of corners) {
            if (Math.abs(row - cr) <= 1 && Math.abs(col - cc) <= 1 && !(row === cr && col === cc)) {
                return true;
            }
        }
        return false;
    }
    
    getFlippedPieces(row, col, player) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        let allFlipped = [];
        for (const [dr, dc] of directions) {
            const flipped = this.checkDirection(row, col, dr, dc, player);
            allFlipped = allFlipped.concat(flipped);
        }
        
        return allFlipped;
    }
    
    minimax(player, depth, alpha, beta, maximizing) {
        if (depth === 0 || this.isGameOver()) {
            return { score: this.evaluateBoard(player), move: null };
        }
        
        const moves = this.getValidMoves(player);
        if (moves.length === 0) {
            const opponent = player === 'red' ? 'white' : 'red';
            const opponentMoves = this.getValidMoves(opponent);
            if (opponentMoves.length === 0) {
                return { score: this.evaluateBoard(player), move: null };
            }
            return this.minimax(opponent, depth - 1, alpha, beta, !maximizing);
        }
        
        let bestMove = null;
        
        if (maximizing) {
            let maxScore = -Infinity;
            for (const [row, col] of moves) {
                const boardCopy = this.copyBoard();
                this.simulateMove(row, col, player);
                const result = this.minimax(player === 'red' ? 'white' : 'red', depth - 1, alpha, beta, false);
                this.board = boardCopy;
                
                if (result.score > maxScore) {
                    maxScore = result.score;
                    bestMove = { row, col };
                }
                
                alpha = Math.max(alpha, result.score);
                if (beta <= alpha) break;
            }
            return { score: maxScore, move: bestMove };
        } else {
            let minScore = Infinity;
            for (const [row, col] of moves) {
                const boardCopy = this.copyBoard();
                this.simulateMove(row, col, player);
                const result = this.minimax(player === 'red' ? 'white' : 'red', depth - 1, alpha, beta, true);
                this.board = boardCopy;
                
                if (result.score < minScore) {
                    minScore = result.score;
                    bestMove = { row, col };
                }
                
                beta = Math.min(beta, result.score);
                if (beta <= alpha) break;
            }
            return { score: minScore, move: bestMove };
        }
    }
    
    getValidMoves(player) {
        const moves = [];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.isValidMove(row, col, player)) {
                    moves.push([row, col]);
                }
            }
        }
        return moves;
    }
    
    copyBoard() {
        return this.board.map(row => [...row]);
    }
    
    simulateMove(row, col, player) {
        this.board[row][col] = player;
        const flipped = this.getFlippedPieces(row, col, player);
        for (const [r, c] of flipped) {
            this.board[r][c] = player;
        }
    }
    
    evaluateBoard(player) {
        let score = 0;
        const opponent = player === 'red' ? 'white' : 'red';
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === player) {
                    score += this.getPositionValue(row, col);
                } else if (this.board[row][col] === opponent) {
                    score -= this.getPositionValue(row, col);
                }
            }
        }
        
        return score;
    }
    
    getPositionValue(row, col) {
        // 角の価値は最高
        if ((row === 0 || row === 7) && (col === 0 || col === 7)) {
            return 100;
        }
        
        // 辺の価値
        if (row === 0 || row === 7 || col === 0 || col === 7) {
            return 10;
        }
        
        // 角の隣は価値が低い
        if (this.isNextToCorner(row, col)) {
            return -50;
        }
        
        return 1;
    }
    
    isGameOver() {
        const redMoves = this.getValidMoves('red');
        const whiteMoves = this.getValidMoves('white');
        return redMoves.length === 0 && whiteMoves.length === 0;
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
        
        // ボードを直接カウントして最終スコアを計算
        let redScore = 0;
        let whiteScore = 0;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 'red') {
                    redScore++;
                } else if (this.board[row][col] === 'white') {
                    whiteScore++;
                }
            }
        }
        
        // サイドバーのスコアも最終値に更新
        document.getElementById('redScore').textContent = redScore;
        document.getElementById('whiteScore').textContent = whiteScore;
        
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
        this.startGame();
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
    
    showNameModal(player) {
        this.currentEditingPlayer = player;
        const playerName = player === 'red' ? 'あか' : 'しろ';
        
        document.getElementById('nameModalTitle').textContent = `${playerName}の名前をかえてね`;
        document.getElementById('nameInput').value = this.playerNames[player];
        
        // プリセット名を生成
        this.generatePresetNames();
        
        document.getElementById('nameModal').classList.add('show');
        document.getElementById('nameInput').focus();
        document.getElementById('nameInput').select();
    }
    
    generatePresetNames() {
        const presetNames = [
            'たろう', 'はなこ', 'じろう', 'みか', 'けん',
            'ゆき', 'あき', 'はる', 'なつ', 'ふゆ',
            'そら', 'うみ', 'やま', 'かわ', 'もり',
            'ほし', 'つき', 'たいよう', 'にじ', 'くも'
        ];
        
        const presetContainer = document.getElementById('presetNames');
        presetContainer.innerHTML = '';
        
        presetNames.forEach(name => {
            const button = document.createElement('button');
            button.className = 'preset-name';
            button.textContent = name;
            presetContainer.appendChild(button);
        });
    }
    
    confirmNameChange() {
        const newName = document.getElementById('nameInput').value.trim();
        
        if (newName && newName.length <= 10) {
            this.playerNames[this.currentEditingPlayer] = newName;
            document.getElementById(`${this.currentEditingPlayer}Name`).textContent = newName;
            
            // ターン表示も更新
            if (this.currentPlayer === this.currentEditingPlayer) {
                this.updateTurnIndicator();
            }
            
            this.closeNameModal();
            this.playSound('place');
        } else {
            document.getElementById('nameInput').style.borderColor = '#ff6b6b';
            setTimeout(() => {
                document.getElementById('nameInput').style.borderColor = '#a29bfe';
            }, 1000);
        }
    }
    
    closeNameModal() {
        document.getElementById('nameModal').classList.remove('show');
        this.currentEditingPlayer = null;
    }
    
    swapPlayerNames() {
        if (this.gameMode === 'cpu') return; // CPUモードでは無効
        
        // 名前を交換
        const tempName = this.playerNames.red;
        this.playerNames.red = this.playerNames.white;
        this.playerNames.white = tempName;
        
        // 表示を更新
        document.getElementById('redName').textContent = this.playerNames.red;
        document.getElementById('whiteName').textContent = this.playerNames.white;
        
        // 現在のターン表示も更新
        this.updateTurnIndicator();
        
        // 効果音を再生
        this.playSound('place');
        
        // メッセージを更新
        this.updateMessage(`名前をこうかんしました！${this.playerNames[this.currentPlayer]}のばんです！`);
        
        // 少し後に通常のメッセージに戻す
        setTimeout(() => {
            this.updateMessage(`${this.playerNames[this.currentPlayer]}のばんです！`);
        }, 2000);
    }
    
    selectColors(color1, color2) {
        this.selectedColors = [color1, color2];
        this.applyColorTheme(color1, color2);
        this.saveSettings();
    }
    
    applyColorTheme(color1, color2) {
        const colorMap = {
            red: {
                color: '#ff6b6b',
                gradientStart: '#ff8787',
                gradientEnd: '#ff6b6b',
                border: '#ff5252',
                hint: 'rgba(255, 107, 107, 0.4)',
                hintLight: 'rgba(255, 107, 107, 0.2)'
            },
            white: {
                color: '#ffffff',
                gradientStart: '#ffffff',
                gradientEnd: '#f1f2f6',
                border: '#dfe6e9',
                hint: 'rgba(116, 185, 255, 0.4)',
                hintLight: 'rgba(116, 185, 255, 0.2)'
            },
            black: {
                color: '#2d3436',
                gradientStart: '#2d3436',
                gradientEnd: '#000000',
                border: '#636e72',
                hint: 'rgba(45, 52, 54, 0.4)',
                hintLight: 'rgba(45, 52, 54, 0.2)'
            },
            orange: {
                color: '#e17055',
                gradientStart: '#ff8c42',
                gradientEnd: '#e17055',
                border: '#d63031',
                hint: 'rgba(225, 112, 85, 0.4)',
                hintLight: 'rgba(225, 112, 85, 0.2)'
            },
            blue: {
                color: '#0984e3',
                gradientStart: '#74b9ff',
                gradientEnd: '#0984e3',
                border: '#2d3436',
                hint: 'rgba(116, 185, 255, 0.4)',
                hintLight: 'rgba(116, 185, 255, 0.2)'
            },
            pink: {
                color: '#e84393',
                gradientStart: '#fd79a8',
                gradientEnd: '#e84393',
                border: '#d63031',
                hint: 'rgba(253, 121, 168, 0.4)',
                hintLight: 'rgba(253, 121, 168, 0.2)'
            },
            green: {
                color: '#00b894',
                gradientStart: '#55efc4',
                gradientEnd: '#00b894',
                border: '#00853e',
                hint: 'rgba(85, 239, 196, 0.4)',
                hintLight: 'rgba(85, 239, 196, 0.2)'
            },
            yellow: {
                color: '#f39c12',
                gradientStart: '#fdcb6e',
                gradientEnd: '#f39c12',
                border: '#e17055',
                hint: 'rgba(253, 203, 110, 0.4)',
                hintLight: 'rgba(253, 203, 110, 0.2)'
            },
            gray: {
                color: '#636e72',
                gradientStart: '#95afc0',
                gradientEnd: '#636e72',
                border: '#2d3436',
                hint: 'rgba(149, 175, 192, 0.4)',
                hintLight: 'rgba(149, 175, 192, 0.2)'
            },
            gold: {
                color: '#d4af37',
                gradientStart: '#f1c40f',
                gradientEnd: '#d4af37',
                border: '#b7950b',
                hint: 'rgba(241, 196, 15, 0.4)',
                hintLight: 'rgba(241, 196, 15, 0.2)'
            },
            silver: {
                color: '#c0c0c0',
                gradientStart: '#ddd6fe',
                gradientEnd: '#c0c0c0',
                border: '#95a5a6',
                hint: 'rgba(221, 214, 254, 0.4)',
                hintLight: 'rgba(221, 214, 254, 0.2)'
            },
            lime: {
                color: '#81c784',
                gradientStart: '#a4e17a',
                gradientEnd: '#81c784',
                border: '#4caf50',
                hint: 'rgba(164, 225, 122, 0.4)',
                hintLight: 'rgba(164, 225, 122, 0.2)'
            },
            purple: {
                color: '#9c27b0',
                gradientStart: '#b39ddb',
                gradientEnd: '#9c27b0',
                border: '#7b1fa2',
                hint: 'rgba(179, 157, 219, 0.4)',
                hintLight: 'rgba(179, 157, 219, 0.2)'
            },
            cyan: {
                color: '#00bcd4',
                gradientStart: '#81d4fa',
                gradientEnd: '#00bcd4',
                border: '#0097a7',
                hint: 'rgba(129, 212, 250, 0.4)',
                hintLight: 'rgba(129, 212, 250, 0.2)'
            },
            brown: {
                color: '#795548',
                gradientStart: '#a1887f',
                gradientEnd: '#795548',
                border: '#5d4037',
                hint: 'rgba(161, 136, 127, 0.4)',
                hintLight: 'rgba(161, 136, 127, 0.2)'
            }
        };
        
        const theme1 = colorMap[color1];
        const theme2 = colorMap[color2];
        
        if (theme1 && theme2) {
            const root = document.documentElement;
            root.style.setProperty('--player1-color', theme1.color);
            root.style.setProperty('--player1-gradient-start', theme1.gradientStart);
            root.style.setProperty('--player1-gradient-end', theme1.gradientEnd);
            root.style.setProperty('--player1-border', theme1.border);
            root.style.setProperty('--player1-hint', theme1.hint);
            root.style.setProperty('--player1-hint-light', theme1.hintLight);
            
            root.style.setProperty('--player2-color', theme2.color);
            root.style.setProperty('--player2-gradient-start', theme2.gradientStart);
            root.style.setProperty('--player2-gradient-end', theme2.gradientEnd);
            root.style.setProperty('--player2-border', theme2.border);
            root.style.setProperty('--player2-hint', theme2.hint);
            root.style.setProperty('--player2-hint-light', theme2.hintLight);
        }
    }
    
    updateColorSelection() {
        document.querySelectorAll('.color-option').forEach(option => {
            const color = option.dataset.color;
            const player = parseInt(option.dataset.player);
            
            if ((player === 1 && color === this.selectedColors[0]) || 
                (player === 2 && color === this.selectedColors[1])) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }
    
    saveSettings() {
        const settings = {
            selectedColors: this.selectedColors
        };
        localStorage.setItem('othelloSettings', JSON.stringify(settings));
    }
    
    loadSettings() {
        const saved = localStorage.getItem('othelloSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                if (settings.selectedColors) {
                    this.selectedColors = settings.selectedColors;
                    this.applyColorTheme(this.selectedColors[0], this.selectedColors[1]);
                }
            } catch (e) {
                console.log('設定の読み込みに失敗しました');
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new OthelloGame();
});