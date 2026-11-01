import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import styles from "./white-gallery.module.css";
import studio from "./studio-system.module.css";

export function PlatformShell({
  children,
  theme = "gallery",
  darkAccent = "footer",
}: {
  children: React.ReactNode;
  theme?: "gallery";
  darkAccent?: "footer" | "craft";
}) {
  const content = (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter darkAccent={darkAccent === "footer"} />
    </>
  );
  return theme === "gallery" ? (
    <div className={`${styles.gallery} ${studio.system}`}>{content}</div>
  ) : (
    content
  );
}
