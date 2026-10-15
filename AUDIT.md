# MotionShelf adversarial audit — 15 October 2026

Scope: local Chromium against the running static frontend (port 3001) and separate API (port 3000), Node tests, asset/network checks, source review, and manual review of screenshots at 1440, 768, 390 and 320 pixels. This is **not** a claim that Render or a real Supabase project has been deployed or tested.

## 32 separate checks

| # | Investigation | Result |
|---:|---|---|
| 1 | Published catalog renders seven rows | Pass |
| 2 | Browser page errors on initial load | None |
| 3 | DM Sans and Space Grotesk actually load | Pass |
| 4 | Font Awesome glyph font loads locally | Pass |
| 5 | Name search narrows results | Pass |
| 6 | Tag/function search narrows results | Pass |
| 7 | Empty state and clear-filters recovery | Pass |
| 8 | UI category excludes agent tools | Pass |
| 9 | Agent category returns the MCP entry | Pass |
| 10 | Framework filter | Pass |
| 11 | License filter | Pass |
| 12 | Save action and saved-only view | Pass |
| 13 | Saved state survives page reload | Pass |
| 14 | Detail drawer displays resource metadata | Pass |
| 15 | Source and repository links point to HTTPS upstream URLs | Pass |
| 16 | Installation command copy and clipboard content | Pass; async assertion corrected |
| 17 | Escape closes detail drawer | Pass |
| 18 | Hash navigation to a resource within an already loaded page | **Fixed** missing `hashchange` listener; pass |
| 19 | Submit form opens and exposes required fields | Pass |
| 20 | Browser blocks incomplete form submission | Pass |
| 21 | 1440px horizontal overflow | None |
| 22 | 768px horizontal overflow | None |
| 23 | 390px horizontal overflow | None |
| 24 | 320px horizontal overflow | None |
| 25 | Mobile category navigation changes results | Pass |
| 26 | Mobile detail close control stays within viewport | Pass |
| 27 | API health and catalog endpoints | Pass |
| 28 | API does not serve frontend assets | Pass |
| 29 | API rejects incomplete submission metadata | Pass |
| 30 | API returns explicit 503 if Supabase is not configured | Pass |
| 31 | Submission source belonging to sibling repository is rejected | Pass |
| 32 | Render static build fails without an API host | Pass |

## Additional adversarial findings and fixes

- Manually checked 21 of 21 published repository, source, and website URLs: each returned HTTP 200 at audit time. This does not validate future availability, install commands, or compatibility.
- A repository URL ending in `/../other` initially bypassed string-prefix validation. URL ownership now compares normalized paths. Repository roots, query strings, fragments, credentials, and oversized metadata are rejected. Regression tests added.
- A failed Supabase network request was initially misreported as invalid user input (400). It now returns 502. Regression test added. No real Supabase key was available, so successful persistent storage was tested with a mocked response only.
- Mobile had no prominent top-of-screen submission control; added one. A 320px screenshot showed overlapping description and framework text; fixed line clamping and rechecked the screenshot.
- Axe-core on home, detail and submission screens at both 1440px and 390px found insufficient contrast on small metadata text. Corrected those colors; all six reruns report **zero detected violations**. Automated scans do not prove complete accessibility.
- Modal keyboard focus now stays inside the active dialog, returns to its triggering control on close, and returns to the submit button after an API response. Mobile form flow was exercised with valid fields and the expected unconfigured-storage error.
- Node suite: 8 passing tests. Catalog validation: 7/7 entries. Static frontend build with a Render-style API hostname: successful.

## Unverified / deployment limitations

- No Render Blueprint sync or deployed Render URL was available. Cross-service environment references and free-tier startup behavior remain deployment checks.
- No actual Supabase project URL, service-role key, or table was provided. `scripts/supabase.sql` and Render secret variables still need to be configured; the live contribution path cannot persist data until then.
- The public submission endpoint has no authentication, CAPTCHA, or rate limiting; it should not be treated as abuse-resistant. Published catalog changes remain a maintainer review task.
- Live upstream code is not executed here. Illustrative previews and compatibility/maintenance claims are not independently verified.
