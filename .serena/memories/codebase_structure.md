# コードベース構造

## ディレクトリ構造
```
/オセロ/
├── index.html          # メインHTMLファイル（エントリポイント）
├── style.css           # スタイルシート（UI/UXデザイン）
├── script.js           # ゲームロジック（メインJavaScript）
├── README.md           # プロジェクト説明
├── .gitignore          # Git無視ファイル設定
└── _docs/              # プロジェクトドキュメント
    └── 2025-08-11_赤白オセロゲーム実装.md
```

## ファイル概要

### index.html
- メインUIコンポーネント
- ゲームモード選択UI
- ゲームボード表示
- モーダルダイアログ
- 日本語（ひらがな）でのUI表記

### style.css
- CSS カスタムプロパティで色テーマ管理
- レスポンシブデザイン
- アニメーション効果
- プレイヤー色のカスタマイズ対応

### script.js
- **OthelloGame クラス** - メインゲームロジック
- **60以上のメソッド** - 機能別に細分化
- ゲーム状態管理
- AI実装（複数難易度）
- UI制御
- 音響効果

## 主要コンポーネント

### OthelloGame クラス主要メソッド群
1. **初期化・設定**: constructor, init, loadSettings, saveSettings
2. **メニュー・UI制御**: showMenu, setupMenuEventListeners
3. **ゲーム開始・管理**: startGame, reset, endGame
4. **ゲームロジック**: isValidMove, makeMove, getValidMoves, flipPieces
5. **AI関連**: getAiMove, minimax, evaluateBoard
6. **プレイヤー管理**: switchPlayer, updateTurnIndicator
7. **音響・視覚効果**: playSound, playTone, applyColorTheme

### 設計パターン
- **シングルクラス設計**: OthelloGame クラスに全機能集約
- **イベント駆動**: DOM イベントベースのユーザー操作
- **状態管理**: インスタンス変数での状態保持