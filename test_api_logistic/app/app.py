from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
import os
from PIL import Image


# Flaskアプリケーションのインスタンス作成
app = Flask(__name__) #Webサーバー本体

# モデルのパスを定義
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'mnist_logreg_model')

# ロジスティクス回帰モデルを読み込み
model = tf.keras.models.load_model(MODEL_PATH)


def preprocess_image(file):
    """
    画像ファイルを読み込み、モデルが入力可能な形式に変換する
    Args:
        file: multipart/form-data
    Returns:
        image: np.array, shape=(1,28,28,1), float32, normalized
    """
    # ファイルを開いてバイナリから画像復元、グレースケール化
    # (MNISTモデルは1チャンネル画像を想定しているため)
    image = Image.open(file).convert('L')

    image = image.resize((28, 28))
    image = np.array(image)

    # 色反転処理
    # (手書き数字の背景/線の色が逆の場合でも正しく認識させるため)
    if np.median(image) > 127:
        image = 255 - image

    # 形状変換 & 正規化
    image = image.reshape(1, 28, 28, 1).astype('float32') / 255.0
    return image


def run_inference(processed_image):
    """
    前処理済みデータを受け取り、推論結果を返す
    Args:
        processed_image: np.array, shape=(1,28,28,1), float32, normalized
    Returns:
        pred_class: int, 予測された数字
        confidence: float, 予測確率
    """
    preds = model.predict(processed_image)
    pred_class = int(np.argmax(preds, axis=1)[0]) # 予測値
    confidence = float(np.max(preds)) #　予測値の確率

    return pred_class, confidence


#URLエンドポイント
@app.route('/predict', methods=['POST'])
def predict():

    try:
        # multipart/form-data でファイルを受け取る
        file = request.files.get('image')

        if not file: # ファイルがない場合
            return jsonify({'error': 'No image'}), 400

        # 1. 前処理
        input_data = preprocess_image(file)

        # 2. 推論
        pred_class, confidence = run_inference(input_data)

        # 3. レスポンス
        return jsonify({
            'predicted_class': pred_class,
            'confidence': confidence
            })

    except Exception as e:
        # 何か問題があった場合は、エラーメッセージをJSONで返しHTTPステータス400（Bad Request）にする。
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    # 直接このファイルを実行したときだけ、Flaskの開発用サーバーを起動
    # debug=Trueはエラー発生時に詳細な情報を表示
    app.run(host="0.0.0.0", port=5001, debug=False)