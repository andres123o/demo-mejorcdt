"use client";

// Campañas de activación como workflows de HubSpot: desencadenante, acciones numeradas y ramas.
// Cada evento del flujo inscribe a la persona en la campaña del paso donde se quedó y la saca al cumplir el objetivo.
import { Fragment, createContext, useContext, useState, type ReactNode } from "react";
import { CircleCheck, Clock, Flag, Plus, Split, Target, Zap, type LucideIcon } from "lucide-react";
import { estaEn, type Persona } from "@/lib/datos";
import { miles, pct, pesos } from "@/lib/fechas";
import { CAMPANAS, diasDe, type Grupo, type Campana, type PasoCampana } from "@/lib/campanas";
import { CAMPANAS_SEMANA } from "@/lib/medicion";
import { Codigo, ICONO_CANAL, Pestanas, VerMas } from "./piezas";
import { EnCampana, Envio } from "./Usuarios";

const GRUPOS: Grupo[] = ["Pasos del journey", "Mercado"];
type Pestana = "flujo" | "personas";

const Contexto = createContext<{ numero: Map<PasoCampana, number>; dias: Map<PasoCampana, number> }>({ numero: new Map(), dias: new Map() });

export function Campanas({
  lista,
  ahora,
  elegido,
  onElegir,
  onAbrir,
}: {
  lista: Persona[];
  ahora: number;
  elegido: string;
  onElegir: (id: string) => void;
  onAbrir: (id: string) => void;
}) {
  const [pestana, setPestana] = useState<Pestana>("flujo");
  const j = CAMPANAS.find((x) => x.id === elegido) ?? CAMPANAS[0];

  return (
    <div>
      <h1 className="mb-6 text-[26px] font-bold tracking-[-0.025em]">Campañas</h1>
      <div className="grid gap-6 xl:grid-cols-[208px_minmax(0,1fr)]">
        <nav aria-label="Campañas" className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] xl:mx-0 xl:flex-col xl:overflow-visible xl:px-0">
          {GRUPOS.map((g) => (
            <Fragment key={g}>
              <span className="hidden px-3 pb-1 pt-4 text-[12px] font-semibold text-tenue first:pt-0 xl:block">{g}</span>
              {CAMPANAS.filter((x) => x.grupo === g).map((x) => (
                <button
                  key={x.id}
                  type="button"
                  aria-current={x.id === j.id ? "page" : undefined}
                  onClick={() => onElegir(x.id)}
                  className={
                    "flex shrink-0 items-center justify-between gap-3 rounded-full px-3.5 py-2 text-left text-[14px] font-semibold outline-none transition-colors focus-visible:shadow-[var(--anillo-foco)] " +
                    (x.id === j.id ? "bg-fondo text-marca shadow-xs" : "text-tenue hover:bg-fondo/70 hover:text-texto")
                  }
                >
                  <span className="truncate">{x.nombre}</span>
                  <span className="text-[12.5px] font-semibold text-tenue">{CAMPANAS_SEMANA[x.id] ? miles(CAMPANAS_SEMANA[x.id]!.inscritos) : ""}</span>
                </button>
              ))}
            </Fragment>
          ))}
        </nav>

        <Detalle j={j} lista={lista} ahora={ahora} pestana={pestana} onPestana={setPestana} onAbrir={onAbrir} />
      </div>
    </div>
  );
}

