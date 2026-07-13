# Rediseño Sección de Proyectos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganizar la ventana "Proyectos" del portfolio en dos niveles — tarjetas destacadas (screenshot + descripción + chips de stack) arriba y el grid de íconos clásico abajo — manteniendo la estética Windows XP.

**Architecture:** Cambio acotado al front. Se extiende `src/lists/proyects.json` con campos opcionales (`featured`, `description`, `stack`), se declara una interfaz global `Project`, y se refactoriza `src/components/Windows/WindowsContainer.tsx` para dividir los proyectos en destacados vs. resto, agregando un componente `FeaturedCard`. Sin cambios en el mecanismo de ventanas ni en las otras ventanas (Sociales, Tecnologías).

**Tech Stack:** Next.js 13 (pages router), React 18, TypeScript, TailwindCSS. Íconos vía CSS `background-image`. Sin librería de datos.

## Global Constraints

- **No hay framework de tests en el repo.** No agregar Jest/Vitest/RTL (fuera de alcance). La verificación de cada task es: `npm run build` (o `npx next build`) y `npm run lint` sin errores nuevos, más chequeo visual con `npm run dev` cuando aplique.
- **Gestor de paquetes:** hay `package-lock.json` y `pnpm-lock.yaml`. Usar `npm` (comandos abajo asumen npm). No commitear cambios a ambos lockfiles.
- **Convención de tipos:** los tipos globales se declaran en `types/standard.d.ts` sin `export` y se usan sin `import` (ver `Folder`). Seguir ese patrón.
- **Estilos:** usar solo utilidades Tailwind ya presentes en el repo y la paleta XP existente (`#045aa5`, hovers `hover:bg-cyan-200/90`). No agregar plugins de Tailwind ni config nueva.
- **Links externos:** siempre `target="_blank"` + `rel="noreferrer"`.
- **Commits:** el repo commitea en `master`. Antes del primer commit de este plan, crear un branch: `git checkout -b feat/seccion-proyectos`. No hacer push salvo que el usuario lo pida.
- **Rutas exactas** siempre. El código de cada step está completo — no hay placeholders.

---

## File Structure

- `types/standard.d.ts` — agregar interfaz global `Project` (MODIFY).
- `src/lists/proyects.json` — extender datos: nuevo destacado gym-admin, convertir Bonitas a destacado, sumar Películas-React y Mochify (MODIFY).
- `src/components/Windows/WindowsContainer.tsx` — dividir destacados/resto, nuevo `FeaturedCard`, secciones con label, ajustar `ProjectItem` para no spreadear campos nuevos al DOM (MODIFY).
- `public/static/screenshots/gym-admin.webp`, `public/static/screenshots/bonitas.webp` — screenshots destacados (CREATE).
- `public/static/icons/peliculas.webp` — ícono del grid nuevo, favicon del sitio (CREATE).

> **Decisión de ejecución (2026-07-13):** Mochify se descartó — su deploy `mochify.vercel.app` fue tomado por otro sitio. Solo Películas-React se suma al grid. Los íconos del grid usan favicon/logo (no screenshot). Los assets de Task 1 ya fueron generados por el controller; ver estado abajo.

Orden de dependencias: **Task 1 (assets)** y **Task 2 (datos+tipos)** son independientes entre sí; **Task 3 (UI)** depende de ambas.

---

### Task 1: Assets (screenshots + íconos)

Capturar y optimizar las imágenes que consumirá la UI. Se hace primero para que el chequeo visual de Task 3 muestre las imágenes reales.

**Files:**
- Create: `public/static/screenshots/gym-admin.webp`
- Create: `public/static/screenshots/bonitas.webp`
- Create: `public/static/icons/peliculas.webp`
- Create: `public/static/icons/mochify.webp`

**Interfaces:**
- Produces: 4 archivos de imagen en las rutas exactas de arriba. Task 3 (JSON en Task 2) referencia estas rutas.

- [ ] **Step 1: Crear el directorio de screenshots**

```bash
mkdir -p public/static/screenshots
```

- [ ] **Step 2: Obtener las 4 imágenes**

