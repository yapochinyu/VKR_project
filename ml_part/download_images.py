from pathlib import Path
import pandas as pd
import requests
from tqdm import tqdm

# Загружаем датасет
df = pd.read_csv("plants.csv")

# Корневая папка для изображений
ROOT_DIR = Path("data/images")
ROOT_DIR.mkdir(parents=True, exist_ok=True)

metadata = []

for idx, row in tqdm(df.iterrows(), total=len(df)):
    try:
        species = row["scientific_name"].replace("/", "_")
        image_url = row["image_url"]

        class_dir = ROOT_DIR / species
        class_dir.mkdir(exist_ok=True)

        ext = image_url.split(".")[-1].split("?")[0]
        filename = f"{row['id']}.{ext}"

        filepath = class_dir / filename

        if not filepath.exists():
            response = requests.get(image_url, timeout=20)

            if response.status_code == 200:
                with open(filepath, "wb") as f:
                    f.write(response.content)

        metadata.append(
            {
                "filepath": str(filepath),
                "taxon_id": row["taxon_id"],
                "scientific_name": row["scientific_name"],
            }
        )

    except Exception:
        continue

metadata_df = pd.DataFrame(metadata)
metadata_df.to_parquet("metadata.parquet", index=False)

print(f"Downloaded: {len(metadata_df)} images")