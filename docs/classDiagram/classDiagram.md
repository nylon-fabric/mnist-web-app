# PredictionHistory
予測結果内容の履歴を1桁ごとに保存するクラス
| 属性 | 型 | 制約 | 備考 |
|------|----|-----|------|
| batch_id | 文字列(CharField) | max_length=36, db_index=True | 同一の推論グループを識別するUUID |
| digit_index | 整数(PositiveSmallIntegerField) | 最小値:0 最大値:32767 | 桁の順序 |
| digit | 文字列(CharField) | max_length=1, null/blank=True | AIによる予測値 |
| confidence | 浮動小数点(FloatField) | null/blank=True | 予測の信頼度（確率） |
| created_at | 時間(DateTimeField) | auto_now_add=True | データの登録日 |

# AIModelConfig
機械学習モデルを登録したクラス
| 属性 | 型 | 制約 | 備考 |
|------|----|-----|------|
| name | 文字列(CharField) | max_length=100 | モデル名 |
| api_url | URL(URLField) | - | Djangoから推論要求を送るFlaskコンテナのベースURL。環境（Docker/ローカル） |
| is_active | 論理値(BooleanField) | default=False | モデル有効フラグ |
| created_at | 時間(DateTimeField) | auto_now_add=True | データの登録日 |
| description | 文字列(TextField) | null/blank=True | 説明 |

- ***save()  オーバーライドについて***
    - 1つのモデルのis_activeを有効化する場合、他のモデルをすべて無効化する


# RetrainingData
再学習用などに使用する予測結果格納クラス
| 属性 | 型 | 制約 | 備考 |
|------|----|-----|------|
| id | UUID(UUIDField) | primary_key=True, default=uuid.uuid4, editable=False | 主キー |
| image | 画像添付ファイル(ImageField) | upload_to='training_images/' | 推論対象となる手書き数字画像 |
| predicted_digit | 文字列(CharField) | max_length=1 | モデルが判定した予測値 |
| correct_digit | 文字列(CharField) | max_length=1 | ユーザーが判定した正解値 |
| is_incorrect | 論理値(BooleanField) | default=False | 推論結果間違いフラグ |
| model_version | 文字列(CharField) | max_length=100 | モデル名 |
| created_at | 時間(DateTimeField) | auto_now_add=True | データの登録日 |