Capturas necesarias (viewport ~1280px, recortar a apaisado ~16:10):
- `gym-admin.webp` ← screenshot de `https://gym-admin.com.ar`
- `bonitas.webp` ← screenshot de `https://bonitasayelen.com.ar/`
- `peliculas.webp` ← screenshot o favicon de `https://peliculas-react-blond.vercel.app/`
- `mochify.webp` ← screenshot o favicon de `https://mochify.vercel.app/`

El autor puede proveer las imágenes directamente. Si las provee en otro formato (png/jpg), convertir a webp:

```bash
# ejemplo con cwebp (si está instalado) o sharp-cli
cwebp -q 80 -resize 800 0 entrada.png -o public/static/screenshots/gym-admin.webp
```

**ESCAPE HATCH:** Si no podés obtener alguna de las 4 imágenes (sitio caído, sin herramienta de captura, el autor no las provee), **DETENTE y reportá cuáles faltan**. No inventes una imagen ni dejes un `src` que apunte a un archivo inexistente. La UI de Task 3 puede seguir con las imágenes disponibles, pero cada `icon` del JSON debe apuntar a un archivo que exista.

- [ ] **Step 3: Verificar que los 4 archivos existen y pesan razonable**

Run:
```bash
ls -la public/static/screenshots/gym-admin.webp public/static/screenshots/bonitas.webp public/static/icons/peliculas.webp public/static/icons/mochify.webp
```
Expected: los 4 archivos listados, cada uno < 200 KB idealmente.

- [ ] **Step 4: Commit**

```bash
git checkout -b feat/seccion-proyectos 2>/dev/null || git checkout feat/seccion-proyectos
git add public/static/screenshots public/static/icons/peliculas.webp public/static/icons/mochify.webp
git commit -m "assets: screenshots destacados + iconos peliculas/mochify"
```

---

### Task 2: Modelo de datos (interfaz `Project` + `proyects.json`)

**Files:**
- Modify: `types/standard.d.ts`
- Modify: `src/lists/proyects.json`

**Interfaces:**
- Produces: interfaz global `Project` (usable sin import). Task 3 la consume para tipar el `map`.
- Produces: `proyects.json` con 2 entradas `featured: true` (Gym Admin, Bonitas) y 9 sin featured.

- [ ] **Step 1: Agregar la interfaz `Project` a `types/standard.d.ts`**

Agregar al final del archivo (después de la interfaz `LinkDrag` existente):

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

- [ ] **Step 2: Reemplazar el contenido de `src/lists/proyects.json`**

Contenido completo nuevo (Gym Admin agregado como destacado; Bonitas movido a destacado con description+stack; Películas-React y Mochify agregados al grid):

```json
{
  "proyects": [
    {
      "title": "Gym Admin",
      "url": "https://gym-admin.com.ar",
      "type": "link",
      "icon": "/static/screenshots/gym-admin.webp",
      "featured": true,
      "description": "SaaS de gestión de gimnasios con app móvil y lector de huella.",
      "stack": ["Next.js", "Node", "Prisma"]
    },
    {
      "title": "Bonitas Ayelen",
      "url": "https://bonitasayelen.com.ar/",
      "type": "link",
      "icon": "/static/screenshots/bonitas.webp",
      "featured": true,
      "description": "Sitio real de cliente en producción.",
      "stack": ["React", "Vercel"]
    },
    {
      "title": "YT Amogus",
      "url": "https://yt.pepo.ar/",
      "type": "link",
      "icon": "/static/icons/ytPepo.png"
    },
    {
      "title": "Dolar blue",
      "url": "https://dolar.pepo.ar/",
      "type": "link",
      "icon": "/static/icons/dollar.webp"
    },
    {
      "title": "Video to Mp3",
      "url": "https://mp3.pepo.ar/",
      "type": "link",
      "icon": "/static/icons/videoToMp3.png"
    },
    {
      "title": "Pokedex",
      "url": "https://pokedex-app-six-zeta.vercel.app/",
      "type": "link",
      "icon": "/static/icons/pokedex.webp"
    },
    {
      "title": "Calculadora",
      "url": "https://calculadora-two-xi.vercel.app/",
      "type": "link",
      "icon": "/static/icons/Calculator.webp"
    },
    {
      "title": "Cartas Clima",
      "url": "https://cartitasclima.vercel.app/",
      "type": "link",
      "icon": "/static/icons/weather.webp"
    },
    {
      "title": "Lista de tareas",
      "url": "https://lista-de-tareas-rho.vercel.app/",
      "type": "link",
      "icon": "/static/icons/task.webp"
    },
    {
      "title": "Peliculas React",
      "url": "https://peliculas-react-blond.vercel.app/",
      "type": "link",
      "icon": "/static/icons/peliculas.webp"
    }
  ]
}
```

