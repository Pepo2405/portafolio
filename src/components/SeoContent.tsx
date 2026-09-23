import { useI18n } from "src/i18n";
import profile from "src/lists/profile.json";
import proyectsData from "src/lists/proyects.json";

const PROJECTS = proyectsData.proyects as Project[];

/**
 * Bloque indexable siempre montado, con el patrón sr-only de Tailwind
 * (clip/1px): lo leen lectores de pantalla y crawlers, pero no ocupa lugar en
 * el layout — el escritorio queda visualmente idéntico.
 *
 * El texto es exactamente el de las ventanas del escritorio (Sobre mí,
 * Proyectos y las fichas): mismo contenido en dos capas, no contenido oculto
 * engañoso. Por eso NO usar display:none acá.
 */
export default function SeoContent() {
  const { t, locale } = useI18n();
  const displayName = (p: Project) =>
    locale === "en" ? p.titleEn ?? p.title : p.title;

  return (
    <section className="sr-only">
      <h2>{t("seo.content.heading")}</h2>
      <p>
        {profile.name} — {t("seo.person.role")}
      </p>
      <p>{t(profile.tagline)}</p>
      <p>{profile.location}</p>
      {profile.bio.map((paragraph) => (
        <p key={paragraph.en}>{t(paragraph)}</p>
      ))}
      <p>{t(profile.current)}</p>

      <h3>{t("seo.content.projects")}</h3>
      <ul>
        {PROJECTS.map((p) => (
          <li key={p.title}>
            <strong>{displayName(p)}</strong>
            {p.description && <> — {t(p.description)}</>}
            {p.details && (
              <ul>
                {p.details.map((d) => (
                  <li key={d.en}>{t(d)}</li>
                ))}
              </ul>
            )}
            {p.stack && <p>{p.stack.join(", ")}</p>}
            {p.url && <a href={p.url}>{p.url}</a>}
          </li>
        ))}
      </ul>

      <h3>{t("sobre.contact")}</h3>
      <ul>
        {profile.links.map((link) => (
          <li key={link.href}>
            <a href={link.href}>
              {t(link.title)}: {link.href}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
