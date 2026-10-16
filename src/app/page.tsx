import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 bg-lienzo p-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mejorcdt/logo.svg" alt="MejorCDT" width={182} height={50} className="h-10 w-auto" />
      <h1 className="text-[2rem] font-bold leading-tight tracking-[-0.02em]">Motor de activación</h1>
      <Link
        href="/panel"
        className="inline-flex h-11 items-center rounded-full bg-marca px-6 text-[15px] font-bold text-white transition-all duration-[240ms] ease-mcdt hover:-translate-y-0.5 hover:bg-marca-hover hover:shadow-md"
      >
        Ver el panel
      </Link>
      <p className="text-[13px] text-tenue">Prototipo independiente de Andrés Olaya con datos simulados. No es un sitio oficial de MejorCDT.</p>
    </main>
  );
}
