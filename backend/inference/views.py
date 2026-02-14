# from django.shortcuts import render

import requests  # Django → Flask API へHTTP通信
from rest_framework.views import APIView  # Djangoを「API用View」として使う
from rest_framework.response import Response  # JSONレスポンスを返す
# from rest_framework import status #J SONレスポンスを返す
from urllib.parse import urljoin
from .models import PredictionHistory, RetrainingData
from django.conf import settings
from django.db.models import Min, Avg
from django.http import HttpResponse
from django.utils import timezone
import csv
from .models import AIModelConfig
from .serializers import AIModelConfigSimpleSerializer


def get_active_model_api_url():
    """
    設定ページで選択したモデルのURLを生成する関数
    """
    # 設定で選択したモデルの取得
    model = AIModelConfig.objects.filter(is_active=True).first()
    if model:
        return model.api_url

    # 選択がない場合、デフォルト設定を適応
    return settings.DEFAULT_FLASK_API_BASE_URL


def call_flask_predict_api(image):
    """
    Flask APIを呼び出し、画像の手書き数字をテキスト予測し返す関数

    :param image: 画像データ
    """
    # URL取得
    # api_url = urljoin(settings.DEFAULT_FLASK_API_BASE_URL, 'predict')
    base_url = get_active_model_api_url()
    api_url = urljoin(base_url, 'predict')

    res = requests.post(
        api_url,
        files={'image': image},
        timeout=5 # タイムアウト指定
    )
    res.raise_for_status()
    return res.json()


def save_prediction_history(batch_id, digit_index, digit, confidence):
    """
    SQLiteに桁ごとの予測内容を保存する関数

    :param batch_id: 同じ桁かの識別ID
    :param digit_index: 桁の純所
    :param digit: 予測値
    :param confidence: 予測値の確率
    """
    return PredictionHistory.objects.create(
        batch_id=batch_id,
        digit_index=digit_index,
        digit=digit,
        confidence=confidence
    )

class PredictView(APIView):
    def post(self, request):
        """
        予測ページ
        画像から数字を予測する API View
        HTTP POST /api/predict/ が呼ばれた際に動作。

        リクエスト（multipart/form-data）で必要なパラメータ:
        - image: 予測対象の画像ファイル
        - batch_id: 2桁以上の数字を紐付ける共通ID（UUID想定）
        - digitIndex: 現在の桁の順序（0始まりの整数）

        処理内容:
        1. リクエストのバリデーション
        2. Flask 予測 API に画像を送信し、予測結果を取得
        3. 予測結果を SQLite に履歴として保存
        4. 予測結果を JSON で返却

        return:
        - 成功: { "digit": 予測値, "message": "Prediction successful: ..." }
        - 失敗: { "error": "エラーメッセージ" }, 適切な HTTP ステータスコード
        """
        # reactからの取得
        image = request.FILES.get('image') # 画像
        batch_id = request.POST.get("batch_id") # 共通ID
        digit_index = request.POST.get("digitIndex") # 順序


        # チェック
        if not image:
            return Response({'error': 'No image'}, status=400)

        if batch_id is None or digit_index is None:
            return Response({'error': 'Invalid parameters'}, status=400)

        try:# None や-1などの値対策
            digit_index = int(digit_index)
        except ValueError:
            return Response({'error': 'digitIndex must be integer'}, status=400)

        # digit_index を int() に変換した後の範囲チェック
        if digit_index < 0:
            return Response({'error': 'digitIndex must be >= 0'}, status=400)


        # 予測の取得
        try:
            flask_response = call_flask_predict_api(image)
        except requests.exceptions.RequestException:
            return Response({'error': 'Flask API is not reachable'}, status=503)

        predicted_digit = flask_response.get('predicted_class')
        confidence = flask_response.get('confidence')

        # 予測がNone だった場合の対応
        if predicted_digit is None:
            return Response({'error': 'Prediction failed'}, status=500)


        # SQLite に履歴保存
        save_prediction_history(
                                batch_id=batch_id,
                                digit_index=digit_index,
                                digit=predicted_digit,
                                confidence=confidence
                                )

        return Response({
                        'digit': predicted_digit,
                        'confidence': confidence,
                        'message': f'Prediction successful: {predicted_digit}'
                        }, status=200) # React に返す


