// Muestra de los registrados de esta semana (ficticios) y en qué paso del journey y en qué campaña va cada uno.
import { DIA, diaSuave, pesos } from "./fechas.ts";
import { avance, campanaDePaso, CAMPANAS, type Campana, type PasoCampana } from "./campanas.ts";
import { BANCOS, EVENTOS, REGLAS, nombrePosicion, posicionDe, type Canal, type Etapa, type Regla } from "./motor.ts";

export type Fuente = "Referido" | "Google" | "Contenido" | "Influencer" | "Pauta en Meta";

type Base = {
  id: string;
  nombre: string;
  monto: number;
  plazo: number; // meses
  banco: string;
  fuente: Fuente;
  canal: "App" | "Web";
  simulaciones: number;
  ultimo: number; // índice del último evento
  horas: number; // horas desde el último evento
  mercado?: string; // campaña de mercado en la que está
  tras?: string; // campaña que lo llevó a abrir
};

const M = 1_000_000;

// prettier-ignore
const BASE: Base[] = [
  { id: "u01", nombre: "Laura Gómez", monto: 30 * M, plazo: 12, banco: "KOA", fuente: "Google", canal: "App", simulaciones: 2, ultimo: 8, horas: 26 },
  { id: "u02", nombre: "Andrés Rincón", monto: 8 * M, plazo: 6, banco: "Ban100", fuente: "Referido", canal: "App", simulaciones: 1, ultimo: 8, horas: 50 },
  { id: "u03", nombre: "Paula Herrera", monto: 60 * M, plazo: 12, banco: "Mibanco", fuente: "Contenido", canal: "Web", simulaciones: 3, ultimo: 6, horas: 30 },
  { id: "u04", nombre: "Juan Camilo Ortiz", monto: 12 * M, plazo: 12, banco: "KOA", fuente: "Google", canal: "Web", simulaciones: 1, ultimo: 7, horas: 20 },
  { id: "u05", nombre: "Valentina Ruiz", monto: 4 * M, plazo: 6, banco: "Bancamía", fuente: "Influencer", canal: "App", simulaciones: 1, ultimo: 4, horas: 40 },
  { id: "u06", nombre: "Sebastián Mora", monto: 2.5 * M, plazo: 3, banco: "Banco W", fuente: "Pauta en Meta", canal: "Web", simulaciones: 1, ultimo: 3, horas: 100 },
  { id: "u07", nombre: "Natalia Castro", monto: 15 * M, plazo: 12, banco: "Credifamilia", fuente: "Google", canal: "App", simulaciones: 2, ultimo: 5, horas: 70 },
  { id: "u08", nombre: "Felipe Arango", monto: 1.5 * M, plazo: 6, banco: "Coltefinanciera", fuente: "Influencer", canal: "App", simulaciones: 1, ultimo: 1, horas: 30 },
  { id: "u09", nombre: "Daniela Pineda", monto: 6 * M, plazo: 12, banco: "KOA", fuente: "Contenido", canal: "Web", simulaciones: 2, ultimo: 2, horas: 122 },
  { id: "u10", nombre: "Mateo Vargas", monto: 0.8 * M, plazo: 3, banco: "Banco Mundo Mujer", fuente: "Pauta en Meta", canal: "Web", simulaciones: 1, ultimo: 1, horas: 140 },
  { id: "u11", nombre: "Carolina Díaz", monto: 25 * M, plazo: 12, banco: "Ban100", fuente: "Referido", canal: "App", simulaciones: 2, ultimo: 2, horas: 20 },
  { id: "u12", nombre: "Santiago López", monto: 3 * M, plazo: 6, banco: "KOA", fuente: "Google", canal: "Web", simulaciones: 1, ultimo: 0, horas: 30 },
  { id: "u13", nombre: "Mariana Torres", monto: 0.5 * M, plazo: 3, banco: "Bancamía", fuente: "Pauta en Meta", canal: "Web", simulaciones: 1, ultimo: 0, horas: 130 },
  { id: "u14", nombre: "Camilo Restrepo", monto: 10 * M, plazo: 12, banco: "Ban100", fuente: "Influencer", canal: "App", simulaciones: 1, ultimo: 0, horas: 150 },
  { id: "u15", nombre: "Isabela Quintero", monto: 2 * M, plazo: 6, banco: "KOA", fuente: "Contenido", canal: "Web", simulaciones: 1, ultimo: 0, horas: 100 },
  { id: "u16", nombre: "Julián Cárdenas", monto: 45 * M, plazo: 12, banco: "Mibanco", fuente: "Google", canal: "Web", simulaciones: 1, ultimo: 0, horas: 74 },
  { id: "u17", nombre: "Alejandra Muñoz", monto: 7 * M, plazo: 6, banco: "Credifamilia", fuente: "Google", canal: "App", simulaciones: 1, ultimo: 0, horas: 120 },
  { id: "u18", nombre: "Diego Salazar", monto: 1 * M, plazo: 3, banco: "Banco W", fuente: "Pauta en Meta", canal: "Web", simulaciones: 1, ultimo: 0, horas: 10 },
  { id: "u19", nombre: "Manuela Ospina", monto: 18 * M, plazo: 12, banco: "KOA", fuente: "Referido", canal: "App", simulaciones: 2, ultimo: 10, horas: 30, tras: "transferencia" },
  { id: "u20", nombre: "Ricardo Peña", monto: 5 * M, plazo: 6, banco: "Ban100", fuente: "Google", canal: "App", simulaciones: 1, ultimo: 10, horas: 75, tras: "validacion" },
  { id: "u21", nombre: "Lucía Montoya", monto: 9 * M, plazo: 12, banco: "Mibanco", fuente: "Contenido", canal: "Web", simulaciones: 2, ultimo: 10, horas: 122, tras: "datos" },
  { id: "u22", nombre: "Tomás Giraldo", monto: 20 * M, plazo: 12, banco: "KOA", fuente: "Google", canal: "App", simulaciones: 1, ultimo: 10, horas: 10, tras: "transferencia" },
  { id: "u23", nombre: "Sara Jaramillo", monto: 6 * M, plazo: 6, banco: "Coltefinanciera", fuente: "Influencer", canal: "Web", simulaciones: 1, ultimo: 8, horas: 74 },
  { id: "u24", nombre: "Esteban Cruz", monto: 3 * M, plazo: 6, banco: "Bancamía", fuente: "Google", canal: "Web", simulaciones: 1, ultimo: 2, horas: 50 },
  { id: "u25", nombre: "Gabriela León", monto: 4 * M, plazo: 12, banco: "Banco W", fuente: "Pauta en Meta", canal: "App", simulaciones: 1, ultimo: 4, horas: 52 },
  { id: "u26", nombre: "Nicolás Ramírez", monto: 2 * M, plazo: 6, banco: "Credifamilia", fuente: "Influencer", canal: "App", simulaciones: 1, ultimo: 1, horas: 146 },
  { id: "u27", nombre: "Juliana Ríos", monto: 35 * M, plazo: 12, banco: "Ban100", fuente: "Contenido", canal: "App", simulaciones: 1, ultimo: 7, horas: 55 },
  { id: "u28", nombre: "Kevin Patiño", monto: 1.2 * M, plazo: 3, banco: "Banco Mundo Mujer", fuente: "Influencer", canal: "App", simulaciones: 1, ultimo: 4, horas: 84 },
  { id: "u29", nombre: "Verónica Silva", monto: 11 * M, plazo: 12, banco: "KOA", fuente: "Referido", canal: "Web", simulaciones: 2, ultimo: 0, horas: 26 },
  { id: "u30", nombre: "Andrea Becerra", monto: 22 * M, plazo: 6, banco: "Mibanco", fuente: "Google", canal: "App", simulaciones: 2, ultimo: 10, horas: 120, tras: "firma" },
];

