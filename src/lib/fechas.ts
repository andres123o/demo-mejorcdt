// Fechas suaves en hora de Bogotá: "Hace 2 h", "Mañana, 9 am", "Jueves".
const ZONA = "America/Bogota";
const dia = (t: number) => new Date(t).toLocaleDateString("en-CA", { timeZone: ZONA });
const diferenciaDias = (t: number, ahora: number) => Math.round((Date.parse(dia(t)) - Date.parse(dia(ahora))) / 86_400_000);

export const HORA = 3_600_000;
export const DIA = 86_400_000;

export function hora(t: number) {
  const s = new Date(t).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: ZONA });
  return s.replace(":00", "").replace(/\s*a\.\s*m\./, " am").replace(/\s*p\.\s*m\./, " pm");
}

export function diaSuave(t: number, ahora: number) {
  const n = diferenciaDias(t, ahora);
  if (n === 0) return "Hoy";
  if (n === 1) return "Mañana";
  if (n === -1) return "Ayer";
  if (n > 1 && n < 7) {
    const s = new Date(t).toLocaleDateString("es-CO", { weekday: "long", timeZone: ZONA });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  return new Date(t).toLocaleDateString("es-CO", { day: "numeric", month: "short", timeZone: ZONA }).replace(".", "");
}

export const cuando = (t: number, ahora: number) => `${diaSuave(t, ahora)}, ${hora(t)}`;

export function haceCuanto(t: number, ahora: number) {
  const min = Math.round((ahora - t) / 60_000);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  if (min < 60 * 24 && diferenciaDias(t, ahora) === 0) return `Hace ${Math.round(min / 60)} h`;
  const n = -diferenciaDias(t, ahora);
  if (n === 1) return "Ayer";
  if (n < 7) return `Hace ${n} días`;
  return diaSuave(t, ahora);
}

// "Hace 3 días" sin ser fecha: para el tiempo que alguien lleva quieto.
export function quieto(desde: number, ahora: number) {
  const h = Math.floor((ahora - desde) / HORA);
  if (h < 24) return `${Math.max(h, 1)} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "1 día" : `${d} días`;
}

export const pesos = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} M` : `$${n.toLocaleString("es-CO")}`;

export const pct = (x: number, dec = 1) => `${(x * 100).toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec })} %`;

export const miles = (n: number) => n.toLocaleString("es-CO");