class PredictionHistoryView(APIView):
    """
    履歴表示ページ
    prediction_history のレコード全行取得。
    最新のデータから順番に並べ、最新レコードを指定件数のみフロントへ返す。

    return:
        SELECT * FROM prediction_history
        ORDER BY created_at DESC
        LIMIT <limit(指定件数)>;
    """
    def get(self, request):

        # クエリパラメータ取得（デフォルト10件）
        limit = request.query_params.get('limit', 10)

        try:
            limit = int(limit)
        except ValueError:
            limit = 10

        # レコードをID種別に取得
        summary_query = PredictionHistory.objects.values('batch_id').annotate(#ID別にグループ作成
            first_created=Min('created_at'), # 日付
            avg_confidence=Avg('confidence') # 平均信頼度
        ).order_by('-first_created')[:limit]  # 最新50件の「操作」を取得

        data = []
        # 別レコードでバラバラに保存されている1桁同士を結合し、入力値と同じ数字にする
        for item in summary_query:
            bid = item['batch_id']

            # batch_id に紐づく全桁を取得（index順）
            digits = PredictionHistory.objects.filter(batch_id=bid).order_by('digit_index')

            # 予測値をインデックス順につなげる
            full_digit = "".join([h.digit for h in digits if h.digit is not None])

            # ページに表示する行を作成
            data.append({
                'batch_id': bid,
                'digit': full_digit, # 結合された数字
                'confidence': round(item['avg_confidence'] * 100, 1), # 予測値の確率（平均を％へ変換）
                'created_at': item['first_created'].strftime('%Y-%m-%d %H:%M:%S')
            })
        return Response(data)

class ExportCSVView(APIView):
    """
    履歴表示ページ
    生データをCSVで出力する
    """
    def get(self, request):

        # 出力ファイル準備
        response = HttpResponse(content_type='text/csv')
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        response['Content-Disposition'] = (
            f'attachment; filename="prediction_history_{timestamp}.csv"'
        )

        writer = csv.writer(response)
        writer.writerow(['batch_id', 'digit_index', 'digit', 'confidence', 'created_at']) # 列名

        # DBから全取得して1行ずつ書き込む
        queryset = PredictionHistory.objects.all().order_by('-created_at')
        for h in queryset:
            writer.writerow([h.batch_id, h.digit_index, h.digit, h.confidence, h.created_at])

        return response

class SwichModelAPIView(APIView):
    """
    設定ページ
    選択されたモデルに切り替える
    """
    def post(self, request):
        model_id = request.data.get("model_id")
        model = AIModelConfig.objects.get(id=model_id)
        model.is_active = True
        model.save()
        return Response({"message": f"model:{model.name} switched"})


class AIModelListAPIView(APIView):
    """
    設定ページ用
    モデル一覧を取得
    """
    def get(self, request):
        models = AIModelConfig.objects.all()
        serializer = AIModelConfigSimpleSerializer(models, many=True)
        return Response(serializer.data)


class SaveTrainingDateView(APIView):
    """
    再トレーニングのために、対象モデルと予測結果と人間から見た正解などを保存する
    """
    def post(self, request):
        image = request.FILES.get('image')
        predicted = request.data.get('predicted_digit')
        correct = request.data.get('correct_digit')
        model_name = request.data.get('model_version')

        RetrainingData.objects.create(
            image=image,
            predicted_digit=predicted,
            correct_digit=correct,
            is_incorrect=(predicted != correct),
            model_version=model_name
        )
        return Response({"status": "success"})