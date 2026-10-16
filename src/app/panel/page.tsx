import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { EsqueletoPanel, Panel } from "@/components/panel/Panel";
import { VISTAS, type Vista } from "@/lib/vistas";

export const metadata: Metadata = {
  title: "Motor de activación · Prototipo",
};

// La hora de lectura viaja con la página, para que servidor y navegador calculen igual "Hace 2 h".
async function leerHora() {
  await connection();
  return Date.now();
}

// ?vista=campanas abre directo en esa vista: sirve para enlazar una parte del panel.
async function Datos({ searchParams }: { searchParams: PageProps<"/panel">["searchParams"] }) {
  const { vista } = await searchParams;
  const ahora = await leerHora();
  const inicial = VISTAS.some(([k]) => k === vista) ? (vista as Vista) : "resumen";
  return <Panel ahora={ahora} inicial={inicial} />;
}

export default function PaginaPanel({ searchParams }: PageProps<"/panel">) {
  return (
    <Suspense fallback={<EsqueletoPanel />}>
      <Datos searchParams={searchParams} />
    </Suspense>
  );
}
