import { createContext, useContext, useState , useEffect } from "react";
import type { ReactNode } from "react";

type AppSettings = {
  confidenceThreshold: number; // 追加操作: default 値はここでは保持せず型のみ定義
  modelId: number | null; //DB登録されているモデルid
};

// Context の中身の型
interface SettingsContextType {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
}

// default 値をセット
const defaultSettings: AppSettings = {
  confidenceThreshold: 0.0, // 追加操作: デフォルト値を 0.0 に設定（元コードは外部値）
  modelId: null,
};

// Context を作成
const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    setSettings: (s: AppSettings) => {}, // 追加操作: ダミー関数をセット
});

// Provider コンポーネント
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    // 修正: localStorage から設定を読み込む処理を追加
    const storedSettings = localStorage.getItem("appSettings");  // localStorage から設定を取得
    // const initialSettings = storedSettings ? JSON.parse(storedSettings) : defaultSettings; // localStorage があればその値を使い、なければ defaultSettings を使用

    const initialSettings: AppSettings = storedSettings
      ? { ...defaultSettings, ...JSON.parse(storedSettings) }// デフォルト設定をベースにして、保存されていた設定で上書きする
      : defaultSettings; // 保存された設定がないなら defaultSettings をそのまま使う


    const [settings, setSettings] = useState<AppSettings>(initialSettings);  // 初期状態として localStorage か defaultSettings を使用

    // 修正: settings が変更されるたびに localStorage に保存
    useEffect(() => {
        localStorage.setItem("appSettings", JSON.stringify(settings));  // settings が変更される度に localStorage に保存
}, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Context を使える Hook
export const useSettings = () => useContext(SettingsContext);