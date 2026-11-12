"use client";

// Antes y después del correo "Mes del ahorro" que MejorCDT envió el lunes 9 de noviembre de 2026.
// El correo va al centro y cada falla se señala con una curva desde su nota. El botón voltea la tarjeta.
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Check, ImageOff } from "lucide-react";
import { PUNTO, PUNTOS, type Lado, type Punto } from "@/lib/correo";

type Cara = "antes" | "despues";
type Modo = "con" | "sin";
type Dispositivo = "pc" | "movil";
// Celular: pantalla de iPhone 14 Pro Max (430 px) más el marco de 10 px a cada lado.
const ANCHO: Record<Dispositivo, number> = { pc: 560, movil: 450 };
type Linea = { id: string; d: string; cx: number; cy: number; orden: number };

const VOLTEO_MS = 850;
const RECOGER_MS = 280;
const SALIDA = "cubic-bezier(0.23, 1, 0.32, 1)";
const GIRO = "cubic-bezier(0.77, 0, 0.175, 1)";
const ENGANCHE = 31; // la curva sale a la altura del título de la nota
const DESNIVEL = 56; // la nota queda un poco más arriba que su punto, para que la curva en S se note

// Las dos caras ocupan la misma celda; la de atrás está girada y no se ve hasta voltear.
const CARA = "[grid-area:1/1] self-start overflow-hidden ring-1 ring-black/[0.06] shadow-[0_2px_6px_rgb(16_24_40/0.04),0_32px_64px_-24px_rgb(17_27_255/0.22)] [backface-visibility:hidden] motion-reduce:transition-opacity motion-reduce:duration-200 ";
const OCULTA = " motion-reduce:invisible motion-reduce:opacity-0";
// En celular el correo va dentro de un marco de teléfono.
const MARCO: Record<Dispositivo, string> = { pc: "rounded-[28px] ", movil: "rounded-[44px] border-[10px] border-[#16161d] " };

const Activo = createContext<string | null>(null);

