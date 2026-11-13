const EARTH_RADIUS_M = 6371000;

/** Haversine 직선거리 (미터) */
export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

export function isLocationStale(updatedAt: string, staleDays: number): boolean {
  const updated = Date.parse(updatedAt.includes('T') ? updatedAt : `${updatedAt.replace(' ', 'T')}Z`);
  if (Number.isNaN(updated)) return true;
  const ageMs = Date.now() - updated;
  return ageMs > staleDays * 24 * 60 * 60 * 1000;
}
