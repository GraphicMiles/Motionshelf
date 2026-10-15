# MotionShelf

A discovery index for open-source UI, animation, agent tools, and utilities. The frontend links to upstream code; the backend indexes metadata and queues new submissions. Neither service executes submitted code.

## Local development

Requires Node.js 20+.

```sh
npm ci
npm start               # API at http://localhost:3000
npm run dev:frontend    # in another terminal: static frontend at http://localhost:3001
```

The local frontend server proxies `/api/*` to the separate API process. For local contribution storage, set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in the API process environment. Without those, browsing works and submissions return a clear configuration error. Run `npm test`, `npm run validate`, and `npm run build:frontend` before deploying.

## Render: two free services

Connect this repository as a Render Blueprint (`render.yaml`). It defines:

- **motionshelf-web**: static site, published from the generated `dist/` folder. `API_HOST` is populated from the API service's Render hostname during the static build; `config.js` is generated at build time. Rebuild after changing the API host.
- **motionshelf-api**: free Node web service, serves only `/health`, `/api/resources` and `/api/submissions`. `FRONTEND_ORIGIN` is populated from the static site's Render URL for CORS.

Before accepting submissions, create a Supabase project, run `scripts/supabase.sql` in its SQL editor, and set these **secret environment variables on the API service** in the Render dashboard when prompted: `SUPABASE_URL` (project URL) and `SUPABASE_SECRET_KEY` (server-side secret key (`sb_secret_…`)). Never add the secret key to the static site's environment or the repo. A legacy service-role JWT is also supported via `SUPABASE_SERVICE_ROLE_KEY` for existing deployments, but new projects should use the secret key. Supabase's free plan limits apply. Render's free web service can sleep while idle, so the first request after inactivity may be slow. No paid persistent Render disk is required.

Render assigns its default onrender.com URLs automatically. If you later use custom domains, update the static build's `API_HOST` configuration and API's `FRONTEND_ORIGIN` to match the new origins. The public catalog remains available even if Supabase is not configured. The static site's assets are served by Render, not by the Node API.

## Contributions

Use **Submit a resource** in the UI, or propose an entry in `data/resources.json` by pull request. Required metadata: `slug`, `name`, `type` (`ui`, `animation`, `agent`, `utility`), `category`, `description`, nonempty `tags` and `frameworks` arrays, `runtime`, `repository`, `source`, `license`, `attribution`, `install`, `usage`, `version`, and `maintenance`. Source must belong to the HTTPS repository (GitHub, GitLab or Codeberg). Agent tools require runtime and configuration guidance; UI/animation entries require framework metadata. New submissions are stored as **pending** in Supabase and are not published automatically. Review upstream links, license files, install commands and compatibility before moving a reviewed entry into the version-controlled catalog.

## Trust and limitations

Seed entries have repository existence and repository-level license identifiers checked against GitHub's API during assembly, not a package-level legal review. Compatibility, maintenance and install commands are not independently verified. On-site previews are illustrative local demos, not upstream code. Source access uses links to upstream repositories rather than mirrored source. Submission URL checks validate structure, not remote availability. Public submission endpoints are not authenticated; add rate limiting or CAPTCHA before high-traffic deployment. Saved resources stay in browser storage.

## Bundled asset licenses

Font Awesome Free icon font and CSS are used under their upstream free licenses; see `public/assets/fa/LICENSE.txt`. DM Sans and Space Grotesk are distributed under the SIL Open Font License. Review the `@fontsource/*` packages for their full license text.

The MotionShelf application code is MIT-licensed (`LICENSE`); bundled third-party assets keep their own licenses.

## Deployment verification checklist

1. In Supabase SQL Editor, run `scripts/supabase.sql`. It is idempotent on the intended schema. Verify that `resource_submissions` exists, RLS is enabled, `anon`/`authenticated` have no table privileges, and `service_role` has insert permission. The SQL was also executed against local PostgreSQL in the audit, but **not** against your Supabase project.
2. Create the Blueprint from `render.yaml`. Its API web service and static site both specify the free plan. On **initial Blueprint creation**, enter `SUPABASE_URL` and `SUPABASE_SECRET_KEY` for the API service when prompted. Use the new `sb_secret_…` key. Older JWT service-role keys can still be supplied as `SUPABASE_SERVICE_ROLE_KEY` manually, but that legacy key is not requested by the Blueprint. Do not put either key in the static site's variables.
3. Wait for the API health check and the static build to succeed. `API_HOST` and `FRONTEND_ORIGIN` are Blueprint references to the two Render hostnames; inspect their resolved values in Render after creation. Render may require a redeploy of the static site once the API hostname is available. The static build intentionally fails rather than publishing a frontend with no API URL.
4. Visit `https://<api-host>/health` and `https://<api-host>/api/resources`, then load the static site. Verify search, source links and a test submission. A successful submission should appear in Supabase as `pending`, **not** in the published catalog. A duplicate should return a conflict.
5. If adding custom domains, set `API_HOST` to the API domain and update the API's `FRONTEND_ORIGIN` to the frontend's exact HTTPS origin. A future Blueprint sync can overwrite manual overrides; update the Blueprint configuration accordingly.

For repeatable local checks: `npm test` (API/validation integration), `npm run validate` (catalog), and `npm run audit:50` (start both local services first; install the test browser once with `npx playwright install chromium`). The 50-check audit is local and does not replace a live Render/Supabase smoke test. This public submission endpoint still needs abuse protection (rate limiting/CAPTCHA) before substantial traffic.
