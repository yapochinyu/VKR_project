# Деплой flwrr на VPS (Docker)

Один вход: **nginx :80** → статика React + прокси `/api` и `/static` на backend с ML.

## Требования к серверу

| Параметр | Рекомендация |
|----------|----------------|
| ОС | Ubuntu 22.04+ (или другой Linux с Docker) |
| RAM | **2 GB** минимум (PyTorch CPU) |
| vCPU | 1–2 |
| Диск | 20–30 GB SSD |
| Порт | **80** открыт в firewall |
| GPU | не нужен |

## 1. Установить Docker на сервере

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
# перелогиньтесь или: newgrp docker
docker --version
docker compose version
```

## 2. Загрузить проект

```bash
git clone <URL-репозитория> flwrr
cd flwrr
```

Или скопируйте папку проекта на сервер (`scp`, WinSCP).

## 3. Обязательные файлы данных

Эти файлы **не в git** (большие). Должны лежать на сервере до запуска:

| Путь | Описание |
|------|----------|
| `best_model.pth` | Обученная модель (корень проекта) |
| `static/images/` | 12 папок по `scientific_name` |
| `plants.db` | Опционально: создастся при первом старте |

С ПК (PowerShell):

```powershell
scp best_model.pth user@SERVER_IP:/home/user/flwrr/
scp -r static/images user@SERVER_IP:/home/user/flwrr/static/
scp plants.db user@SERVER_IP:/home/user/flwrr/
```

## 4. Запуск

```bash
cd flwrr
cp .env.example .env   # при необходимости сменить FLWRR_HTTP_PORT
docker compose up -d --build
```

Первый запуск backend может занять **2–5 минут** (установка зависимостей в образе уже сделана при build; загрузка модели при healthcheck).

Проверка:

- http://SERVER_IP/ — главная flwrr
- http://SERVER_IP/api/health — `{"status":"ok"}`

## 5. Логи и перезапуск

```bash
docker compose logs -f backend
docker compose logs -f nginx
docker compose restart
docker compose down
docker compose up -d --build   # после обновления кода
```

## 6. Обновление версии

```bash
git pull
docker compose up -d --build
```

Данные (`plants.db`, `static/`, `best_model.pth`) на томах сохраняются.

## 7. Телефон

Если VPS с публичным IP — откройте в браузере телефона:

`http://SERVER_IP/`

Для камеры в долгосрочной перспективе удобнее HTTPS (см. ниже).

## 8. Локальная проверка (на ПК)

```powershell
cd D:\projects\VKR_project
docker compose up --build
```

Откройте http://localhost

## 9. HTTPS (позже)

Сейчас только HTTP :80. Когда появится домен:

1. Настроить A-запись домена на IP сервера.
2. Установить certbot, получить сертификат Let's Encrypt.
3. Добавить в nginx `listen 443 ssl` и редирект с 80.

Автоматизация certbot в compose в этой версии **не включена**.

## 10. Устранение неполадок

| Проблема | Решение |
|---------|---------|
| `backend` unhealthy | `docker compose logs backend` — нет ли `best_model.pth` |
| 502 от nginx | Дождаться healthcheck backend (~2 мин после старта) |
| Нет картинок | Проверить `static/images` на хосте и volume в compose |
| OOM / killed | VPS < 2 GB RAM — увеличить тариф или ONNX (будущее) |
| Порт 80 занят | В `.env`: `FLWRR_HTTP_PORT=8080` |

## Переменные окружения (backend)

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `FLWRR_ROOT` | `/app` в Docker | Корень проекта |
| `FLWRR_DB_PATH` | `{ROOT}/plants.db` | SQLite |
| `FLWRR_STATIC_DIR` | `{ROOT}/static` | Картинки |
| `FLWRR_MODEL_PATH` | `{ROOT}/best_model.pth` | Модель |

## Оценка ресурсов

- Образ backend с PyTorch CPU: ~1–2 GB на диске
- RAM в работе: ~1.5–2 GB (один uvicorn worker)
- Не увеличивайте `--workers` без отдельной стратегии — каждый worker загружает модель заново
