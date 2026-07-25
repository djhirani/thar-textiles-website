# Deployment and Domain Setup

## Status

The sanitized public repository, `main` branch and GitHub Pages workflow are active. The temporary Pages deployment was verified before the custom domain was configured. GitHub now recognizes `thartextiles.co`; Namecheap website-record changes and subsequent HTTPS validation remain pending owner action.

| Item                       | Status                                              |
| -------------------------- | --------------------------------------------------- |
| GitHub repository          | `djhirani/thar-textiles-website`                    |
| Repository visibility      | Public                                              |
| GitHub repository URL      | `https://github.com/djhirani/thar-textiles-website` |
| GitHub Pages temporary URL | `https://djhirani.github.io/thar-textiles-website/` |
| Production URL             | `https://thartextiles.co`                           |
| Pages source               | GitHub Actions                                      |

Current GitHub state:

- authenticated owner: `djhirani`;
- branch: `main`;
- remote: `https://github.com/djhirani/thar-textiles-website.git`;
- Pages build type: workflow;
- custom domain configured in GitHub: `thartextiles.co`;
- HTTPS enforcement: pending correct DNS and certificate issuance.

## Public repository scope

The owner approved a sanitized public deployment repository on 25 July 2026. The initial public scope contains 45 files (approximately 6.3 MB), including the application, seven approved website photographs, the owner-supplied logo direction, tests and deployment documentation.

The following remain preserved locally but are excluded from Git:

- the three source project documents;
- internal QA and identity-refinement documentation;
- internal logo-review routes and presentation boards;
- the 40-image and 10-video source-media archive;
- rejected and experimental brand artwork.

The production source no longer depends on excluded media. Exact copies of the seven displayed photographs are stored under `public/images/site-products` so the visible website remains unchanged.

## Static architecture

The site uses Next.js static export via `output: "export"`. `npm run build` writes the deployable site to `out/`. All current routes are generated as static HTML. Images are emitted without the Next.js runtime image API because GitHub Pages does not provide a Node.js image-optimization server.

The project has no API routes, server actions, databases, authentication, cookies, dynamic request headers, ISR or other server-only dependencies. Public contact actions use `mailto:hello@thartextiles.co`; no paid form service is configured.

Known limitations:

- GitHub Pages cannot run server actions, API routes or dynamic authentication.
- Images are served as committed static files and are not optimized on demand.
- Contact remains email-based until a separately approved form service is selected.
- Domain and HTTPS activation depend on DNS propagation and GitHub certificate issuance.

## GitHub Actions workflow

Workflow: `.github/workflows/deploy-pages.yml`

On pushes to `main`, it:

1. checks out the repository;
2. installs the locked dependencies with `npm ci`;
3. runs formatting, lint, strict TypeScript and unit tests;
4. builds the `out/` static export;
5. uploads `out/` with GitHub's official Pages artifact action;
6. deploys through GitHub's official Pages deployment action.

The workflow grants repository contents read-only access during build. Only the deployment job receives `pages: write` and `id-token: write`.

## Current public DNS audit

Read-only public DNS inspection on 25 July 2026 found Namecheap nameservers:

- `dns1.registrar-servers.com`
- `dns2.registrar-servers.com`

Current website records:

- Apex `A`: `162.255.119.72`
- `www` CNAME: `parkingpage.namecheap.com`

These appear to be Namecheap redirect/parking records and are the only records proposed for replacement. No DNS change has been made.

### Mail records that must remain untouched

- MX priority 10: `mx.zoho.eu`
- MX priority 20: `mx2.zoho.eu`
- MX priority 50: `mx3.zoho.eu`
- SPF TXT: `v=spf1 include:zohomail.eu ~all`
- Zoho verification TXT: present
- `zoho._domainkey` DKIM TXT: present
- `_dmarc` TXT: not currently published in public DNS

Never delete or replace the MX, SPF, DKIM or Zoho verification records while changing website records.

## Planned DNS changes

Do not apply this plan until:

1. the repository exists;
2. its first Pages deployment succeeds at the temporary GitHub Pages URL;
3. `thartextiles.co` is saved as the custom domain in GitHub Pages settings;
4. the exact authenticated GitHub username/default Pages hostname is confirmed.

Current GitHub-documented apex records:

| Type  | Host  | Value                           |
| ----- | ----- | ------------------------------- |
| A     | `@`   | `185.199.108.153`               |
| A     | `@`   | `185.199.109.153`               |
| A     | `@`   | `185.199.110.153`               |
| A     | `@`   | `185.199.111.153`               |
| CNAME | `www` | `<confirmed-account>.github.io` |

At Namecheap, the existing apex redirect/parking record and `www` parking CNAME would be replaced by these website records. Do not add wildcard DNS. Do not alter mail-related records.

The exported `public/CNAME` file contains `thartextiles.co`, but GitHub's repository Pages settings must still be configured. The apex domain is intended to remain primary; GitHub Pages should redirect `www` to the apex once both records are correct.

## Deployment commands

Local validation:

```sh
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npx playwright test --workers=1
```

The `out/` directory is generated and ignored by Git.

Future updates after initial setup:

```sh
git switch main
git pull --ff-only
git add <explicit-files>
git commit -m "Describe the website update"
git push origin main
```

Pushing `main` triggers the Pages workflow automatically.

## Rollback

For a website-code rollback:

1. identify the last known-good commit;
2. create a new commit that reverts the faulty commit;
3. push the revert to `main`;
4. verify the replacement Pages deployment.

Do not rewrite shared history or force-push `main`.

For a domain rollback:

1. keep all Zoho mail records unchanged;
2. restore only the previous apex website record and `www` parking/redirect record;
3. remove or update the GitHub Pages custom domain only after the prior website target is responding;
4. verify HTTPS and mail DNS independently.

DNS propagation can take up to 24 hours. HTTPS certificate availability may lag behind DNS.
