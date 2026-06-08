import { Route, Routes } from "react-router-dom";
import FloatingRecognizeButton from "./components/FloatingRecognizeButton";
import HomePage from "./pages/HomePage";
import PlantDetailPage from "./pages/PlantDetailPage";
import RecognizePage from "./pages/RecognizePage";

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/plants/:id" element={<PlantDetailPage />} />
        <Route path="/recognize" element={<RecognizePage />} />
      </Routes>
      <FloatingRecognizeButton />
    </div>
  );
}
