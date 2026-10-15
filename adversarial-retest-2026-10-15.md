# MotionShelf — adversarial retest

**Scope:** public catalog, resource previews and copying, six interaction exports, contribution analysis and submission boundaries, maintainer UI, API authentication and source inspection. Tests were read-only against production; mocked requests and local API tests covered mutations and submissions without creating fake production records.

## Results

| Check | Outcome |
| --- | --- |
| Automated API and source tests | 47/47 passed after fixes |
| Seeded randomized UI/API journeys | 4 seeds × 172 = 688/688 passed locally |
| Catalog and copy adversarial checks | 64/64 passed locally |
| Contribution accessibility and responsive flow | 33/33 passed locally |
| Gallery, browsing follow-up, admin UI | 109/109, 39/39, 15/15 passed |
| Six interactions (production) | 157/157 passed |
| Production read-only contribution smoke checks | 5/5 passed |

Randomized runs exercised search/filter/sort/detail/copy sequences at widths 280, 320, 390, 768, and 1440 px; URL and file-source changes during analysis; manual fallback and intercepted submission; clipboard rejection; missing snippets; transient GitHub-count failure; malformed JSON and ZIP mutation; and oversized request limits. No randomized test created a production submission.

## Reproducible issues discovered and fixed in the local changes

1. **Stale analysis could cross source types (high).** Begin GitHub analysis, switch to Upload before it completes: the GitHub details previously appeared under Upload. Analysis now cancels on source changes and a revision check discards late responses.
2. **Edited source retained an old review (high).** Changing a URL or replacing files after analysis previously left the old extracted details visible. The review now closes until the new source is analyzed or manually entered; submission checks the reviewed revision.
3. **Malformed/oversized requests returned the wrong status (medium).** `null` submission JSON yielded 502 rather than a validation error; oversized analysis JSON yielded 422 rather than 413. They now return 422 and 413 respectively.
4. **Local-sounding hostname accepted as submission metadata (medium).** `https://localhost.` was accepted by the URL parser (fetching it was separately blocked by pinned DNS). Such hostnames are now rejected at URL validation.
5. **Initial star count could remain blank after a transient upstream failure (low).** One production adversarial run observed an empty count while GitHub temporarily failed; a second run passed. The client now attempts a bounded retry after 6.5 seconds, without inventing a count.

## Remaining verification limits and risks

- **Production upload persistence and reviewer decisions were not exercised end-to-end.** Doing so would create a real pending item and require authenticated maintainer access. Upload storage and pending-row behavior passed mocked integration tests; production API/storage health and read-only analysis passed. The private bucket's first live write remains unverified.
- **Storage telemetry covers the database, not private uploaded-file bytes.** Free-tier Storage usage and cleanup of rejected/abandoned uploads need an explicit retention/monitoring policy before sustained upload traffic. This is a capacity/operations gap, not evidence of a current outage.
- The star count can still be absent while GitHub remains unavailable; the link remains usable and a false number is never shown.

**Deployment note:** Local fixes must be pushed and Render redeployed before the five fixes above apply to production. The rest of the production read-only checks reflect the previously deployed version.
