"use client";

// Piezas visuales del panel. Todo se lee de un vistazo: color + palabra, nunca solo color.
import type { ReactNode } from "react";
import { Bell, Check, ChevronRight, Mail, MessageCircle, Smartphone, type LucideIcon } from "lucide-react";
import type { Canal } from "@/lib/motor";

export function Tarjeta({ titulo, derecha, children, className = "" }: { titulo?: ReactNode; derecha?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={"rounded-2xl border border-linea bg-fondo p-5 shadow-xs sm:p-6 " + className}>
      {titulo && (
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-[16px] font-bold tracking-[-0.01em]">{titulo}</h2>
          {derecha}
        </div>
      )}
      {children}
    </section>
  );
}

export function Indicador({ titulo, accion, children }: { titulo: string; accion?: { texto: string; onClick: () => void }; children: ReactNode }) {
  return (
    <section className="flex flex-col rounded-2xl border border-linea bg-fondo p-5 shadow-xs sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[14px] font-semibold text-tenue">{titulo}</h2>
        {accion && <Enlace onClick={accion.onClick}>{accion.texto}</Enlace>}
      </div>
      {children}
    </section>
  );
}

export function Enlace({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-my-1 inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[13px] font-semibold text-marca outline-none transition-colors hover:bg-marca-fondo focus-visible:shadow-[var(--anillo-foco)]"
    >
      {children} <ChevronRight className="h-4 w-4" />
    </button>
  );
}

export function Valor({ n, unidad }: { n: ReactNode; unidad?: string }) {
  return (
    <p className="text-[34px] font-bold leading-none tracking-[-0.03em]">
      {n} {unidad && <span className="text-[17px] font-semibold tracking-normal text-tenue">{unidad}</span>}
    </p>
  );
}

export function Titulo({ children, derecha }: { children: ReactNode; derecha?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h4 className="text-[13px] font-semibold text-tenue">{children}</h4>
      {derecha}
    </div>
  );
}

export const Codigo = ({ children }: { children: ReactNode }) => (
  <span className="rounded-md bg-marca-fondo px-1.5 py-px font-mono text-[11.5px] font-medium text-marca">{children}</span>
);

export const NOMBRE_CANAL: Record<Canal, string> = { whatsapp: "WhatsApp", email: "Correo", push: "Push", inapp: "In-app" };

export const ICONO_CANAL: Record<Canal, LucideIcon> = { email: Mail, whatsapp: MessageCircle, push: Bell, inapp: Smartphone };

export const TONO_CANAL: Record<Canal, string> = {
  email: "bg-info-fondo text-info-texto",
  whatsapp: "bg-exito-fondo text-exito-texto",
  push: "bg-marca-suave text-marca",
  inapp: "bg-aviso-fondo text-aviso-texto",
};

export function IconoCanal({ canal, tamano = 24 }: { canal: Canal; tamano?: number }) {
  const Icono = ICONO_CANAL[canal];
  return (
    <span title={NOMBRE_CANAL[canal]} className={"flex shrink-0 items-center justify-center rounded-md " + TONO_CANAL[canal]} style={{ width: tamano, height: tamano }}>
      <Icono className="h-3.5 w-3.5" strokeWidth={2.2} />
    </span>
  );
}

// Canal con su nombre: "WhatsApp", "Push".
export function Canales({ canales }: { canales: Canal[] }) {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {canales.map((c) => (
        <span key={c} className="flex items-center gap-1.5 text-[13px] font-semibold">
          <IconoCanal canal={c} tamano={22} />
          {NOMBRE_CANAL[c]}
        </span>
      ))}
    </span>
  );
}

export function ChipAbierto() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-exito-fondo px-2.5 py-1 text-[12.5px] font-semibold text-exito-texto">
      <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.6} />
      CDT abierto
    </span>
  );
}

export function Barra({ partes, alto = 6 }: { partes: { n: number; color: string }[]; alto?: number }) {
  return (
    <div className="flex gap-[3px] overflow-hidden rounded-full" style={{ height: alto }}>
      {partes.map((p, i) => (p.n > 0 ? <span key={i} style={{ flex: p.n, background: p.color }} /> : null))}
    </div>
  );
}

export function Progreso({ hechos, total }: { hechos: number; total: number }) {
  return (
    <span className="flex gap-1" aria-label={`${hechos} de ${total} pasos`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={"h-1.5 w-4 rounded-full " + (i < hechos ? "bg-marca" : "bg-marca-suave")} />
      ))}
    </span>
  );
}

export function Dato({ k, v, ancho }: { k: string; v: ReactNode; ancho?: boolean }) {
  return (
    <div className={ancho ? "col-span-2" : ""}>
      <dt className="text-[12.5px] text-tenue">{k}</dt>
      <dd className="mt-0.5 font-semibold">{v}</dd>
    </div>
  );
}

export function Pestanas<T extends string>({ valor, opciones, onCambio }: { valor: T; opciones: [T, string][]; onCambio: (v: T) => void }) {
  return (
    <div role="tablist" className="flex rounded-full bg-fondo-apagado p-1">
      {opciones.map(([k, t]) => (
        <button
          key={k}
          role="tab"
          type="button"
          aria-selected={valor === k}
          onClick={() => onCambio(k)}
          className={
            "rounded-full px-4 py-1.5 text-[13px] font-semibold outline-none transition-all focus-visible:shadow-[var(--anillo-foco)] " +
            (valor === k ? "bg-fondo text-texto shadow-xs" : "text-tenue hover:text-texto")
          }
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export function VerMas({ mostrando, total }: { mostrando: number; total: number }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-linea px-5 py-3 sm:px-6">
      <span className="text-[12.5px] text-tenue">
        Mostrando <span className="font-semibold text-texto">{mostrando.toLocaleString("es-CO")}</span> de {total.toLocaleString("es-CO")}
      </span>
      <button type="button" disabled className="cursor-not-allowed rounded-full border border-linea px-3.5 py-1.5 text-[13px] font-semibold text-tenue opacity-60">
        Ver más
      </button>
    </div>
  );
}

export function Encabezado({ titulo, derecha }: { titulo: string; derecha?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-[26px] font-bold tracking-[-0.025em]">{titulo}</h1>
      {derecha}
    </div>
  );
}
