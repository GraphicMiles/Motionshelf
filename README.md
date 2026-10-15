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

- **motionshelf**: static site, published from the generated `dist/` folder. `API_HOST` is populated from the API service's Render hostname during the static build; `config.js` is generated at build time. Rebuild after changing the API host.
- **motionshelf-api**: free Node web service, serves only `/health`, `/api/resources` and `/api/submissions`. `FRONTEND_ORIGIN` is populated from the static site's Render URL for CORS.

Before accepting submissions, create a Supabase project, run `scripts/supabase.sql` in its SQL editor, and set these **secret environment variables on the API service** in the Render dashboard when prompted: `SUPABASE_URL` (project URL) and `SUPABASE_SECRET_KEY` (server-side secret key (`sb_secret_…`)). Never add the secret key to the static site's environment or the repo. A legacy service-role JWT is also supported via `SUPABASE_SERVICE_ROLE_KEY` for existing deployments, but new projects should use the secret key. Supabase's free plan limits apply. Render's free web service can sleep while idle, so the first request after inactivity may be slow. No paid persistent Render disk is required.

Render assigns its default onrender.com URLs automatically. If you later use custom domains, update the static build's `API_HOST` configuration and API's `FRONTEND_ORIGIN` to match the new origins. The public catalog remains available even if Supabase is not configured. The static site's assets are served by Render, not by the Node API.

## Contributions

Use **Submit a resource** in the UI, or propose an entry in `data/resources.json` by pull request. Required metadata: `slug`, `name`, `type` (`ui`, `animation`, `agent`, `utility`), `category`, `description`, nonempty `tags` and `frameworks` arrays, `runtime`, `repository`, `source`, `license`, `attribution`, `install`, `usage`, `version`, and `maintenance`. Source must belong to the HTTPS repository (GitHub, GitLab or Codeberg). Agent tools require runtime and configuration guidance; UI/animation entries require framework metadata. New submissions are stored as **pending** in Supabase and are not published automatically. The form submits JSON metadata and links to upstream source; the optional file picker imports metadata locally in the browser. MotionShelf does not upload files or host submitted code. Use the protected review queue for approval; the version-controlled seed catalog remains separate.

## Trust and limitations

Seed entries have repository existence and repository-level license identifiers checked against GitHub's API during assembly, not a package-level legal review. Compatibility, maintenance and install commands are not independently verified. On-site previews are illustrative local demos, not upstream code. Source access uses links to upstream repositories rather than mirrored source. Submission URL checks validate structure, not remote availability. Public submission endpoints are not authenticated; burst and global write limits are active, but Turnstile requires separate site and secret keys. Saved resources stay in browser storage.

## Bundled asset licenses

Font Awesome Free icon font and CSS are used under their upstream free licenses; see `public/assets/fa/LICENSE.txt`. DM Sans and Space Grotesk are distributed under the SIL Open Font License. Review the `@fontsource/*` packages for their full license text.

The MotionShelf application code is MIT-licensed (`LICENSE`); bundled third-party assets keep their own licenses.

## Deployment verification checklist

1. In Supabase SQL Editor, run `scripts/supabase.sql`. It is idempotent on the intended schema. Verify that `resource_submissions` exists, RLS is enabled, `anon`/`authenticated` have no table privileges, and `service_role` has insert permission. Both SQL files were executed against the production Supabase project on October 15, 2026.
2. Create the Blueprint from `render.yaml`. The API web service explicitly uses `plan: free`; the static site omits an instance plan, as Render requires for this service type. On **initial Blueprint creation**, enter `SUPABASE_URL` and `SUPABASE_SECRET_KEY` for the API service when prompted. Use the new `sb_secret_…` key. Older JWT service-role keys can still be supplied as `SUPABASE_SERVICE_ROLE_KEY` manually, but that legacy key is not requested by the Blueprint. Do not put either key in the static site's variables.
3. Wait for the API health check and the static build to succeed. `API_HOST` and `FRONTEND_ORIGIN` are Blueprint references to the two Render hostnames; inspect their resolved values in Render after creation. Render may require a redeploy of the static site once the API hostname is available. The static build intentionally fails rather than publishing a frontend with no API URL.
4. Visit `https://<api-host>/health` and `https://<api-host>/api/resources`, then load the static site. Verify search, source links and a test submission. A successful submission should appear in Supabase as `pending`, **not** in the published catalog. A duplicate should return a conflict.
5. If adding custom domains, set `API_HOST` to the API domain and update the API's `FRONTEND_ORIGIN` to the frontend's exact HTTPS origin. A future Blueprint sync can overwrite manual overrides; update the Blueprint configuration accordingly.

