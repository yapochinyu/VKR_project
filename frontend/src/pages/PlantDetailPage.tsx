import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchPlant, imageSrc, type Plant } from "../api/client";
import { formatPlantText, isMissingOssetian } from "../utils/formatText";

export default function PlantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const plantId = Number(id);
    if (!plantId) {
      setError("Неверный идентификатор");
      setLoading(false);
      return;
    }

    fetchPlant(plantId)
      .then(setPlant)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Ошибка загрузки")
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <p className="status-message">Загрузка…</p>
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="page">
        <header className="page-header">
          <button
            type="button"
            className="btn-back"
            onClick={() => navigate(-1)}
            aria-label="Назад"
          >
            ←
          </button>
          <h1>Ошибка</h1>
        </header>
        <p className="status-message status-message--error">
          {error ?? "Не найдено"}
        </p>
        <Link to="/">На главную</Link>
      </div>
    );
  }

  const src = imageSrc(plant.image_url);

  return (
    <div className="page">
      <header className="page-header">
        <button
          type="button"
          className="btn-back"
          onClick={() => navigate(-1)}
          aria-label="Назад"
        >
          ←
        </button>
        <h1>{plant.russian_name}</h1>
      </header>

      {src ? (
        <img
          className="detail-hero"
          src={src}
          alt={plant.russian_name ?? ""}
        />
      ) : (
        <div className="detail-hero detail-hero--placeholder">🌿</div>
      )}

      <div className="detail-names">
        <h2>{plant.russian_name}</h2>
        <p
          className={
            isMissingOssetian(plant.osetian_name)
              ? "plant-card__subtitle plant-card__subtitle--missing"
              : "plant-card__subtitle"
          }
        >
          {plant.osetian_name}
        </p>
        <p className="latin">{plant.scientific_name}</p>
      </div>

      {plant.general_info && (
        <section className="detail-section">
          <h3>Описание</h3>
          <p>{formatPlantText(plant.general_info)}</p>
        </section>
      )}

      {plant.cultural_info && (
        <section className="detail-section">
          <h3>Культурный контекст</h3>
          <p>{formatPlantText(plant.cultural_info)}</p>
        </section>
      )}
    </div>
  );
}
