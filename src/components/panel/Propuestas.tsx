"use client";

// Inicio: las dos propuestas en una pantalla, con lo que encontramos, cómo lo resolvemos y enlaces a cada parte.
import type { ReactNode } from "react";
import { Check } from "lucide-react";
import type { Vista } from "@/lib/vistas";

const MOTOR: [Vista, string, string][] = [
  ["resumen", "Resumen", "El recorrido de la semana, paso a paso"],
  ["usuarios", "Usuarios", "En qué paso va cada persona"],
  ["campanas", "Campañas", "Qué mensaje recibe en cada paso"],
  ["reglas", "Reglas", "Qué anticipa que alguien abra su CDT"],
  ["eventos", "Eventos", "Lo que se registra en HubSpot"],
  ["medicion", "Medición", "Cuántos CDT mueve cada campaña"],
];

export function Propuestas({ onIr }: { onIr: (v: Vista) => void }) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[30px] font-bold tracking-[-0.03em]">Dos propuestas para MejorCDT</h1>
        <p className="mt-1.5 text-[15px] text-texto-secundario">Lo que investigué y cómo lo resolvería.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Propuesta
          titulo="Correos que se leen y llevan a abrir el CDT"
          cifra="8"
          detalle="fallas en el correo del Mes del ahorro"
          problemas={["Llegó con una fecha que ya había pasado", "Los pasos y el botón son imágenes", "Le habla igual a todo el mundo"]}
          soluciones={["La fecha se calcula el día del envío", "Todo en texto: se ve aunque no carguen las imágenes", "Le habla a cada persona según el paso en que va"]}
        >
          <Boton onClick={() => onIr("correo")}>Ver el antes y después</Boton>
        </Propuesta>

        <Propuesta
          titulo="Un motor que acompaña a cada persona hasta su primer CDT"
          cifra="18,8 %"
          detalle="de los registrados abre un CDT en 14 días"
          nota="Datos de ejemplo"
          problemas={["La mayoría se queda en algún paso: datos, validación, firma o transferencia", "La venta se sigue a mano por WhatsApp y teléfono"]}
          soluciones={["Detecta en qué paso se quedó cada persona", "Le envía el mensaje justo, por el canal que usa", "Mide cuántos CDT mueve cada campaña"]}
        >
          <ul className="grid gap-2 sm:grid-cols-2">
            {MOTOR.map(([v, nombre, texto]) => (
              <li key={v}>
                <button
                  type="button"
                  onClick={() => onIr(v)}
                  className="w-full rounded-2xl bg-lienzo px-4 py-3 text-left outline-none ring-1 ring-linea transition-[background-color,transform] duration-150 ease-out hover:bg-marca-fondo focus-visible:shadow-[var(--anillo-foco)] active:scale-[0.98]"
                >
                  <span className="block text-[14px] font-bold text-marca">{nombre}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-texto-secundario">{texto}</span>
                </button>
              </li>
            ))}
          </ul>
        </Propuesta>
      </div>
    </div>
  );
}

function Propuesta({
  titulo,
  cifra,
  detalle,
  nota,
  problemas,
  soluciones,
  children,
}: {
  titulo: string;
  cifra: string;
  detalle: string;
  nota?: string;
  problemas: string[];
  soluciones: string[];
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col rounded-[24px] bg-fondo p-6 shadow-[0_1px_2px_rgb(16_24_40/0.05),0_16px_40px_-16px_rgb(16_24_40/0.14)] ring-1 ring-black/[0.05] sm:p-8">
      <h2 className="max-w-[24ch] text-[22px] font-bold leading-tight tracking-[-0.02em]">{titulo}</h2>

      <div className="mt-6 flex items-baseline gap-3">
        <span className="text-[44px] font-extrabold leading-none tracking-[-0.04em] text-marca">{cifra}</span>
        <span className="text-[14px] leading-snug text-texto-secundario">
          {detalle}
          {nota && <span className="mt-0.5 block text-[12px] text-tenue">{nota}</span>}
        </span>
      </div>

      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <Lista titulo="Lo que investigué" items={problemas} tono="error" />
        <Lista titulo="Cómo lo resolvería" items={soluciones} tono="exito" />
      </div>

      <div className="mt-auto pt-8">{children}</div>
    </section>
  );
}

function Lista({ titulo, items, tono }: { titulo: string; items: string[]; tono: "error" | "exito" }) {
  return (
    <div>
      <h3 className="text-[12.5px] font-semibold text-tenue">{titulo}</h3>
      <ul className="mt-3 flex flex-col gap-2.5">
        {items.map((t) => (
          <li key={t} className="flex gap-2.5 text-[14px] leading-snug">
            {tono === "exito" ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-exito" strokeWidth={2.6} />
            ) : (
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-error" />
            )}
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Boton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-marca px-6 py-3 text-[14.5px] font-bold text-white outline-none transition-[background-color,transform] duration-150 ease-out hover:bg-marca-hover focus-visible:shadow-[var(--anillo-foco)] active:scale-[0.97]"
    >
      {children}
    </button>
  );
}