For repeatable local checks: `npm test` (API/validation integration), `npm run validate` (catalog), and `npm run audit:50` and `npm run audit:review` (start both local services first; install the test browser once with `npx playwright install chromium`; override `AUDIT_BASE` for a nondefault frontend port). The 50-check audit is local and does not replace a live Render/Supabase smoke test. Rate limits are active; configure Turnstile before substantial traffic.

## Maintainer review and production protection

Production review is at `/admin.html`. The invited maintainer is `rfarouq69@gmail.com`; use the email invitation to set a password of at least 12 characters, then sign in. The browser retains the short-lived access token only in session storage. The backend validates the Supabase Auth user **and** checks its exact ID and confirmed email against the private `motionshelf_maintainers` table for every privileged request. There is no browser-side table grant. Sign out when finished. If an invitation expires, issue a fresh invitation through the Supabase Auth admin dashboard; do not register a public maintainer account.

Run `scripts/supabase.sql` and then `scripts/review.sql` on new projects; the latter is idempotent. Approved submissions are merged into the API catalog only when the database records successful upstream verification and current metadata validation. The static seven-item catalog remains available on storage outages. Approval rechecks the GitHub repository (public, active, canonical), SPDX license, and any source tree/file URL immediately before an atomic status transition with an audit event. Other allowed repository hosts can be submitted but **cannot be auto-approved** until equivalent provider verification exists. Check every other submitted assertion manually: author attribution, installation, runtime, compatibility, maintenance and version are *not* automatically established. Never execute suggested install commands during review. Rejected rows are retained for audit and may require manual cleanup under a data-retention policy.

Public submissions are limited to 30 KB of JSON, a coarse in-process burst cap and an atomic 120-request/hour project-wide budget in Supabase. The global budget works after Render restarts and fails closed when unavailable. Configure Cloudflare Turnstile's `TURNSTILE_SITE_KEY` on the static service and `TURNSTILE_SECRET_KEY` on the API service **together**; the server validates single-use tokens, expected hostname and `submission` action. Until provisioned, the Turnstile check is inactive; rate limits still apply. Never put the secret in a browser bundle or Git. Review GitHub/Cloudflare status and limit settings as traffic changes. Public file uploads and resource-code execution remain unsupported. The optional 30 KB metadata JSON picker reads a file in the browser to fill the existing form, then submits JSON through the existing API; no file is transferred.

`/health` is a lightweight process liveness route for Render. `/health/storage` runs a service-role-only database snapshot, reports quota usage and pending queue age, warns at 70% and returns 503 at 80% of the **assumed** 500 MiB free database quota or on database failure. Check actual project quota and egress in Supabase's dashboard. The scheduled GitHub Actions workflow polls this route every two hours and creates one deduplicated GitHub issue for failures, high usage or a queue older than seven days; it closes the issue on recovery. Enable GitHub Actions and repository issue permissions, and watch the repository to receive notifications. Scheduled workflows can be delayed or disabled by GitHub and are not a paging SLA; use an independent uptime monitor for critical operations. Review Render free-instance hours and Supabase usage monthly. Prune `motionshelf_write_budget` rows older than seven days from the SQL editor during routine maintenance; never delete audit records without a retention decision.
