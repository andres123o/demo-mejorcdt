"use client";

import { useState } from "react";
import { miles, pct } from "@/lib/fechas";
import { CAMPANAS } from "@/lib/campanas";
import { ABIERTOS, CAMPANAS_SEMANA, DIAS_PRIMER_CDT, MEDIANA_DIAS, POR_FUENTE, REGISTRADOS, SEMANAS } from "@/lib/medicion";
import { Encabezado, Tarjeta } from "./piezas";

const Periodo = ({ children }: { children: string }) => <span className="text-[12.5px] font-semibold text-tenue">{children}</span>;

export function Medicion() {
  return (
    <div className="flex flex-col gap-5">
      <Encabezado titulo="Medición" />
      <section className="grid grid-cols-3 divide-x divide-linea rounded-2xl border border-linea bg-fondo shadow-xs">
        {[
          ["Registrados", miles(REGISTRADOS.semana)],
          ["CDT abiertos", miles(ABIERTOS.d7)],
          ["Conversión", pct(ABIERTOS.d7 / REGISTRADOS.semana)],
        ].map(([k, v]) => (
          <div key={k} className="px-4 py-4 sm:px-6 sm:py-5">
            <p className="text-[13px] font-semibold text-tenue">{k} · esta semana</p>
            <p className="mt-2 text-[26px] font-bold leading-none tracking-[-0.03em] sm:text-[30px]">{v}</p>
          </div>
        ))}
      </section>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Tarjeta titulo="Activación por semana" derecha={<Periodo>% que abre su CDT en 14 días</Periodo>}>
          <Linea />
        </Tarjeta>
        <Tarjeta titulo="Días hasta el primer CDT" derecha={<Periodo>CDT de esta semana</Periodo>}>
          <Dias />
        </Tarjeta>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Tarjeta titulo="Por campaña" derecha={<Periodo>Conversión al siguiente paso · esta semana</Periodo>}>
          <PorCampana />
        </Tarjeta>
        <Tarjeta titulo="Por fuente" derecha={<Periodo>CDT abiertos · esta semana</Periodo>}>
          <PorFuente />
        </Tarjeta>
      </div>
    </div>
  );
}

