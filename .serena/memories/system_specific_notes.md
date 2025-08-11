# システム固有の注意事項（macOS）

## macOS 環境での開発

### 環境情報
- **OS**: Darwin 24.6.0（macOS）
- **プロジェクトパス**: `/Users/tommy/Documents/デスクトップ避難場所/code/codex/オセロ`
- **Git 管理**: あり（main ブランチ）

### macOS 特有のコマンド

#### ファイル・ディレクトリ操作
```bash
# ファインダーで開く
open .

# テキストエディットで開く
open -a TextEdit index.html

# ブラウザで開く
open index.html  # デフォルトブラウザ
open -a Safari index.html  # Safari
open -a "Google Chrome" index.html  # Chrome
```

#### 開発サーバー起動
```bash
# Python3（macOS標準）
python3 -m http.server 8000

# Node.js がある場合
npx serve .

# PHP がある場合
php -S localhost:8000
```

#### ファイル監視
```bash
# fswatch（インストール必要）
brew install fswatch
fswatch -o . | xargs -n1 -I{} echo "ファイル変更"

# 標準のfind + watch
watch -n 1 'find . -name "*.js" -o -name "*.html" -o -name "*.css" | head -10'
```

### 日本語ファイル名・パス
- プロジェクトパスに日本語が含まれている
- Terminal でのパス指定時は適切にエスケープまたはクォート
```bash
cd "/Users/tommy/Documents/デスクトップ避難場所/code/codex/オセロ"
```

### 権限・セキュリティ
- **ローカルファイル**: `file://` プロトコルでの制限
- **CORS 問題**: 可能性があるため、ローカルサーバー推奨
- **音声再生**: ユーザージェスチャー必須（Web Audio API）

### Git 設定確認
```bash
# 現在のブランチ確認
git branch

# リモート確認
git remote -v

# 日本語ファイル名の扱い
git config core.quotepath false
```

### トラブルシューティング

#### よくある問題
1. **音が出ない**
   - Web Audio API の制限
   - ユーザーの最初のクリック後に音声有効化

2. **ファイルパスエラー**
   - 日本語パスの適切な処理
   - Terminal でのエスケープ処理

3. **ブラウザキャッシュ**
   - Hard Refresh: `Cmd + Shift + R`
   - キャッシュクリア推奨

#### デバッグ用コマンド
```bash
# システム情報
uname -a
sw_vers

# ブラウザプロセス確認
ps aux | grep -i chrome
ps aux | grep -i safari
```