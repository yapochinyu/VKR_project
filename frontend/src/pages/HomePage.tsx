import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPlants, type PlantListItem } from "../api/client";
import PlantListItemCard from "../components/PlantListItem";

export default function HomePage() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<PlantListItem[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPlants(debouncedSearch || undefined, sort);
      setPlants(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSort = () => {
    setSort((s) => (s === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="page">
      <div className="home-top">
        <div className="brand-row">
          <h1 className="brand-title">flwrr</h1>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate("/recognize")}
          >
            Распознать
          </button>
        </div>

        <div className="toolbar">
          <input
            type="search"
            className="search-input"
            placeholder="Поиск по названию…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Поиск по русскому названию"
          />
          <button
            type="button"
            className="btn-sort"
            onClick={toggleSort}
            aria-label="Сортировка"
          >
            {sort === "asc" ? "А→Я" : "Я→А"}
          </button>
        </div>
      </div>

      {loading && <p className="status-message">Загрузка…</p>}
      {error && (
        <p className="status-message status-message--error">{error}</p>
      )}
      {!loading && !error && plants.length === 0 && (
        <p className="status-message">Ничего не найдено</p>
      )}
      {!loading && !error && plants.length > 0 && (
        <ul className="plant-list">
          {plants.map((plant) => (
            <PlantListItemCard key={plant.plant_id} plant={plant} />
          ))}
        </ul>
      )}
    </div>
  );
}
