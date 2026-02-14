/**
 * 履歴ページ
 * csv出力
 */
import "./ExportButton.css"
type ExportButtonProps = {
    onClick: () => void;
}
const ExportButton = ({onClick}: ExportButtonProps) => {
    return(
        <button
            onClick={onClick}
            className="export-button">
            分析用CSVをダウンロード
        </button>
    );
};

export default ExportButton;
