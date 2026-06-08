import locale
import sqlite3
from typing import Any

from backend.config import DB_PATH
from backend.schemas import Plant, PlantListItem

CYRILLIC_ORDER = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ"


def _cyrillic_sort_key(name: str | None) -> tuple[int, str]:
    if not name:
        return (len(CYRILLIC_ORDER) + 1, "")
    first = name.strip()[:1].upper()
    idx = CYRILLIC_ORDER.find(first)
    if idx == -1:
        return (len(CYRILLIC_ORDER), name.lower())
    return (idx, name.lower())


def _try_locale_sort(names: list[str], reverse: bool) -> list[str] | None:
    for loc in ("ru_RU.UTF-8", "Russian_Russia.1251", "ru"):
        try:
            locale.setlocale(locale.LC_COLLATE, loc)
            return sorted(names, key=locale.strxfrm, reverse=reverse)
        except locale.Error:
            continue
    return None


def _row_to_plant(row: sqlite3.Row) -> Plant:
    return Plant(
        plant_id=row["plant_id"],
        scientific_name=row["scientific_name"],
        image_url=row["image_url"],
        russian_name=row["russian_name"],
        osetian_name=row["osetian_name"],
        general_info=row["general_info"],
        cultural_info=row["cultural_info"],
    )


def _get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def list_plants(
    search: str | None = None,
    sort: str = "asc",
) -> list[PlantListItem]:
    conn = _get_connection()
    try:
        cursor = conn.execute(
            "SELECT plant_id, scientific_name, image_url, russian_name, osetian_name FROM plants"
        )
        rows = cursor.fetchall()
    finally:
        conn.close()

    items: list[PlantListItem] = [
        PlantListItem(
            plant_id=row["plant_id"],
            scientific_name=row["scientific_name"],
            image_url=row["image_url"],
            russian_name=row["russian_name"],
            osetian_name=row["osetian_name"],
        )
        for row in rows
    ]

    if search:
        q = search.strip().lower()
        items = [
            p
            for p in items
            if p.russian_name and q in p.russian_name.lower()
        ]

    reverse = sort == "desc"
    names = [p.russian_name or "" for p in items]
    sorted_names = _try_locale_sort(names, reverse)
    if sorted_names is not None:
        order = {name: i for i, name in enumerate(sorted_names)}
        items.sort(key=lambda p: order.get(p.russian_name or "", 0))
    else:
        items.sort(key=lambda p: _cyrillic_sort_key(p.russian_name), reverse=reverse)

    return items


def get_plant(plant_id: int) -> Plant | None:
    conn = _get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM plants WHERE plant_id = ?", (plant_id,)
        ).fetchone()
    finally:
        conn.close()
    if row is None:
        return None
    return _row_to_plant(row)


def get_plant_by_scientific_name(scientific_name: str) -> Plant | None:
    conn = _get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM plants WHERE scientific_name = ?", (scientific_name,)
        ).fetchone()
    finally:
        conn.close()
    if row is None:
        return None
    return _row_to_plant(row)


def get_all_scientific_names() -> set[str]:
    conn = _get_connection()
    try:
        rows = conn.execute("SELECT scientific_name FROM plants").fetchall()
    finally:
        conn.close()
    return {row["scientific_name"] for row in rows}
