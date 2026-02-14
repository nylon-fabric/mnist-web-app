// 設定ページの設定項目の「型定義」

// 学習モデルを切り替えるときに使用
// export type ModelType = "default" | "v2";

// 予測信頼度と学習モデルの種類の設定項目
export interface AppSettings {
    confidenceThreshold: number; // 確率下限（0〜1）
    // modelType: ModelType;        // 学習モデル
    modelId: number | null;
}

// 設定の初期値
export const defaultSettings: AppSettings = {
    confidenceThreshold: 0.0,
    // modelType: "default",
    modelId:  null,
};

// モデルの定義
export interface AIModelConfig {
    id: number;
    name: string;
    api_url: string;
    description?: string;
    is_active?: boolean;
}

//履歴ページ　テーブル表示内容
export interface HistoryItem {
    batch_id: string;
    digit_index: number;
    digit: string;
    confidence: number;
    created_at: string;
}

