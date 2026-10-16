"use client";

import { useState } from "react";
import { type Persona } from "@/lib/datos";
import { cuando, miles, pesos, quieto } from "@/lib/fechas";
import { ABIERTOS, CAMPANAS_SEMANA, REGISTRADOS } from "@/lib/medicion";
import { CAMPANAS } from "@/lib/campanas";
import { ETAPAS, nombrePaso } from "@/lib/motor";
import { ChipAbierto, Encabezado, IconoCanal, NOMBRE_CANAL, Progreso, VerMas } from "./piezas";

// "todos", el id de una campaña, o "abierto".
type Filtro = string;

const orden = (p: Persona) => (p.campana ? CAMPANAS.findIndex((j) => j.id === p.campana!.id) : CAMPANAS.length);

export function Usuarios({ lista, ahora, onAbrir }: { lista: Persona[]; ahora: number; onAbrir: (id: string) => void }) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const pasa = (p: Persona, f: Filtro) => f === "todos" || (f === "abierto" ? !p.campana : p.campana?.id === f);
  // Los contadores son los totales de la semana; la lista es una muestra.
  const total = (f: Filtro) => (f === "todos" ? REGISTRADOS.semana : f === "abierto" ? ABIERTOS.d7 : (CAMPANAS_SEMANA[f]?.inscritos ?? 0));
  const filas = lista.filter((p) => pasa(p, filtro)).sort((a, b) => orden(a) - orden(b) || a.horas - b.horas);
  const opciones: [Filtro, string][] = [["todos", "Todos"], ...CAMPANAS.filter((j) => j.grupo === "Pasos del journey").map((j): [Filtro, string] => [j.id, j.nombre]), ["abierto", "CDT abierto"]];

  return (
    <div>
      <Encabezado titulo="Usuarios" derecha={<span className="text-[13px] text-tenue">Registrados de esta semana</span>} />

      <div role="tablist" className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {opciones.map(([k, t]) => (
          <button
            key={k}
            role="tab"
            type="button"
            aria-selected={filtro === k}
            onClick={() => setFiltro(k)}
            className={
              "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold outline-none transition-colors focus-visible:shadow-[var(--anillo-foco)] " +
              (filtro === k ? "border-marca bg-marca text-white" : "border-linea bg-fondo text-texto-secundario hover:text-texto")
            }
          >
            {t}
            <span className={"font-mono text-[12px] " + (filtro === k ? "text-white/75" : "text-tenue")}>{miles(total(k))}</span>
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-linea bg-fondo shadow-xs">
        <div className="hidden grid-cols-[minmax(0,1.3fr)_150px_80px_minmax(0,1fr)_minmax(0,1.1fr)] gap-5 border-b border-linea px-6 py-3 text-[12.5px] font-semibold text-tenue lg:grid">
          <span>Usuario</span>
          <span>Paso del journey</span>
          <span>Inactivo</span>
          <span>Campaña</span>
          <span>Próximo envío</span>
        </div>
        <ul>
          {filas.map((p) => (
            <li key={p.id} className="border-b border-linea last:border-b-0">
              <button
                type="button"
                onClick={() => onAbrir(p.id)}
                className="grid w-full grid-cols-2 items-center gap-x-5 gap-y-2.5 px-5 py-3.5 text-left outline-none transition-colors hover:bg-lienzo focus-visible:bg-lienzo sm:px-6 lg:grid-cols-[minmax(0,1.3fr)_150px_80px_minmax(0,1fr)_minmax(0,1.1fr)]"
              >
                <span className="col-span-2 min-w-0 lg:col-span-1">
                  <span className="block truncate text-[14px] font-semibold">{p.nombre}</span>
                  <span className="block truncate text-[12.5px] text-tenue">
                    {pesos(p.monto)} · {p.banco}
                  </span>
                </span>
                <Avance p={p} />
                <span className="text-[13px] font-semibold">{p.campana ? quieto(p.ultimoEn, ahora) : "—"}</span>
                <EnCampana p={p} />
                <Envio p={p} ahora={ahora} />
              </button>
            </li>
          ))}
        </ul>
        <VerMas mostrando={filas.length} total={total(filtro)} />
      </section>
    </div>
  );
}

// Seis tramos, uno por etapa: hasta dónde llegó.
function Avance({ p }: { p: Persona }) {
  const hasta = ETAPAS.findIndex((e) => e.id === p.posicion) + 1;
  const abierto = p.posicion === "abierto";
  return (
    <span className="flex flex-col gap-1.5">
      <span className="flex gap-[3px]" aria-hidden>
        {ETAPAS.map((e, i) => (
          <span key={e.id} className={"h-1.5 w-5 rounded-full " + (i < hasta ? (abierto ? "bg-exito" : "bg-marca") : "bg-marca-suave")} />
        ))}
      </span>
      <span className="text-[12px] text-tenue">{nombrePaso(p.posicion)}</span>
    </span>
  );
}

// Nombre de la campaña y en qué mensaje va.
export function EnCampana({ p }: { p: Persona }) {
  if (!p.campana || !p.paso) return <span className="min-w-0"><ChipAbierto /></span>;
  const { hechos, total } = p.paso;
  return (
    <span className="flex min-w-0 flex-col gap-1.5">
      <span className="truncate text-[14px] font-semibold">{p.campana.nombre}</span>
      <span className="flex items-center gap-2">
        <Progreso hechos={Math.min(hechos + (p.siguiente ? 1 : 0), total)} total={total} />
        <span className="text-[12px] text-tenue">{p.siguiente ? `Mensaje ${hechos + 1} de ${total}` : "Mensajes enviados"}</span>
      </span>
    </span>
  );
}

// El siguiente mensaje: canal y cuándo sale.
export function Envio({ p, ahora }: { p: Persona; ahora: number }) {
  if (!p.siguiente) return <span className="text-[13px] text-tenue">—</span>;
  return (
    <span className="flex min-w-0 items-center gap-2 text-[13px]" title={p.siguiente.texto}>
      <IconoCanal canal={p.siguiente.canal} tamano={22} />
      <span className="min-w-0 truncate">
        <span className="font-semibold">{NOMBRE_CANAL[p.siguiente.canal]}</span>
        <span className="text-tenue"> · {cuando(p.siguiente.t, ahora)}</span>
      </span>
    </span>
  );
}
