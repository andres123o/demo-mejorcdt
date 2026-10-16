// El motor de activación: eventos del flujo de apertura, etapas y las reglas que salen del histórico
// (qué hicieron los que ya abrieron un CDT). Datos simulados; la forma es la del flujo real.

// ── Eventos ───────────────────────────────────────────────────────────
// Nombres inferidos de las rutas públicas del flujo de apertura de mejorcdt.com.

export type Etapa = "simulo" | "datos" | "identidad" | "firma" | "transferencia" | "abierto";

export const EVENTOS: { id: string; nombre: string; etapa: Etapa; props: string[] }[] = [
  { id: "simulacion_creada", nombre: "Simuló", etapa: "simulo", props: ["monto", "plazo", "banco", "tasa", "fuente", "canal"] },
  { id: "datos_personales_completados", nombre: "Datos personales", etapa: "datos", props: ["canal"] },
  { id: "datos_financieros_completados", nombre: "Datos financieros", etapa: "datos", props: ["canal"] },
  { id: "preguntas_banco_completadas", nombre: "Preguntas del banco", etapa: "datos", props: ["banco"] },
  { id: "listas_aprobadas", nombre: "Listas restrictivas", etapa: "identidad", props: [] },
  { id: "identidad_validada", nombre: "Identidad validada", etapa: "identidad", props: ["proveedor"] },
  { id: "documentos_subidos", nombre: "Documentos", etapa: "identidad", props: ["documentos"] },
  { id: "tasa_asegurada", nombre: "Aseguró la tasa", etapa: "firma", props: ["tasa", "vence_tasa"] },
  { id: "documentos_firmados", nombre: "Firmó", etapa: "firma", props: [] },
  { id: "comprobante_subido", nombre: "Transfirió", etapa: "transferencia", props: ["monto"] },
  { id: "cdt_completado", nombre: "CDT abierto", etapa: "abierto", props: ["monto", "banco", "dias_desde_simulacion"] },
];

export const ACTIVACION = EVENTOS.length - 1; // cdt_completado

export const ETAPAS: { id: Etapa; nombre: string; quieto: string }[] = [
  { id: "simulo", nombre: "Simuló", quieto: "Solo simuló" },
  { id: "datos", nombre: "Datos", quieto: "Datos a medias" },
  { id: "identidad", nombre: "Validación", quieto: "En validación" },
  { id: "firma", nombre: "Firma", quieto: "Sin firmar" },
  { id: "transferencia", nombre: "Transferencia", quieto: "Sin transferir" },
  { id: "abierto", nombre: "CDT abierto", quieto: "CDT abierto" },
];

// Dónde está alguien según su último evento: la etapa del paso que le falta.
export function posicionDe(ultimo: number): Etapa {
  if (ultimo === 0) return "simulo";
  if (ultimo <= 2) return "datos";
  if (ultimo <= 5) return "identidad";
  if (ultimo <= 7) return "firma";
  if (ultimo === 8) return "transferencia";
  return "abierto";
}

export const nombrePosicion = (p: Etapa) => ETAPAS.find((e) => e.id === p)!.quieto;
export const nombrePaso = (p: Etapa) => ETAPAS.find((e) => e.id === p)!.nombre;

// ── Reglas ────────────────────────────────────────────────────────────
// Del histórico: de los que hicieron esto, cuántos abrieron su CDT en 30 días. Según eso, qué se le envía.

// Cifras públicas de MejorCDT: más de 550.000 usuarios (La República, 2025) y más de 150.000 que invierten (sus vacantes, 2026).
export const HISTORICO = { registrados: 550_000, invirtieron: 150_000 };

export type Canal = "whatsapp" | "email" | "push" | "inapp";
export type TipoMensaje = "Recordatorio" | "Descubrimiento" | "Aprovecha la tasa";

export type Regla = { id: string; hizo: string; abren: number; canales: Canal[]; tipo: TipoMensaje; mensaje: string; campana: string };

export const REGLAS: Regla[] = [
  { id: "r1", hizo: "Simuló y no siguió en 24 h", abren: 0.05, canales: ["whatsapp", "email"], tipo: "Descubrimiento", mensaje: "Su simulación y las mejores tasas de hoy", campana: "solo-simulo" },
  { id: "r2", hizo: "Dejó sus datos a medias", abren: 0.14, canales: ["push", "email"], tipo: "Recordatorio", mensaje: "Sigue donde quedaste", campana: "datos" },
  { id: "r3", hizo: "Completó sus datos, pero no validó su identidad", abren: 0.29, canales: ["whatsapp", "inapp"], tipo: "Recordatorio", mensaje: "Solo falta un paso", campana: "validacion" },
  { id: "r4", hizo: "Aseguró su tasa, pero no firmó", abren: 0.46, canales: ["whatsapp", "push"], tipo: "Aprovecha la tasa", mensaje: "Tu tasa está asegurada", campana: "firma" },
  { id: "r5", hizo: "Firmó, pero no ha transferido", abren: 0.71, canales: ["whatsapp", "email"], tipo: "Recordatorio", mensaje: "Datos para transferir", campana: "transferencia" },
  { id: "r6", hizo: "Su tasa vence en 48 h y no ha transferido", abren: 0.62, canales: ["push", "whatsapp"], tipo: "Aprovecha la tasa", mensaje: "Tu tasa vence mañana", campana: "transferencia" },
  { id: "r7", hizo: "El banco que simuló subió su tasa", abren: 0.18, canales: ["inapp", "email"], tipo: "Aprovecha la tasa", mensaje: "Subió la tasa de tu banco", campana: "alerta-tasa" },
  { id: "r8", hizo: "Recibe su prima esta semana", abren: 0.09, canales: ["email", "whatsapp"], tipo: "Descubrimiento", mensaje: "Pon a rentar tu prima", campana: "prima" },
];

// Tasas simuladas de los bancos aliados (E.A., 12 meses).
export const BANCOS: Record<string, { tasa: number }> = {
  KOA: { tasa: 13.3 },
  Ban100: { tasa: 12.9 },
  Bancamía: { tasa: 12.6 },
  "Banco W": { tasa: 12.4 },
  Mibanco: { tasa: 12.8 },
  Coltefinanciera: { tasa: 12.2 },
  Credifamilia: { tasa: 12.5 },
  "Banco Mundo Mujer": { tasa: 12.1 },
};
