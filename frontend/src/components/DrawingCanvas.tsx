/*
記載された数字を予測するページ
*/
import { useEffect, useRef, useState } from "react";
import { useSettings } from "../context/SettingsContext";
import { predict, saveTrainingData } from "../services/api";
import DigitCanvas from "../components/drawing/DigitCanvas";
import PredictionFeedback from "../components/drawing/PredictionFeedback";
import "./DrawingCanvas.css"


// 送信用キャンバスサイズ
const SIZE = 28;

const DrawingCanvas = () => {
    // キャンバス定義
    const leftCanvasRef = useRef<HTMLCanvasElement>(null);
    const rightCanvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false); // 描画中フラグ

    const { settings } = useSettings(); // 信頼度下限を取得

    // 描画中かの切り替え処理
    const startDrawing = () => { isDrawing.current = true; };
    const stopDrawing = () => { isDrawing.current = false; };


    // トレーニング用の予測結果を保持するステート
    const [result, setResult] = useState<{
        finalResult: string;
        batchId: string;
        details: { imageData: string; predicted: string }[]; // 画像データ（DataURL）に変換して保存する
    } | null>(null);

    // 描画処理
    const draw = (canvasRef: React.RefObject<HTMLCanvasElement | null>, e: React.MouseEvent) => {
        if (!isDrawing.current) return; // 描画中か判定

        // canvas要素の取得
        const canvas = canvasRef.current;
        if (!canvas) return; // canvas要素のnull チェック

        // 2D描画コンテキスト(描画用の機能をまとめたオブジェクト)の取得
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect(); // キャンバスの表示上の位置とサイズを取得

        // マウス座標をキャンバス座標に変換
        // キャンバスの 実際の描画サイズとCSSで表示されているサイズ（rect.width × rect.height） が異なる可能性があるため。
        const x = Math.floor((e.clientX - rect.left) * (SIZE / rect.width));
        const y = Math.floor((e.clientY - rect.top) * (SIZE / rect.height));

        ctx.fillStyle = "black";
        // ctx.fillRect(x, y, 1, 1);// 筆の太さ1ピクセル
        ctx.fillRect(x - 1, y - 1, 2, 2);// 筆の太さ2ピクセル
    };

    // キャンバス初期化処理
    const clearCanvas = (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
        if (!canvasRef.current) return; // null の場合は何もしない

        // 取得
        const canvas = canvasRef.current!; // canvas 要素
        const ctx = canvas.getContext("2d")!; //2D描画コンテキスト

        // キャンバスを白で塗りつぶす
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, SIZE, SIZE);
    };

    // コンポーネントが初回レンダーされたとき、左右のキャンバスを初期化する処理まとめ
    useEffect(() => {
        [leftCanvasRef, rightCanvasRef].forEach(ref => { // 配列で2つの ref をまとめて処理
            const canvas = ref.current!;
            canvas.width = SIZE; //キャンバスの内部サイズ設定(内部と表示でキャンバスサイズが異なるため)
            canvas.height = SIZE;
            clearCanvas(ref); //  初期化
        });
    }, []);

    // キャンバスが真っ白かどうかチェック
    const isCanvasEmpty = (canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext("2d")!;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // RGBA の値を確認。すべて255なら白
        return !imageData.data.some((value, idx) => idx % 4 !== 3 && value !== 255);
    };

    // APIを叩いて内容を受信する
    const sendCanvasToAPI = async (
        canvasRef: React.RefObject<HTMLCanvasElement | null>, // 画像
        batchId: string, // ID
        digitIndex: string //桁順
    ) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;

        // 空なら API 呼ばず null
        if (isCanvasEmpty(canvas)) return null;

        // APIへ渡す
        return new Promise<string | null>((resolve) => {
            canvas.toBlob(async (blob) => {
                if (!blob) return resolve(null);

                // APIへの送信内容を作成
                const formData = new FormData();
                formData.append("image", blob, "digit.png");
                formData.append("batch_id", batchId);
                formData.append("digitIndex", digitIndex);

                try {
                    // APIへ送信と受信
                    const data = await predict(formData); // 受信予測結果

                    const predictedDigit = data.digit; // 予測値
                    let confidence = data.confidence; // 予測値の確率

                    // 信頼度の変換
                    if (typeof confidence === "string") {
                        confidence = parseFloat(confidence.replace("%", "")) / 100;
                    }
                    if (typeof confidence === "number" && confidence > 1.0) {
                        confidence = confidence / 100;
                    }

                    // 信頼度判定
                    if (confidence < settings.confidenceThreshold) {
                        // 信頼度が下限未満なら結果を破棄
                        console.warn("信頼度が低いため却下されました");
                        alert("信頼度が低いため却下されました");
                        return resolve(null);
                    }
                    resolve(predictedDigit ?? null); // ← ここで返す
                } catch (err) {
                    console.error(err);
                    alert("サーバーに接続できません");

                    resolve(null);
                }
            }, "image/png");
        });
    };
    // 直列処理
    // const predictDoubleDigit = async () => {
    //     const leftResult = await sendCanvasToAPI(leftCanvasRef);
    //     const rightResult = await sendCanvasToAPI(rightCanvasRef);

    //     const finalResult = [leftResult, rightResult].filter(r => r !== null).join("");
    //     alert(`予測結果: ${finalResult || "未記入"}`);
    // };

    // 並列処理
    const sendToAPI = async () => {

        // 同じ時に入力された値と判別するよう紐付けるための共通ID
        const batchId = crypto.randomUUID();

        //インデックス判定（桁場所）
        // インデックス判定用の入れ物
        const activeTasks = [];

        // 左のキャンバスに絵があればリストに追加
        if (leftCanvasRef.current && !isCanvasEmpty(leftCanvasRef.current)) {
            activeTasks.push(leftCanvasRef);
        }
        // 右のキャンバスに絵があればリストに追加
        if (rightCanvasRef.current && !isCanvasEmpty(rightCanvasRef.current)) {
            activeTasks.push(rightCanvasRef);
        }
        // リストに入った順番で API を叩く
        const results = await Promise.all(
            activeTasks.map((ref, index) =>
                sendCanvasToAPI(ref, batchId, index.toString())
            )
        );

        const finalResult = results.filter(r => r !== null).join('');

        // --- 結果をステートに入れる ---
        setResult({
            finalResult,
            batchId,
            details: activeTasks.map((ref, i) => ({
                // その瞬間のキャンバスを画像文字列（Base64）に変換して保存
                imageData: ref.current!.toDataURL("image/png"),
                // results[i] が 0 でも正しく表示できるように（nullとかに判定して見表示にさせない）文字列として入れる
                predicted: (results[i] !== null && results[i] !== undefined) ? String(results[i]) : ""
            }))
        });
    };

    // --- 再学習データを送信する関数 ---
    const saveSingleDigit = async (
        detail: {
            imageData: string,
            predicted: string
        },
        selectedDigit: string // ユーザーが選んだ数字（0-9）
    ) => {
        try {
            // 画像変換
            const response = await fetch(detail.imageData);
            const blob = await response.blob();

            //データの組み立て
            const formData = new FormData();
            formData.append("image", blob, "training.png");
            formData.append("predicted_digit", detail.predicted); // AIの予測
            formData.append("correct_digit", selectedDigit);      // ユーザーが選んだ正しい数字

            // AIの予測とユーザーの選択が違えば「不正解(true)」とする
            const isIncorrect = (detail.predicted !== selectedDigit);
            formData.append("is_incorrect", isIncorrect.toString());

            formData.append("model_version", settings.modelId?.toString() || "unknown");

            // サービス層を呼び出しデータをAPIへ送信
            await saveTrainingData(formData);

            alert(`数字「${selectedDigit}」として保存しました(${isIncorrect ? "修正済" : "正解" })`);
        } catch (err) {
            // Error オブジェクトからメッセージを取り出す
            const message = err instanceof Error ? err.message : "保存に失敗しました";
            alert(message);
        }
    };

    return (
        <div className="DrawingCanvas-wrapper">
            <h2>予測</h2>
            <div className="canvases-container">

                <DigitCanvas
                    label="左"
                    canvasRef={leftCanvasRef}
                    onDraw={draw}
                    onStartDraw={startDrawing}
                    onStopDraw={stopDrawing}
                    onClear={() => clearCanvas(leftCanvasRef)}
                />
                <DigitCanvas
                    label="右"
                    canvasRef={rightCanvasRef}
                    onDraw={draw}
                    onStartDraw={startDrawing}
                    onStopDraw={stopDrawing}
                    onClear={() => clearCanvas(rightCanvasRef)}
                />
            </div>
            <button
                onClick={sendToAPI}
                className="prediction-button"
            >予測する</button>

            {/* --- 追加：予測結果とフィードバックボタン --- */}
            {result && (
                <div className="feedback-section-wrapper">
                    <PredictionFeedback
                        details={result.details}
                        saveSingleDigit={saveSingleDigit}
                        onClose={() => setResult(null)}
                    />
                 </div>
            )}
        </div>
    );
};

export default DrawingCanvas;
