export interface LatLng {
  lat: number;
  lng: number;
}

export async function geocodeLocation(location: string): Promise<LatLng | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", location);
  url.searchParams.set("language", "ko");
  url.searchParams.set("key", key);

  const res = await fetch(url.toString(), { next: { revalidate: 86400 * 7 } });
  if (!res.ok) return null;

  const json = await res.json();
  if (json.status !== "OK" || !json.results?.[0]) return null;

  const { lat, lng } = json.results[0].geometry.location;
  return { lat, lng };
}
