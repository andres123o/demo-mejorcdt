import type { Etapa } from "./motor.ts";

// Cifras agregadas para dar escala. Simuladas: no son datos de MejorCDT, pero cuadran entre sí:
// unos 2.700 registrados por semana y 16 % a 19 % que abren su primer CDT (unos 512 por semana).

// ── Totales ───────────────────────────────────────────────────────────

export const REGISTRADOS = { anio: 140_000, semana: 2_720, semanaAnterior: 2_590 };
export const ABIERTOS = { d7: 512, d7Anterior: 486, d30: 2_190, d90: 6_240, anio: 22_700 };

// Tendencias de 8 semanas para las tarjetas.
export const TENDENCIA = {
  registrados: [2_480, 2_520, 2_610, 2_560, 2_650, 2_700, 2_590, 2_720],
  abiertos: [432, 441, 455, 470, 462, 479, 486, 512],
  conversion: [0.151, 0.155, 0.163, 0.171, 0.176, 0.181, 0.184, 0.188],
  dias: [8.1, 7.8, 7.4, 7.0, 6.8, 6.5, 6.2, 6],
};

// ── Journey del usuario: los registrados de esta semana, paso a paso ──
// Cuántos llegaron a cada paso. Los que no pasaron al siguiente están en la campaña de ese paso.
// Cuadra con las tarjetas: empieza en REGISTRADOS.semana y termina en ABIERTOS.d7 (512 / 2.720 = 18,8 %).


// tiempo = mediana desde el paso anterior.
export const JOURNEY_USUARIO: { etapa: Etapa; llegaron: number; tiempo?: string }[] = [
  { etapa: "simulo", llegaron: 2_720 },
  { etapa: "datos", llegaron: 1_320, tiempo: "6 h" },
  { etapa: "identidad", llegaron: 860, tiempo: "1 día" },
  { etapa: "firma", llegaron: 625, tiempo: "2 días" },
  { etapa: "transferencia", llegaron: 552, tiempo: "18 h" },
  { etapa: "abierto", llegaron: 512, tiempo: "1 día" },
];

// Campañas de esta semana: en las de cada paso, los inscritos son los que se quedaron en ese paso.
export const CAMPANAS_SEMANA: Record<string, { inscritos: number; objetivo: number } | null> = {
  "solo-simulo": { inscritos: 1_400, objetivo: 252 },
  datos: { inscritos: 460, objetivo: 115 },
  validacion: { inscritos: 235, objetivo: 89 },
  firma: { inscritos: 73, objetivo: 40 },
  transferencia: { inscritos: 40, objetivo: 32 },
  "alerta-tasa": { inscritos: 1_130, objetivo: 136 },
  prima: null, // programada
};

// ── Medición ──────────────────────────────────────────────────────────

// Activación a 14 días por semana de registro.
export const SEMANAS: { semana: string; activacion: number; registrados: number }[] = [
  { semana: "4 ago", activacion: 0.148, registrados: 2_390 },
  { semana: "11 ago", activacion: 0.151, registrados: 2_480 },
  { semana: "18 ago", activacion: 0.155, registrados: 2_520 },
  { semana: "25 ago", activacion: 0.163, registrados: 2_610 },
  { semana: "1 sep", activacion: 0.171, registrados: 2_560 },
  { semana: "8 sep", activacion: 0.176, registrados: 2_650 },
  { semana: "15 sep", activacion: 0.181, registrados: 2_700 },
  { semana: "22 sep", activacion: 0.184, registrados: 2_590 },
  { semana: "29 sep", activacion: 0.188, registrados: 2_720 },
];

// Por fuente, esta semana: lo que cuenta es el CDT abierto, no el registro (suman 2.720 y 512).
export const POR_FUENTE: { fuente: string; registros: number; abiertos: number }[] = [
  { fuente: "Google", registros: 700, abiertos: 176 },
  { fuente: "Contenido", registros: 490, abiertos: 94 },
  { fuente: "Referidos", registros: 330, abiertos: 90 },
  { fuente: "Influencers", registros: 640, abiertos: 88 },
  { fuente: "Pauta en Meta", registros: 560, abiertos: 64 },
];

// Días desde que simuló hasta su primer CDT, de los 512 CDT de esta semana.
export const DIAS_PRIMER_CDT: { dias: string; cdt: number }[] = [
  { dias: "0–1", cdt: 58 },
  { dias: "2", cdt: 54 },
  { dias: "3", cdt: 49 },
  { dias: "4", cdt: 47 },
  { dias: "5", cdt: 44 },
  { dias: "6", cdt: 42 },
  { dias: "7", cdt: 37 },
  { dias: "8–10", cdt: 77 },
  { dias: "11–14", cdt: 58 },
  { dias: "15+", cdt: 46 },
];
export const MEDIANA_DIAS = "6";
