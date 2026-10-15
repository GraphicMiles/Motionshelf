# Render / Supabase deployment audit — 15 October 2026

## Findings corrected

1. **Critical: newer Supabase keys.** The old API sent every key in `Authorization: Bearer`. New `sb_secret_…` keys are opaque, not JWTs. The API now sends new secret keys in `apikey` only; legacy service-role JWTs retain both headers. The Render Blueprint prompts for `SUPABASE_SECRET_KEY` instead of the legacy name.
2. **Schema privileges.** `scripts/supabase.sql` now enables RLS, revokes table and identity-sequence access from `anon` and `authenticated`, grants schema/table/sequence access to `service_role`, and leaves no client policies. It has unique slug/repository constraints and a review-status check.
3. **Free-tier certainty.** The static site now explicitly specifies `plan: free` as well as the API. No Render disk or paid database is declared.
4. **Malformed metadata.** A non-string repository previously could trigger a validation exception during duplicate checking; validation now returns errors instead.
5. **Build configuration.** The static build fails if Render has no API host. It accepts properly formed custom hostnames without accepting paths or protocols. The API refuses a non-HTTPS Supabase URL on Render.

## Executed checks

- `npm run audit:50`: **50/50 pass**. `scripts/audit50.mjs` lists each check: Blueprint/SQL assertions, catalog validation, API response behavior, search, filters, saves, detail pages, copy, hash navigation, six interactive demos, contribution requirements, and overflow at 1440/720/390/320px. Browser checks use Chromium against a separate local static server and API. These are structural Blueprint checks, **not** a Render Blueprint sync.
- `npm test`: **13/13 pass**, including full HTTP submission to a mock PostgREST endpoint, both Supabase key formats, duplicate conflict handling, a simulated storage outage, malformed metadata, allowed/denied CORS preflights, and a Render HTTPS-only Supabase URL guard.
- `npm run validate`: **7/7 catalog entries valid**.
- `npm ci` and a Render-style static build with `API_HOST=motionshelf-api.onrender.com`: pass; generated `dist/config.js` contains the public API URL and no Supabase key. A custom API domain build also passed; malformed hostnames failed as expected.
- The SQL migration ran **twice** with `ON_ERROR_STOP=1` against a local PostgreSQL 17 instance. RLS=true; anon table insert=false; authenticated table insert=false; service_role insert=true; anon sequence usage=false; service_role sequence usage=true. Service-role insert worked; anon select, duplicate slug and invalid status failed as intended.
- `npm audit --omit=dev --audit-level=high`: zero reported production dependency vulnerabilities at audit time.

## Limits / live go-live gate

No Render workspace or Supabase project credentials were supplied to run an actual Blueprint sync or a real Supabase REST insert. Therefore **perfect deployment cannot be certified**. The service references match Render's documented `fromService` and `RENDER_EXTERNAL_*` pattern, but inspect their resolved values after Blueprint creation and perform the live smoke test in `README.md`. On Render, `sync: false` secrets are prompted at initial Blueprint creation, not automatically re-prompted on later syncs. The public submission endpoint is intentionally unauthenticated and has no robust abuse protection; CORS is not authentication.

References: [Render Blueprint spec](https://render.com/docs/blueprint-spec), [Render environment variables](https://render.com/docs/environment-variables), [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys), [Supabase RLS and grants](https://supabase.com/docs/guides/database/postgres/row-level-security).
