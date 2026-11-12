"use client";

// Dos propuestas para MejorCDT: el correo mejorado y el motor de activación, con una portada que las resume.
import { useCallback, useMemo, useState } from "react";
import { personas } from "@/lib/datos";
import { GRUPOS, grupoDe, type Vista } from "@/lib/vistas";
import { Pestanas } from "./piezas";
import { Eventos } from "./Eventos";
import { Ficha } from "./Ficha";
import { Campanas } from "./Campanas";
import { Correo } from "./Correo";
import { Propuestas } from "./Propuestas";
import { Medicion } from "./Medicion";
import { Reglas } from "./Reglas";
import { Resumen } from "./Resumen";
import { Usuarios } from "./Usuarios";

export type { Vista };

export function Panel({ ahora, inicial = "propuestas" }: { ahora: number; inicial?: Vista }) {
  const lista = useMemo(() => personas(ahora), [ahora]);
  const [vista, setVista] = useState<Vista>(inicial);
  const [abiertoId, setAbiertoId] = useState<string | null>(null);
  const [campana, setCampana] = useState("transferencia");
  const grupo = grupoDe(vista);
  const abierto = lista.find((p) => p.id === abiertoId) ?? null;
  const cerrar = useCallback(() => setAbiertoId(null), []);

  function ir(v: Vista) {
    setVista(v);
    window.scrollTo({ top: 0 });
  }

  function verCampana(id: string) {
    setCampana(id);
    setAbiertoId(null);
    ir("campanas");
  }

  return (
    <div className="min-h-dvh w-full bg-lienzo text-texto">
      <header className="sticky top-0 z-30 border-b border-linea bg-fondo/90 backdrop-blur-md">
        <div className="flex h-16 w-full items-center gap-6 px-4 sm:px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mejorcdt/logo.svg" alt="MejorCDT" width={182} height={50} className="h-[30px] w-auto shrink-0" />
          <nav aria-label="Vistas" className="-mb-px flex h-full items-stretch gap-1 overflow-x-auto [scrollbar-width:none]">
            {GRUPOS.map((g) => {
              const activo = grupo === g;
              return (
                <button
                  key={g.nombre}
                  type="button"
                  aria-current={activo ? "page" : undefined}
                  onClick={() => ir(g.vistas[0][0])}
                  className={
                    "relative flex shrink-0 items-center px-3 text-[14px] font-semibold outline-none transition-colors " +
                    (activo ? "text-marca" : "text-tenue hover:text-texto focus-visible:text-texto")
                  }
                >
                  {g.nombre}
                  {activo && <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-marca" />}
                </button>
              );
            })}
          </nav>
          <span className="ml-auto hidden shrink-0 items-center gap-2 rounded-full border border-linea bg-fondo px-3 py-1.5 text-[13px] font-semibold lg:inline-flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-exito/60 motion-reduce:hidden" />
              <span className="relative h-2 w-2 rounded-full bg-exito" />
            </span>
            Conectado a HubSpot
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[78rem] px-4 pb-16 pt-8 sm:px-6">
        {/* Las propuestas con varias vistas las muestran en una sub-barra, para no llenar el menú de arriba. */}
        {grupo.vistas.length > 1 && (
          <div className="mb-8 overflow-x-auto [scrollbar-width:none]">
            <div className="inline-flex">
              <Pestanas valor={vista} opciones={grupo.vistas} onCambio={ir} />
            </div>
          </div>
        )}
        {vista === "propuestas" && <Propuestas onIr={ir} />}
        {vista === "correo" && <Correo />}
        {vista === "resumen" && <Resumen onIr={ir} onCampana={verCampana} />}
        {vista === "usuarios" && <Usuarios lista={lista} ahora={ahora} onAbrir={setAbiertoId} />}
        {vista === "campanas" && <Campanas lista={lista} ahora={ahora} elegido={campana} onElegir={setCampana} onAbrir={setAbiertoId} />}
        {vista === "reglas" && <Reglas onCampana={verCampana} />}
        {vista === "eventos" && <Eventos />}
        {vista === "medicion" && <Medicion />}
      </main>

      {abierto && <Ficha p={abierto} ahora={ahora} onCerrar={cerrar} onVerCampana={verCampana} />}
    </div>
  );
}

export function EsqueletoPanel() {
  return (
    <div className="min-h-dvh w-full bg-lienzo">
      <div className="h-16 border-b border-linea bg-fondo" />
      <div className="mx-auto flex max-w-[78rem] animate-pulse flex-col gap-5 px-4 pt-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-marca-suave/50" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-marca-suave/50" />
      </div>
    </div>
  );
}
