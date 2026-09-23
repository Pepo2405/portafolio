/// <reference types="vite/client" />

interface Project {
  /** Clave estable de ventana y de slug. Marca/proyecto: no se traduce. */
  title: string;
  /** Título en inglés para <title>/JSON-LD. Si falta, se usa `title`. */
  titleEn?: string;
  url?: string;
  type?: string;
  icon: string;
  featured?: boolean;
  description?: Bi;
  /** Bullets que se muestran en la ficha del proyecto (ventana propia). */
  details?: Bi[];
  /** Etiqueta para los proyectos que no tienen demo pública. */
  badge?: Bi;
  /**
   * Qué decir cuando no hay demo pública. Por defecto es genérico y neutro;
   * los proyectos de un empleador o cliente conviene redactarlos aparte para
   * no ofrecer detalles internos que no son tuyos.
   */
  noDemoNote?: Bi;
  stack?: string[];
}

/** Texto bilingüe: toda la copy traducible vive en pares es/en. */
type Bi = { es: string; en: string };

/** Idioma del sitio. Se determina por el prefijo /en/ de la URL. */
type Locale = "es" | "en";
