"use client";

import { useState, type ReactNode } from "react";
import { ArrowRight, Check, ChevronRight, Clock } from "lucide-react";
import { miles, pct } from "@/lib/fechas";
import { CAMPANAS, campanaDePaso } from "@/lib/campanas";
import { ABIERTOS, CAMPANAS_SEMANA, JOURNEY_USUARIO, REGISTRADOS, TENDENCIA } from "@/lib/medicion";
import { ETAPAS } from "@/lib/motor";
import { Tarjeta } from "./piezas";
import type { Vista } from "./Panel";

const variacion = (a: number, b: number) => `${a >= b ? "+" : "−"}${pct(Math.abs(a / b - 1))}`;
const puntos = (a: number, b: number) => `${a >= b ? "+" : "−"}${(Math.abs(a - b) * 100).toLocaleString("es-CO", { maximumFractionDigits: 1 })} pts`;

export function Resumen({ onIr, onCampana }: { onIr: (v: Vista) => void; onCampana: (id: string) => void }) {
  const [conv, convAntes] = TENDENCIA.conversion.slice(-2).reverse();
  const [dias, diasAntes] = TENDENCIA.dias.slice(-2).reverse();
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Cifra titulo="Registrados" n={miles(REGISTRADOS.semana)} serie={TENDENCIA.registrados} cambio={variacion(REGISTRADOS.semana, REGISTRADOS.semanaAnterior)} />
        <Cifra titulo="CDT abiertos" n={miles(ABIERTOS.d7)} serie={TENDENCIA.abiertos} cambio={variacion(ABIERTOS.d7, ABIERTOS.d7Anterior)} />
        <Cifra titulo="Conversión a 14 días" n={pct(conv)} serie={TENDENCIA.conversion} cambio={puntos(conv, convAntes)} />
        <Cifra
          titulo="Días hasta el primer CDT"
          n={dias.toLocaleString("es-CO")}
          serie={TENDENCIA.dias}
          baja
          cambio={`${dias <= diasAntes ? "−" : "+"}${Math.abs(dias - diasAntes).toLocaleString("es-CO", { maximumFractionDigits: 1 })} días`}
        />
      </div>

      <Tarjeta titulo="Journey del usuario" derecha={<span className="text-[12.5px] font-semibold text-tenue">Registrados de esta semana</span>}>
        <JourneyUsuario onCampana={onCampana} />
      </Tarjeta>

      <Tarjeta
        titulo="Campañas"
        derecha={
          <button type="button" onClick={() => onIr("campanas")} className="flex items-center gap-0.5 text-[13px] font-semibold text-marca">
            Ver todas <ChevronRight className="h-4 w-4" />
          </button>
        }
      >
        <ul className="grid gap-x-10 lg:grid-cols-2">
          {CAMPANAS.map((c) => {
            const m = CAMPANAS_SEMANA[c.id];
            return (
              <li key={c.id} className="border-t border-linea first:border-t-0 lg:[&:nth-child(2)]:border-t-0">
                <button type="button" onClick={() => onCampana(c.id)} className="flex w-full items-center justify-between gap-4 py-3 text-left outline-none">
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-semibold">{c.nombre}</span>
                    <span className="block text-[12.5px] text-tenue">{m ? `${miles(m.inscritos)} inscritos esta semana` : "Programada: 15 dic"}</span>
                  </span>
                  {m && (
                    <span className="shrink-0 text-right">
                      <span className="block text-[14px] font-semibold">
                        <span className="font-mono">{pct(m.objetivo / m.inscritos, 0)}</span> <span className="text-[12px] font-medium text-tenue">conversión</span>
                      </span>
                      <span className="block text-[12px] text-tenue">
                        {miles(m.objetivo)} {c.logro}
                      </span>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </Tarjeta>
    </div>
  );
}

function Cifra({ titulo, n, serie, baja, cambio }: { titulo: string; n: string; serie: number[]; baja?: boolean; cambio: ReactNode }) {
  return (
    <section className="flex flex-col rounded-2xl border border-linea bg-fondo p-5 shadow-xs">
      <h2 className="text-[13.5px] font-semibold text-tenue">{titulo}</h2>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-[30px] font-bold leading-none tracking-[-0.03em]">{n}</p>
        <Tendencia serie={serie} baja={baja} />
      </div>
      <p className="mt-3 text-[12.5px] text-tenue">
        Esta semana · <span className="font-semibold text-exito-texto">{cambio}</span> frente a la anterior
      </p>
    </section>
  );
}

// Línea de 8 semanas, sin ejes: solo la dirección. `baja` = bajar es bueno.
function Tendencia({ serie, baja }: { serie: number[]; baja?: boolean }) {
  const min = Math.min(...serie);
  const max = Math.max(...serie);
  const p = serie.map((v, i) => `${(i / (serie.length - 1)) * 76 + 2},${26 - ((baja ? max - v : v - min) / (max - min || 1)) * 22}`);
  const [x, y] = p.at(-1)!.split(",");
  return (
    <svg viewBox="0 0 80 30" className="h-[30px] w-[80px] shrink-0" aria-hidden>
      <polyline points={p.join(" ")} fill="none" stroke="var(--marca)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
      <circle cx={x} cy={y} r={2.75} fill="var(--marca)" stroke="var(--fondo)" strokeWidth={1.5} />
    </svg>
  );
}

// ── Journey del usuario ───────────────────────────────────────────────
// Embudo por pasos, al estilo de Amplitude: la barra sólida son los que llegaron; el tramo rayado,
// los que se quedaron en el paso anterior. Entre pasos, la conversión y el tiempo. Debajo, la campaña
// que trabaja a los que se quedaron en cada paso.

const ALTO = 200;

function JourneyUsuario({ onCampana }: { onCampana: (id: string) => void }) {
  const [sobre, setSobre] = useState<number | null>(null);
  const total = JOURNEY_USUARIO[0].llegaron;
  const columnas = "grid-cols-6 gap-3 sm:gap-4";
  const tenue = (i: number) => (sobre === null || sobre === i ? "opacity-100" : "opacity-40");

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]" onMouseLeave={() => setSobre(null)}>
      <div className="min-w-[780px]">
        {/* Pasos */}
        <div className={`grid ${columnas}`}>
          {JOURNEY_USUARIO.map((p, i) => (
            <div key={p.etapa} className={"flex items-center gap-2 transition-opacity " + tenue(i)} onMouseEnter={() => setSobre(i)}>
              <span className={"flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold " + (p.etapa === "abierto" ? "bg-exito text-white" : "bg-marca-suave text-marca")}>
                {p.etapa === "abierto" ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
              </span>
              <span className="truncate text-[13px] font-semibold">{ETAPAS[i].nombre}</span>
            </div>
          ))}
        </div>

        {/* Barras */}
        <div className="relative mt-4">
          {[0.25, 0.5, 0.75, 1].map((g) => (
            <span key={g} className="pointer-events-none absolute inset-x-0 border-t border-dashed border-linea" style={{ bottom: g * ALTO }} />
          ))}
          <div className={`relative grid ${columnas} border-b border-borde`}>
            {JOURNEY_USUARIO.map((p, i) => {
              const antes = i > 0 ? JOURNEY_USUARIO[i - 1].llegaron : p.llegaron;
              const final = p.etapa === "abierto";
              return (
                <div key={p.etapa} className={"flex flex-col justify-end transition-opacity " + tenue(i)} style={{ height: ALTO + 44 }} onMouseEnter={() => setSobre(i)}>
                  <div className="mb-2">
                    <span className="block text-[17px] font-bold leading-tight tracking-[-0.01em]">{pct(p.llegaron / total, 0)}</span>
                    <span className="block font-mono text-[11.5px] text-tenue">{miles(p.llegaron)}</span>
                  </div>
                  {i > 0 && (
                    <span
                      className="rounded-t-[4px]"
                      style={{ height: ((antes - p.llegaron) / total) * ALTO, background: "repeating-linear-gradient(135deg, var(--marca-suave) 0 4px, transparent 4px 8px)" }}
                    />
                  )}
                  <span className={i === 0 ? "rounded-t-[4px]" : ""} style={{ height: (p.llegaron / total) * ALTO, background: final ? "var(--exito)" : "var(--marca)" }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversión y tiempo entre pasos */}
        <div className={`mt-3 grid ${columnas}`}>
          {JOURNEY_USUARIO.map((p, i) => (
            <div key={p.etapa} className={"text-[12px] transition-opacity " + tenue(i)} onMouseEnter={() => setSobre(i)}>
              {i === 0 ? (
                <span className="text-tenue">Inicio</span>
              ) : (
                <>
                  <span className="flex items-center gap-1 font-semibold">
                    <ArrowRight className="h-3 w-3 text-tenue" />
                    {pct(p.llegaron / JOURNEY_USUARIO[i - 1].llegaron, 0)} pasan
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-tenue">
                    <Clock className="h-3 w-3" />
                    {p.tiempo}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Campaña de cada paso */}
        <div className={`mt-4 grid ${columnas}`}>
          {JOURNEY_USUARIO.map((p, i) => {
            const sig = JOURNEY_USUARIO[i + 1];
            const c = campanaDePaso(p.etapa);
            const m = c ? CAMPANAS_SEMANA[c.id] : null;
            if (!sig || !c || !m)
              return (
                <div key={p.etapa} className={"flex flex-col justify-center rounded-xl bg-exito-fondo p-3 transition-opacity " + tenue(i)} onMouseEnter={() => setSobre(i)}>
                  <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-exito-texto">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.6} /> Meta
                  </span>
                  <span className="mt-1 text-[12px] text-exito-texto/80">Primer CDT abierto</span>
                </div>
              );
            return (
              <button
                key={p.etapa}
                type="button"
                onClick={() => onCampana(c.id)}
                onMouseEnter={() => setSobre(i)}
                onFocus={() => setSobre(i)}
                className={"group rounded-xl border border-linea p-3 text-left outline-none transition-all hover:border-marca/40 hover:bg-marca-fondo focus-visible:shadow-[var(--anillo-foco)] " + tenue(i)}
              >
                <span className="block text-[11.5px] text-tenue">Se quedaron</span>
                <span className="block font-mono text-[14px] font-bold">{miles(p.llegaron - sig.llegaron)}</span>
                <span className="mt-2 flex items-center justify-between gap-1 border-t border-linea pt-2 text-[12px] font-semibold text-marca">
                  <span className="truncate">{c.nombre}</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                <span className="block text-[11.5px] text-tenue">{pct(m.objetivo / m.inscritos, 0)} conversión</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
