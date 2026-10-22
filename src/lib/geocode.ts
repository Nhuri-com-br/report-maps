// Converte coordenadas em endereço usando o Nominatim (OpenStreetMap).
// Uso leve (uma chamada por relato), dentro da política de uso do serviço.
export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<string | null> {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1` +
    `&accept-language=pt-BR&lat=${lat}&lon=${lng}`;

  const res = await fetch(url, { signal });
  if (!res.ok) return null;

  const data = await res.json();
  const a = data.address ?? {};
  const street = a.road || a.pedestrian || a.footway || a.path;
  const district = a.suburb || a.neighbourhood || a.quarter;
  const city = a.city || a.town || a.village || a.municipality;

  const streetLine = street && a.house_number ? `${street}, ${a.house_number}` : street;
  const parts = [streetLine, district, city].filter(Boolean);

  return parts.length ? parts.join(' - ') : (data.display_name ?? null);
}