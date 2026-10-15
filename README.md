# MotionShelf

A discovery index for open-source UI, animation, agent tools, and utilities. The frontend links to upstream code; the backend indexes metadata and queues new submissions. Neither service executes submitted code.

## Local development

Requires Node.js 20+.

```sh
npm ci
npm start               # API at http://localhost:3000
npm run dev:frontend    # in another terminal: static frontend at http://localhost:3001
```

The local frontend server proxies `/api/*` to the separate API process. For local contribution storage, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the API process environment. Without those, browsing works and submissions return a clear configuration error. Run `npm test`, `npm run validate`, and `npm run build:frontend` before deploying.

## Render: two free services

Connect this repository as a Render Blueprint (`render.yaml`). It defines:

- **motionshelf-web**: static site, published from the generated `dist/` folder. `API_HOST` is populated from the API service's Render hostname during the static build; `config.js` is generated at build time. Rebuild after changing the API host.
- **motionshelf-api**: free Node web service, serves only `/health`, `/api/resources` and `/api/submissions`. `FRONTEND_ORIGIN` is populated from the static site's Render URL for CORS.

Before accepting submissions, create a Supabase project, run `scripts/supabase.sql` in its SQL editor, and set these **secret environment variables on the API service** in the Render dashboard when prompted: `SUPABASE_URL` (project URL) and `SUPABASE_SERVICE_ROLE_KEY` (server-side service-role key). Never add the service-role key to the static site's environment or the repo. Supabase's free plan limits apply. Render's free web service can sleep while idle, so the first request after inactivity may be slow. No paid persistent Render disk is required.

Render assigns its default onrender.com URLs automatically. If you later use custom domains, update the static build's `API_HOST` configuration and API's `FRONTEND_ORIGIN` to match the new origins. The public catalog remains available even if Supabase is not configured. The static site's assets are served by Render, not by the Node API.

## Contributions

Use **Submit a resource** in the UI, or propose an entry in `data/resources.json` by pull request. Required metadata: `slug`, `name`, `type` (`ui`, `animation`, `agent`, `utility`), `category`, `description`, nonempty `tags` and `frameworks` arrays, `runtime`, `repository`, `source`, `license`, `attribution`, `install`, `usage`, `version`, and `maintenance`. Source must belong to the HTTPS repository (GitHub, GitLab or Codeberg). Agent tools require runtime and configuration guidance; UI/animation entries require framework metadata. New submissions are stored as **pending** in Supabase and are not published automatically. Review upstream links, license files, install commands and compatibility before moving a reviewed entry into the version-controlled catalog.

## Trust and limitations

Seed entries have repository existence and repository-level license identifiers checked against GitHub's API during assembly, not a package-level legal review. Compatibility, maintenance and install commands are not independently verified. On-site previews are illustrative local demos, not upstream code. Source access uses links to upstream repositories rather than mirrored source. Submission URL checks validate structure, not remote availability. Public submission endpoints are not authenticated; add rate limiting or CAPTCHA before high-traffic deployment. Saved resources stay in browser storage.

## Bundled asset licenses

Font Awesome Free icon font and CSS are used under their upstream free licenses; see `public/assets/fa/LICENSE.txt`. DM Sans and Space Grotesk are distributed under the SIL Open Font License. Review the `@fontsource/*` packages for their full license text.

The MotionShelf application code is MIT-licensed (`LICENSE`); bundled third-party assets keep their own licenses.
