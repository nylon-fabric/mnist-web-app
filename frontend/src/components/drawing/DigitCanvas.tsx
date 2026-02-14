/**
 *予測ページ
 キャンバス部分
 */
import "./DigitCanvas.css";

// キャンバス
const DISPLAY_SIZE = 280;

// コンポーネントが受け取る型定義
type DigitCanvasProps = {
    label: string; // 「左」「右」などの表示用ラベル
    canvasRef: React.RefObject<HTMLCanvasElement | null>; // キャンバスのDOM
    onDraw: (ref: React.RefObject<HTMLCanvasElement | null>, e: React.MouseEvent) => void; // canvasRef と マウスイベントを受け取って、処理する関数
    onStartDraw: () => void;
    onStopDraw: () => void;
    onClear: () => void; // クリックしたら呼ぶだけの関数
};

const DigitCanvas = ({
    label,
    canvasRef,
    onDraw,
    onStartDraw,
    onStopDraw,
    onClear,
}: DigitCanvasProps) => {

    return(
        <div className="canvas-container">
        <canvas
            ref={canvasRef}
            onMouseDown={onStartDraw}
            onMouseUp={onStopDraw}
            onMouseMove={(e) => onDraw(canvasRef, e)}
            onMouseLeave={onStopDraw}
            style={{
                width: DISPLAY_SIZE,
                height: DISPLAY_SIZE,
                border: "1px solid #ccc",
                cursor: "crosshair",
                imageRendering: "pixelated",
                background: "white",
            }}
        />
        <button onClick={onClear} className="clear-button">
            {label}クリア
        </button>
    </div>
    );
};

export default DigitCanvas;