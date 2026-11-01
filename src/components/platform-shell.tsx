import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function PlatformShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="tt-site">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="tt-main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
