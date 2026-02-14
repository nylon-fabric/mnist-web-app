import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import DrawingCanvas from "./components/DrawingCanvas";
import PredictionHistory from "./components/PredictionHistory";
import SettingsPage from "./components/SettingsPage";
import { SettingsProvider } from "./context/SettingsContext";
import './App.css'

function App() {

  return (
    <SettingsProvider>
      <BrowserRouter>
        <nav className="app-nav">
          <div className="app-nav-inner">
            <Link to="/">予測</Link>{" | "}
            <Link to="/history">履歴</Link>{" | "}
            <Link to="/settings">設定</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<DrawingCanvas />} />
          <Route path="/history" element={<PredictionHistory />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App
