import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { recognizePlant } from "../api/client";

function useIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function RecognizePage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleFile = (selected: File | null) => {
    setError(null);
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setError("Выберите изображение");
      return;
    }
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  };

  const openPicker = (capture?: boolean) => {
    const input = inputRef.current;
    if (!input) return;
    if (capture) {
      input.setAttribute("capture", "environment");
    } else {
      input.removeAttribute("capture");
    }
    input.click();
  };

  const submit = async () => {
    if (!file) {
      setError("Сначала выберите или сделайте фото");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await recognizePlant(file);
      navigate(`/plants/${result.plant.plant_id}`, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка распознавания");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page recognize-page">
      <header className="page-header">
        <button
          type="button"
          className="btn-back"
          onClick={() => navigate(-1)}
          aria-label="Назад"
        >
          ←
        </button>
        <h1>Распознать</h1>
      </header>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="file-input-hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {preview && (
        <img className="recognize-preview" src={preview} alt="Превью" />
      )}

      {loading ? (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Распознаём растение…</p>
        </div>
      ) : (
        <div className="recognize-actions">
          {isMobile ? (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => openPicker(true)}
              >
                Сделать фото
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => openPicker(false)}
              >
                Выбрать из галереи
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => openPicker(false)}
            >
              Загрузить фото
            </button>
          )}

          {file && (
            <button type="button" className="btn-primary" onClick={submit}>
              Отправить на распознавание
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="status-message status-message--error">{error}</p>
      )}

      <p className="status-message" style={{ fontSize: "0.85rem" }}>
        Сфотографируйте растение при хорошем освещении. Первый запуск модели
        может занять несколько секунд.
      </p>
    </div>
  );
}
