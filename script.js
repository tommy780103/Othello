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
        this.totalPlayers = 2; // 全体の人数 2のみ
        this.humanPlayers = 2; // 人間のプレイヤー数 1-2
        this.difficulty = null; // 1-5
        this.isAiThinking = false;
        this.currentEditingPlayer = null; // 'red' or 'white'
        this.selectedColors = [null, null]; // 色選択前はnull
        this.colorSelectionStep = 1; // 1: プレイヤー1選択中, 2: プレイヤー2選択中, 0: 完了
        this.currentPlayerIndex = 0; // 現在色を選択中のプレイヤーインデックス
        this.allColors = ['red', 'white', 'black', 'blue', 'orange', 'pink', 'green', 'yellow', 'gray', 'gold', 'silver', 'lime', 'purple', 'cyan', 'brown'];
        this.firstPlayer = 'red'; // じゃんけんで決まる先攻プレイヤー
        this.jankenDecided = false; // じゃんけんで先攻が決まったかどうか
        this.isCustomName = { red: false, white: false }; // 手入力で名前が変更されたかどうか
        this.colorDefaultNames = {
            red: 'あか', white: 'しろ', black: 'くろ', blue: 'あお',
            orange: 'オレンジ', pink: 'ピンク', green: 'みどり', yellow: 'きいろ',
            gray: 'グレー', gold: 'きん', silver: 'ぎん', lime: 'きみどり',
            purple: 'むらさき', cyan: 'みずいろ', brown: 'ちゃいろ'
        };
        
        this.loadSettings();
        this.setupMenuEventListeners();
        this.setupNameModalEventListeners();
        this.setupColorSelectionNameEditListeners();
        this.showMenu();
    }
    
    init() {
        // 2人モードの初期化
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(null));
        
        const mid = Math.floor(this.boardSize / 2);
        this.board[mid - 1][mid - 1] = 'white';
        this.board[mid - 1][mid] = 'red';
        this.board[mid][mid - 1] = 'red';
        this.board[mid][mid] = 'white';
        
        this.currentPlayer = this.firstPlayer; // じゃんけんで決まった先攻プレイヤーを使用
        this.gameOver = false;
        
        this.renderBoard();
        this.updateValidMoves();
        this.updateScore();
        this.updateMessage(`${this.playerNames[this.currentPlayer]}のばんです！コマをおいてね`);
    }
    
    
    
    setupMenuEventListeners() {
        // 全体人数選択ボタン（2人モード専用）
        document.querySelectorAll('.total-player-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 以前の選択を解除
                document.querySelectorAll('.total-player-btn').forEach(b => b.classList.remove('selected'));
                
                // 現在の選択を強調
                e.currentTarget.classList.add('selected');
                
                const selectedTotal = parseInt(e.currentTarget.dataset.total);
                this.totalPlayers = 2; // 内部的には常に2人モード
                
                if (selectedTotal === 1) {
                    // 1人モード = 人間1 vs CPU1
                    this.humanPlayers = 1;
                    this.gameMode = 'cpu';
                    // 難易度選択を表示
                    document.getElementById('difficultySelector').style.display = 'block';
                } else {
                    // 2人モード = 人間2
                    this.humanPlayers = 2;
                    this.gameMode = 'pvp';
                    // 難易度選択を非表示
                    document.getElementById('difficultySelector').style.display = 'none';
                }
                
                // 人数選択スキップして直接色選択へ
                document.getElementById('humanPlayerSelector').style.display = 'none';
                
                // 色選択をリセットして表示
                this.resetColorSelection();
                console.log('Player selection complete, showing color selection');
            });
        });

        // 人間プレイヤー数選択ボタン（動的に生成されるため、イベント委譲使用）
        document.getElementById('humanPlayerButtons').addEventListener('click', (e) => {
            if (e.target.classList.contains('human-player-btn')) {
                // 以前の選択を解除
                document.querySelectorAll('.human-player-btn').forEach(b => b.classList.remove('selected'));
                
                // 現在の選択を強調
                e.target.classList.add('selected');
                
                this.humanPlayers = parseInt(e.target.dataset.human);
                this.generatePlayerSetup();
                this.showPlayerBreakdown();
                
                // 3-4人モードまたはCPUがいる場合の処理
                setTimeout(() => {
                    if (this.totalPlayers === 2 && this.gameMode === 'cpu') {
                        // 2人モードでCPUがいる場合は難易度選択
                        document.getElementById('difficultySelector').style.display = 'block';
                    } else {
                        // 3-4人モードまたは全員人間の場合は色選択に進む
                        this.resetColorSelection();
                    }
                }, 1000);
            }
        });


        // 難易度選択ボタン
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 以前の選択を解除
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
                
                // 現在の選択を強調
                e.currentTarget.classList.add('selected');
                
                this.difficulty = parseInt(e.currentTarget.dataset.level);
                
                // 選択した難易度を表示
                const difficultyNames = {
                    1: 'ちょうやさしい',
                    2: 'やさしい', 
                    3: 'ふつう',
                    4: 'つよい',
                    5: 'おにつよ'
                };
                
                document.getElementById('selectedDifficultyText').textContent = 
                    `${difficultyNames[this.difficulty]}を選んだよ！色をえらんでね`;
                document.getElementById('difficultySelected').style.display = 'block';
                
                // 少し遅延してから色選択に進む（選択状態を確認できるように）
                setTimeout(() => {
                    this.resetColorSelection();
                }, 800);
            });
        });
        
        // ゲーム開始ボタン
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.startGame();
        });
    }
    
    showHumanPlayerSelector() {
        const humanSelector = document.getElementById('humanPlayerSelector');
        const humanButtons = document.getElementById('humanPlayerButtons');
        
        humanButtons.innerHTML = '';
        
        // 1人モードの場合は簡略化
        if (this.totalPlayers === 1) {
            // 1人モードは自動的にCPU対戦に設定
            this.totalPlayers = 2; // 内部的には2人モードとして処理
            this.humanPlayers = 1;
            this.generatePlayerSetup();
            this.showPlayerBreakdown();
            
            // 難易度選択を表示
            setTimeout(() => {
                this.resetColorSelection();
            }, 800);
            
            return;
        }
        
        humanSelector.style.display = 'block';
        
        // 1人から全体人数までの人間プレイヤー数ボタンを生成
        for (let i = 1; i <= this.totalPlayers; i++) {
            const btn = document.createElement('button');
            btn.className = 'human-player-btn';
            btn.dataset.human = i;
            
            if (i === this.totalPlayers) {
                btn.classList.add('selected');
                this.humanPlayers = this.totalPlayers;
            }
            
            const numberSpan = document.createElement('span');
            numberSpan.className = 'count-number';
            numberSpan.textContent = i;
            
            const textSpan = document.createElement('span');
            textSpan.className = 'count-text';
            textSpan.textContent = 'にん';
            
            btn.appendChild(numberSpan);
            btn.appendChild(textSpan);
            humanButtons.appendChild(btn);
        }
    }
    
    generatePlayerSetup() {
        // 人間プレイヤー数に基づいて自動的にプレイヤー構成を生成
        this.playerSetup = [];
        
        for (let i = 0; i < this.totalPlayers; i++) {
            if (i < this.humanPlayers) {
                this.playerSetup.push('human');
            } else {
                this.playerSetup.push('cpu');
            }
        }
        
        // 全員人間の場合はPvPモード、そうでなければCPUモード
        this.gameMode = this.humanPlayers === this.totalPlayers ? 'pvp' : 'cpu';
    }
    
    showPlayerBreakdown() {
        const breakdown = document.getElementById('playerBreakdown');
        const breakdownText = document.getElementById('breakdownText');
        
        const cpuCount = this.totalPlayers - this.humanPlayers;
        
        if (cpuCount === 0) {
            breakdownText.textContent = `プレイヤー${this.humanPlayers}人でたたかいます`;
        } else {
            breakdownText.textContent = `プレイヤー${this.humanPlayers}人 + コンピューター${cpuCount}人でたたかいます`;
        }
        
        breakdown.style.display = 'block';
    }
    
    setupColorEventListeners() {
        console.log('Setting up color event listeners...');
        
        // シンプルなアプローチ: イベント委譲を使用
        const step1Container = document.getElementById('step1');
        if (!step1Container) {
            console.error('Step1 container not found!');
            return;
        }
        
        // 既存のイベントリスナーを削除
        const newContainer = step1Container.cloneNode(true);
        step1Container.parentNode.replaceChild(newContainer, step1Container);
        
        // 新しいコンテナにイベント委譲でリスナーを追加
        newContainer.addEventListener('click', (e) => {
            const colorOption = e.target.closest('.color-option');
            if (!colorOption) return;
            
            const color = colorOption.dataset.color;
            console.log('Color clicked:', color);
            
            if (!color) {
                console.error('No color data found');
                return;
            }
            
            // 視覚的フィードバック
            colorOption.style.transform = 'scale(0.95)';
            setTimeout(() => {
                colorOption.style.transform = '';
            }, 150);
            
            if (color === 'random') {
                const randomColor = this.selectRandomColor();
                if (randomColor) {
                    console.log(`Random color selected: ${randomColor}`);
                    this.handleColorSelection(randomColor);
                } else {
                    alert('利用可能な色がありません');
                }
            } else {
                console.log(`Color selected: ${color}`);
                this.handleColorSelection(color);
            }
        });
        
        console.log('Color event listeners set up with event delegation');
    }
    
    handleColorSelection(color) {
        console.log(`Handling color selection: ${color} for player ${this.currentPlayerIndex + 1}`);
        
        // 色を選択
        this.selectedColors[this.currentPlayerIndex] = color;
        
        // プレイヤー名を更新
        if (this.currentPlayerIndex === 0 && !this.isCustomName.red) {
            this.playerNames.red = this.colorDefaultNames[color] || color;
        } else if (this.currentPlayerIndex === 1 && !this.isCustomName.white) {
            this.playerNames.white = this.colorDefaultNames[color] || color;
        }
        
        console.log('Current selected colors:', this.selectedColors);
        console.log('Current player names:', this.playerNames);
        
        // 次のプレイヤーまたは完了処理
        this.currentPlayerIndex++;
        
        if (this.humanPlayers === 1) {
            // 1人モードの場合、CPUの色を自動選択
            if (this.currentPlayerIndex === 1) {
                const availableColors = this.getAvailableColors();
                if (availableColors.length > 0) {
                    this.selectedColors[1] = availableColors[0];
                    if (!this.isCustomName.white) {
                        this.playerNames.white = this.colorDefaultNames[availableColors[0]];
                    }
                    console.log(`CPU auto-selected: ${availableColors[0]}`);
                }
                this.finishColorSelection();
            }
        } else {
            // 2人モードの場合
            if (this.currentPlayerIndex >= 2) {
                this.finishColorSelection();
            } else {
                this.updateColorStepTitle();
                this.updateAvailableColors();
            }
        }
    }
    
    finishColorSelection() {
        console.log('Finishing color selection');
        console.log('Final selected colors:', this.selectedColors);
        console.log('Final player names:', this.playerNames);
        
        this.showStep3();
    }
    
    setupColorSelectionNameEditListeners() {
        // 色選択後の名前編集ボタン
        document.getElementById('player1NameEditBtn').addEventListener('click', () => {
            this.showNameModal('red');
        });
        
        document.getElementById('player2NameEditBtn').addEventListener('click', () => {
            if (this.gameMode !== 'cpu') { // CPUモードでは白の名前変更不可
                this.showNameModal('white');
            }
        });
    }
    
    // 古い関数 - 新しいhandleColorSelectionを使用
    /* selectColorForCurrentPlayer(color) {
        console.log(`Selecting color ${color} for player ${this.currentPlayerIndex + 1}`);
        console.log('Before selection - selectedColors:', this.selectedColors);
        
        // 現在のプレイヤーに色を設定
        this.selectedColors[this.currentPlayerIndex] = color;
        
        // 1人モード（vs CPU）の場合のCPU色を自動選択
        if (this.humanPlayers === 1 && this.totalPlayers === 2 && this.currentPlayerIndex === 0) {
            const availableColors = this.getAvailableColors();
            if (availableColors.length > 0) {
                // CPU用の色を自動選択
                const cpuColor = availableColors[0]; // 最初の利用可能色を選択
                this.selectedColors[1] = cpuColor;
                console.log(`Auto-selected CPU color: ${cpuColor}`);
            }
        }
        
        console.log('After selection - selectedColors:', this.selectedColors);
        
        // プレイヤー名を更新（2人モードの場合のみ）
        if (this.totalPlayers === 2) {
            if (this.currentPlayerIndex === 0 && !this.isCustomName.red) {
                this.playerNames.red = this.colorDefaultNames[color];
                document.getElementById('redName').textContent = this.playerNames.red;
            } else if (this.currentPlayerIndex === 1 && !this.isCustomName.white) {
                this.playerNames.white = this.colorDefaultNames[color];
                document.getElementById('whiteName').textContent = this.playerNames.white;
            }
        }
        
        // 次のプレイヤーに進む
        this.currentPlayerIndex++;
        
        // 必要な色選択数を計算（2人モード専用）
        const requiredSelections = this.humanPlayers === 1 ? 1 : 2;
        
        console.log(`Current player index: ${this.currentPlayerIndex}, Required selections: ${requiredSelections}, Total players: ${this.totalPlayers}`);
        
        if (this.currentPlayerIndex < requiredSelections) {
            
            // 人間プレイヤーの場合は手動で色選択
            console.log(`Moving to player ${this.currentPlayerIndex + 1}`);
            this.updateAvailableColors();
            this.updateColorStepTitle();
        } else {
            // 1人モードの場合はCPU用の色を自動選択
            if (this.humanPlayers === 1) {
                const availableColors = this.getAvailableColors();
                if (availableColors.length > 0) {
                    this.selectedColors[1] = availableColors[0];
                    if (!this.isCustomName.white) {
                        this.playerNames.white = this.colorDefaultNames[availableColors[0]];
                    }
                }
            }
            
            // 全プレイヤーの色選択完了
            this.currentPlayerIndex = 0;
            this.showStep3();
        }
    } */
    
    updateAvailableColors() {
        const availableColors = this.getAvailableColors();
        
        // 利用可能な色のみ表示（ランダムは常に表示）
        document.querySelectorAll('#step1 .color-option').forEach(option => {
            const color = option.dataset.color;
            
            if (color === 'random') {
                // ランダムは常に表示（利用可能な色がある場合のみ有効化）
                option.style.display = 'flex';
                if (availableColors.length > 0) {
                    option.classList.remove('disabled');
                } else {
                    option.classList.add('disabled');
                }
            } else if (availableColors.includes(color)) {
                // 通常の色：利用可能な場合のみ表示
                option.style.display = 'flex';
                option.classList.remove('disabled');
            } else {
                // 既に選択された色：非表示
                option.style.display = 'none';
                option.classList.add('disabled');
            }
        });
        
        // デバッグ用ログ
        console.log(`Player ${this.currentPlayerIndex + 1} - Available colors:`, availableColors);
    }
    
    
    showStep3() {
        // Step1を隠してStep3を表示
        document.getElementById('step1').style.display = 'none';
        document.getElementById('step2').style.display = 'none';
        document.getElementById('step3').style.display = 'block';
        
        // 色選択結果を表示
        this.updateStep3Preview();
        
        // 色テーマを適用
        this.applyColorTheme(this.selectedColors[0], this.selectedColors[1]);
        this.saveSettings();
        
        // モードに応じて先攻選択UIを表示
        if (this.gameMode === 'pvp') {
            document.getElementById('turnDecisionPvP').style.display = 'block';
            document.getElementById('turnDecisionCpu').style.display = 'none';
            this.setupFirstPlayerSelector();
        } else if (this.gameMode === 'cpu') {
            document.getElementById('turnDecisionPvP').style.display = 'none';
            document.getElementById('turnDecisionCpu').style.display = 'block';
            this.setupJankenEventListeners();
        }
    }
    
    updateStep3Preview() {
        // 2人モードの場合は固定レイアウトの色とプレイヤー名を更新
        if (this.selectedColors.length === 2) {
            const colorNames = {
                red: 'あか', white: 'しろ', black: 'くろ', blue: 'あお',
                orange: 'オレンジ', pink: 'ピンク', green: 'みどり', yellow: 'きいろ',
                gray: 'グレー', gold: 'きん', silver: 'ぎん', lime: 'きみどり',
                purple: 'むらさき', cyan: 'みずいろ', brown: 'ちゃいろ'
            };
            
            // プレイヤー1の色とプレイヤー名を更新
            document.getElementById('finalPlayer1Preview').className = `preview-piece color-${this.selectedColors[0]}`;
            document.getElementById('finalPlayer1ColorName').textContent = this.playerNames.red;
            
            // プレイヤー2の色とプレイヤー名を更新
            document.getElementById('finalPlayer2Preview').className = `preview-piece color-${this.selectedColors[1]}`;
            document.getElementById('finalPlayer2ColorName').textContent = this.playerNames.white;
            
            // CPUモードの場合は名前編集ボタンを無効化
            if (this.gameMode === 'cpu') {
                document.getElementById('player2NameEditBtn').style.opacity = '0.3';
                document.getElementById('player2NameEditBtn').style.pointerEvents = 'none';
            } else {
                document.getElementById('player2NameEditBtn').style.opacity = '0.7';
                document.getElementById('player2NameEditBtn').style.pointerEvents = 'auto';
            }
        }
    }
    
    resetColorSelection() {
        console.log('Resetting color selection...');
        
        this.colorSelectionStep = 1;
        this.currentPlayerIndex = 0;
        
        // 色選択をリセット（nullで初期化して選択可能にする）
        this.selectedColors = [null, null];
        
        // ステップの表示を調整
        const step1 = document.getElementById('step1');
        const step2 = document.getElementById('step2');
        const step3 = document.getElementById('step3');
        
        if (step1) step1.style.display = 'block';
        if (step2) step2.style.display = 'none';
        if (step3) step3.style.display = 'none';
        
        // 全ての色選択オプションを表示して有効化
        document.querySelectorAll('#step1 .color-option').forEach(option => {
            option.style.display = 'flex';
            option.classList.remove('disabled');
        });
        
        // ステップタイトルを更新
        this.updateColorStepTitle();
        
        // 色選択イベントリスナーを再設定
        this.setupColorEventListeners();
        
        console.log('Color selection reset complete');
    }
    
    
    updateColorStepTitle() {
        const title = document.getElementById('colorStepTitle');
        
        // 1人モード（vs CPU）の場合
        if (this.humanPlayers === 1 && this.totalPlayers === 2) {
            title.textContent = `あなたの色をえらんでね`;
            return;
        }
        
        // 2人モードでのタイトル設定
        if (this.currentPlayerIndex === 0) {
            title.textContent = `プレイヤー1の色をえらんでね`;
        } else if (this.currentPlayerIndex === 1) {
            title.textContent = `プレイヤー2の色をえらんでね`;
        } else {
            title.textContent = '色選択完了';
        }
    }
    
    getAvailableColors() {
        // 既に選択された色を除外（nullでない色のみ）
        const selectedColors = this.selectedColors.filter(color => color !== null);
        return this.allColors.filter(color => !selectedColors.includes(color));
    }
    
    selectRandomColor() {
        const availableColors = this.getAvailableColors();
        console.log(`Random color selection for player ${this.currentPlayerIndex + 1}:`);
        console.log('Currently selected colors:', this.selectedColors);
        console.log('Available colors for random selection:', availableColors);
        
        if (availableColors.length === 0) {
            console.warn('No available colors for random selection!');
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * availableColors.length);
        const selectedColor = availableColors[randomIndex];
        
        console.log(`Randomly selected color: ${selectedColor} (index ${randomIndex} from ${availableColors.length} available colors)`);
        return selectedColor;
    }
    
    setupJankenEventListeners() {
        // じゃんけんボタンのイベントリスナー
        document.querySelectorAll('.janken-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const playerChoice = e.currentTarget.dataset.choice;
                this.playJanken(playerChoice);
            });
        });
        
        // もう一度ボタンのイベントリスナー
        document.getElementById('retryJankenBtn').addEventListener('click', () => {
            this.resetJanken();
        });
    }
    
    playJanken(playerChoice) {
        const choices = ['rock', 'paper', 'scissors'];
        const computerChoice = choices[Math.floor(Math.random() * choices.length)];
        
        const choiceNames = {
            rock: 'ぐー',
            paper: 'ぱー', 
            scissors: 'ちょき'
        };
        
        const choiceEmoji = {
            rock: '✊',
            paper: '✋',
            scissors: '✌️'
        };
        
        let result = '';
        let firstPlayer = 'red'; // デフォルトは赤から
        
        if (playerChoice === computerChoice) {
            result = `あいこ！あなた：${choiceEmoji[playerChoice]} コンピューター：${choiceEmoji[computerChoice]}`;
            document.getElementById('retryJankenBtn').style.display = 'block';
        } else if (
            (playerChoice === 'rock' && computerChoice === 'scissors') ||
            (playerChoice === 'paper' && computerChoice === 'rock') ||
            (playerChoice === 'scissors' && computerChoice === 'paper')
        ) {
            result = `あなたのかち！あなた：${choiceEmoji[playerChoice]} コンピューター：${choiceEmoji[computerChoice]}<br>あなたから先にはじめます！`;
            firstPlayer = 'red';
            this.jankenDecided = true;
        } else {
            result = `コンピューターのかち！あなた：${choiceEmoji[playerChoice]} コンピューター：${choiceEmoji[computerChoice]}<br>コンピューターから先にはじめます！`;
            firstPlayer = 'white';
            this.jankenDecided = true;
        }
        
        // じゃんけんの結果を表示
        document.getElementById('jankenMessage').innerHTML = result;
        document.getElementById('jankenResult').style.display = 'block';
        
        // 結果が決まった場合は先攻を設定
        if (this.jankenDecided) {
            this.firstPlayer = firstPlayer;
            // 1.5秒後にじゃんけん部分を隠す
            setTimeout(() => {
                document.getElementById('turnDecisionCpu').style.display = 'none';
            }, 1500);
        }
    }
    
    resetJanken() {
        document.getElementById('jankenResult').style.display = 'none';
        document.getElementById('retryJankenBtn').style.display = 'none';
        this.jankenDecided = false;
    }
    
    setupFirstPlayerSelector() {
        // 色とプレイヤー名を更新
        const colorNames = {
            red: 'あか', white: 'しろ', black: 'くろ', blue: 'あお',
            orange: 'オレンジ', pink: 'ピンク', green: 'みどり', yellow: 'きいろ',
            gray: 'グレー', gold: 'きん', silver: 'ぎん', lime: 'きみどり',
            purple: 'むらさき', cyan: 'みずいろ', brown: 'ちゃいろ'
        };
        
        // プレビュー色を設定
        document.getElementById('firstBtnPlayer1Color').className = `preview-piece color-${this.selectedColors[0]}`;
        document.getElementById('firstBtnPlayer2Color').className = `preview-piece color-${this.selectedColors[1]}`;
        
        // プレイヤー名を設定（色名または手入力名）
        document.getElementById('firstBtnPlayer1Name').textContent = this.playerNames.red;
        document.getElementById('firstBtnPlayer2Name').textContent = this.playerNames.white;
        
        // 先攻選択ボタンのイベントリスナー
        document.querySelectorAll('.first-player-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 以前の選択を解除
                document.querySelectorAll('.first-player-btn').forEach(b => b.classList.remove('selected'));
                
                // 現在の選択を強調
                e.currentTarget.classList.add('selected');
                
                // 先攻プレイヤーを設定
                this.firstPlayer = e.currentTarget.dataset.player;
            });
        });
        
        // デフォルトはプレイヤー1（red）を先攻に設定
        this.firstPlayer = 'red';
    }

    setupGameEventListeners() {
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.reset());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('skipBtn').addEventListener('click', () => this.skipTurn());
        document.getElementById('swapBtn').addEventListener('click', () => this.swapPlayerNames());
        document.getElementById('menuBtn').addEventListener('click', () => this.showMenu());
        
        // 2人モード用の名前変更ボタン
        const redNameBtn = document.getElementById('redNameBtn');
        const whiteNameBtn = document.getElementById('whiteNameBtn');
        
        if (redNameBtn) {
            redNameBtn.addEventListener('click', () => {
                this.showNameModal('red');
            });
        }
        
        if (whiteNameBtn) {
            whiteNameBtn.addEventListener('click', () => {
                if (this.gameMode !== 'cpu') {
                    this.showNameModal('white');
                }
            });
        }
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
        document.getElementById('humanPlayerSelector').style.display = 'none';
        document.getElementById('scoreBoard').style.display = 'none';
        
        // 色選択をリセット
        this.resetColorSelection();
        
        // じゃんけん関連をリセット
        this.firstPlayer = 'red';
        this.jankenDecided = false;
        document.getElementById('turnDecisionPvP').style.display = 'none';
        document.getElementById('turnDecisionCpu').style.display = 'none';
        
        // 手入力フラグをリセット（メニューに戻った際は色に応じたデフォルト名に戻る）
        this.isCustomName = { red: false, white: false };
        
        // 難易度選択をリセット
        document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('selected'));
        document.getElementById('difficultySelected').style.display = 'none';
        
        // 先攻選択をリセット（デフォルトはプレイヤー1）
        document.querySelectorAll('.first-player-btn').forEach(btn => btn.classList.remove('selected'));
        document.getElementById('player1FirstBtn').classList.add('selected');
        
        // 固定で2人モード
        this.totalPlayers = 2;
        this.humanPlayers = 2;
        
        // メッセージエリアを隠す
        document.getElementById('messageArea').innerHTML = '';
    }

    startGame() {
        document.getElementById('gameModeSelector').style.display = 'none';
        document.getElementById('gameBoard').style.display = 'grid';
        document.getElementById('gameControls').style.display = 'flex';
        document.getElementById('scoreBoard').style.display = 'block';
        
        // 2人モード用の初期化
        this.init();
        this.setupGameEventListeners();
        this.updateScore();
        this.updateMessage();
    }
    
    
    
    getColorValue(colorName) {
        const colorMap = {
            red: '#ff6b6b', white: '#333', black: '#2d3436', blue: '#0984e3',
            orange: '#e17055', pink: '#e84393', green: '#00b894', yellow: '#f39c12',
            gray: '#636e72', gold: '#d4af37', silver: '#c0c0c0', lime: '#81c784',
            purple: '#9c27b0', cyan: '#00bcd4', brown: '#795548'
        };
        return colorMap[colorName] || '#333';
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
        
        // スキップボタンの表示制御
        this.updateSkipButton();
    }
    
    updateSkipButton() {
        const skipBtn = document.getElementById('skipBtn');
        
        // 有効な手がない場合のみスキップボタンを表示
        if (this.validMoves.length === 0) {
            skipBtn.style.display = 'inline-block';
            
            // 有効な手がない場合はボタンを強調
            if (this.validMoves.length === 0) {
                skipBtn.style.background = '#e74c3c';
                skipBtn.textContent = 'パス（必須）';
            } else {
                skipBtn.style.background = '#ffa502';
                skipBtn.textContent = 'パス';
            }
        } else {
            skipBtn.style.display = 'none';
        }
        
        // CPUのターンの場合はボタンを無効化
        if (this.gameMode === 'cpu' && this.currentPlayer === 'white') {
            skipBtn.disabled = true;
        } else {
            skipBtn.disabled = false;
        }
    }
    
    skipTurn() {
        // CPUのターンではスキップできない
        if (this.gameMode === 'cpu' && this.currentPlayer === 'white') return;
        
        // 2人モードでのスキップ処理
        this.handleTwoPlayerSkip();
        
        this.playSound('place');
    }
    
    handleTwoPlayerSkip() {
        const currentPlayerName = this.playerNames[this.currentPlayer];
        this.updateMessage(`${currentPlayerName}がパスしました`);
        
        // プレイヤーを切り替え
        this.switchPlayer();
        this.updateValidMoves();
        
        // 次のプレイヤーも有効な手がない場合はゲーム終了
        if (this.validMoves.length === 0) {
            this.endGame();
            return;
        }
        
        // 通常のターン続行
        this.updateTurnIndicator();
        this.updateMessage(`${this.playerNames[this.currentPlayer]}のばんです！`);
        
        // CPUの手番処理
        if (this.gameMode === 'cpu' && this.currentPlayer === 'white') {
            this.makeAiMove();
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
        
        // ゲーム状態をリセット
        this.gameOver = false;
        this.isAiThinking = false;
        this.currentPlayer = this.firstPlayer;
        
        // 2人モード用の初期化
        this.init();
        this.updateMessage();
        this.updateScore();
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
            // 2人モードの処理
            const currentColor = this.currentEditingPlayer === 'red' ? this.selectedColors[0] : this.selectedColors[1];
            if (newName !== this.colorDefaultNames[currentColor]) {
                this.isCustomName[this.currentEditingPlayer] = true;
            } else {
                this.isCustomName[this.currentEditingPlayer] = false;
            }
            
            this.playerNames[this.currentEditingPlayer] = newName;
            document.getElementById(`${this.currentEditingPlayer}Name`).textContent = newName;
            
            // step3の色選択画面での名前表示も更新
            if (this.currentEditingPlayer === 'red') {
                document.getElementById('finalPlayer1ColorName').textContent = newName;
            } else if (this.currentEditingPlayer === 'white') {
                document.getElementById('finalPlayer2ColorName').textContent = newName;
            }
            
            // ターン表示も更新
            if (this.currentPlayer === this.currentEditingPlayer) {
                this.updateTurnIndicator();
            }
            
            this.closeNameModal();
            this.playSound('place');
            this.saveSettings();
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
        // 手入力で変更されていない場合のみ、色に合わせて名前を更新
        if (!this.isCustomName.red) {
            this.playerNames.red = this.colorDefaultNames[color1];
            document.getElementById('redName').textContent = this.playerNames.red;
        }
        if (!this.isCustomName.white && this.gameMode !== 'cpu') {
            this.playerNames.white = this.colorDefaultNames[color2];
            document.getElementById('whiteName').textContent = this.playerNames.white;
        }
        
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
            },
            wood1: {
                color: '#deb887',
                gradientStart: '#d2b48c',
                gradientEnd: '#cd853f',
                border: '#8b7355',
                hint: 'rgba(210, 180, 140, 0.4)',
                hintLight: 'rgba(210, 180, 140, 0.2)'
            },
            wood2: {
                color: '#cd853f',
                gradientStart: '#deb887',
                gradientEnd: '#8b4513',
                border: '#654321',
                hint: 'rgba(205, 133, 63, 0.4)',
                hintLight: 'rgba(205, 133, 63, 0.2)'
            },
            wood3: {
                color: '#8b4513',
                gradientStart: '#daa520',
                gradientEnd: '#654321',
                border: '#3e2723',
                hint: 'rgba(139, 69, 19, 0.4)',
                hintLight: 'rgba(139, 69, 19, 0.2)'
            },
            marble: {
                color: '#f5f5f5',
                gradientStart: '#ffffff',
                gradientEnd: '#d3d3d3',
                border: '#999999',
                hint: 'rgba(245, 245, 245, 0.4)',
                hintLight: 'rgba(245, 245, 245, 0.2)'
            },
            stone: {
                color: '#708090',
                gradientStart: '#708090',
                gradientEnd: '#2f4f4f',
                border: '#1c1c1c',
                hint: 'rgba(112, 128, 144, 0.4)',
                hintLight: 'rgba(112, 128, 144, 0.2)'
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
        // 順番制色選択では不要（選択時に即座に次のステップに進む）
    }
    
    saveSettings() {
        const settings = {
            selectedColors: this.selectedColors,
            playerNames: this.playerNames,
            isCustomName: this.isCustomName
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
                }
                if (settings.playerNames) {
                    this.playerNames = { ...this.playerNames, ...settings.playerNames };
                }
                if (settings.isCustomName) {
                    this.isCustomName = { ...this.isCustomName, ...settings.isCustomName };
                }
                // 色テーマを適用（名前の自動更新も含む）
                this.applyColorTheme(this.selectedColors[0], this.selectedColors[1]);
                
                // 保存されたプレイヤー名を表示に反映
                document.getElementById('redName').textContent = this.playerNames.red;
                document.getElementById('whiteName').textContent = this.playerNames.white;
            } catch (e) {
                console.log('設定の読み込みに失敗しました');
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new OthelloGame();
});