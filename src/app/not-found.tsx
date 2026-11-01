import Link from "next/link";
import { LinkArrow } from "@/components/link-arrow";
import { PlatformShell } from "@/components/platform-shell";

export default function NotFound() {
  return (
    <PlatformShell>
      <section className="tt-page-head tt-page-head--centre">
        <div className="tt-wrap">
          <p className="tt-eyebrow">404 · Page unavailable</p>
          <h1 className="tt-title">We could not find that page.</h1>
          <p className="tt-page-head__intro">
            Return to the Thar Textiles homepage or browse the collection.
          </p>
          <div className="tt-actions">
            <Link className="tt-button" href="/">
              Return home <LinkArrow />
            </Link>
            <Link className="tt-link" href="/shop/">
              Browse the collection <LinkArrow />
            </Link>
          </div>
        </div>
      </section>
    </PlatformShell>
  );
}
