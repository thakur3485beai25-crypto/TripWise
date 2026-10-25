export const formatPlaceNames = (list) => {
  let names = list.map((p) => p.name);
  if (names.length === 0) return "somewhere on our list";
  if (names.length === 1) return names[0];
  if (names.length === 2) return names[0] + " and " + names[1];
  return names.slice(0, -1).join(", ") + ", and " + names[names.length - 1];
};

export const cheapestPrice = (place) =>
  Math.min(...place.hotels.map((h) => parseInt(h.price.replace(/[^\d]/g, ""), 10)));

export const sortByLowestCrowd = (list) =>
  [...list].sort((a, b) => a.currentVisitors / a.maxVisitors - b.currentVisitors / b.maxVisitors);

export const sortByCheapest = (list) => [...list].sort((a, b) => cheapestPrice(a) - cheapestPrice(b));

export function getCrowdLevel(place) {
  let percent = (place.currentVisitors / place.maxVisitors) * 100;
  if (percent >= 90) return "high";
  if (percent >= 50) return "medium";
  return "low";
}

export function getCrowdLabel(level) {
  if (level === "high") return "High";
  if (level === "medium") return "Medium";
  return "Low";
}