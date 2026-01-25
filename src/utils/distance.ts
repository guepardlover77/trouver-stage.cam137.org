// ============================================================================
// Utilitaires de calcul de distance géographique
// ============================================================================

const EARTH_RADIUS_KM = 6371;

/**
 * Convertit des degrés en radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calcule la distance entre deux points en km (formule de Haversine)
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Formate une distance pour l'affichage
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  }
  return `${Math.round(distanceKm)} km`;
}

/**
 * Vérifie si un point est dans un cercle
 */
export function isPointInCircle(
  pointLat: number,
  pointLon: number,
  centerLat: number,
  centerLon: number,
  radiusKm: number
): boolean {
  const distance = haversineDistance(pointLat, pointLon, centerLat, centerLon);
  return distance <= radiusKm;
}

/**
 * Vérifie si un point est dans un rectangle
 */
export function isPointInBounds(
  pointLat: number,
  pointLon: number,
  bounds: { north: number; south: number; east: number; west: number }
): boolean {
  return (
    pointLat <= bounds.north &&
    pointLat >= bounds.south &&
    pointLon <= bounds.east &&
    pointLon >= bounds.west
  );
}

/**
 * Vérifie si un point est dans un polygone (algorithme ray casting)
 */
export function isPointInPolygon(
  pointLat: number,
  pointLon: number,
  polygon: { lat: number; lon: number }[]
): boolean {
  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].lon;
    const yi = polygon[i].lat;
    const xj = polygon[j].lon;
    const yj = polygon[j].lat;

    const intersect =
      yi > pointLat !== yj > pointLat &&
      pointLon < ((xj - xi) * (pointLat - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Calcule le centre d'un ensemble de points
 */
export function calculateCenter(
  points: { lat: number; lon: number }[]
): { lat: number; lon: number } {
  if (points.length === 0) {
    return { lat: 0, lon: 0 };
  }

  const sum = points.reduce(
    (acc, point) => ({
      lat: acc.lat + point.lat,
      lon: acc.lon + point.lon
    }),
    { lat: 0, lon: 0 }
  );

  return {
    lat: sum.lat / points.length,
    lon: sum.lon / points.length
  };
}

/**
 * Calcule les bounds contenant tous les points
 */
export function calculateBounds(
  points: { lat: number; lon: number }[]
): { north: number; south: number; east: number; west: number } | null {
  if (points.length === 0) {
    return null;
  }

  let north = -Infinity;
  let south = Infinity;
  let east = -Infinity;
  let west = Infinity;

  for (const point of points) {
    north = Math.max(north, point.lat);
    south = Math.min(south, point.lat);
    east = Math.max(east, point.lon);
    west = Math.min(west, point.lon);
  }

  return { north, south, east, west };
}

/**
 * Ajoute un padding aux bounds
 */
export function padBounds(
  bounds: { north: number; south: number; east: number; west: number },
  paddingPercent: number = 10
): { north: number; south: number; east: number; west: number } {
  const latPadding = ((bounds.north - bounds.south) * paddingPercent) / 100;
  const lonPadding = ((bounds.east - bounds.west) * paddingPercent) / 100;

  return {
    north: bounds.north + latPadding,
    south: bounds.south - latPadding,
    east: bounds.east + lonPadding,
    west: bounds.west - lonPadding
  };
}

/**
 * Calcule le bearing (direction) entre deux points en degrés
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = toRadians(lon2 - lon1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  bearing = (bearing + 360) % 360;

  return bearing;
}

/**
 * Convertit un bearing en direction cardinale
 */
export function bearingToCardinal(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

/**
 * Calcule un nouveau point à partir d'un point, d'une distance et d'un bearing
 */
export function destinationPoint(
  lat: number,
  lon: number,
  distanceKm: number,
  bearingDegrees: number
): { lat: number; lon: number } {
  const bearing = toRadians(bearingDegrees);
  const lat1 = toRadians(lat);
  const lon1 = toRadians(lon);
  const angularDistance = distanceKm / EARTH_RADIUS_KM;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
    Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
  );

  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    lat: lat2 * (180 / Math.PI),
    lon: lon2 * (180 / Math.PI)
  };
}

/**
 * Génère des points pour dessiner un cercle sur la carte
 */
export function generateCirclePoints(
  centerLat: number,
  centerLon: number,
  radiusKm: number,
  numPoints: number = 64
): { lat: number; lon: number }[] {
  const points: { lat: number; lon: number }[] = [];

  for (let i = 0; i < numPoints; i++) {
    const bearing = (360 / numPoints) * i;
    points.push(destinationPoint(centerLat, centerLon, radiusKm, bearing));
  }

  return points;
}
