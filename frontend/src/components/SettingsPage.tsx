/**
 * 信頼度下限の表示と対応を行う
 */
import ConfidenceThreshold from "../components/settings/ConfidenceThreshold";
import ModelSelector from "../components/settings/ModelSelector";
import { useSettings } from "../context/SettingsContext";
import { useEffect, useState } from "react";
import type { AIModelConfig } from "../types/settings";
import { fetchModels } from "../services/api";
import "./SettingsPage.css"


const SettingsPage = () => {
const { settings, setSettings } = useSettings(); // 下限設定する確率
const [models, setModels] = useState<AIModelConfig[]>([]); // 切り替えるモデル

// 現在の使用モデル名をIDで検索
const currentModelName = models.find(m => m.id === settings.modelId)?.name || "未設定";

  useEffect(() => {
    //　APIアクセスして設定ページのモデル表示用の一覧を取る
    const fetchData = async () => {
      try {
        const data = await fetchModels();
        setModels(data);

      } catch (err) {
        console.error("Failed to fetch models:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="SettingsPage-wrapper">
        <h2>設定ページ</h2>
        <div>
          <div>
            <ConfidenceThreshold />
            <p>現在の閾値: {(settings.confidenceThreshold * 100).toFixed(0)}%</p>
          </div>
          <div>
            < ModelSelector models={models} />
            <p>現在のモデル: ID:{settings.modelId}, name:{currentModelName}</p>
          </div>
        </div>
    </div>
  );
};

export default SettingsPage;
