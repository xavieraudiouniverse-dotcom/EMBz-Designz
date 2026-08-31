/**
 * Real latitude/longitude lookups for the InteractiveGlobe component.
 * Approximate country centroids and well-known city coordinates — good
 * enough for plotting a marker, not survey-grade geography.
 */
export const COUNTRY_LATLON: Record<string, { lat: number; lon: number }> = {
  australia: { lat: -25.27, lon: 133.78 },
  "new zealand": { lat: -40.9, lon: 174.89 },
  "united states": { lat: 39.83, lon: -98.58 },
  usa: { lat: 39.83, lon: -98.58 },
  canada: { lat: 56.13, lon: -106.35 },
  "united kingdom": { lat: 54.0, lon: -2.0 },
  uk: { lat: 54.0, lon: -2.0 },
  germany: { lat: 51.17, lon: 10.45 },
  france: { lat: 46.6, lon: 1.89 },
  japan: { lat: 36.2, lon: 138.25 },
  singapore: { lat: 1.35, lon: 103.82 },
  "united arab emirates": { lat: 23.42, lon: 53.85 },
  uae: { lat: 23.42, lon: 53.85 },
};

export const DEFAULT_LATLON = { lat: 15, lon: 10 };

export function latLonForCountry(country: string | null | undefined): { lat: number; lon: number } {
  if (!country) return DEFAULT_LATLON;
  return COUNTRY_LATLON[country.trim().toLowerCase()] ?? DEFAULT_LATLON;
}

/** Hub cities used for the "global network" style visualizations (Movement, dashboard). */
export const CITY_LATLON: Record<string, { lat: number; lon: number }> = {
  sydney: { lat: -33.87, lon: 151.21 },
  "new york": { lat: 40.71, lon: -74.01 },
  london: { lat: 51.51, lon: -0.13 },
  tokyo: { lat: 35.68, lon: 139.69 },
  singapore: { lat: 1.35, lon: 103.82 },
  "são paulo": { lat: -23.55, lon: -46.63 },
  "sao paulo": { lat: -23.55, lon: -46.63 },
  lagos: { lat: 6.52, lon: 3.38 },
  dubai: { lat: 25.2, lon: 55.27 },
};
