"use client";

import { ChevronRight } from "lucide-react";
import { miles, pct } from "@/lib/fechas";
import { CAMPANAS } from "@/lib/campanas";
import { HISTORICO, REGLAS, type TipoMensaje } from "@/lib/motor";
import { Canales, Encabezado } from "./piezas";

const TONO_TIPO: Record<TipoMensaje, string> = {
  Recordatorio: "bg-fondo-apagado text-texto-secundario",
  Descubrimiento: "bg-info-fondo text-info-texto",
  "Aprovecha la tasa": "bg-marca-fondo text-marca",
};

// Qué hicieron los que ya abrieron un CDT → probabilidad de que abra quien hace lo mismo → qué se le envía.
export function Reglas({ onCampana }: { onCampana: (id: string) => void }) {
  return (
    <div>
      <Encabezado
        titulo="Reglas"
        derecha={
          <span className="text-[13px] text-tenue">
            Del comportamiento de <span className="font-semibold text-texto">+{miles(HISTORICO.registrados)}</span> registrados y <span className="font-semibold text-texto">+{miles(HISTORICO.invirtieron)}</span> que ya invirtieron
          </span>
        }
      />

      <section className="overflow-hidden rounded-2xl border border-linea bg-fondo shadow-xs">
        <div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.4fr)_20px] gap-6 border-b border-linea px-6 py-3 text-[12.5px] font-semibold text-tenue md:grid">
          <span>Si el usuario</span>
          <span>Abren su CDT</span>
          <span>Acción</span>
          <span />
        </div>
        <ul>
          {REGLAS.map((r) => (
            <li key={r.id} className="border-b border-linea last:border-b-0">
              <button
                type="button"
                onClick={() => onCampana(r.campana)}
                className="group grid w-full items-center gap-x-6 gap-y-3 px-5 py-4 text-left outline-none transition-colors hover:bg-lienzo focus-visible:bg-lienzo sm:px-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.4fr)_20px]"
              >
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold leading-snug">{r.hizo}</span>
                  <span className="mt-0.5 block text-[12.5px] text-tenue">Campaña {CAMPANAS.find((j) => j.id === r.campana)!.nombre}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-fondo-apagado">
                    <span className="block h-full rounded-full bg-marca" style={{ width: `${r.abren * 100}%` }} />
                  </span>
                  <span className="w-11 text-right font-mono text-[14px] font-bold">{pct(r.abren, 0)}</span>
                </span>
                <span className="flex min-w-0 flex-col gap-2">
                  <Canales canales={r.canales} />
                  <span className="flex flex-wrap items-center gap-2 text-[13px]">
                    <span className={"rounded-full px-2.5 py-0.5 text-[12px] font-semibold " + TONO_TIPO[r.tipo]}>{r.tipo}</span>
                    <span className="text-texto-secundario">{r.mensaje}</span>
                  </span>
                </span>
                <ChevronRight className="hidden h-4 w-4 text-tenue opacity-0 transition-opacity group-hover:opacity-100 md:block" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
