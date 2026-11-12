// Errores del correo "Mes del ahorro" (enviado el lunes 9 de noviembre de 2026) y su solución.
// Cada punto se ancla a una parte del correo; "lado" dice en qué columna va su nota.

export type Lado = "izq" | "der";

export type Punto = {
  id: string;
  n: number;
  lado: Lado;
  error: { titulo: string; texto: string };
  solucion: { titulo: string; texto: string };
};

export const PUNTOS: Punto[] = [
  {
    id: "asunto",
    n: 1,
    lado: "izq",
    error: {
      titulo: "Promete una tasa que nunca aparece",
      texto: "En la bandeja dice «tasas de hasta 13,10 %». Adentro no hay ninguna tasa, y quien abrió por eso se va sin encontrarla.",
    },
    solucion: { titulo: "Cumple lo que promete", texto: "Asunto con su nombre y sin prometer premios ni rentabilidad. La tasa aparece adentro como simulación." },
  },
  {
    id: "cabecera",
    n: 2,
    lado: "der",
    error: {
      titulo: "Una imagen gigante abre el correo",
      texto: "En el celular, la primera pantalla es solo esta imagen. Pesa 674 KB y tarda en cargar con datos móviles.",
    },
    solucion: { titulo: "Una sola imagen, liviana", texto: "El cerdito pesa 32 KB. Si el correo no lo carga, queda su descripción sobre el mismo fondo y nada se descuadra." },
  },
  {
    id: "titulo",
    n: 3,
    lado: "izq",
    error: {
      titulo: "Le habla igual a todo el mundo",
      texto: "No usa el nombre ni sabe en qué va cada persona. A quien ya abrió su CDT le pide lo mismo que a quien nunca ha entrado.",
    },
    solucion: { titulo: "Le habla a Andrés", texto: "Le pregunta por su nombre para qué ahorra, que es justo lo que pide el concurso." },
  },
  {
    id: "cuerpo",
    n: 4,
    lado: "der",
    error: {
      titulo: "Letra pequeña y apretada",
      texto: "Tres párrafos largos en letra chica antes de llegar a lo importante. En el celular cuesta leerlos.",
    },
    solucion: { titulo: "Una frase en lugar de tres párrafos", texto: "Letra más grande y directo a lo que falta." },
  },
  {
    id: "pasos",
    n: 5,
    lado: "izq",
    error: {
      titulo: "Lo más importante está en una foto",
      texto: "El requisito de abrir un CDT desde $250.000 solo está dentro de esta imagen. Si el correo no la carga, el paso desaparece.",
    },
    solucion: { titulo: "Sabe en qué paso va", texto: "Lo hecho en verde, lo que sigue resaltado y lo que falta en gris. Todo en texto." },
  },
  {
    id: "fecha",
    n: 6,
    lado: "der",
    error: {
      titulo: "La fecha ya pasó",
      texto: "Llegó el lunes y dice «mañana domingo cierra la semana 2». Esa semana ya había cerrado, y quien lo nota deja de creer en el plazo.",
    },
    solucion: { titulo: "La fecha siempre es correcta", texto: "Se calcula el día del envío: «4 días para cerrar»." },
  },
  {
    id: "boton",
    n: 7,
    lado: "izq",
    error: {
      titulo: "El botón también es una foto",
      texto: "Outlook y muchos correos de empresa no cargan imágenes. Ahí no hay dónde hacer clic.",
    },
    solucion: { titulo: "Un botón que siempre aparece", texto: "Está hecho en texto y se ve con o sin imágenes." },
  },
  {
    id: "codigo",
    n: 8,
    lado: "der",
    error: {
      titulo: "Una persona ciega no se entera de nada",
      texto: "Las imágenes no tienen descripción y el correo no dice en qué idioma está, así que el lector de pantalla no tiene qué leer.",
    },
    solucion: { titulo: "Cualquiera lo puede leer", texto: "Cada imagen tiene descripción y el correo indica que está en español." },
  },
];

export const PUNTO = Object.fromEntries(PUNTOS.map((p) => [p.id, p])) as Record<string, Punto>;
