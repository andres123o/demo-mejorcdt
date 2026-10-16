"use client";

import { useEffect, useRef } from "react";
import { CircleCheck, X, Zap } from "lucide-react";
import { type Hito, type Persona } from "@/lib/datos";
import { cuando, pct, pesos } from "@/lib/fechas";
import { CAMPANAS } from "@/lib/campanas";
import { BANCOS, nombrePaso } from "@/lib/motor";
import { Canales, ChipAbierto, Dato, Enlace, IconoCanal, NOMBRE_CANAL, Progreso, Titulo } from "./piezas";

export function Ficha({ p, ahora, onCerrar, onVerCampana }: { p: Persona; ahora: number; onCerrar: () => void; onVerCampana: (id: string) => void }) {
  const cerrar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cerrar.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onCerrar]);

  const tras = p.tras ? CAMPANAS.find((j) => j.id === p.tras) : null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button type="button" aria-label="Cerrar" tabIndex={-1} onClick={onCerrar} className="absolute inset-0 animate-aparecer bg-texto/25" />
      <div role="dialog" aria-modal="true" aria-labelledby="ficha-titulo" className="relative flex h-full w-full max-w-[520px] animate-deslizar flex-col overflow-y-auto bg-fondo shadow-lg">
        <div className="sticky top-0 z-10 flex items-start gap-4 border-b border-linea bg-fondo/95 px-6 py-5 backdrop-blur">
          <div className="min-w-0 flex-1">
            <h2 id="ficha-titulo" className="text-[20px] font-bold leading-tight tracking-[-0.015em]">
              {p.nombre}
            </h2>
            <p className="mt-1 truncate text-[13.5px] text-tenue">
              {pesos(p.monto)} a {p.plazo} meses · {p.banco}
            </p>
          </div>
          <button
            ref={cerrar}
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar ficha"
            className="-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-tenue outline-none hover:bg-fondo-apagado hover:text-texto focus-visible:shadow-[var(--anillo-foco)]"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="flex flex-col gap-8 px-6 py-6">
          {p.campana && p.paso ? (
            <section>
              <Titulo derecha={<Enlace onClick={() => onVerCampana(p.campana!.id)}>Ver campaña</Enlace>}>Campaña</Titulo>
              <div className="flex items-center justify-between gap-4">
                <p className="text-[17px] font-bold">{p.campana.nombre}</p>
                <span className="flex items-center gap-2.5">
                  <Progreso hechos={Math.min(p.paso.hechos + (p.siguiente ? 1 : 0), p.paso.total)} total={p.paso.total} />
                  <span className="text-[12.5px] font-semibold text-texto-secundario">{p.siguiente ? `Mensaje ${p.paso.hechos + 1} de ${p.paso.total}` : "Mensajes enviados"}</span>
                </span>
              </div>
              <p className="mt-1 text-[13px] text-tenue">
                Paso del journey: {nombrePaso(p.posicion)} · Sale al cumplir: {p.campana.objetivo.toLowerCase()}
              </p>
              {p.siguiente && (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-lienzo p-3.5">
                  <IconoCanal canal={p.siguiente.canal} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] text-tenue">{NOMBRE_CANAL[p.siguiente.canal]}</span>
                    <span className="block truncate text-[14px] font-semibold">{p.siguiente.texto}</span>
                  </span>
                  <span className="shrink-0 text-[13px] font-semibold">{cuando(p.siguiente.t, ahora)}</span>
                </div>
              )}
            </section>
          ) : (
            <section>
              <ChipAbierto />
              <p className="mt-3 text-[15px] font-semibold">
                {pesos(p.monto)} en {p.banco}
                {tras && <span className="font-normal text-tenue"> · tras la campaña {tras.nombre}</span>}
              </p>
            </section>
          )}

          {p.regla && (
            <section>
              <Titulo>Regla</Titulo>
              <div className="rounded-xl border border-linea p-4">
                <p className="text-[14px] font-semibold">{p.regla.hizo}</p>
                <p className="mt-1 text-[13px] text-tenue">
                  <span className="font-mono font-semibold text-texto">{pct(p.regla.abren, 0)}</span> de quienes hicieron lo mismo abrieron su CDT
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-linea pt-3">
                  <Canales canales={p.regla.canales} />
                  <span className="text-[13px] text-tenue">· {p.regla.tipo}</span>
                </div>
              </div>
            </section>
          )}

          <section>
            <Titulo>Línea de tiempo</Titulo>
            <Linea hitos={p.hitos} ahora={ahora} />
          </section>

          <section>
            <Titulo>Datos</Titulo>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-[14px]">
              <Dato k="Monto simulado" v={pesos(p.monto)} />
              <Dato k="Plazo" v={`${p.plazo} meses`} />
              <Dato k="Banco" v={p.banco} />
              <Dato k="Tasa hoy" v={`${(BANCOS[p.banco]?.tasa ?? 12.5).toLocaleString("es-CO")} % E.A.`} />
              <Dato k="Cómo llegó" v={p.fuente} />
              <Dato k="Simuló en" v={`${p.canal}, ${p.simulaciones === 1 ? "una vez" : `${p.simulaciones} veces`}`} />
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

const BURBUJA = { whatsapp: "bg-exito-fondo", email: "bg-info-fondo", push: "bg-marca-fondo", inapp: "bg-aviso-fondo" };

// Eventos del flujo y lo que le llegó, en orden. Los mensajes se ven como le llegaron.
function Linea({ hitos, ahora }: { hitos: Hito[]; ahora: number }) {
  const lista = [...hitos].reverse();
  return (
    <ol>
      {lista.map((h, i) => (
        <li key={i} className="relative grid grid-cols-[28px_1fr] gap-x-3 pb-5 last:pb-0">
          {i < lista.length - 1 && <span className="absolute bottom-0 left-[13.5px] top-7 w-px bg-linea" />}
          <span className="relative z-10 flex h-7 w-7 items-center justify-center">
            {h.tipo === "evento" ? (
              <span className={"flex h-7 w-7 items-center justify-center rounded-full border " + (h.evento === "cdt_completado" ? "border-exito/30 bg-exito-fondo text-exito-texto" : "border-linea bg-fondo text-tenue")}>
                <CircleCheck className="h-3.5 w-3.5" strokeWidth={2.2} />
              </span>
            ) : h.tipo === "inscripcion" ? (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-marca text-white">
                <Zap className="h-3.5 w-3.5" strokeWidth={2.2} />
              </span>
            ) : (
              <IconoCanal canal={h.canal} tamano={28} />
            )}
          </span>
          <div className="min-w-0 pt-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[14px] font-semibold leading-[20px]">{h.tipo === "evento" ? h.nombre : h.tipo === "inscripcion" ? `Entró a ${h.campana}` : h.titulo}</p>
              <span className="shrink-0 text-[12px] text-tenue">{cuando(h.t, ahora)}</span>
            </div>
            {h.tipo === "evento" && <p className="mt-0.5 font-mono text-[11.5px] text-tenue">{h.evento}</p>}
            {h.tipo === "mensaje" && <p className={"mt-2 rounded-xl rounded-tl-sm px-3 py-2 text-[13px] leading-[19px] " + BURBUJA[h.canal]}>{h.texto}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
