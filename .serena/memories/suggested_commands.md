# 推奨コマンド

## 開発・実行コマンド

### プロジェクト起動
```bash
# ローカルサーバー起動（Python3）
python3 -m http.server 8000

# ブラウザでアクセス
# http://localhost:8000
```

### 開発用コマンド（macOS）
```bash
# プロジェクトディレクトリ移動
cd "/Users/tommy/Documents/デスクトップ避難場所/code/codex/オセロ"

# ファイル一覧表示
ls -la

# ファイル検索
find . -name "*.js" -o -name "*.html" -o -name "*.css"

# 文字列検索（ripgrep推奨）
rg "関数名やクラス名" --type js

# Git操作
git status
git add .
git commit -m "機能追加: 説明"
```

### ブラウザ開発
```bash
# Chrome で開発者ツール付きで起動
open -a "Google Chrome" --args --auto-open-devtools-for-tabs http://localhost:8000

# Safari で開く
open -a Safari http://localhost:8000
```

## テスト・検証

### 手動テスト項目
1. **ゲーム基本機能**
   - オセロルール通りの動作
   - 勝敗判定の正確性
   - プレイヤー交代の正常性

2. **UI/UX**
   - レスポンシブデザイン確認
   - 音響効果の動作
   - アニメーション表示

3. **ブラウザ互換性**
   - Chrome, Firefox, Safari, Edge での動作確認

### デバッグ方法
```javascript
// ブラウザコンソールでのデバッグ
console.log('現在の盤面:', game.board);
console.log('有効な手:', game.getValidMoves());
```

## 運用・メンテナンス

### ファイル監視（開発時）
```bash
# ファイル変更監視（fswatch使用）
fswatch -o . | xargs -n1 -I{} echo "ファイルが変更されました"
```

### コード品質チェック
- **手動レビュー**: README.mdの仕様との整合性確認
- **動作確認**: 複数ブラウザでの実機テスト

注意: このプロジェクトは純粋なフロントエンドプロジェクトのため、
ビルドプロセスやパッケージマネージャーは不要です。