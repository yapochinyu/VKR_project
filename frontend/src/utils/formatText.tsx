import type { ReactNode } from "react";

/** Simple **bold** and <br> support for plant descriptions from DB. */
export function formatPlantText(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const segments = text.split(/(<br\s*\/?>)/gi);
  let key = 0;

  for (const segment of segments) {
    if (/^<br\s*\/?>$/i.test(segment)) {
      parts.push(<br key={`br-${key++}`} />);
      continue;
    }
    const boldParts = segment.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
    for (const part of boldParts) {
      if (!part) continue;
      if (part.startsWith("**") && part.endsWith("**")) {
        parts.push(<strong key={`b-${key++}`}>{part.slice(2, -2)}</strong>);
      } else if (part.startsWith("_") && part.endsWith("_")) {
        parts.push(<em key={`i-${key++}`}>{part.slice(1, -1)}</em>);
      } else {
        parts.push(<span key={`t-${key++}`}>{part}</span>);
      }
    }
  }
  return parts;
}

export function isMissingOssetian(name: string | null): boolean {
  if (!name) return true;
  return name.toLowerCase().includes("нет осетинского");
}