> **A confirmar con el autor:** el `stack` de Gym Admin y Bonitas es tentativo. Si el autor da los valores reales, reemplazarlos aquí antes del commit. No bloquea la implementación.

- [ ] **Step 3: Validar que el JSON parsea**

Run:
```bash
node -e "JSON.parse(require('fs').readFileSync('src/lists/proyects.json','utf8')); console.log('JSON OK')"
```
Expected: `JSON OK`

- [ ] **Step 4: Verificar build + lint**

Run:
```bash
npm run lint && npm run build
```
Expected: lint sin errores; build termina con "Compiled successfully" (o equivalente). El JSON nuevo no debería romper nada aún (Task 3 usa los campos).

- [ ] **Step 5: Commit**

```bash
git add types/standard.d.ts src/lists/proyects.json
git commit -m "feat: modelo de datos de proyectos (featured/description/stack)"
```

---

### Task 3: UI — `FeaturedCard` + refactor de `WindowsContainer`

**Files:**
- Modify: `src/components/Windows/WindowsContainer.tsx`

**Interfaces:**
- Consumes: interfaz global `Project` (Task 2); campos `featured`/`description`/`stack` del JSON (Task 2); imágenes en `/static/screenshots/*` e `/static/icons/*` (Task 1).

Estado actual del bloque relevante en `src/components/Windows/WindowsContainer.tsx` (para referencia — no copiar, se reemplaza):

```tsx
const WindowsContainer = () => {
  const { proyects } = data;
  const { visibleItems, handleClose, handleOpen } = useWindows();
  const windows = { Proyectos: true, Sociales: true };
  return (
    <div className="absolute h-1  top-0 left-0 md:left-0 md:top-0 bottom-28 flex w-full">
      {visibleItems["Proyectos"] && (
        <DraggableWin title={"Proyectos"} close={handleClose}>
          <main className="px-4 py-4  text-black folderIcons  overflow-y-scroll">
            {proyects.map((el: any) => (
              <ProjectItem {...el} key={el.url} />
            ))}
          </main>
        </DraggableWin>
      )}
```

Y el `ProjectItem` actual (al final del archivo):

```tsx
const ProjectItem = ({ url, title, icon, ...props }: any) => {
```

- [ ] **Step 1: Derivar `featured` y `rest` dentro del componente**

Reemplazar la línea `const { proyects } = data;` por:

```tsx
  const proyects = data.proyects as Project[];
  const featured = proyects.filter((p) => p.featured);
  const rest = proyects.filter((p) => !p.featured);
```

- [ ] **Step 2: Reemplazar el bloque `{visibleItems["Proyectos"] && (...)}`**

Reemplazar todo el bloque de la ventana "Proyectos" (desde `{visibleItems["Proyectos"] && (` hasta su `)}` de cierre) por:

```tsx
      {visibleItems["Proyectos"] && (
        <DraggableWin title={"Proyectos"} close={handleClose}>
          <main className="px-4 py-4 text-black folderIcons overflow-y-scroll">
            {featured.length > 0 && (
              <>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#045aa5] border-b border-slate-300 mb-2">
                  ★ Destacados
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  {featured.map((el) => (
                    <FeaturedCard {...el} key={el.url} />
                  ))}
                </div>
              </>
            )}
            <div className="text-[11px] font-bold uppercase tracking-wide text-[#045aa5] border-b border-slate-300 mb-2">
              Más proyectos
            </div>
            <div className="flex flex-wrap">
              {rest.map((el) => (
                <ProjectItem {...el} key={el.url} />
              ))}
            </div>
          </main>
        </DraggableWin>
      )}
```

- [ ] **Step 3: Agregar el componente `FeaturedCard`**

Agregar al final del archivo (después de `ProjectItem`):