// ── Lo que el motor calcula ───────────────────────────────────────────

export type Hito =
  | { tipo: "evento"; t: number; evento: string; nombre: string }
  | { tipo: "mensaje"; t: number; canal: Canal; titulo: string; texto: string; campana: string }
  | { tipo: "inscripcion"; t: number; campana: string };

export type Persona = Base & {
  posicion: Etapa;
  ultimoEn: number;
  campana: Campana | null; // null solo si ya abrió su CDT
  paso: { hechos: number; total: number } | null;
  siguiente: { texto: string; canal: Canal; t: number } | null;
  hitos: Hito[];
  venceTasa: number | null;
  regla: Regla | null;
};

// Minutos entre un paso y el siguiente del flujo: varía para que la línea de tiempo se vea real.
const pausa = (i: number) => (6 + ((i * 13) % 17)) * 60_000;

export function calcular(b: Base, ahora: number): Persona {
  const posicion = posicionDe(b.ultimo);
  const ultimoEn = ahora - b.horas * 3_600_000;
  const tiempos: number[] = [];
  for (let i = b.ultimo, t = ultimoEn; i >= 0; i--) {
    tiempos[i] = t;
    t -= pausa(i);
  }
  const hitos: Hito[] = tiempos.map((t, i) => ({ tipo: "evento", t, evento: EVENTOS[i].id, nombre: EVENTOS[i].nombre }));

  const tasaIdx = EVENTOS.findIndex((e) => e.id === "tasa_asegurada");
  const venceTasa = b.ultimo >= tasaIdx && posicion !== "abierto" ? tiempos[tasaIdx] + 5 * DIA : null;

  // Todos los que no han abierto están en una campaña: la del paso donde se quedaron o una de mercado.
  const campana = posicion === "abierto" ? null : b.mercado ? CAMPANAS.find((j) => j.id === b.mercado)! : campanaDePaso(posicion);
  // Entra 24 h después de quedarse quieto; a los de mercado los inscribe el evento de mercado.
  const entrada = campana ? (b.mercado ? ahora - 2 * DIA - 3 * 3_600_000 : ultimoEn + DIA) : null;

  let paso: Persona["paso"] = null;
  let siguiente: Persona["siguiente"] = null;
  if (campana && entrada !== null) {
    const dias = entrada > ahora ? -1 : Math.floor((ahora - entrada) / DIA);
    const a = avance(campana, dias);
    paso = { hechos: a.hechos.length, total: a.total };
    if (entrada <= ahora) hitos.push({ tipo: "inscripcion", t: entrada, campana: campana.nombre });
    for (const h of a.hechos)
      hitos.push({ tipo: "mensaje", t: entrada + h.dia * DIA + 15 * 60_000, canal: h.paso.canal, titulo: h.paso.titulo, texto: llenar(h.paso.texto, b, venceTasa, ahora), campana: campana.nombre });
    if (a.siguiente) siguiente = { texto: a.siguiente.paso.titulo, canal: a.siguiente.paso.canal, t: entrada + a.siguiente.dia * DIA + 15 * 60_000 };
  }
  hitos.sort((x, y) => x.t - y.t);

  const urgeTasa = posicion === "transferencia" && venceTasa !== null && venceTasa - ahora < 2 * DIA;
  const regla = campana ? (urgeTasa ? REGLAS.find((r) => r.id === "r6")! : REGLAS.find((r) => r.campana === campana.id) ?? null) : null;

  return { ...b, posicion, ultimoEn, campana, paso, siguiente, hitos, venceTasa, regla };
}

