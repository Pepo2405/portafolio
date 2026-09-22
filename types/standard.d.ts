interface Project {
  title: string;
  url?: string;
  type?: string;
  icon: string;
  featured?: boolean;
  description?: string;
  /** Bullets que se muestran en la ficha del proyecto (ventana propia). */
  details?: string[];
  /** Etiqueta para los proyectos que no tienen demo pública. */
  badge?: string;
  /**
   * Qué decir cuando no hay demo pública. Por defecto es genérico y neutro;
   * los proyectos de un empleador o cliente conviene redactarlos aparte para
   * no ofrecer detalles internos que no son tuyos.
   */
  noDemoNote?: string;
  stack?: string[];
}
