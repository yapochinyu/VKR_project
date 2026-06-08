from __future__ import annotations

import io
from dataclasses import dataclass
from threading import Lock

import torch
import timm
from PIL import Image
from torchvision import transforms

from backend.config import MODEL_PATH

_transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ]
)

_model: torch.nn.Module | None = None
_class_names: list[str] | None = None
_lock = Lock()


@dataclass
class Prediction:
    scientific_name: str
    confidence: float


def _load_model() -> None:
    global _model, _class_names
    if _model is not None:
        return

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Модель не найдена: {MODEL_PATH}. "
            "Поместите best_model.pth в корень проекта"
        )

    try:
        checkpoint = torch.load(
            MODEL_PATH, map_location="cpu", weights_only=False
        )
    except TypeError:
        checkpoint = torch.load(MODEL_PATH, map_location="cpu")
    _class_names = list(checkpoint["class_names"])
    _model = timm.create_model(
        "efficientnet_b0",
        pretrained=False,
        num_classes=len(_class_names),
    )
    _model.load_state_dict(checkpoint["model_state_dict"])
    _model.eval()


def get_class_names() -> list[str]:
    with _lock:
        _load_model()
    assert _class_names is not None
    return list(_class_names)


def predict(image_bytes: bytes) -> Prediction:
    with _lock:
        _load_model()

    assert _model is not None and _class_names is not None

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = _transform(image).unsqueeze(0)

    with torch.no_grad():
        outputs = _model(tensor)
        probs = torch.softmax(outputs, dim=1)[0]
        idx = int(probs.argmax().item())
        confidence = float(probs[idx].item())

    return Prediction(
        scientific_name=_class_names[idx],
        confidence=confidence,
    )
