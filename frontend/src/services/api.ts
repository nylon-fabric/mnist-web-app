/*
api処理
*/
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const apiService = {


  /**
   * 履歴を取得
   */
  async getHistory(limit: number = 50) {
    const res = await fetch(`${API_BASE}/api/history/?limit=${limit}`);
    if (!res.ok) throw new Error("履歴の取得に失敗しました");
    return res.json();
  },

  /**
   * CSVエクスポート用のURLを取得
   */
  getExportUrl() {
    return `${API_BASE}/api/history/export/`;
  },



};
/*予測ページ */
export const predict = async (formData: FormData) => {

   // 予測（推論）を実行
  const res = await fetch(`${API_BASE}/api/predict/`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "サーバーエラーが発生しました");
  }
  return res.json(); // { digit: ..., confidence: ... }
};


export const saveTrainingData = async (formData: FormData) => {

  // 再学習用に使用する予測データ結果を送る
  const res = await fetch(`${API_BASE}/api/history/retraining_data/`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "データの保存に失敗しました");
  }
  return res.json();
};


/**
 * 履歴ページ
 */
export const getHistory = async (limit: number = 50) => {

  // 履歴を取得
  const res = await fetch(`${API_BASE}/api/history/?limit=${limit}`);
  if (!res.ok) throw new Error("履歴の取得に失敗しました");
  return res.json();
};


export const getExportUrl = () => {
  // CSVエクスポート用のURLを取得
  return `${API_BASE}/api/history/export/`;
};


// 設定ページ
export const fetchModels = async () => {

  //　設定ページのモデル一覧表示
  const response = await fetch(`${API_BASE}/api/settings/models/`);

  if (!response.ok) {
    throw new Error("Failed to fetch models");
  }
  return await response.json();
};


export const switchModel = async (modelId: number) => {

  // モデル切り替え呼び出し
  const response = await fetch(`${API_BASE}/api/settings/switch-model/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model_id: modelId }),
  });

  if (!response.ok) {
    throw new Error("Failed to switch model");
  }
  return await response.json();
};