export function Correo() {
  const [cara, setCara] = useState<Cara>("antes");
  // Las notas cambian de texto solo cuando están ocultas, al terminar el giro.
  const [caraNotas, setCaraNotas] = useState<Cara>("antes");
  const [modo, setModo] = useState<Modo>("con");
  const [dispositivo, setDispositivo] = useState<Dispositivo>("pc");
  const [volteando, setVolteando] = useState(false);
  const [mostrar, setMostrar] = useState(false);
  const [activo, setActivo] = useState<string | null>(null);
  const [tops, setTops] = useState<Record<string, number>>({});
  const [lineas, setLineas] = useState<Linea[]>([]);
  const escena = useRef<HTMLDivElement>(null);
  const tarjeta = useRef<HTMLDivElement>(null);
  const notas = useRef<Record<string, HTMLElement | null>>({});
  const girando = useRef(false);
  const sin = modo === "sin";
  const esAntes = cara === "antes";

  // Ubica cada nota a la altura de su punto en el correo, sin que se monten, y traza la curva.
  const medir = useCallback(() => {
    const e = escena.current;
    if (!e || !window.matchMedia("(min-width: 1024px)").matches) return;
    const base = e.getBoundingClientRect();
    const nuevosTops: Record<string, number> = {};
    const nuevas: Linea[] = [];
    for (const lado of ["izq", "der"] as Lado[]) {
      const puntos = PUNTOS.filter((p) => p.lado === lado)
        .map((p) => {
          const r = e.querySelector(`[data-cara="${cara}"] [data-ancla="${p.id}"]`)?.getBoundingClientRect();
          return r ? { p, ax: r.left + r.width / 2 - base.left, ay: r.top + r.height / 2 - base.top } : null;
        })
        .filter((x) => x !== null)
        .sort((a, b) => a.ay - b.ay);
      // Primero de arriba abajo para que no se monten; luego de abajo arriba para que ninguna pase del final del correo.
      const colocadas = puntos.flatMap(({ p, ax, ay }) => {
        const nota = notas.current[p.id];
        return nota ? [{ p, ax, ay, nota, alto: nota.offsetHeight, top: 0 }] : [];
      });
      let libre = 0;
      for (const c of colocadas) {
        c.top = Math.max(c.ay - ENGANCHE - DESNIVEL, libre);
        libre = c.top + c.alto + 18;
      }
      let limite = base.height;
      for (const c of [...colocadas].reverse()) {
        c.top = Math.min(c.top, limite - c.alto);
        limite = c.top - 18;
      }
      colocadas.forEach(({ p, ax, ay, nota, top }, orden) => {
        nuevosTops[p.id] = top;
        const col = nota.parentElement!.getBoundingClientRect();
        const cx = lado === "izq" ? col.right - base.left : col.left - base.left;
        const cy = top + ENGANCHE;
        // Curva en S: sale horizontal de la nota y llega horizontal al punto.
        const tiron = (ax - cx) * 0.5;
        nuevas.push({ id: p.id, d: `M${cx} ${cy} C${cx + tiron} ${cy} ${ax - tiron} ${ay} ${ax} ${ay}`, cx, cy, orden });
      });
    }
    setTops(nuevosTops);
    setLineas(nuevas);
    requestAnimationFrame(() => setMostrar(true));
  }, [cara]);

  // Se mide con la tarjeta quieta: al cargar, al cambiar de modo y al terminar el volteo.
  useLayoutEffect(() => {
    if (!volteando) medir();
  }, [medir, modo, volteando, dispositivo]);

  // Las imágenes al cargar y el ancho de la ventana cambian las posiciones. Nunca se mide a mitad del giro.
  const medirActual = useRef(medir);
  useEffect(() => {
    medirActual.current = medir;
  }, [medir]);
  useEffect(() => {
    const e = escena.current;
    if (!e) return;
    const ro = new ResizeObserver(() => {
      if (!girando.current) medirActual.current();
    });
    ro.observe(e);
    return () => ro.disconnect();
  }, []);

  // Al cambiar de computador a celular las notas se recogen, el correo cambia de ancho y vuelven a salir.
  function cambiarDispositivo(d: Dispositivo) {
    if (d === dispositivo) return;
    girando.current = true;
    setVolteando(true);
    setMostrar(false);
    setActivo(null);
    window.setTimeout(() => setDispositivo(d), RECOGER_MS);
    window.setTimeout(() => {
      girando.current = false;
      setVolteando(false);
    }, RECOGER_MS + 450);
  }

  // Tres tiempos: las notas se recogen hacia el correo, la tarjeta gira y las notas nuevas salen de ella.
  function voltear() {
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nueva: Cara = esAntes ? "despues" : "antes";
    const recoger = reducir ? 0 : RECOGER_MS;
    const giro = reducir ? 200 : VOLTEO_MS;
    girando.current = true;
    setVolteando(true);
    setMostrar(false);
    setActivo(null);
    window.setTimeout(() => {
      setCara(nueva);
      if (!reducir) {
        tarjeta.current?.animate([{ transform: "scale(1)" }, { transform: "scale(0.92)", offset: 0.45 }, { transform: "scale(1)" }], { duration: VOLTEO_MS, easing: GIRO });
      }
    }, recoger);
    window.setTimeout(() => {
      girando.current = false;
      setCaraNotas(nueva);
      setVolteando(false);
    }, recoger + giro);
  }

  const color = caraNotas === "antes" ? "var(--error)" : "var(--exito)";

  return (
    <Activo.Provider value={activo}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.025em]">{esAntes ? "8 fallas en su correo" : "Así lo mejoraríamos"}</h1>
          <p className="mt-1 text-[14px] text-texto-secundario">
            {esAntes ? "Mes del ahorro, enviado el lunes 9 de noviembre" : "El mismo correo del Mes del ahorro, con las 8 fallas resueltas"}
          </p>
        </div>
        {/* Una sola barra con dos grupos: tamaño de pantalla e imágenes. */}
        <div className="flex items-center rounded-full bg-fondo-apagado p-1">
          <Opciones valor={dispositivo} onCambio={cambiarDispositivo} opciones={[["pc", "Computador"], ["movil", "Celular"]]} />
          <span aria-hidden className="mx-1.5 h-5 w-px bg-borde" />
          <Opciones valor={modo} onCambio={setModo} opciones={[["con", "Con imágenes"], ["sin", "Sin imágenes"]]} />
        </div>
      </div>

      <div className="mb-10 flex justify-center">
        <button
          type="button"
          onClick={voltear}
          disabled={volteando}
          className={
            "rounded-full px-7 py-3 text-[15px] font-bold outline-none transition-[transform,background-color,box-shadow] duration-150 ease-out focus-visible:shadow-[var(--anillo-foco)] active:scale-[0.97] " +
            (esAntes ? "bg-marca text-white shadow-[0_8px_24px_-8px_rgb(17_27_255/0.6)] hover:bg-marca-hover" : "bg-fondo text-texto ring-1 ring-borde hover:bg-fondo-apagado")
          }
        >
          {esAntes ? "Ver después" : "Ver antes"}
        </button>
      </div>

      <div ref={escena} className="relative lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-16">
        <Columna lado="izq" cara={caraNotas} tops={tops} mostrar={mostrar} onActivo={setActivo} notas={notas} />

        <div
          ref={tarjeta}
          style={{ width: ANCHO[dispositivo] }}
          className="mx-auto max-w-full transition-[width] duration-[450ms] ease-[cubic-bezier(0.77,0,0.175,1)] [perspective:2400px] motion-reduce:transition-none"
        >
          <div
            style={{ transitionTimingFunction: GIRO, transitionDuration: `${VOLTEO_MS}ms` }}
            className={"grid transition-transform [transform-style:preserve-3d] motion-reduce:transition-none " + (esAntes ? "" : "[transform:rotateY(180deg)] motion-reduce:[transform:none]")}
          >
            <div data-cara="antes" aria-hidden={!esAntes} className={CARA + MARCO[dispositivo] + (esAntes ? "" : OCULTA)}>
              <Antes sin={sin} />
            </div>
            <div data-cara="despues" aria-hidden={esAntes} className={CARA + MARCO[dispositivo] + "[transform:rotateY(180deg)] motion-reduce:[transform:none]" + (esAntes ? OCULTA : "")}>
              <Despues sin={sin} />
            </div>
          </div>
        </div>

        <Columna lado="der" cara={caraNotas} tops={tops} mostrar={mostrar} onActivo={setActivo} notas={notas} />

        <svg aria-hidden className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block">
          {lineas.map((l) => {
            const on = activo === l.id;
            const retraso = mostrar ? 260 + l.orden * 90 : 0;
            return (
              <g key={l.id} style={{ opacity: activo && !on ? 0.2 : 1, transition: "opacity 200ms ease" }}>
                <path
                  d={l.d}
                  pathLength={1}
                  fill="none"
                  stroke={color}
                  strokeWidth={on ? 2 : 1.5}
                  strokeLinecap="round"
                  strokeDasharray={1}
                  strokeDashoffset={mostrar ? 0 : 1}
                  style={{ transition: `stroke-dashoffset ${mostrar ? 750 : 240}ms ${SALIDA} ${retraso}ms, stroke-width 200ms ease` }}
                />
                <circle
                  cx={l.cx}
                  cy={l.cy}
                  r={3}
                  fill={color}
                  style={{ opacity: mostrar ? 1 : 0, transition: `opacity 200ms ease ${mostrar ? retraso : 0}ms` }}
                />
              </g>
            );
          })}
        </svg>

        {/* En pantallas chicas las notas van debajo del correo. */}
        <ol className="mt-8 flex flex-col gap-3 lg:hidden">
          {PUNTOS.map((p) => (
            <li key={p.id}>
              <Nota p={p} cara={caraNotas} />
            </li>
          ))}
        </ol>
      </div>
    </Activo.Provider>
  );
}

