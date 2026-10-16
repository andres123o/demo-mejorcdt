"use client";

// Los eventos que se rastrean: cada paso del flujo envía uno a HubSpot y ese evento mueve a la persona entre campañas.
import { ETAPAS, EVENTOS } from "@/lib/motor";
import { Codigo, Encabezado } from "./piezas";

export function Eventos() {
  return (
    <div>
      <Encabezado titulo="Eventos" derecha={<span className="text-[13px] text-tenue">{EVENTOS.length} eventos</span>} />

      <section className="overflow-hidden rounded-2xl border border-linea bg-fondo shadow-xs">
        <div className="hidden grid-cols-[minmax(0,1.3fr)_140px_minmax(0,1fr)] gap-6 border-b border-linea px-6 py-3 text-[12.5px] font-semibold text-tenue sm:grid">
          <span>Evento</span>
          <span>Etapa</span>
          <span>Propiedades</span>
        </div>
        <ul>
          {EVENTOS.map((e) => (
            <li key={e.id} className="grid gap-x-6 gap-y-1.5 border-b border-linea px-5 py-3 last:border-b-0 sm:grid-cols-[minmax(0,1.3fr)_140px_minmax(0,1fr)] sm:items-center sm:px-6">
              <span className="min-w-0">
                <span className="block truncate font-mono text-[13px] font-semibold">{e.id}</span>
                <span className="block text-[12.5px] text-tenue">{e.nombre}</span>
              </span>
              <span className="text-[13px] font-semibold">{ETAPAS.find((x) => x.id === e.etapa)!.nombre}</span>
              <span className="flex flex-wrap gap-1">
                {e.props.length ? e.props.map((p) => <Codigo key={p}>{p}</Codigo>) : <span className="text-[12.5px] text-tenue">Ninguna</span>}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
