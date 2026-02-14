# 設定ページ機能 詳細設計書

## 機能概要
アプリ全体で使用される推論設定を管理するページ。<br>
信頼度下限および使用する AI モデルをユーザーが切り替えることができる。

### 機能概要
- 信頼度下限設定（ConfidenceThreshold）
    - 推論結果を採用する信頼度を設定する。<br>下限値をユーザーがスライダー形式で設定できる機能。

- 使用モデル切り替え（ModelSelector）
    - 推論に使用する AI モデルをユーザーが選択できる設定。

## 接続先
### Django API（http://localhost:8000 ローカル開発時）
- SwichModelAPIView.post（/api/settings/switch-model/（選択されたモデルに切り替える））
- AIModelListAPIView.get（/api/settings/models/ (設定ページに表示するモデル一覧を取得)）

### DB
- AIModelConfig（機械学習モデルを保存）
    - 推論モデルを変更した際、<br>
        modelsクラス側で変更対象以外の有効フラグ(is_active)をすべて無効に変更

## 処理フロー
### 1. React 側
 1. ***設定ページ初期表示***
    1. SettingsContext から現在の設定値を取得
    2. ConfidenceThreshold コンポーネントに信頼度下限を表示
    3. ModelSelector 用に Django API からモデル一覧を取得
    4. 現在選択中の modelId を元に表示モデル名を解決

2. ***信頼度下限設定（ConfidenceThreshold）***
    - 初回操作
        - localStorage から appSettings を取得し、取得できた場合は SettingsContext に反映する
    - ユーザー操作と設定保存
        - スライダー（0〜100）を操作し、内部的に 0〜1 に正規化した値を SettingsContext に保存
        - SettingsContext の変更を検知したとき、localStorage に最新設定を保存する
            ```
            const newValue = Number(e.target.value)
            confidenceThreshold: newValue / 100
            ```

3. ***使用モデル切り替え（ModelSelector）***
    - 初期表示時
        - Django API（/api/models/ 等）からモデル一覧を取得し、select 要素に表示
    - モデル選択時と設定保存
        - 選択された modelId を SettingsContext に保存
        - Django API に切り替えリクエストと切り替え対象モデルidを送信し、Django 側で有効モデルを切り替える
            - 送信内容
                ```
                newValue = Number(e.target.value);
                ```
        - Context の modelId 変更を検知し、UI 表示を同期する

#### ***エラーハンドリング***
- モデル一覧取得失敗時
    - console.error にログ出力
        ```
        console.error("Failed to fetch models:", err);
        ```

- モデル切り替え失敗時
    - UI 操作は維持（設定変更の操作性を優先し、再試行可能な設計とする）
        - ※画面上の表示と実際の有効モデルに乖離が発生する可能性があるが、リロードまたは再選択で解消する運用とする
    - エラー内容をログに記録
        ```
        console.error("Switch model failed:", err);
        ```


### 2. Django 側
1. ***SwichModelAPIView(選択されたモデルをアクティブとして保存)***
    1. Reactから送信された model_id でAIModelConfigの対象レコードを取得
    2. 対象モデルの is_active を True（アクティブ）へ設定
    3. Reactへ下記 JSON 形式メッセージを返却
        ```
        "message": f"model:{model.name} switched"
        ```

2. ***AIModelListAPIView(モデル一覧を取得)***
    1. Reactからのリクエストを受け、AIModelConfig全レコードを取得
    2. Reactへidとモデル名を返却
        ```
        model = AIModelConfig
        fields = ['id', 'name']
        ```


## シーケンス図
![シーケンス図](portfolio\sequence\settings_page_sequence\settings_page.svg)