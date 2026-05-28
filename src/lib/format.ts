// Resolve product image paths (DB stores logical paths like "/src/assets/cat-leather.jpg")
// to bundled URLs. Falls back to the hero image if unknown.
import catLeather from "@/assets/cat-leather.jpg";
import catWatches from "@/assets/cat-watches.jpg";
import catHome from "@/assets/cat-home.jpg";
import catOutdoor from "@/assets/cat-outdoor.jpg";
import hero from "@/assets/hero.jpg";

const map: Record<string, string> = {
  "/src/assets/cat-leather.jpg": catLeather,
  "/src/assets/cat-watches.jpg": catWatches,
  "/src/assets/cat-home.jpg": catHome,
  "/src/assets/cat-outdoor.jpg": catOutdoor,
};

export function resolveImage(path?: string | null): string {
  if (!path) return hero;
  if (path.startsWith("http")) return path;
  return map[path] ?? hero;
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
