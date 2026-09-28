const CODE_ALPHABET = "23456789CFGHJMPQRVWX";
const PAIR_RESOLUTIONS = [20, 1, 0.05, 0.0025, 0.000125];

/** Returns a full 10-digit Open Location Code for the supplied coordinates. */
export function encodePlusCode(latitude: number, longitude: number): string {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return "";

  let lat = Math.max(-90, Math.min(90 - 1e-12, latitude)) + 90;
  let lon = ((longitude + 180) % 360 + 360) % 360;
  let code = "";

  for (const resolution of PAIR_RESOLUTIONS) {
    const latDigit = Math.floor(lat / resolution);
    const lonDigit = Math.floor(lon / resolution);
    code += CODE_ALPHABET[latDigit] + CODE_ALPHABET[lonDigit];
    lat -= latDigit * resolution;
    lon -= lonDigit * resolution;
  }

  return `${code.slice(0, 8)}+${code.slice(8)}`;
}
