| No | 機能ID | クラス名                  | HTTPメソッド | 画面名     | 説明                                                |
| -- | ---- | --------------------- | -------- | ------- | ------------------------------------------------- |
| 1  | F001 | PredictView           | POST     | 予測ページ   | ユーザーが手書き画像を送信し、AI予測結果を取得して保存する。Flask API経由で数字を予測。 |
| 2  | F002 | PredictionHistoryView | GET      | 履歴ページ   | 過去の予測結果を取得。batch_idごとに集計して最新を指定件数で返却。               |
| 3  | F003 | ExportCSVView         | GET      | 履歴ページ   | PredictionHistoryの生データをCSV形式で出力。                  |
| 4  | F004 | SwichModelAPIView     | POST     | 設定ページ   | 使用モデルを切り替える。切替時に他のモデルは自動で無効化。                     |
| 5  | F005 | AIModelListAPIView    | GET      | 設定ページ   | 登録済みAIモデル一覧を取得して返却。                               |
| 6  | F006 | SaveTrainingDateView  | POST     | 予測ページ   | 対象モデル、予測値、正解値を保存し、再学習データとして記録。                    |
