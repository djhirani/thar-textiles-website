import type { Metadata } from "next";
import { PlatformShell } from "@/components/platform-shell";
import { verifiedBusiness } from "@/lib/content";
export const metadata: Metadata = {
  title: "Enquiry privacy notice",
  robots: { index: false, follow: false },
};
export default function PrivacyPage() {
  return (
    <PlatformShell>
      <article className="platform-wrap platform-section platform-privacy">
        <h1>Enquiry privacy notice</h1>
        <p>
          <strong>Draft for owner review before public form activation.</strong>{" "}
          Thar Textiles uses the information you enter in an enquiry to review
          your request and reply through your chosen contact channel. An enquiry
          does not create an account or public profile.
        </p>
        <h2>Information collected</h2>
        <p>
          Your name, contact details, message, and the context you choose to
          provide; the form also records your consent, a submission reference,
          dates, and limited abuse-prevention data. Please avoid identity
          documents, bank details, and sensitive personal information.
        </p>
        <h2>Who can access it</h2>
        <p>
          Authorized Thar Textiles staff can review enquiries through a
          protected dashboard. The intended service providers are Cloudflare for
          processing and storage and, when approved and configured, a
          transactional email provider for notifications. Data may be processed
          outside Pakistan. No Pakistan data residency is claimed.
        </p>
        <h2>Retention and your choices</h2>
        <p>
          Enquiries are held for follow-up and reviewed for retention. A
          proposed review point is 12 months; the final retention policy
          requires organizational approval. You can ask to access, correct, or
          delete your enquiry by contacting{" "}
          <a href={`mailto:${verifiedBusiness.email}`}>
            {verifiedBusiness.email}
          </a>{" "}
          and quoting your reference if available.
        </p>
        <p>
          This notice and the form wording require owner and legal review before
          production activation.
        </p>
      </article>
    </PlatformShell>
  );
}