```tsx
const FeaturedCard = ({ url, title, icon, description, stack }: Project) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex gap-3 border border-slate-300 bg-slate-50 rounded-md p-2 hover:bg-cyan-200/60 transition-colors"
    >
      <div
        className="w-24 h-16 flex-none rounded bg-slate-200 bg-cover bg-center"
        style={{ backgroundImage: `url(${icon})` }}
        title={title}
      ></div>
      <div className="min-w-0">
        <h4 className="font-semibold text-sm text-black">{title}</h4>
        {description && (
          <p className="text-xs text-slate-600">{description}</p>
        )}
        {stack && (
          <div className="flex flex-wrap gap-1 mt-1">
            {stack.map((t) => (
              <span
                key={t}
                className="bg-indigo-100 text-indigo-800 rounded-full px-2 py-0.5 text-[10px]"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
};
```

- [ ] **Step 4: Ajustar `ProjectItem` para no spreadear campos nuevos al DOM**

Cambiar la firma de `ProjectItem` para extraer los campos específicos de proyecto (así `featured`, `description`, `stack`, `type` no caen en `...props` y no se renderizan como atributos inválidos del `<a>`):

```tsx
const ProjectItem = ({ url, title, icon, featured, description, stack, type, ...props }: any) => {
```

(El resto del cuerpo de `ProjectItem` queda igual.)

- [ ] **Step 5: Verificar lint + build**

Run:
```bash
npm run lint && npm run build
```
Expected: lint sin errores nuevos; build "Compiled successfully".

- [ ] **Step 6: Chequeo visual**

Run:
```bash
npm run dev
```
Abrir `http://localhost:3000`, abrir la ventana "Proyectos" (click en la carpeta Proyectos del escritorio) y verificar:
- Sección "★ Destacados" con 2 tarjetas: Gym Admin y Bonitas Ayelen, cada una con screenshot, descripción y chips de stack.
- Sección "Más proyectos" con el grid de los 8 restantes (incluye Películas React con su ícono amogus).
- Click en una tarjeta destacada y en un ícono del grid → abre la URL en pestaña nueva.
- Abrir DevTools (consola): sin warnings de React del tipo "Invalid DOM property" o "received `true` for a non-boolean attribute".
- Reducir el viewport a ~375px (mobile): las 2 tarjetas destacadas se apilan (1 columna) y nada desborda horizontalmente.

- [ ] **Step 7: Commit**

```bash
git add src/components/Windows/WindowsContainer.tsx
git commit -m "feat: seccion de proyectos en dos niveles (destacados + grid)"
```

---

## Notas de mantenimiento

- Agregar un proyecto nuevo = una entrada en `src/lists/proyects.json`. Con `featured: true` + `description` + `stack` va a Destacados; sin esos campos, al grid.
- `src/components/TaskBar.tsx` también importa `proyects.json` y hace `...TaskItems.proyects` para las ventanas minimizadas. Los proyectos son links externos (nunca se minimizan), así que no aparecen en la taskbar; los campos nuevos son opcionales y no rompen ese `map`. Verificar en el diff que TaskBar siga compilando.
- Bug preexistente **fuera de alcance**: la ventana "Sociales" mapea `taskList.json` cuyos items usan `href` (no `url`), por lo que `ProjectItem` recibe `url` undefined. No tocar en este plan.
- `ProjectItem` es compartido por las ventanas Proyectos, Sociales y Tecnologías. El cambio del Step 4 solo agrega destructuring de campos que esas otras ventanas no usan, así que es seguro.

## Self-Review (hecho por el autor del plan)

- **Cobertura del spec:** modelo de datos → Task 2; componentes (FeaturedCard + split + labels + tipado) → Task 3; estilos → Task 3 (clases inline); assets → Task 1; verificación (build/lint/visual) → gates de cada task; fuera de alcance respetado (no se tocan otras ventanas ni hallazgos del audit). ✅
- **Placeholders:** el único "a confirmar" es el valor de `stack` (contenido del autor), explícitamente no-bloqueante. Sin TODOs de código. ✅
- **Consistencia de tipos:** `Project` definido en Task 2 y consumido en Task 3; `FeaturedCard({ url, title, icon, description, stack }: Project)` usa solo campos declarados. ✅
