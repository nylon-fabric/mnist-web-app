/*
設定ページ
信頼度下限を設定する
*/
import { useEffect } from "react";
import { useSettings } from "../../context/SettingsContext";
import "./ConfidenceThreshold.css"

const ConfidenceThreshold = () => {

  // settings から confidenceThreshold を取得
  const { settings, setSettings } = useSettings();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value); // 新しい値を取得

    setSettings({ ...settings, confidenceThreshold: newValue / 100 }); // 親に新しい設定値を0～１で渡す
  };
  // localStorage から設定を取得して初期化
  useEffect(() => {
    const storedSettings = localStorage.getItem("appSettings");

    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      setSettings(parsedSettings); // 取得した設定を setSettings で反映
    }
  }, [setSettings]);

  // settings が変更されるたびに localStorage に保存
  useEffect(() => {
    localStorage.setItem("appSettings", JSON.stringify(settings)); // 設定変更後、localStorage に保存
  }, [settings]);

  return (
    <div className="confidence-wrapper">
      <label>信頼度下限: {Math.round(settings.confidenceThreshold * 100)}%</label>{/* Math.round(で小数点切り捨て、 スライダーは0〜100で管理（UI用）*/}
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(settings.confidenceThreshold * 100)}
        onChange={handleChange}
        className="confidence-container"
      />
    </div>
  );
};

export default ConfidenceThreshold;