function Detalle({ j, lista, ahora, pestana, onPestana, onAbrir }: { j: Campana; lista: Persona[]; ahora: number; pestana: Pestana; onPestana: (p: Pestana) => void; onAbrir: (id: string) => void }) {
  const dentro = lista.filter((p) => estaEn(j, p));
  const m = CAMPANAS_SEMANA[j.id];

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_272px]">
      <aside className="flex flex-col gap-5 self-start rounded-2xl border border-linea bg-fondo p-5 shadow-xs lg:order-2">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[19px] font-bold tracking-[-0.02em]">{j.nombre}</h2>
            <Interruptor programado={!m} />
          </div>
          <div className="mt-4">
            <Pestanas
              valor={pestana}
              onCambio={onPestana}
              opciones={[
                ["flujo", "Flujo"],
                ["personas", `Personas ${miles(m?.inscritos ?? dentro.length)}`],
              ]}
            />
          </div>
        </div>
        <dl className="flex flex-col gap-4 border-t border-linea pt-4 text-[13.5px]">
          <Meta icono={Target} k="Objetivo" v={j.objetivo} codigo={j.meta} />
          <Meta icono={CircleCheck} k="Sale" v="Al cumplir el objetivo, en cualquier paso" />
        </dl>
        {m ? (
          <dl className="grid grid-cols-2 gap-4 border-t border-linea pt-4">
            <div>
              <dt className="text-[12.5px] text-tenue">Inscritos</dt>
              <dd className="mt-0.5 font-mono text-[17px] font-bold">{miles(m.inscritos)}</dd>
            </div>
            <div>
              <dt className="text-[12.5px] text-tenue">Conversión</dt>
              <dd className="mt-0.5 font-mono text-[17px] font-bold">{pct(m.objetivo / m.inscritos, 0)}</dd>
            </div>
            <p className="col-span-2 -mt-1 text-[12.5px] text-tenue">
              {miles(m.objetivo)} {j.logro} · esta semana
            </p>
          </dl>
        ) : (
          <p className="border-t border-linea pt-4 text-[13px] text-tenue">Programada: 15 dic</p>
        )}
      </aside>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-linea bg-fondo shadow-xs">
        {pestana === "personas" ? (
          dentro.length === 0 ? (
            <p className="px-6 py-14 text-center text-[14px] text-tenue">{j.grupo === "Mercado" ? "Esta campaña es para registrados de semanas anteriores." : "Nadie de la muestra está en esta campaña."}</p>
          ) : (
            <>
            <ul>
              {dentro.map((p) => (
                <li key={p.id} className="border-b border-linea last:border-b-0">
                  <button
                    type="button"
                    onClick={() => onAbrir(p.id)}
                    className="grid w-full grid-cols-2 items-center gap-x-4 gap-y-2 px-5 py-3 text-left outline-none transition-colors hover:bg-lienzo focus-visible:bg-lienzo sm:px-6"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold">{p.nombre}</span>
                      <span className="block truncate text-[12.5px] text-tenue">
                        {pesos(p.monto)} · {p.banco}
                      </span>
                    </span>
                    <span className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <EnCampana p={p} />
                      <Envio p={p} ahora={ahora} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {m && <VerMas mostrando={dentro.length} total={m.inscritos} />}
            </>
          )
        ) : (
          <div className="overflow-x-auto bg-lienzo px-4 py-10 [scrollbar-width:thin]" style={{ backgroundImage: "radial-gradient(rgb(17 27 255 / 0.07) 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
            <Contexto.Provider value={{ numero: numerar(j.pasos), dias: diasDe(j) }}>
              <div className="mx-auto flex w-max min-w-full flex-col items-center">
                <Caja icono={Zap} tono="disparador" encabezado="Desencadenante de inscripción">
                  <p className="text-[14px] font-semibold leading-snug">{j.disparador}</p>
                  <p className="mt-1.5 text-[12.5px] text-tenue">
                    Evento <Codigo>{j.evento}</Codigo>
                  </p>
                </Caja>
                <Pasos pasos={j.pasos} />
              </div>
            </Contexto.Provider>
          </div>
        )}
      </section>
    </div>
  );
}

function Interruptor({ programado }: { programado: boolean }) {
  return (
    <span className={"flex items-center gap-1.5 text-[12px] font-semibold " + (programado ? "text-tenue" : "text-marca")}>
      <span className={"relative h-[18px] w-[30px] rounded-full " + (programado ? "bg-borde" : "bg-marca")}>
        <span className={"absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm " + (programado ? "left-[2px]" : "right-[2px]")} />
      </span>
      {programado ? "Programado" : "Activo"}
    </span>
  );
}

function Meta({ icono: Icono, k, v, codigo }: { icono: LucideIcon; k: string; v: string; codigo?: string }) {
  return (
    <div className="flex gap-2.5">
      <Icono className="mt-0.5 h-4 w-4 shrink-0 text-tenue" />
      <div className="min-w-0">
        <dt className="text-[12.5px] text-tenue">{k}</dt>
        <dd className="mt-0.5 font-semibold leading-snug">
          {v}
          {codigo && (
            <span className="mt-1 block">
              <Codigo>{codigo}</Codigo>
            </span>
          )}
        </dd>
      </div>
    </div>
  );
}

// ── Lienzo, al estilo del editor de workflows de HubSpot ──────────────

function numerar(pasos: PasoCampana[], m = new Map<PasoCampana, number>()) {
  for (const p of pasos) {
    if (p.tipo === "fin") continue;
    m.set(p, m.size + 1);
    if (p.tipo === "condicion") for (const r of p.ramas) numerar(r.pasos, m);
  }
  return m;
}

function Conector() {
  return (
    <span className="flex flex-col items-center" aria-hidden>
      <span className="h-4 w-px bg-borde" />
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-borde bg-fondo text-tenue">
        <Plus className="h-3 w-3" strokeWidth={2.5} />
      </span>
      <span className="h-4 w-px bg-borde" />
    </span>
  );
}

function Pasos({ pasos }: { pasos: PasoCampana[] }) {
  return (
    <>
      {pasos.map((p, i) => (
        <Fragment key={i}>
          <Conector />
          <PasoVista paso={p} />
        </Fragment>
      ))}
    </>
  );
}

function PasoVista({ paso: p }: { paso: PasoCampana }) {
  const { numero } = useContext(Contexto);
  const n = numero.get(p);

  if (p.tipo === "espera")
    return (
      <Caja paso={p} icono={Clock} tono="espera" encabezado={`${n}. Retraso`} compacta>
        <p className="text-[13.5px] font-semibold">{`Esperar ${p.dias} ${p.dias === 1 ? "día" : "días"}`}</p>
      </Caja>
    );
  if (p.tipo === "mensaje")
    return (
      <Caja paso={p} icono={ICONO_CANAL[p.canal]} tono={p.canal} encabezado={`${n}. ${ACCION[p.canal]}`}>
        <p className="text-[14px] font-semibold leading-snug">{p.titulo}</p>
        <p className="mt-1.5 line-clamp-3 text-[13px] leading-[19px] text-texto-secundario">{conVariables(p.texto)}</p>
      </Caja>
    );
  if (p.tipo === "fin")
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-linea bg-fondo px-3 py-1.5 text-[12.5px] font-semibold text-tenue">
        <Flag className="h-3.5 w-3.5" />
        {p.titulo}
      </span>
    );

  return (
    <div className="flex flex-col items-center">
      <Caja paso={p} icono={Split} tono="rama" encabezado={`${n}. Rama si/entonces`} compacta>
        <p className="text-[14px] font-semibold">{p.pregunta}</p>
      </Caja>
      <span className="h-4 w-px bg-borde" />
      <div className="flex items-stretch gap-8">
        {p.ramas.map((r, i) => (
          <div key={r.nombre} className="relative flex flex-col items-center">
            <span className="absolute top-0 h-px bg-borde" style={{ left: i === 0 ? "50%" : "-16px", right: i === p.ramas.length - 1 ? "50%" : "-16px" }} />
            <span className="h-4 w-px bg-borde" />
            <span className="rounded-full border border-linea bg-fondo px-2.5 py-0.5 text-[12px] font-bold">{r.nombre}</span>
            <Pasos pasos={r.pasos} />
            <span className="min-h-5 w-px flex-1 bg-borde" />
            <span className="absolute bottom-0 h-px bg-borde" style={{ left: i === 0 ? "50%" : "-16px", right: i === p.ramas.length - 1 ? "50%" : "-16px" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

const ACCION = { whatsapp: "Enviar WhatsApp", email: "Enviar correo", push: "Enviar push", inapp: "Mostrar in-app" };

const TONOS = {
  disparador: "bg-marca text-white",
  email: "bg-info-fondo text-info-texto",
  whatsapp: "bg-exito-fondo text-exito-texto",
  push: "bg-marca-suave text-marca",
  inapp: "bg-aviso-fondo text-aviso-texto",
  espera: "bg-fondo-apagado text-texto-secundario",
  rama: "bg-marca-suave text-marca",
};

function Caja({ paso, icono: Icono, tono, encabezado, compacta, children }: { paso?: PasoCampana; icono: LucideIcon; tono: keyof typeof TONOS; encabezado: string; compacta?: boolean; children: ReactNode }) {
  const { dias } = useContext(Contexto);
  const dia = paso ? dias.get(paso) : undefined;
  return (
    <div className={"relative overflow-hidden rounded-2xl border border-linea bg-fondo shadow-sm " + (compacta ? "w-[260px]" : "w-[320px]")}>
      <div className="flex items-center gap-2 border-b border-linea px-3.5 py-2">
        <span className={"flex h-6 w-6 shrink-0 items-center justify-center rounded-md " + TONOS[tono]}>
          <Icono className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-tenue">{encabezado}</span>
        {dia !== undefined && <span className="shrink-0 text-[11.5px] font-semibold text-tenue">Día {dia}</span>}
      </div>
      <div className="px-3.5 py-3">{children}</div>
    </div>
  );
}

function conVariables(texto: string): ReactNode {
  return texto.split(/(\{\{\w+\}\})/).map((t, i) =>
    /^\{\{\w+\}\}$/.test(t) ? (
      <span key={i} className="rounded bg-marca-fondo px-1 py-px font-mono text-[11.5px] text-marca">
        {t.slice(2, -2)}
      </span>
    ) : (
      t
    ),
  );
}
