from pydantic import BaseModel


class Plant(BaseModel):
    plant_id: int
    scientific_name: str
    image_url: str | None
    russian_name: str | None
    osetian_name: str | None
    general_info: str | None
    cultural_info: str | None


class PlantListItem(BaseModel):
    plant_id: int
    scientific_name: str
    image_url: str | None
    russian_name: str | None
    osetian_name: str | None


class RecognizeResponse(BaseModel):
    plant: Plant
    confidence: float
    scientific_name: str
