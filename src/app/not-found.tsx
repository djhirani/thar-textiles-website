import { PlatformShell } from "@/components/platform-shell";
import { Action, Eyebrow } from "@/components/platform-ui";

export default function NotFound() {
  return (
    <PlatformShell>
      <section className="platform-page-hero">
        <div className="platform-wrap">
          <Eyebrow>404 · Page unavailable</Eyebrow>
          <h1>We could not find that page.</h1>
          <p>Return to the Thar Textiles homepage or browse the collection.</p>
          <div className="platform-actions">
            <Action href="/">Return home</Action>
            <Action href="/shop/" secondary>
              Browse the collection
            </Action>
          </div>
        </div>
      </section>
    </PlatformShell>
  );
}
