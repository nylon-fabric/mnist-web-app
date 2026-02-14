import { useSettings } from "../../context/SettingsContext";
import  type { AIModelConfig } from "../../types/settings"; // モデル情報の型を定義しておく
import { useEffect, useState } from "react";
import { switchModel } from "../../services/api";
import "./ModelSelector.css"

interface ModelSelectorProps {
  models: AIModelConfig[]; // Djangoから取得したモデルリスト
}
const ModelSelector = ({ models }: ModelSelectorProps) => {
    //定義
    const { settings, setSettings } = useSettings(); // 現在のアプリ設定
    const [selectedId, setSelectedId] = useState<number | null>(settings.modelId); // ドロップダウンで選択されているモデルID

    // ユーザーが選択したモデルを設定する
    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = Number(e.target.value);
        setSelectedId(newId); // ドロップダウン用の state を更新
        setSettings({ ...settings, modelId: newId }); // Context にも反映

        //切り替え処理を呼ぶ
        try {
            const data = await switchModel(newId);
            console.log("Model switched:", data.message);
        } catch (err) {
            console.error("Switch model failed:", err);
        }
    };
    // Context の modelId が変わったときに、ローカル state も更新
    useEffect(() => {
        setSelectedId(settings.modelId);
    }, [settings.modelId]);

    return(
        <div className="model-container">
            <label>使用するモデル:</label>
            <select value={selectedId ?? ""} onChange={handleChange}>
                {models.map((m) => (
                <option key={m.id} value={m.id}>
                    {m.id}：{m.name}
                </option>
                ))}
            </select>
        </div>
    );
}
export default ModelSelector;