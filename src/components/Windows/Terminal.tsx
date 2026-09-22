import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import proyectsData from "src/lists/proyects.json";
import profile from "src/lists/profile.json";
import useWindows from "src/hooks/useWindow";

type LineKind = "input" | "output" | "error" | "accent";

interface Line {
  id: number;
  kind: LineKind;
  text: string;
}

const PROYECTS = proyectsData.proyects as {
  title: string;
  url?: string;
  featured?: boolean;
  stack?: string[];
}[];

const BANNER = [
  "portfolio.sh — escribí 'help' para ver los comandos disponibles.",
];

const HELP: string[] = [
  "COMANDOS",
  "  whoami              quién soy",
  "  ls                  lista los proyectos",
  "  ls destacados       solo los destacados",
  "  open <nombre>       abre un proyecto (ej: open goblin)",
  "  stack               tecnologías que uso",
  "  contact             cómo contactarme",
  "  cv                  abre el CV (ES / EN)",
  "  proyectos           abre la ventana de Proyectos",
  "  clear               limpia la pantalla",
  "  exit                cierra la terminal",
];

const NEOFETCH = [
  "        .-.        ignacio@portfolio",
  "       |   |       -----------------",
  "       |___|       OS: PepOS XP 1.0",
  "      /     \\      Rol: Full Stack Dev",
  "     | () () |     Stack: TS · React · Bun",
  "      \\  ^  /      Base: Pilar, Argentina",
  "       |||||       Uptime: desde siempre",
  "       |||||",
];

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function findProject(query: string) {
  const q = normalize(query);
  if (!q) return undefined;
  return (
    PROYECTS.find((p) => normalize(p.title) === q) ??
    PROYECTS.find((p) => normalize(p.title).startsWith(q)) ??
    PROYECTS.find((p) => normalize(p.title).includes(q))
  );
}

interface Props {
  onClose: () => void;
}

/**
 * Ventana Terminal: una forma de explorar el portfolio para gente de dev,
 * sin depender del doble clic del escritorio.
 */
const Terminal = ({ onClose }: Props) => {
  const { handleOpen } = useWindows();
  const [lines, setLines] = useState<Line[]>(() =>
    BANNER.map((text, i) => ({ id: i, kind: "output" as LineKind, text }))
  );
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const idRef = useRef(BANNER.length);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const push = (kind: LineKind, text: string) => ({
    id: idRef.current++,
    kind,
    text,
  });

  // La terminal tiene el foco mientras está abierta.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Autoscroll al fondo con cada línea nueva.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const commands = useMemo(
    () => ({
      help: (): Line[] => HELP.map((t) => push("output", t)),
      "?": (): Line[] => HELP.map((t) => push("output", t)),
      whoami: (): Line[] => [
        push("accent", profile.name),
        push("output", `${profile.role} · ${profile.tagline ?? ""}`.trim()),
        push("output", profile.location),
        ...profile.bio.map((t) => push("output", t)),
      ],
      neofetch: (): Line[] => NEOFETCH.map((t) => push("accent", t)),
      stack: (): Line[] => [
        push("output", profile.stack.join("  ·  ")),
        push("output", ""),
        push("output", `Ahora mismo: ${profile.current}`),
      ],
      contact: (): Line[] => [
        push("output", "¿Hablamos?"),
        ...profile.links.map((l) => push("accent", `  ${l.title.padEnd(10)} ${l.href}`)),
      ],
      cv: (): Line[] => {
        handleOpen({ target: { title: "Curriculum" } });
        return [push("output", "Abriendo el CV (español / inglés)…")];
      },
      proyectos: (): Line[] => {
        handleOpen({ target: { title: "Proyectos" } });
        return [push("output", "Abriendo Proyectos…")];
      },
      exit: (): Line[] => {
        onClose();
        return [];
      },
      sudo: (): Line[] => [
        push("error", "ignacio no está en el archivo de sudoers. Esto va a quedar registrado."),
      ],
      clear: (): Line[] => [],
    }),
    // push/handleOpen/onClose son estables dentro de una ejecución de comando.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleOpen, onClose]
  );

  const runLs = (arg: string): Line[] => {
    const featuredOnly = normalize(arg).startsWith("destacado");
    const list = featuredOnly ? PROYECTS.filter((p) => p.featured) : PROYECTS;
    if (list.length === 0) return [push("output", "No hay nada acá.")];
    return list.map((p) =>
      push(
        "output",
        `${p.featured ? "★" : " "} ${p.title.padEnd(22)} ${p.url ?? "(detalle en el escritorio)"}`
      )
    );
  };

  const runOpen = (arg: string): Line[] => {
    if (!arg) return [push("error", "Uso: open <nombre>. Probá 'ls' para ver la lista.")];
    const project = findProject(arg);
    if (!project) return [push("error", `No encontré ningún proyecto que matchee "${arg}".`)];
    if (project.url) {
      window.open(project.url, "_blank", "noreferrer");
      return [push("output", `Abriendo ${project.title} → ${project.url}`)];
    }
    handleOpen({ target: { title: project.title } });
    return [push("output", `Abriendo la ficha de ${project.title}…`)];
  };

  const execute = (raw: string): Line[] => {
    const trimmed = raw.trim();
    if (!trimmed) return [];

    const [command, ...rest] = trimmed.split(/\s+/);
    const arg = rest.join(" ");
    const cmd = normalize(command);

    if (cmd === "ls" || cmd === "dir") return runLs(arg);
    if (cmd === "open" || cmd === "cd") return runOpen(arg);

    const handler = commands[cmd as keyof typeof commands];
    if (!handler) {
      return [
        push("error", `command not found: ${command}`),
        push("output", "Escribí 'help' para ver qué hay."),
      ];
    }
    return handler();
  };

  const submit = () => {
    const raw = value;
    const echo = push("input", raw);
    const result = execute(raw);

    setLines((prev) => [...prev, echo, ...result]);
    setHistory((prev) => (raw.trim() ? [...prev, raw] : prev));
    setHistoryIndex(null);
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setValue(history[next]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === null) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(null);
        setValue("");
      } else {
        setHistoryIndex(next);
        setValue(history[next]);
      }
    }
  };

  const onContainerClick = () => inputRef.current?.focus();

  return (
    <main
      className="h-full overflow-hidden bg-[#0b0f14] px-3 py-2 font-mono text-[13px] leading-relaxed"
      onClick={onContainerClick}
    >
      <div ref={scrollRef} className="h-full overflow-y-auto">
        {lines.map((line) => (
          <div
            key={line.id}
            className={
              line.kind === "input"
                ? "text-white"
                : line.kind === "error"
                  ? "text-red-400"
                  : line.kind === "accent"
                    ? "text-emerald-300"
                    : "text-slate-300"
            }
          >
            {line.kind === "input" ? (
              <>
                <span className="text-emerald-400">ignacio@portfolio</span>
                <span className="text-slate-500">:~$ </span>
                {line.text}
              </>
            ) : (
              <span className="whitespace-pre-wrap">{line.text}</span>
            )}
          </div>
        ))}

        <div className="flex items-center text-white">
          <span className="text-emerald-400">ignacio@portfolio</span>
          <span className="text-slate-500">:~$</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoComplete="off"
            aria-label="Entrada de comandos de la terminal"
            className="ml-1 min-w-0 flex-1 bg-transparent text-white caret-emerald-400 outline-none"
          />
        </div>
      </div>
    </main>
  );
};

export default Terminal;
