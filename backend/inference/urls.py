from django.urls import path
from .views import PredictView, PredictionHistoryView, ExportCSVView, SwichModelAPIView, AIModelListAPIView, SaveTrainingDateView

urlpatterns = [
    path("predict/", PredictView.as_view(), name='predict'), # 予測API
    path("history/", PredictionHistoryView.as_view(), name='history'), # 履歴取得API
    path('history/export/', ExportCSVView.as_view(), name='export_csv'), # CSV
    path('settings/switch-model/', SwichModelAPIView.as_view(), name='switch-models'), # 設定ページのモデル切り替え
    path('settings/models/', AIModelListAPIView.as_view(), name='models'), # 設定ページのモデル表示
    path('history/retraining_data/', SaveTrainingDateView.as_view(), name='retraining_data'), # 再学習用の結果記録
    ]