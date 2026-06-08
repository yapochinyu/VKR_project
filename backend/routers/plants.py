from fastapi import APIRouter, HTTPException, Query

from backend.database import get_plant, list_plants
from backend.schemas import Plant, PlantListItem

router = APIRouter(prefix="/api/plants", tags=["plants"])


@router.get("", response_model=list[PlantListItem])
def get_plants(
    search: str | None = Query(None),
    sort: str = Query("asc", pattern="^(asc|desc)$"),
) -> list[PlantListItem]:
    return list_plants(search=search, sort=sort)


@router.get("/{plant_id}", response_model=Plant)
def get_plant_by_id(plant_id: int) -> Plant:
    plant = get_plant(plant_id)
    if plant is None:
        raise HTTPException(status_code=404, detail="Растение не найдено")
    return plant