// Una sola serie: línea de 2 px con puntos, cruz y detalle al pasar el cursor.
function Linea() {
  const [sobre, setSobre] = useState<number | null>(null);
  const min = 0.12;
  const max = 0.2;
  const x = (i: number) => (i / (SEMANAS.length - 1)) * 100;
  const y = (v: number) => (1 - (v - min) / (max - min)) * 100;
  const ultima = SEMANAS.at(-1)!;
  const s = sobre !== null ? SEMANAS[sobre] : null;
  const marcas = [0.12, 0.14, 0.16, 0.18, 0.2];

  return (
    <div>
      <p className="text-[34px] font-bold leading-none tracking-[-0.03em]">{pct(ultima.activacion)}</p>
      <p className="mt-2 text-[13px] text-tenue">
        Semana del {ultima.semana} · <span className="font-semibold text-exito-texto">+{((ultima.activacion - SEMANAS[0].activacion) * 100).toLocaleString("es-CO", { maximumFractionDigits: 1 })} puntos</span> desde el {SEMANAS[0].semana}
      </p>

      <div className="mt-6 grid grid-cols-[36px_minmax(0,1fr)] gap-2">
        <div className="relative h-[190px]">
          {marcas.map((m) => (
            <span key={m} className="absolute right-0 -translate-y-1/2 font-mono text-[11px] text-tenue" style={{ top: `${y(m)}%` }}>
              {Math.round(m * 100)} %
            </span>
          ))}
        </div>
        <div className="relative h-[190px]" onMouseLeave={() => setSobre(null)}>
          {marcas.map((m) => (
            <span key={m} className="absolute inset-x-0 border-t border-linea" style={{ top: `${y(m)}%` }} />
          ))}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            <polyline points={SEMANAS.map((w, i) => `${x(i)},${y(w.activacion)}`).join(" ")} fill="none" stroke="var(--marca)" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          {sobre !== null && <span className="absolute inset-y-0 w-px bg-borde-fuerte" style={{ left: `${x(sobre)}%` }} />}
          {SEMANAS.map((w, i) => (
            <span
              key={w.semana}
              className={"absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-fondo bg-marca transition-transform " + (sobre === i ? "scale-150" : "")}
              style={{ left: `${x(i)}%`, top: `${y(w.activacion)}%` }}
            />
          ))}
          <div className="absolute inset-0 flex">
            {SEMANAS.map((w, i) => (
              <span key={w.semana} className="h-full flex-1" onMouseEnter={() => setSobre(i)} />
            ))}
          </div>
          {s && sobre !== null && (
            <div
              className="pointer-events-none absolute top-0 z-10 w-[168px] rounded-xl border border-linea bg-fondo p-3 text-[12.5px] shadow-md"
              style={sobre > SEMANAS.length / 2 ? { right: `${100 - x(sobre)}%`, marginRight: 10 } : { left: `${x(sobre)}%`, marginLeft: 10 }}
            >
              <p className="font-bold">Semana del {s.semana}</p>
              <p className="mt-1.5 flex justify-between">
                <span className="text-tenue">Abren su CDT</span>
                <span className="font-mono font-semibold">{pct(s.activacion)}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-tenue">Registrados</span>
                <span className="font-mono font-semibold">{miles(s.registrados)}</span>
              </p>
            </div>
          )}
        </div>
        <span />
        <div className="relative h-5">
          {SEMANAS.map((w, i) =>
            i % 2 === 0 || i === SEMANAS.length - 1 ? (
              <span key={w.semana} className="absolute -translate-x-1/2 whitespace-nowrap text-[11.5px] text-tenue" style={{ left: `${x(i)}%` }}>
                {w.semana}
              </span>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}

// Histograma: cuántos CDT se abrieron según los días que pasaron desde la simulación.
function Dias() {
  const [sobre, setSobre] = useState<number | null>(null);
  const max = Math.max(...DIAS_PRIMER_CDT.map((d) => d.cdt));
  const total = DIAS_PRIMER_CDT.reduce((s, d) => s + d.cdt, 0);
  const d = sobre !== null ? DIAS_PRIMER_CDT[sobre] : null;

  return (
    <div>
      <p className="text-[34px] font-bold leading-none tracking-[-0.03em]">
        {MEDIANA_DIAS} <span className="text-[17px] font-semibold tracking-normal text-tenue">días</span>
      </p>
      <p className="mt-2 h-[19px] text-[13px] text-tenue">
        {d ? (
          <>
            <span className="font-semibold text-texto">{miles(d.cdt)} CDT</span> a los {d.dias} {d.dias === "1" ? "día" : "días"} · {pct(d.cdt / total, 0)}
          </>
        ) : (
          "La mitad abre su CDT en 6 días o menos"
        )}
      </p>
      <div className="mt-6 flex h-[190px] items-end gap-[3px] border-b border-borde" onMouseLeave={() => setSobre(null)}>
        {DIAS_PRIMER_CDT.map((x, i) => (
          <span key={x.dias} className="flex h-full flex-1 items-end" onMouseEnter={() => setSobre(i)}>
            <span
              className="w-full rounded-t-[4px] transition-opacity"
              style={{ height: `${(x.cdt / max) * 100}%`, background: x.dias === MEDIANA_DIAS ? "var(--marca)" : "var(--marca-media)", opacity: sobre === null || sobre === i ? 1 : 0.45 }}
            />
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-[3px]">
        {DIAS_PRIMER_CDT.map((x) => (
          <span key={x.dias} className={"flex-1 text-center text-[10.5px] " + (x.dias === MEDIANA_DIAS ? "font-bold text-marca" : "text-tenue")}>
            {x.dias}
          </span>
        ))}
      </div>
      <p className="mt-1 text-center text-[11.5px] text-tenue">Días desde que simuló</p>
    </div>
  );
}

// Cada campaña se mide por su objetivo: pasar al siguiente paso (en Sin transferir, abrir el CDT).
function PorCampana() {
  const filas = CAMPANAS.flatMap((j) => (CAMPANAS_SEMANA[j.id] ? [{ nombre: j.nombre, meta: j.objetivo, ...CAMPANAS_SEMANA[j.id]! }] : []));
  return (
    <div>
      <ul className="flex flex-col gap-4">
        {filas.map((f) => {
          const tasa = f.objetivo / f.inscritos;
          return (
            <li key={f.nombre} className="group" title={`${miles(f.objetivo)} de ${miles(f.inscritos)} inscritos cumplieron el objetivo`}>
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="min-w-0 truncate">
                  <span className="font-semibold">{f.nombre}</span> <span className="text-tenue">· {f.meta}</span>
                </span>
                <span className="shrink-0 text-tenue">
                  <span className="font-mono font-semibold text-texto">{miles(f.objetivo)}</span> de {miles(f.inscritos)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-fondo-apagado">
                  <span className="block h-full rounded-r-[4px] bg-marca transition-opacity group-hover:opacity-80" style={{ width: `${tasa * 100}%` }} />
                </span>
                <span className="w-12 text-right font-mono text-[13px] font-bold">{pct(tasa, 0)}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Lo que cuenta es el CDT abierto: barras por CDT, con el % de sus registros que abrió.
function PorFuente() {
  const filas = [...POR_FUENTE].sort((a, b) => b.abiertos - a.abiertos);
  const max = filas[0].abiertos;
  return (
    <ul className="flex flex-col gap-4">
      {filas.map((f) => (
        <li key={f.fuente} className="group" title={`${miles(f.abiertos)} CDT de ${miles(f.registros)} registros`}>
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="font-semibold">{f.fuente}</span>
            <span className="text-tenue">{pct(f.abiertos / f.registros)} de sus registros</span>
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-fondo-apagado">
              <span className="block h-full rounded-r-[4px] bg-marca transition-opacity group-hover:opacity-80" style={{ width: `${(f.abiertos / max) * 100}%` }} />
            </span>
            <span className="w-12 text-right font-mono text-[13px] font-bold">{miles(f.abiertos)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
