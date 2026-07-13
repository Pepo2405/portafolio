# Rediseño de la sección de Proyectos — Diseño

**Fecha:** 2026-07-13
**Proyecto:** portafolio (Next.js 13 pages router, TypeScript, Tailwind, GSAP, Howler)
**Commit base:** 77c0cc4

## Objetivo

La sección de Proyectos hoy muestra 8 proyectos de 2022–2023 (calculadora, to-do, pokédex…) como un grid plano de íconos, todos al mismo nivel. Esto subvende el nivel técnico actual del autor.

Rediseñar la ventana "Proyectos" (estética Windows XP) para que tenga **dos niveles**: proyectos **destacados** con tarjeta rica (screenshot + descripción + stack) arriba, y el **grid de íconos** clásico abajo. Meta doble: impresionar técnicamente **sin perder** la vibra escritorio-XP.

Layout elegido: **A — dos niveles** (destacados + grid), en una sola ventana `DraggableWin`.

## Set de contenido final

**Destacados** (`featured: true`, con screenshot + descripción + stack):
1. **Gym Admin** — `https://gym-admin.com.ar` — "SaaS de gestión de gimnasios con app móvil y lector de huella." — stack sugerido: Next.js, Node, Prisma (ajustar al real).
2. **Bonitas Ayelen** — `https://bonitasayelen.com.ar/` — "Sitio real de cliente en producción." — stack: a confirmar.

**Grid** (resto, formato actual de íconos):
- YT Amogus — `https://yt.pepo.ar/`
- Dólar blue — `https://dolar.pepo.ar/`
- Video to Mp3 — `https://mp3.pepo.ar/`
- Pokédex — `https://pokedex-app-six-zeta.vercel.app/`
- Calculadora — `https://calculadora-two-xi.vercel.app/`
- Cartas Clima — `https://cartitasclima.vercel.app/`
- Lista de tareas — `https://lista-de-tareas-rho.vercel.app/`
- **Películas-React** (NUEVO) — `https://peliculas-react-blond.vercel.app/`
- **Mochify** (NUEVO) — `https://mochify.vercel.app/`

> Nota: Bonitas Ayelen migra del grid actual a destacado. Se remueve del grid su entrada duplicada.

## Modelo de datos

`src/lists/proyects.json` — se extiende cada entrada con 3 campos **opcionales** (los proyectos existentes siguen válidos sin cambios):

```json
{
  "title": "Gym Admin",
  "url": "https://gym-admin.com.ar",
  "type": "link",
  "icon": "/static/screenshots/gym-admin.webp",
  "featured": true,
  "description": "SaaS de gestión de gimnasios con app móvil y lector de huella.",
  "stack": ["Next.js", "Node", "Prisma"]
}
```

- `featured?: boolean` — marca destacado. Ausente/false → va al grid.
- `description?: string` — texto corto (1 línea) para la tarjeta destacada.
- `stack?: string[]` — chips de tecnología.

Interfaz TypeScript (reemplaza el `any` actual en la sección):

```ts
interface Project {
  title: string;
  url: string;
  type?: string;
  icon: string;
  featured?: boolean;
  description?: string;
  stack?: string[];
}
```

## Componentes

Cambios acotados a `src/components/Windows/WindowsContainer.tsx` (la ventana "Proyectos"):

1. Tipar `proyects` como `Project[]` y derivar:
   - `const featured = proyects.filter((p) => p.featured);`
   - `const rest = proyects.filter((p) => !p.featured);`
2. Nuevo componente **`FeaturedCard`** (mismo archivo o `src/components/Windows/FeaturedCard.tsx`):
   - Layout horizontal: thumbnail (`icon`) a la izquierda; a la derecha título, `description` y chips de `stack`.
   - Envuelto en `<a href={url} target="_blank" rel="noreferrer">`.
3. Reutilizar el `ProjectItem` existente para el grid de `rest`.
4. Estructura del body de la ventana "Proyectos":
   ```
   ★ Destacados        (label)
   [FeaturedCard] [FeaturedCard]
   Más proyectos       (label)
   [grid de ProjectItem]
   ```
   Todo dentro del `<main>` scrolleable actual (`overflow-y-scroll`).

Sin cambios en el mecanismo de ventanas (`useWindow`, `DraggableWin`, contexto), ni en las ventanas Sociales/Tecnologías.

## Estilos

- Paleta y utilidades existentes: header `#045aa5`, hovers `hover:bg-cyan-200/90` / `hover:bg-blue-500/50`, texto negro sobre fondo blanco.
- **FeaturedCard:** borde `border-slate-300`, fondo `bg-slate-50`, `rounded-md`, padding, hover suave. Thumbnail con `object-cover` y `rounded`.
- **Chips (stack):** `bg-indigo-100 text-indigo-800 rounded-full px-2 py-0.5 text-[10px]`.
- **Labels de sección:** pequeñas, mayúsculas, color `#045aa5`, con borde inferior sutil.
- **Responsive:** destacados full-width apilados en mobile (`flex-col md:flex-row` para el contenedor de cards); grid mantiene `flex-wrap`.

## Assets

- **Screenshots destacados** → `/public/static/screenshots/gym-admin.webp` y `/public/static/screenshots/bonitas.webp`. Capturar de los sitios en vivo (~800px de ancho), optimizar a `.webp`. El autor puede proveerlas o capturarlas asistido.
- **Íconos nuevos del grid** → `/public/static/icons/peliculas.webp` y verificar el de Mochify. Screenshot o favicon del sitio, optimizado.
- Si un screenshot destacado no está disponible al implementar: **STOP y avisar** — no inventar imagen ni dejar `src` roto.

## Fuera de alcance

- Ventanas Sociales y Tecnologías (aunque el patrón `FeaturedCard` podría reutilizarse luego).
- Hallazgos del audit previo (código muerto, upgrade de Next 13→14/15, deps sin usar, SEO/meta). Son trabajos separados.
- Cambios al mecanismo de drag/resize/minimize de ventanas.

## Verificación

No existe infraestructura de tests en el repo. Gates:

1. `npm run build` termina sin errores.
2. `npm run lint` sin errores nuevos.
3. Chequeo visual manual (`npm run dev`):
   - La ventana "Proyectos" muestra la sección "★ Destacados" con 2 tarjetas (Gym Admin, Bonitas) con screenshot, descripción y chips de stack.
   - La sección "Más proyectos" muestra el grid con los 9 restantes (incluye Películas-React y Mochify).
   - Cada tarjeta y cada ícono abren su URL en pestaña nueva (`target="_blank"`).
   - En viewport mobile (~375px) las cards se apilan full-width y nada desborda horizontalmente.

## Notas de mantenimiento

- Agregar un proyecto = una entrada en `proyects.json`. Con `featured: true` + `description` + `stack` va a destacados; sin eso, al grid.
- El `TaskBar` también consume `proyects.json` (`src/components/TaskBar.tsx`) para las ventanas minimizadas — verificar que los campos nuevos no rompan ese `map` (son opcionales, no debería, pero revisar en el diff).
