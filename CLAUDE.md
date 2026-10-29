# Sound — notes for AI coding assistants

- React 18 + Vite + Tailwind/shadcn front end, hosted on GitHub Pages
  (`.github/workflows/deploy.yml`). Supabase is the back end (Postgres, Auth, Storage,
  one Edge Function).
- Pages call `base44.entities.<Name>.list/filter/get/create/update/delete`,
  `base44.auth.*`, `base44.integrations.Core.*` and `base44.functions.invoke`. These
  are implemented in `src/api/base44Client.js` on top of supabase-js. There is no
  Base44 dependency left; the name is kept so imports stay stable.
- Adding a field: add a column in a new SQL migration under `supabase/migrations/`
  AND add it to `src/api/schema.js`. Unknown fields are dropped before saving.
- Access rules are Postgres RLS policies plus guard triggers in the migration. Never
  rely on the front end for security.
- The site may be served from a sub-path (`/<repo>/`). Use `appUrl()` from
  `src/lib/basePath.js` for any `window.location` navigation and for asset URLs; React
  Router `<Link>`/`navigate` already handle the base path.
- Checks before finishing: `npm run lint` and `npm run build`.
