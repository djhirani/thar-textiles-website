# Deployment and domain setup

## Approved production release

The owner approved publishing the White Gallery design on 1 November 2026 using **email and telephone contact only**. Online enquiry forms are clearly unavailable on the public website. Cloudflare resources, staging services, DNS and nameservers must remain unchanged for this release.

- Repository: https://github.com/djhirani/thar-textiles-website
- Website: https://thartextiles.co/
- Publishing source: GitHub Actions, triggered by changes to `main`.
- Custom domain: `thartextiles.co`, with HTTPS enforced in the verified Pages settings.
- Contact: `hello@thartextiles.co`, telephone `+92 334 2511485`.

## Architecture and release configuration

Next.js produces a static website using `output: "export"`. The deployable HTML, CSS, JavaScript and approved photographs are generated in `out/`. GitHub Pages hosts these static files; it does not run the enquiry backend.

The existing deployment workflow intentionally does not pass enquiry API or Turnstile environment variables into this contact-only production build. With no API configured, every enquiry section provides direct email/telephone links and an explicit online-form unavailability notice. No form input is collected and no Turnstile script is loaded by those sections.

Do not connect the public website to the synthetic-only staging database. Activating production online forms is a separate release requiring a production API, database, Turnstile and private administrator configuration, owner approval, and tests. Existing staging form logic and administrator authentication remain preserved.

## Publishing

The existing `.github/workflows/deploy-pages.yml` workflow:

1. Installs the locked dependencies using Node.js 22 and `npm ci`.
2. Checks formatting, lint, TypeScript and unit tests.
3. Builds the static export using the base path supplied by GitHub Pages.
4. Uploads `out/` and publishes it through GitHub's official Pages deployment action.

The domain is already configured. This release needs no DNS or nameserver changes and introduces no paid services.

## Source scope

The repository contains the public application, genuine approved product photographs, original Premium Heritage emblem, required validation/backend source and tests. Deployment of the static website does not deploy a Worker or database.

Local environment files, credentials, internal review documents, screenshot galleries, source archives and build outputs remain excluded. Public assets must not depend on files in those excluded directories.

## Verification and rollback

After deployment, check HTTPS, homepage, catalogue filters, product pages, navigation, mobile layout, all direct-contact actions, image loading and the explicit online-form unavailability notices.

The previous successful live revision is `115c995767ba4e4c8a067331d1a86f111052598f`. Its source archive and release evidence are retained locally under `docs/production-release/`. If rollback is necessary, revert the release commit on `main` and let the same Pages workflow republish. Preserve subsequent unrelated commits and avoid force-pushing history.
