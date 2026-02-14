/*
予測数字の履歴を表示するページ
*/
import { useEffect, useState } from "react";
import { getHistory,  getExportUrl} from "../services/api";
import ExportButton from "../components/history/ExportButton";
import HistoryTable from "../components/history/HistoryTable";
import type { HistoryItem } from "../types/settings";
import "./PredictionHistory.css"

// // APIから取得する各履歴データの構造を型で定義
// interface HistoryItem {
//     batch_id: string;
//     digit_index: number;
//     digit: string;
//     confidence: number;
//     created_at: string;
// }

const PredictionHistory = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]); // 表示履歴データを格納する配列
    const [loading, setLoading] = useState(true); // データ取得中かのフラグ

    const [limit, setLimit] = useState<number>(10); // ページの表示件数設定

     // API呼び出し
     useEffect(() => {
        const fetchHistory = async () => {

            try {
                //APIから履歴一覧を取得し、保存
                const data = await getHistory(limit);
                setHistory(data);

            } catch (err) {
                console.error(err);
                alert("履歴の取得に失敗しました");

            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    },  [limit]);// ← limit が変わるたび再取得

    // CSｖ出力機能
    const handleExportCSV = () => {
        // APIのフルURLを指定して、ブラウザの別タブ（または直接ダウンロード）として開く

        // ブラウザがURLへアクセスし、CSVをダウンロード
        window.location.href = getExportUrl();
    }

    if (loading) return <p>読み込み中...</p>;

    return (
        <div className="PredictionHistory-wrapper">
            <h2>予測履歴</h2>
            <div className="PredictionHistory-select-container">
                表示件数：
                <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="PredictionHistory-select"
                >
                    <option value={10}>10件</option>
                    <option value={30}>30件</option>
                    <option value={50}>50件</option>
                    <option value={100}>100件</option>
                </select>
            </div>
           <ExportButton onClick={handleExportCSV} />
           <HistoryTable  history={history}/>
        </div>
    );
};

export default PredictionHistory;

