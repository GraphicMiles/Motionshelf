# MotionShelf review & protection rollout — 15 October 2026

Commit `8109f99` is on `main`; the Render static site and API served the new routes during the rollout checks. Supabase migration `scripts/review.sql` was applied to the production project. The sole invited maintainer account is `rfarouq69@gmail.com`, bound to its Auth user ID in a private allowlist. At last check it was **invited but not yet confirmed**; the owner must accept the email invitation and choose a password. No maintainer login or actual approval could be tested without that action.

## Verified

- `npm test`: 19/19; `npm run validate`: 7 catalog entries; local audit: 50/50; local and production review/browser audit: 12/12 each across 1440, 390 and 320 pixels, including axe-core scans of the admin and contribution screens; production audit: 100/100. Automated axe checks do not replace human assistive-technology testing.
- Live `/admin.html` 200; `/health/storage` 200, database ~2% of assumed 500 MiB free quota, zero pending submissions after cleanup. Unauthenticated admin queue 401, incorrect password 401, multipart uploads 415.
- One temporary live JSON submission returned 201/pending; repeated submission returned 409; the row was deleted and the pending queue returned to zero.
- Live SQL privilege checks: `anon` cannot read the maintainer allowlist, call review or rate-budget RPCs; `authenticated` cannot read submissions. Service-role snapshot and rate-budget RPCs returned expected responses.
- GitHub Actions monitoring workflow was manually dispatched; check its run result under **Actions → Production storage monitor**. GitHub issue notifications require repository watch settings and issue permissions.

## Security and operational boundaries

- The public write budget is atomic and persistent; the burst cap is per process and IP-derived, so it is only a secondary defense. Cloudflare Turnstile code is deployed but **inactive** until both production environment variables are configured: API `TURNSTILE_SECRET_KEY` and static build `TURNSTILE_SITE_KEY`. Configure both together and redeploy both services; check hostname/action and live submit flow after enabling. Do not use test keys in production.
- Review approval is server-side only, requires a confirmed allowlisted Supabase Auth identity, rechecks GitHub repository and SPDX license plus source path, and atomically records an audit event. GitLab and Codeberg submissions fail closed on approval until provider-specific verification is implemented. Other claims still require a human reviewer. Installation commands must never be executed as part of review.
- The JSON metadata file picker reads locally and fills the form. No file contents are uploaded as a file; server multipart uploads are rejected. Submitted resource code is neither hosted nor run.
- The API serves the static seed catalog if database reads fail; `/health/storage` separately exposes storage degradation. GitHub's scheduled workflow is best-effort, not a guaranteed pager. Independently monitor Render/Supabase quotas, egress, free-tier sleep behavior, and GitHub Actions availability.
- **Outstanding owner action:** accept the invitation sent to `rfarouq69@gmail.com`, visit the review page from the email, set a 12+ character password, and sign in. The email invitation may expire and then must be reissued from Supabase Auth. Provision Turnstile keys if bot challenge is required, and enable/watch GitHub issue alerts. Manual screen-reader and cross-device physical testing remain recommended.
