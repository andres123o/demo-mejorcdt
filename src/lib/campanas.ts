// Campañas de activación como workflows de HubSpot. Cada evento inscribe a la persona en la campaña
// del paso del journey donde se quedó; sale apenas cumple el objetivo (el siguiente evento). Es la estructura: no envía nada.
import type { Canal, Etapa } from "./motor.ts";

export type PasoCampana =
  | { tipo: "espera"; dias: number }
  | { tipo: "mensaje"; canal: Canal; titulo: string; texto: string }
  | { tipo: "condicion"; pregunta: string; ramas: { nombre: string; pasos: PasoCampana[]; principal?: boolean }[] }
  | { tipo: "fin"; titulo: string };

export type Grupo = "Pasos del journey" | "Mercado";

export type Campana = {
  id: string;
  grupo: Grupo;
  nombre: string;
  posicion?: Etapa; // a quién inscribe, en las campañas de cada paso
  evento: string;
  disparador: string;
  meta: string;
  objetivo: string;
  logro: string; // cómo se dice que lo cumplieron: "1.130 empezaron su registro"
  pasos: PasoCampana[];
};

export const CAMPANAS: Campana[] = [
  {
    id: "solo-simulo",
    grupo: "Pasos del journey",
    nombre: "Solo simuló",
    posicion: "simulo",
    evento: "simulacion_creada",
    disparador: "Simuló y no siguió en 24 h",
    meta: "datos_personales_completados",
    objetivo: "Empieza su registro",
    logro: "empezaron su registro",
    pasos: [
      { tipo: "mensaje", canal: "whatsapp", titulo: "Tu simulación", texto: "Hola {{nombre}}, tus {{monto}} a {{plazo}} en {{banco}} rinden {{rendimiento}}. Sigue aquí: {{enlace}}" },
      { tipo: "espera", dias: 3 },
      {
        tipo: "condicion",
        pregunta: "¿Empezó el registro?",
        ramas: [
          { nombre: "Sí", pasos: [{ tipo: "fin", titulo: "Pasa a Datos a medias" }] },
          {
            nombre: "No",
            principal: true,
            pasos: [
              { tipo: "mensaje", canal: "email", titulo: "Las mejores tasas de hoy", texto: "Las 3 mejores tasas para {{monto}} a {{plazo}}, actualizadas hoy." },
              { tipo: "espera", dias: 4 },
              { tipo: "fin", titulo: "Queda en campañas de mercado" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "datos",
    grupo: "Pasos del journey",
    nombre: "Datos a medias",
    posicion: "datos",
    evento: "datos_personales_completados",
    disparador: "Dejó sus datos a medias hace 24 h",
    meta: "preguntas_banco_completadas",
    objetivo: "Completa sus datos",
    logro: "completaron sus datos",
    pasos: [
      { tipo: "mensaje", canal: "push", titulo: "Sigue donde quedaste", texto: "{{nombre}}, tus datos ya están guardados. Te faltan {{pasos_faltantes}} pasos." },
      { tipo: "espera", dias: 2 },
      {
        tipo: "condicion",
        pregunta: "¿Completó sus datos?",
        ramas: [
          { nombre: "Sí", pasos: [{ tipo: "fin", titulo: "Pasa a En validación" }] },
          {
            nombre: "No",
            principal: true,
            pasos: [
              { tipo: "mensaje", canal: "email", titulo: "Tu tasa te espera", texto: "{{banco}} sigue pagando {{tasa}} E.A. Termina en 3 minutos: {{enlace}}" },
              { tipo: "espera", dias: 3 },
              { tipo: "mensaje", canal: "push", titulo: "Te faltan 3 minutos", texto: "{{nombre}}, termina tus datos y asegura {{tasa}} E.A." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "validacion",
    grupo: "Pasos del journey",
    nombre: "En validación",
    posicion: "identidad",
    evento: "preguntas_banco_completadas",
    disparador: "Quedó en la validación hace 24 h",
    meta: "documentos_subidos",
    objetivo: "Valida su identidad y sube documentos",
    logro: "se validaron",
    pasos: [
      { tipo: "mensaje", canal: "whatsapp", titulo: "Solo falta un paso", texto: "{{nombre}}, solo falta {{pendiente}}. Te toma 2 minutos: {{enlace}}" },
      { tipo: "espera", dias: 2 },
      {
        tipo: "condicion",
        pregunta: "¿Subió lo que faltaba?",
        ramas: [
          { nombre: "Sí", pasos: [{ tipo: "fin", titulo: "Pasa a Sin firmar" }] },
          {
            nombre: "No",
            principal: true,
            pasos: [
              { tipo: "mensaje", canal: "inapp", titulo: "Así se valida", texto: "Las 3 razones más comunes por las que falla la validación y cómo resolverlas." },
              { tipo: "espera", dias: 2 },
              { tipo: "mensaje", canal: "whatsapp", titulo: "Tu CDT está casi listo", texto: "{{nombre}}, solo falta {{pendiente}} para abrir tu CDT en {{banco}}: {{enlace}}" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "firma",
    grupo: "Pasos del journey",
    nombre: "Sin firmar",
    posicion: "firma",
    evento: "tasa_asegurada",
    disparador: "Aseguró su tasa y no firmó en 24 h",
    meta: "documentos_firmados",
    objetivo: "Firma los documentos",
    logro: "firmaron",
    pasos: [
      { tipo: "mensaje", canal: "whatsapp", titulo: "Tu tasa está asegurada", texto: "{{nombre}}, tu tasa de {{tasa}} está asegurada hasta {{vence_tasa}}. Firma aquí: {{enlace}}" },
      { tipo: "espera", dias: 2 },
      {
        tipo: "condicion",
        pregunta: "¿Firmó?",
        ramas: [
          { nombre: "Sí", pasos: [{ tipo: "fin", titulo: "Pasa a Sin transferir" }] },
          {
            nombre: "No",
            principal: true,
            pasos: [
              { tipo: "mensaje", canal: "push", titulo: "Firma en 1 minuto", texto: "{{nombre}}, tu tasa de {{tasa}} sigue asegurada. Firma desde la app." },
              { tipo: "espera", dias: 1 },
              { tipo: "mensaje", canal: "whatsapp", titulo: "Tu tasa vence mañana", texto: "{{nombre}}, tu tasa de {{tasa}} vence mañana. Después puede cambiar: {{enlace}}" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "transferencia",
    grupo: "Pasos del journey",
    nombre: "Sin transferir",
    posicion: "transferencia",
    evento: "documentos_firmados",
    disparador: "Firmó y no transfirió en 24 h",
    meta: "cdt_completado",
    objetivo: "Abre su CDT",
    logro: "abrieron su CDT",
    pasos: [
      { tipo: "mensaje", canal: "whatsapp", titulo: "Datos para transferir", texto: "{{nombre}}, todo listo. Transfiere {{monto}} a {{cuenta_banco}} y sube el comprobante: {{enlace}}" },
      { tipo: "espera", dias: 1 },
      {
        tipo: "condicion",
        pregunta: "¿Transfirió?",
        ramas: [
          { nombre: "Sí", pasos: [{ tipo: "fin", titulo: "Sale al abrir su CDT" }] },
          {
            nombre: "No",
            principal: true,
            pasos: [
              { tipo: "mensaje", canal: "email", titulo: "Cómo transferir", texto: "La cuenta de {{banco}}, el monto exacto y cómo subir el comprobante en 3 pasos." },
              { tipo: "espera", dias: 1 },
              { tipo: "mensaje", canal: "push", titulo: "Tu tasa vence mañana", texto: "{{nombre}}, tu tasa de {{tasa}} vence mañana. Transfiere hoy y queda asegurada." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "alerta-tasa",
    grupo: "Mercado",
    nombre: "Alerta de tasa",
    evento: "tasa_actualizada",
    disparador: "El banco que simuló subió su tasa 0,25 puntos o más",
    meta: "simulacion_creada",
    objetivo: "Vuelve y simula de nuevo",
    logro: "simularon de nuevo",
    pasos: [
      { tipo: "mensaje", canal: "inapp", titulo: "Subió la tasa de tu banco", texto: "{{banco}} subió su tasa a {{tasa}} para {{plazo}}. Tus {{monto}} rinden {{rendimiento}}." },
      { tipo: "espera", dias: 2 },
      { tipo: "mensaje", canal: "email", titulo: "Aprovecha la tasa", texto: "{{banco}} paga hoy {{tasa}} E.A. Simula de nuevo en 1 minuto: {{enlace}}" },
      { tipo: "espera", dias: 3 },
      { tipo: "fin", titulo: "Sale" },
    ],
  },
  {
    id: "prima",
    grupo: "Mercado",
    nombre: "Prima de diciembre",
    evento: "calendario_prima",
    disparador: "Semana de pago de la prima, desde el 15 dic",
    meta: "cdt_completado",
    objetivo: "Abre su CDT",
    logro: "abrieron su CDT",
    pasos: [
      { tipo: "mensaje", canal: "email", titulo: "Pon a rentar tu prima", texto: "Una prima de {{monto}} a 6 meses rinde {{rendimiento}} hoy. Compara 11 bancos: {{enlace}}" },
      { tipo: "espera", dias: 2 },
      {
        tipo: "condicion",
        pregunta: "¿Simuló de nuevo?",
        ramas: [
          {
            nombre: "Sí",
            principal: true,
            pasos: [{ tipo: "mensaje", canal: "whatsapp", titulo: "Tu simulación", texto: "{{nombre}}, tu prima de {{monto}} rinde {{rendimiento}} en {{banco}}. Ábrelo aquí: {{enlace}}" }],
          },
          { nombre: "No", pasos: [{ tipo: "fin", titulo: "Sale" }] },
        ],
      },
    ],
  },
];

export const campanaDePaso = (p: Etapa) => CAMPANAS.find((j) => j.posicion === p) ?? null;

type Mensaje = Extract<PasoCampana, { tipo: "mensaje" }>;

// Mensajes del camino principal con su día dentro de la campaña.
export function linea(pasos: PasoCampana[], dia = 0): { paso: Mensaje; dia: number }[] {
  const out: { paso: Mensaje; dia: number }[] = [];
  for (const p of pasos) {
    if (p.tipo === "espera") dia += p.dias;
    else if (p.tipo === "condicion") {
      const rama = p.ramas.find((r) => r.principal) ?? p.ramas[0];
      const sub = linea(rama.pasos, dia);
      out.push(...sub);
      dia = sub.at(-1)?.dia ?? dia;
    } else if (p.tipo === "mensaje") out.push({ paso: p, dia });
  }
  return out;
}

// Dónde va alguien que lleva `dias` días en la campaña.
export function avance(j: Campana, dias: number) {
  const pasos = linea(j.pasos);
  const hechos = pasos.filter((p) => p.dia <= dias);
  const siguiente = pasos.find((p) => p.dia > dias) ?? null;
  return { pasos, hechos, siguiente, total: pasos.length };
}

export const diasDe = (j: Campana) => new Map(linea(j.pasos).map((p) => [p.paso as PasoCampana, p.dia]));
