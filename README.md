# Portafolio — Ignacio Iglesias

Portafolio personal con forma de escritorio de Windows XP: íconos arrastrables,
ventanas redimensionables, menú Inicio, reproductor multimedia y una terminal.

Hecho con **React 18 + TypeScript + Vite + Tailwind + GSAP**. El audio usa
**Howler** y las ventanas **re-resizable**.

## Levantarlo

```bash
bun install
bun run dev      # http://localhost:5173
bun run build    # tsc + vite build  -> dist/
bun run preview  # sirve el build
bun run lint     # eslint
```

Requiere Node 22 (ver `.nvmrc`).

## Cómo está organizado

```
src/
  App.tsx                    Escritorio: íconos, hint, pantalla de apagado
  lists/                     Datos del sitio (única fuente de verdad)
    profile.json             Nombre, bio, stack y links de contacto
    proyects.json            16 proyectos; los destacados tienen `details`
    technologies.json        38 tecnologías con ícono y doc oficial
    taskList.json            Redes del menú Inicio
    windows.ts               Metadata de cada ventana (ícono, label, tamaño)
    desktopIcons.ts          Íconos del escritorio y sus celdas por defecto
    music.json               Playlist del reproductor
  components/
    Windows/                 Sistema de ventanas
      draggable.tsx          Ventana genérica: drag, resize, snap, animaciones
      WindowsContainer.tsx   Renderiza cada ventana + las fichas de proyecto
      SobreMi.tsx            Ventana "Sobre mí"
      Terminal.tsx           Ventana "Terminal" (comandos)
      MediaPlayer/           Reproductor estilo Windows Media Player
    TaskBar.tsx              Barra de tareas + menú Inicio
    DesktopIcon.tsx          Ícono del escritorio
    DesktopHint.tsx          Globo de ayuda de la primera visita
    ShutdownScreen.tsx       Pantalla de "Apagar"
  context/WindowsContext.tsx Estado global de ventanas (foco, z-index, visibilidad)
  hooks/                     Drag, layout de íconos, media queries, focus trap
```

### Agregar o editar contenido

Casi todo el contenido vive en `src/lists/` y no hace falta tocar componentes.

- **Proyecto nuevo**: sumá una entrada a `proyects.json`. Con `featured: true`
  aparece como tarjeta; `details` son los bullets de su ficha; `badge` sirve
  para marcar los que no tienen demo pública.
- **Ventana nueva**: agregala a `WINDOW_META` (`src/lists/windows.ts`) con su
  ícono y tamaño, sumá el ícono de escritorio en `desktopIcons.ts` y renderizala
  en `WindowsContainer.tsx`.
- **Tamaño de una ventana**: campo `size` en `WINDOW_META`. Si no está, usa
  600x430.
- **Bio y contacto**: `profile.json`. Lo comparten la ventana "Sobre mí", la
  Terminal y la pantalla de apagado.

### La terminal

Abre comandos útiles: `help`, `whoami`, `ls`, `open <proyecto>`, `stack`,
`contact`, `cv`, `proyectos`, `clear`, `exit` y algún easter egg.

## Notas de comportamiento

- Las ventanas se abren con **doble clic** en el ícono (o **Enter** con teclado).
- "Sobre mí" arranca abierta para que la primera visita vea contenido sin tener
  que descubrir la interacción. El globo de ayuda se muestra una sola vez
  (`localStorage`).
- El layout de los íconos se persiste en `localStorage`
  (`xp-desktop-icons@2`) y se reacomoda si la pantalla es chica. "Organizar
  íconos" o "Cerrar sesión" lo resetean.
- En mobile las ventanas van a pantalla completa y se oculta el drag/resize.
- Se respeta `prefers-reduced-motion` en las animaciones y en el visualizador.

## Actualizar el CV

Los PDF no se editan acá: viven en el vault **Personal** de Bridges
(`~/Documents/Vaults/Personal`) como Markdown, y de ahí salen los PDFs.

1. Editá `CV - Ignacio Iglesias (ES).md` o `(EN).md` en el vault.
2. Generá los PDFs con el script del vault:
   ```bash
   cd ~/Documents/Vaults/Personal
   ./md2pdf.sh "CV - Ignacio Iglesias (ES).md" "CV - Ignacio Iglesias (EN).md"
   ```
3. Copiá el resultado a `public/static/`:
   ```bash
   cp "$HOME/Documents/Vaults/Personal/CV - Ignacio Iglesias (ES).pdf" \
      public/static/"Cv Ignacio Iglesias.pdf"
   cp "$HOME/Documents/Vaults/Personal/CV - Ignacio Iglesias (EN).pdf" \
      public/static/"Cv Ignacio Iglesias (EN).pdf"
   ```

El ícono **Curriculum** del escritorio abre una ventana con las dos versiones.
Si el CV cambia de nombre, actualizá `src/components/Windows/Curriculum.tsx`.

El texto del sitio (rol, bio, stack, contacto) sale de `src/lists/profile.json`
y debería seguir diciendo lo mismo que el CV.

## Deploy

El build es estático (`dist/`) y se sirve desde cualquier host estático
(Vercel, Cloudflare Pages, etc.). No hay variables de entorno ni backend.

## SEO y bilingüe

- Todo el texto traducible vive en `src/i18n/es.ts` + `src/i18n/en.ts` (y los
  campos `{ es, en }` de los JSON de `src/lists/`). `tsc` falla si falta una
  traducción.
- `bun run build` además prerenderiza las 20 rutas (`scripts/prerender.tsx`),
  genera `sitemap.xml` y valida que la metadata no se haya roto. Si la
  validación falla, el build falla.
- La OG card se regenera con `bun run og-cover` (el PNG queda commiteado).
- Chequeo post-deploy: Rich Results Test de Google y el validador de OG de
  LinkedIn sobre `https://www.pepo.ar/`.
