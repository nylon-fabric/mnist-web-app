import type { HistoryItem } from "../../types/settings";
import "./HistoryTable.css"

type HistoryTableProps = {
  history: HistoryItem[];
};

const HistoryTable = ({ history }: HistoryTableProps) => {
    return(
        <div className="table-responsive">
            <table className="history-table">
                <thead>
                    <tr>
                        <th className="col-date">日付</th>
                        <th className="col-batch">バッチID</th>
                        <th className="col-digit">予測値</th>
                        <th className="col-confidence">信頼度</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((item, idx) => (
                        <tr key={idx}>
                            <td className="col-date">{item.created_at}</td>
                            <td className="col-batch">{item.batch_id}</td>
                            <td className="col-digit">{item.digit}</td>
                            <td className="col-confidence">{item.confidence}%</td>
                        </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default HistoryTable;