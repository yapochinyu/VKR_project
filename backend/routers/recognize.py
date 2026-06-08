from fastapi import APIRouter, File, HTTPException, UploadFile

from backend.database import get_plant_by_scientific_name
from backend.ml.inference import predict
from backend.schemas import RecognizeResponse

router = APIRouter(prefix="/api", tags=["recognize"])


@router.post("/recognize", response_model=RecognizeResponse)
async def recognize_plant(file: UploadFile = File(...)) -> RecognizeResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Нужен файл изображения")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Пустой файл")

    try:
        prediction = predict(image_bytes)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка распознавания: {exc}",
        ) from exc

    plant = get_plant_by_scientific_name(prediction.scientific_name)
    if plant is None:
        raise HTTPException(
            status_code=404,
            detail=f"Растение «{prediction.scientific_name}» не найдено в справочнике",
        )

    return RecognizeResponse(
        plant=plant,
        confidence=prediction.confidence,
        scientific_name=prediction.scientific_name,
    )