function Opciones<T extends string>({ valor, opciones, onCambio }: { valor: T; opciones: [T, string][]; onCambio: (v: T) => void }) {
  return (
    <div role="radiogroup" className="flex">
      {opciones.map(([k, t]) => (
        <button
          key={k}
          type="button"
          role="radio"
          aria-checked={valor === k}
          onClick={() => onCambio(k)}
          className={
            "rounded-full px-4 py-1.5 text-[13px] font-semibold outline-none transition-[background-color,color,box-shadow] duration-150 ease-out focus-visible:shadow-[var(--anillo-foco)] " +
            (valor === k ? "bg-fondo text-texto shadow-xs" : "text-tenue hover:text-texto")
          }
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function Columna({
  lado,
  cara,
  tops,
  mostrar,
  onActivo,
  notas,
}: {
  lado: Lado;
  cara: Cara;
  tops: Record<string, number>;
  mostrar: boolean;
  onActivo: (id: string | null) => void;
  notas: React.RefObject<Record<string, HTMLElement | null>>;
}) {
  const activo = useContext(Activo);
  // Al ocultarse se recogen hacia el correo; al aparecer salen de él, una tras otra.
  const hacia = lado === "izq" ? "translate-x-6" : "-translate-x-6";
  return (
    <div className="relative hidden lg:block">
      {PUNTOS.filter((p) => p.lado === lado).map((p, i) => {
        const listo = mostrar && tops[p.id] !== undefined;
        const atenuada = activo !== null && activo !== p.id;
        return (
          <div
            key={p.id}
            ref={(el) => {
              notas.current[p.id] = el;
            }}
            onMouseEnter={() => onActivo(p.id)}
            onMouseLeave={() => onActivo(null)}
            style={{
              top: tops[p.id] ?? 0,
              transitionTimingFunction: SALIDA,
              transitionDuration: listo ? "560ms" : "240ms",
              transitionDelay: listo ? (activo === null ? `${80 + i * 90}ms` : "0ms") : `${i * 35}ms`,
            }}
            className={
              "absolute inset-x-0 transition-[opacity,translate,filter,scale] " +
              (listo ? "translate-x-0 scale-100 blur-0 " + (atenuada ? "opacity-45" : "opacity-100") : `pointer-events-none scale-[0.94] opacity-0 blur-[8px] ${hacia}`)
            }
          >
            <Nota p={p} cara={cara} />
          </div>
        );
      })}
    </div>
  );
}

function Nota({ p, cara }: { p: Punto; cara: Cara }) {
  const antes = cara === "antes";
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-fondo/90 p-5 shadow-[0_1px_2px_rgb(16_24_40/0.05),0_16px_40px_-16px_rgb(16_24_40/0.16)] ring-1 ring-black/[0.05] backdrop-blur-md transition-shadow duration-200 hover:shadow-[0_1px_2px_rgb(16_24_40/0.05),0_24px_48px_-16px_rgb(16_24_40/0.24)]">
      <h3 className="text-[15px] font-bold leading-snug tracking-[-0.012em] text-texto">{antes ? p.error.titulo : p.solucion.titulo}</h3>
      <p className="mt-1.5 text-[13.5px] leading-[1.55] text-texto-secundario">{antes ? p.error.texto : p.solucion.texto}</p>
    </div>
  );
}

// Punto del correo al que apunta una nota: un punto con halo, en el borde del lado de su nota.
function Ancla({ id, tono, className = "top-3" }: { id: string; tono: "error" | "exito"; className?: string }) {
  const activo = useContext(Activo);
  const p = PUNTO[id];
  const on = activo === id;
  return (
    <span data-ancla={id} className={"pointer-events-none absolute z-10 flex h-5 w-5 items-center justify-center " + (p.lado === "izq" ? "left-3 " : "right-3 ") + className}>
      <span
        className={
          "absolute inset-0 rounded-full transition-transform duration-300 ease-out " + (tono === "error" ? "bg-error/25 " : "bg-exito/30 ") + (on ? "scale-[1.8]" : "scale-100")
        }
      />
      <span className={"relative h-2.5 w-2.5 rounded-full ring-2 ring-white " + (tono === "error" ? "bg-error" : "bg-exito")} />
    </span>
  );
}

// Cómo se ve en la bandeja: remitente, asunto y vista previa.
function Bandeja({ asunto, pre, children }: { asunto: string; pre: string; children?: ReactNode }) {
  return (
    <div className="relative border-b border-linea bg-fondo py-4 pl-12 pr-5">
      <p className="text-[12.5px] font-semibold text-tenue">Equipo MejorCDT</p>
      <p className="mt-0.5 text-[15px] font-bold leading-snug">{asunto}</p>
      <p className="mt-0.5 truncate text-[13px] text-texto-secundario">{pre}</p>
      {children}
    </div>
  );
}

// Imagen del correo original. Bloqueada se ve como en Outlook: un hueco sin texto, porque su alt está vacío.
function Imagen({ src, ancho, alto, sin }: { src: string; ancho: number; alto: number; sin: boolean }) {
  if (sin) {
    return (
      <div style={{ aspectRatio: `${ancho} / ${alto}` }} className="flex w-full items-center justify-center border border-dashed border-borde bg-fondo-apagado">
        <ImageOff className="h-6 w-6 text-borde-fuerte" />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={ancho} height={alto} className="block h-auto w-full" />;
}

function Antes({ sin }: { sin: boolean }) {
  const t = "error" as const;
  return (
    <div className="bg-[#f8f8ff] text-[#101b24]">
      <Bandeja asunto="¿Ya participas por $1.000.000 en CDT?" pre="CDT con tasas de hasta 13.10 % E.A. y una historia que puede ganar">
        <Ancla id="asunto" tono={t} className="top-4" />
      </Bandeja>

      <div className="relative py-[5px]">
        <Imagen src="/mejorcdt/correo/cabecera.png" ancho={878} alto={1003} sin={sin} />
        <Ancla id="cabecera" tono={t} className="top-6" />
      </div>

      <div className="relative px-12 py-[10px]">
        <h3 className="text-center text-[22px] font-bold leading-[1.2] text-[#2e3c47]">
          Cierra el año con tu ahorro en orden ( y con opción a <span className="text-marca">$1.000.000 en CDT</span> )
        </h3>
        <Ancla id="titulo" tono={t} className="top-2" />
      </div>

      <div className="relative flex flex-col gap-[17px] px-10 py-4 text-[14px] leading-[1.2]">
        <p>Se acerca el fin de año y, con él, la prima, los regalos, los viajes y los gastos de todos los diciembres. La plata que queda a la vista se va rápido.</p>
        <p>Este es el momento del año para organizarla y cerrar bien.</p>
        <p>
          Y esta semana tienes un incentivo extra: cuéntanos para qué ahorras y participa por un <strong>CDT de $1.000.000</strong>. Porque todo ahorro tiene una meta, y queremos conocer la tuya.
        </p>
        <Ancla id="cuerpo" tono={t} className="top-3" />
      </div>

      <div className="flex flex-col gap-2 px-[25px] pb-[25px] pt-3">
        <div className="relative">
          <Imagen src="/mejorcdt/correo/medio.png" ancho={674} alto={464} sin={sin} />
          <Ancla id="pasos" tono={t} className="top-[46%] -left-2.5!" />
        </div>
        <div className="relative px-8 py-2">
          <p className="text-center text-[14px] leading-[1.2]">
            <strong>Que no se te pasen los días.</strong> Cada semana elegimos una historia ganadora, y todavía quedan dos por elegir. Mañana domingo cierra la semana 2.
          </p>
          <Ancla id="fecha" tono={t} className="top-3 right-0!" />
        </div>
        <div className="relative">
          <Imagen src="/mejorcdt/correo/final.png" ancho={750} alto={89} sin={sin} />
          <Ancla id="boton" tono={t} className="top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-[#f3f3ff] px-6 py-4 text-center text-[14px] leading-[1.2]">
        <p>
          Cada persona participa una sola vez. <em>Aplican términos y condiciones.</em>
        </p>
        <p className="font-bold">El equipo de MejorCDT</p>
      </div>
      <div className="relative bg-[#dbe1ff] px-6 py-5 text-center">
        <p className="text-[16px] text-texto">Síguenos en nuestras redes sociales</p>
        <p className="mt-3 text-[18px] font-bold text-marca">@MejorCDT</p>
        <Ancla id="codigo" tono={t} className="top-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
}

// Lo que el motor sabe de esta persona: tiene la app, no ha abierto CDT, y el correo sale el jueves 12.
const PASOS = [
  { texto: "Bajaste la app", estado: "hecho" },
  { texto: "Abre un CDT desde $250.000", estado: "ahora" },
  { texto: "Cuéntanos para qué ahorras", estado: "luego" },
] as const;

// Fondo medido en su imagen original: casi negro arriba, violeta vivo encima del cerdito y bordes más oscuros.
const FONDO_ORIGINAL = [
  "linear-gradient(90deg, rgb(0 0 30 / 0.28), transparent 22%, transparent 78%, rgb(0 0 30 / 0.28))",
  "radial-gradient(75% 40% at 50% 60%, #1f06ac 0%, rgb(31 6 172 / 0) 100%)",
  "linear-gradient(180deg, #000932 0%, #0b0655 24%, #12067a 52%, #150474 100%)",
].join(", ");

// Volumen de la cifra: capas de verde cada vez más oscuro, como las letras 3D de su campaña.
const VOLUMEN = "0 1px 0 #2fd98a, 0 2px 0 #1fbf74, 0 3px 0 #17a865, 0 4px 0 #12925a, 0 5px 0 #0d7a4a, 0 14px 22px rgb(0 0 0 / 0.35)";

// Etiqueta "Mi ahorro se llama…", la pieza central de su concurso. En correos angostos se achica hacia el borde.
function Etiqueta({ nombre, fondo, className }: { nombre: string; fondo?: boolean; className: string }) {
  return (
    <span
      aria-hidden
      className={
        "pointer-events-none absolute w-[116px] overflow-hidden rounded-[10px] bg-white shadow-[0_10px_24px_-8px_rgb(0_0_0/0.5)] ring-2 ring-[#5b86ff] @max-[460px]:scale-[0.72] " +
        (fondo ? "opacity-55 blur-[1.5px] @max-[460px]:scale-[0.55] scale-[0.8] " : "") +
        className
      }
    >
      <span className="block bg-[#2f6bff] px-2 py-[3px] text-[8.5px] font-bold text-white">Mi ahorro se llama</span>
      <span className="block px-2 pb-1.5 pt-1 font-[family-name:var(--font-mano)] text-[17px] font-semibold leading-tight text-[#1b2a6b]">{nombre}</span>
    </span>
  );
}

function Despues({ sin }: { sin: boolean }) {
  const t = "exito" as const;
  return (
    <div lang="es" className="bg-fondo text-texto">
      <Bandeja asunto="Andrés, ¿para qué estás ahorrando?" pre="Es la última semana. El concurso cierra el domingo 15.">
        <Ancla id="asunto" tono={t} className="top-4" />
      </Bandeja>

      <div className="flex items-center justify-between px-7 pb-4 pt-6">
        {sin ? (
          <span className="text-[15px] font-extrabold tracking-[-0.02em] text-marca">MejorCDT</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/mejorcdt/logo.svg" alt="MejorCDT" width={182} height={50} className="-ml-2 h-7 w-auto" />
        )}
        <span className="text-[12.5px] font-semibold text-tenue">Mes del ahorro</span>
      </div>

      {/* Cabecera: el texto va en HTML; el cerdito es la única imagen y se funde con el fondo. */}
      <div className="px-4">
        <div
          className="@container relative overflow-hidden rounded-[26px] text-white"
          style={{ background: FONDO_ORIGINAL }}
        >
          {/* Etiquetas del concurso. Las del fondo, más pequeñas y desenfocadas, dan profundidad. */}
          <Etiqueta nombre="Mi casa propia" className="right-[-18px] top-[18px] origin-right rotate-[8deg] @max-[460px]:right-[-6px] @max-[460px]:top-[12px]" />
          <Etiqueta nombre="Viaje a Europa" className="left-[-18px] top-[104px] origin-left -rotate-[9deg] @max-[460px]:left-[-6px] @max-[460px]:top-[158px]" />
          <Etiqueta nombre="La maestría" fondo className="left-[-22px] top-[236px] origin-left rotate-[6deg] @max-[460px]:hidden" />
          <Etiqueta nombre="Mi carro" fondo className="right-[-26px] top-[214px] origin-right -rotate-[7deg] @max-[460px]:hidden" />

          <div className="relative px-7 pt-8 text-center">
            <p className="inline-flex items-center gap-2 text-[12px] font-semibold text-white/75">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#5cf2a6] opacity-70 motion-reduce:hidden" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-[#5cf2a6]" />
              </span>
              Es la última semana del concurso
            </p>
            <h1 className="relative mx-auto mt-4 max-w-[12ch] text-[30px] font-extrabold leading-[1.06] tracking-[-0.035em] [text-shadow:0_2px_18px_rgb(20_10_120/0.55)]">
              Andrés, ¿cómo se llama tu ahorro?
            </h1>
            <Ancla id="titulo" tono={t} className="top-[78px] left-2!" />
            <div className="relative mx-auto mt-6 inline-block">
              <p className="relative text-[52px] @max-[460px]:text-[40px] font-extrabold leading-none tracking-[-0.05em] text-[#6dffb4]" style={{ textShadow: VOLUMEN }}>
                $1.000.000
              </p>
            </div>
            <p className="mx-auto mt-4 max-w-[26ch] text-[14px] font-medium leading-[1.5] text-white/80">en un CDT para la historia que más nos guste esta semana</p>
          </div>

          <div className="relative mt-5 flex justify-center px-4">
            <div className="flex items-stretch overflow-hidden whitespace-nowrap rounded-2xl text-[12.5px] font-semibold shadow-[0_10px_24px_-10px_rgb(0_0_0/0.5)] ring-1 ring-white/15">
              <span className="flex items-baseline gap-1.5 bg-white px-3.5 py-2 text-marca">
                Te quedan <span className="text-[18px] font-extrabold tracking-[-0.02em]">4</span> días
              </span>
              <span className="flex items-center bg-white/10 px-3.5 text-white backdrop-blur-sm">Cierra el domingo 15</span>
            </div>
            <Ancla id="fecha" tono={t} className="top-1/2 -translate-y-1/2" />
          </div>

          <div className="relative mt-4">
            {sin ? (
              // Así se ve con imágenes bloqueadas: el texto alternativo con estilo, sobre el mismo fondo.
              <div className="flex h-16 items-center justify-center px-8 text-center text-[13px] italic text-white/55">Alcancía de MejorCDT llena de billetes</div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/mejorcdt/correo/cerdito.jpg"
                alt="Alcancía de MejorCDT llena de billetes"
                width={640}
                height={373}
                className="block h-auto w-full [mask-image:linear-gradient(to_bottom,transparent,black_22%)]"
              />
            )}
            <Ancla id="cabecera" tono={t} className="top-6" />
          </div>
        </div>
      </div>

      <div className="relative px-7 pt-7">
        <p className="text-[16px] leading-[1.5] text-texto-secundario">
          Ya tienes la app. Para participar, <span className="font-semibold text-texto">abre tu CDT y cuéntanos tu historia.</span>
        </p>
        <Ancla id="cuerpo" tono={t} className="top-7 right-1!" />
      </div>

      {/* Avance: lo hecho, lo que sigue y lo que falta. */}
      <div className="@container relative px-7 pt-5">
        <ol className="grid gap-2 @[440px]:grid-cols-3">
          {PASOS.map((p, i) => (
            <li
              key={p.texto}
              className={
                "flex items-center gap-3 rounded-2xl px-4 py-3 @[440px]:flex-col @[440px]:items-start @[440px]:p-3.5 " +
                (p.estado === "ahora" ? "bg-marca text-white shadow-[0_10px_24px_-10px_rgb(17_27_255/0.7)]" : p.estado === "hecho" ? "bg-exito-fondo text-exito-texto" : "bg-fondo-apagado/70 text-tenue")
              }
            >
              <span
                className={
                  "flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold " +
                  (p.estado === "ahora" ? "bg-white text-marca" : p.estado === "hecho" ? "bg-exito text-white" : "bg-fondo text-tenue ring-1 ring-borde")
                }
              >
                {p.estado === "hecho" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className="text-[13px] font-bold leading-tight">{p.texto}</span>
            </li>
          ))}
        </ol>
        <Ancla id="pasos" tono={t} className="top-1/2 left-1!" />
      </div>

      {/* Lo que gana con el paso que falta, en pesos. */}
      <div className="px-7 pt-4">
        {/* Simulación, no promesa: la tasa es de referencia y el valor va antes de retención. Se acomoda al ancho del correo. */}
        <div className="@container rounded-2xl bg-marca-fondo p-5 ring-1 ring-marca-suave">
          <div className="flex flex-col gap-3 @[420px]:flex-row @[420px]:items-end @[420px]:justify-between">
            <div>
              <p className="text-[12.5px] font-semibold text-tenue">Un ejemplo</p>
              <p className="mt-1 text-[15px] font-semibold leading-snug text-texto">Un CDT de $250.000 a un año, al 13,10 % E.A.</p>
            </div>
            <div className="@[420px]:text-right">
              <p className="text-[12.5px] font-semibold text-tenue">te daría cerca de</p>
              <p className="mt-0.5 text-[26px] font-extrabold leading-none tracking-[-0.03em] text-texto">$32.750</p>
            </div>
          </div>
          <p className="mt-4 border-t border-marca-suave pt-3 text-[11.5px] leading-[1.5] text-tenue">
            Es un ejemplo, no una promesa. La tasa es la del 12 de noviembre y cambia según el banco y el plazo.
          </p>
        </div>
      </div>

      <div className="relative px-7 pb-2 pt-6">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          tabIndex={-1}
          className="flex w-full items-center justify-center rounded-2xl bg-marca px-6 py-[18px] text-[16px] font-bold text-white transition-transform duration-150 ease-out active:scale-[0.98]"
        >
          Abrir mi CDT
        </a>
        <p className="mt-3 text-center text-[13px] text-tenue">
          ¿Ya lo abriste? <span className="font-semibold text-marca underline decoration-marca-suave underline-offset-2">Cuéntanos tu historia</span>
        </p>
        <Ancla id="boton" tono={t} className="top-9 left-1!" />
      </div>

      <div className="relative mt-6 border-t border-linea px-7 py-5 text-center text-[12px] leading-[1.6] text-tenue">
        <p>Elegimos una historia cada semana. Aplican términos y condiciones.</p>
        <p className="mt-1">
          El equipo de MejorCDT · <span className="underline">Darme de baja</span> · <span className="underline">Preferencias</span>
        </p>
        <Ancla id="codigo" tono={t} className="top-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
}
