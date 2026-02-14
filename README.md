# AI手書き数字認識システム (mnist-web-app)
![フロント表示内容](/docs/screen/after_prediction.png)
## 概要
授業で習得したReactに加え、独学で習得したDjango、Flask、TensorFlowを組み合わせた、フルスタックなAI Webアプリケーションです。<br>
数値予測に留まらず、多桁の数字認識や、ユーザーによる判定結果の修正を通じた「再学習用データの蓄積」など、実運用を見据えた設計をいたしました。

## 特徴
- 多桁同時認識: 複数の数字が含まれる画像をバッチ処理で一括判定。
- Human-in-the-Loop: AIの誤判定をユーザーが修正し、正解ラベル付きデータとしてDBに蓄積。
- 疎結合なアーキテクチャ: Web管理(Django)とAI推論(Flask)を分離し、モデルの変更に強い構成。

## 技術スタック
### フロントエンド
- React / TypeScript / Vite: 型安全な開発と、Canvasを利用した直感的なUI。
### バックエンド
- Django: 予測履歴管理、AIモデルの排他制御、およびマスタ管理。
- Flask: AI推論専用の軽量APIサーバー。
### AI / 機械学習
- TensorFlow / Keras: CNN（畳み込みニューラルネットワーク）を用いた自作学習モデル。
### インフラ・その他
- Docker / Docker Compose: コンテナ化による開発環境の統一。
- SQLite: 開発効率重視の軽量データベース。

## システムアーキテクチャ
![アーキテクチャ構成図](/docs/architecture/architecture.png)

## AIモデル詳細
自作のCNNモデルを採用しています。
- データセット: MNIST（60,000 train / 10,000 test）
- 入力: $28 \times 28$ グレースケール画像
- 構造: 畳み込み層 × 2（32, 64 filters）、プーリング層 × 2、ドロップアウト(0.5)
- 設計思想: 解像度を段階的に下げつつ特徴量を増やすことで、ノイズに強い識別を実現しております。
- 評価指標: Accuracy
- テストデータ精度: 約 98%

## モデルレイヤー内容
![モデルレイヤー図](/docs/architecture/ml_model_architecture/ml_model_architecture.svg)

## 工夫した点・課題解決
1. 独自設計の「AIModelConfig」によるモデル制御実務でのモデル更新を想定し、DB上で「現在有効なモデル」を1つに限定する排他制御を実装しました。<br>これにより、コードを書き換えずに管理画面から推論モデルを切り替え可能です。
2. 再学習データの蓄積フローAIの判定結果をそのままにせず、ユーザーが修正したデータを RetrainingData テーブルに保存。<br>将来的な精度向上のためのデータパイプラインを考慮して設計いたしました。
3. Dockerによるマイクロサービス化WebサーバーとAIサーバーを別コンテナに分けることで、推論エンジンのみを独立してスケーリングできる構成にいたしました。

## ディレクトリ構造
- frontend/ # React
- backend/  # Django
- ml_api/   # Flask + Model

## 起動概要
本プロジェクトは以下の構成で動作をしております。
- AI推論API（Flask）: Docker コンテナ実行
- Web管理サーバー（Django）: ローカル実行
- フロントエンド（React）: ローカル実行

### 1. AI推論APIの起動（Docker）
```bash
cd ml_api
docker-compose up --build
```
### 2. Django管理サーバーの起動
```bash
cd backend
venv\Scripts\activate # Windows
python manage.py migrate
python manage.py loaddata initial_data.json
python manage.py runserver
```

### 3. フロントエンドの起動
```bash
cd frontend
npm install
npm run dev
```
### バックエンドからコンテナの接続先について
対応モデルへの切り替えは、AIModelConfigテーブルに登録されたURLで切り替えを行っております。
現在CNNとテスト用に用意しているコンテナは下記URLで設定されております。
- MNIST CNN v1 http://localhost:5000
- MNIST Logistic http://localhost:5001

### AIModelConfig設計詳細
- ["クラス図"]("/docs/classDiagram/classDiagram.md")
