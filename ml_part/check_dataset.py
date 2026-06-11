from pathlib import Path
from PIL import Image
import pandas as pd

DATASET_DIR = Path("data/images")

stats = []
broken_files = []

for class_dir in DATASET_DIR.iterdir():
    if not class_dir.is_dir():
        continue

    image_count = 0
    widths = []
    heights = []

    for img_path in class_dir.glob("*"):
        try:
            with Image.open(img_path) as img:
                width, height = img.size

            widths.append(width)
            heights.append(height)
            image_count += 1

        except Exception:
            broken_files.append(str(img_path))

    if image_count > 0:
        stats.append({
            "class": class_dir.name,
            "images": image_count,
            "min_width": min(widths),
            "max_width": max(widths),
            "min_height": min(heights),
            "max_height": max(heights),
            "avg_width": round(sum(widths) / len(widths)),
            "avg_height": round(sum(heights) / len(heights)),
        })

stats_df = pd.DataFrame(stats)

print("\n=== CLASS STATISTICS ===")
print(stats_df.sort_values("images", ascending=False))

print(f"\nTotal classes: {len(stats_df)}")
print(f"Total images: {stats_df['images'].sum()}")

print(f"\nBroken files: {len(broken_files)}")

if broken_files:
    pd.Series(broken_files).to_csv(
        "broken_files.csv",
        index=False,
        header=["filepath"]
    )
    print("Broken file list saved to broken_files.csv")