# MotionShelf production verification — 15 October 2026

## Real deployed services

- Frontend: `https://motionshelf.onrender.com/` — HTML, external CSS/JS, icon font and typefaces load; its `config.js` points to the live API.
- API: `https://motionshelf-api.onrender.com/` — `/health` and `/api/resources` respond; allowed frontend CORS preflight succeeds, foreign origin is denied.
- Supabase: `scripts/supabase.sql` was run via the Supabase Management API on the **single project available to the supplied access token**. Before migration, `public.resource_submissions` did not exist. After migration, six required columns, RLS, unique slug/repository constraints, and the status constraint were verified. `anon` and `authenticated` cannot insert, `anon` cannot read, and `service_role` can insert. Anonymous sequence usage is denied.
- A temporary, clearly labelled resource was submitted through the deployed API. HTTP 201, Supabase row `pending`, `verified.repository=false`, `verified.license=false`. It was deleted.
- A second temporary resource was submitted through the **actual mobile browser form**. The success message appeared, Supabase stored it as `pending`, and resubmitting identical metadata showed the duplicate error. That row was deleted and a final query found zero remaining audit rows.

## Automated adversarial checks

- `npm run audit:100`: **100/100 pass** against deployed URLs. The numbered checks cover assets, production API responses/CORS/invalid inputs, catalog integrity, URL/metadata validation, search, type/framework/license filters, bookmarks, detail links and copying, all six illustrative demos, contribution requirements, mobile navigation, and horizontal overflow at 320/390/720/1440px. The script deliberately avoids valid writes; the controlled write-and-cleanup tests above were separate.
- `npm run audit:50`: **50/50 pass** on the local split frontend/API.
- `npm test`: **14/14 pass** after the explicit file-upload rejection change. `npm run validate`: **7/7 resources valid**.
- Axe-core on the deployed site: home, detail, and contribution screens at 1440px and 390px each reported **zero detected violations**. This is not a guarantee of complete accessibility.

## Scope and remaining limitations

MotionShelf **does not provide file uploads**. Contributions are JSON metadata and links to upstream repositories; no submitted code is executed. The API now returns a clear 415 for multipart/file uploads instead of a JSON parse error. The production service will acquire that change after this commit deploys.

The public contribution endpoint still has no authentication, CAPTCHA, or robust rate limiting. CORS is not authentication; requests made outside a browser can still reach it. Add abuse protection before significant public traffic. These checks do not simulate sustained load, multi-region latency, upstream repository outages, or future platform changes. Do not treat `/health` as a Supabase connectivity check: it only checks the API process.
