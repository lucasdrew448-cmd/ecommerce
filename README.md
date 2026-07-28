# Headless Ecommerce Frontend

This workspace contains a minimal Next.js 14 headless ecommerce storefront.

Quick start

- Install dependencies: `npm install` or `pnpm install`
- Run the dev server: `npm run dev`

Tailwind CSS

- Tailwind is preconfigured. After installing dependencies, Tailwind will be available in the build pipeline via PostCSS.
- If you need to regenerate CSS manually during development, run the Next.js dev server; PostCSS will process Tailwind directives in `app/globals.css`.

Environment

- Optionally set `NEXT_PUBLIC_COMMERCE_API_URL` to point to a headless commerce API with endpoints:
  - `GET /products` — returns a product list

Notes

- Cart state is stored in `localStorage` under `headless-cart`.
- Replace the client-side cart with your headless cart API integration as needed.
