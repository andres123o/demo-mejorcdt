export type Vista = "propuestas" | "correo" | "resumen" | "usuarios" | "campanas" | "reglas" | "eventos" | "medicion";

// Arriba solo van tres pestañas. Las vistas del motor se eligen dentro de su propuesta, en una sub-barra.
export type Grupo = { nombre: string; vistas: [Vista, string][] };

export const GRUPOS: Grupo[] = [
  { nombre: "Inicio", vistas: [["propuestas", "Inicio"]] },
  { nombre: "Correos", vistas: [["correo", "Correo"]] },
  {
    nombre: "Activación",
    vistas: [
      ["resumen", "Resumen"],
      ["usuarios", "Usuarios"],
      ["campanas", "Campañas"],
      ["reglas", "Reglas"],
      ["eventos", "Eventos"],
      ["medicion", "Medición"],
    ],
  },
];

export const VISTAS: [Vista, string][] = GRUPOS.flatMap((g) => g.vistas);

export const grupoDe = (v: Vista) => GRUPOS.find((g) => g.vistas.some(([k]) => k === v)) ?? GRUPOS[0];
