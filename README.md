# Thar Textiles Website

The production website for Thar Textiles, a women-led contemporary fashion and textile brand connecting the handmade embroidery traditions of Tharparkar with international customers.

- Production domain: [thartextiles.co](https://thartextiles.co)
- Contact: [hello@thartextiles.co](mailto:hello@thartextiles.co)
- Framework: Next.js, TypeScript and Tailwind CSS
- Hosting: GitHub Pages static export

## Local development

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Validation

```sh
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npx playwright test --workers=1
```

`npm run build` creates the static production site in `out/`.

Deployment and domain details are documented in [`docs/DEPLOYMENT-AND-DOMAIN-SETUP.md`](docs/DEPLOYMENT-AND-DOMAIN-SETUP.md).
