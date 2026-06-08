export interface PlantListItem {
  plant_id: number;
  scientific_name: string;
  image_url: string | null;
  russian_name: string | null;
  osetian_name: string | null;
}

export interface Plant extends PlantListItem {
  general_info: string | null;
  cultural_info: string | null;
}

export interface RecognizeResponse {
  plant: Plant;
  confidence: number;
  scientific_name: string;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function imageSrc(url: string | null): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
}

export async function fetchPlants(
  search?: string,
  sort: "asc" | "desc" = "asc"
): Promise<PlantListItem[]> {
  const params = new URLSearchParams({ sort });
  if (search?.trim()) params.set("search", search.trim());
  const res = await fetch(`${API_BASE}/api/plants?${params}`);
  if (!res.ok) throw new Error("Не удалось загрузить список растений");
  return res.json();
}

export async function fetchPlant(id: number): Promise<Plant> {
  const res = await fetch(`${API_BASE}/api/plants/${id}`);
  if (!res.ok) throw new Error("Растение не найдено");
  return res.json();
}

export async function recognizePlant(file: File): Promise<RecognizeResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/recognize`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const detail = data.detail ?? "Ошибка распознавания";
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return res.json();
}
