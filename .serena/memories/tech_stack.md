# 技術スタック

## フロントエンド技術
- **HTML5**: セマンティックなマークアップ、レスポンシブ対応
- **CSS3**: 
  - アニメーション（3Dフリップ、ホバーエフェクト）
  - レスポンシブデザイン
  - CSS カスタムプロパティ（CSS変数）使用
  - Flexboxレイアウト
- **Vanilla JavaScript (ES6+)**:
  - クラスベースのオブジェクト指向設計
  - Web Audio API（効果音）
  - Local Storage（設定保存）
  - 非同期処理（async/await）

## アーキテクチャ
- **シングルページアプリケーション (SPA)**
- **MVC パターン**:
  - Model: ゲーム状態（OthelloGame クラス）
  - View: HTML/CSS
  - Controller: イベントハンドラー

## ブラウザ対応
- モダンブラウザ対応（Chrome、Firefox、Safari、Edge）
- ES6+ 機能使用のため、古いブラウザは非対応

## 外部依存関係
なし - 純粋なVanilla JavaScript実装

## パフォーマンス特徴
- 軽量（依存関係なし）
- クライアントサイド完結
- ローカルストレージによる設定永続化