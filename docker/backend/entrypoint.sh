#!/bin/sh
set -e

if [ ! -f "${FLWRR_DB_PATH:-/app/plants.db}" ]; then
  echo "plants.db not found, running create_db.py..."
  python create_db.py
fi

exec "$@"
