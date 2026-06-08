import { Link } from "react-router-dom";
import { imageSrc, type PlantListItem as Plant } from "../api/client";
import { isMissingOssetian } from "../utils/formatText";

interface Props {
  plant: Plant;
}

export default function PlantListItemCard({ plant }: Props) {
  const src = imageSrc(plant.image_url);

  return (
    <li>
      <Link to={`/plants/${plant.plant_id}`} className="plant-card">
        {src ? (
          <img
            className="plant-card__thumb"
            src={src}
            alt={plant.russian_name ?? plant.scientific_name}
            loading="lazy"
          />
        ) : (
          <div className="plant-card__thumb plant-card__thumb--placeholder">
            🌿
          </div>
        )}
        <div className="plant-card__body">
          <p className="plant-card__title">{plant.russian_name}</p>
          <p
            className={
              isMissingOssetian(plant.osetian_name)
                ? "plant-card__subtitle plant-card__subtitle--missing"
                : "plant-card__subtitle"
            }
          >
            {plant.osetian_name ?? "—"}
          </p>
        </div>
      </Link>
    </li>
  );
}
