# flwrr — справочник флоры РСО-Алания

Mobile-first веб-приложение: справочник из 12 растений и распознавание по фото (EfficientNet-B0).

## Требования

- Python 3.10+ (рекомендуется conda-окружение `flora`)
- Node.js 18+
- Файлы в проекте:
  - `plants.db` (создаётся скриптом)
  - `best_model.pth` (в корне проекта)
  - `static/images/{scientific_name}/…`

## Установка

```powershell
cd d:\projects\VKR_project
pip install -r requirements.txt
python create_db.py
```

```powershell
cd frontend
npm install
```

## Запуск

**Терминал 1 — backend:**

```powershell
cd d:\projects\VKR_project
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Терминал 2 — frontend:**

```powershell
cd d:\projects\VKR_project\frontend
npm run dev
```

Откройте http://localhost:5173

Прокси Vite перенаправляет `/api` и `/static` на backend.

## Тест с телефона

1. Backend с `--host 0.0.0.0`
2. Узнайте IP компьютера в Wi‑Fi
3. Создайте `frontend/.env.local`:

```
VITE_API_URL=http://192.168.x.x:8000
```

4. `npm run dev -- --host`

## API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/plants?search=&sort=asc\|desc` | Список растений |
| GET | `/api/plants/{plant_id}` | Карточка |
| POST | `/api/recognize` | multipart `file` → top-1 + карточка |
| GET | `/static/images/...` | Изображения |

## Production (Docker на сервере)

```powershell
docker compose up -d --build
```

Сайт: http://localhost (или IP VPS). Подробно: **[DEPLOY.md](DEPLOY.md)** — VPS, копирование модели, логи, HTTPS позже.

Нужны на хосте: `best_model.pth`, `static/images/`, при желании `plants.db`.

## Структура

```
backend/          FastAPI + ML inference
frontend/         React + Vite
docker/           Dockerfile backend + nginx
docker-compose.yml
static/images/    Фото растений
best_model.pth    Модель (корень проекта)
ml_part/          Архив обучения (локально, не в git)
plants.db         SQLite
create_db.py      Пересоздание БД
DEPLOY.md         Инструкция деплоя на VPS
```
