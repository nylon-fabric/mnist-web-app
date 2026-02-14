/**
 * 予測ページ
 * 予測結果の修正エリア
 */
import "./PredictionFeedback.css";

// 定義
type PredictionDetail = {
    imageData: string; // 画像
    predicted: string;
};

type PredictionFeedbackProps = {
    details: PredictionDetail[];
    saveSingleDigit: (
        detail: PredictionDetail, // AIの予測
        selectedDigit: string // ユーザーが選んだ数字（0-9）
    ) => void;

    onClose: () => void; // クリックしたら呼ぶだけの関数
};
const PredictionFeedback = ({ details, saveSingleDigit, onClose }: PredictionFeedbackProps) => {
    return (
        <div className="prediction-feedback-container">
            <h3>各桁の確認・修正</h3>
            <p>正しい数字を選択して保存してください</p>
            <div className="prediction-card-container">

                {details.map((detail, index) => (
                    <div key={index} className="prediction-card">

                        <img src={detail.imageData} width="60"
                            style={{
                            border: "1px solid #000",
                            marginBottom: "10px"
                        }} alt="digit" />
                        <p>AIの予測:
                            <strong style={{
                                fontSize: "1.2em",
                                color: "blue"
                            }}>{detail.predicted || "(なし)"}</strong>
                        </p>

                        {/* 0〜9のボタンを配置 */}
                        <div className="digit-buttons">
                            {[...Array(10).keys()].map(num => (
                                <button
                                    key={num}
                                    onClick={() => saveSingleDigit(detail, num.toString())}
                                    // モデルが予測した数字に色を付ける
                                    className={detail.predicted === num.toString() ? "selected" : ""}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="close-button-wrapper">
                <button onClick={onClose} className="close-button">
                    確認を終了する
                </button>
            </div>
        </div>
    );
};

export default PredictionFeedback;