// "el domingo", "mañana", "hoy", "el 3 nov".
const conArticulo = (d: string) => (["Hoy", "Mañana", "Ayer"].includes(d) ? d.toLowerCase() : `el ${d.toLowerCase()}`);

// Reemplaza las {{variables}} con los datos de la persona, como lo haría la plantilla del mensaje.
export function llenar(texto: string, b: Base, venceTasa: number | null, ahora: number) {
  const tasa = BANCOS[b.banco]?.tasa ?? 12.5;
  const rinde = Math.round((b.monto * (tasa / 100) * (b.plazo / 12)) / 1000) * 1000;
  const v: Record<string, string> = {
    nombre: b.nombre.split(" ")[0],
    monto: pesos(b.monto),
    plazo: `${b.plazo} meses`,
    banco: b.banco,
    tasa: `${tasa.toLocaleString("es-CO")} %`,
    rendimiento: pesos(rinde),
    enlace: "mejorcdt.com/continuar",
    pasos_faltantes: "3",
    pendiente: "la foto de tu cédula",
    vence_tasa: venceTasa ? conArticulo(diaSuave(venceTasa, ahora)) : "el viernes",
    cuenta_banco: `la cuenta de ${b.banco}`,
  };
  return texto.replace(/\{\{(\w+)\}\}/g, (_, k) => v[k] ?? k);
}

export const personas = (ahora: number) => BASE.map((b) => calcular(b, ahora));

export const estaEn = (j: Campana, p: Persona) => p.campana?.id === j.id;

export { nombrePosicion, type PasoCampana };
