# F-050 / F-075 / F-076 landing delivery

Canonical implementation claim e0cd279e preceded these changes. This candidate incorporates PR11 (4878cf64) and the PR12/13 marketing/calculator work, then applies the settled September8 seat ruling: the first three seats may be staff or Sub, allocated to staff first. Additional staff remain $39/month or $374/year; additional Subs remain $9.99/month or $95.90/year. The minimum one staff seat and annual default are retained. Sub marketing promises assigned-task access, not the staff estimate surfaces. The contract FAQ states the existing term facts without its contradictory opening “No.”

The approved MSA, September2 effective date, version1.0, permanent archive, parser and integrity guard are byte-identical to PR11. SHA256: 7ed7d22e05d8978c88491a3b342b079a51a698b33ddb653298e784d1870e7fdb. No legal clause was rewritten for this integration.

## Verification

- Updated shared-seat expectations on the old implementation: 12 passed,6 failed. Corrected implementation:18 passed. Existing integer-cent, large-roster and annual headline/billed-amount checks remain.
- Final `npm run ci`: copy guard,18 pricing tests,TypeScript and production Next build all passed.
- Actual Chrome interaction against the built local app:2 staff+1 Sub shows $249/month and $2,390/year;2 staff+2 Subs shows $258.99/month and $2,485.90/year. Included counts show2 staff+1 Sub, with only the fourth seat charged. Expanded contract FAQ shows month-to-month and annual-renewal terms. Desktop pricing and agreement render inspected.
- Actual HTTP HTML for `/legal` and `/legal/msa/v1.0` contains every one of the55 numbered approved clauses, with the effective date. `/legal/msa` returns200 and its actual archive link navigates to the permanent version. All three routes return200.

## Delivery boundary

This is a reviewable update to existing upstream PR13. PR11 and PR12 remain open until the maintainer reviews the superseding diff. On September9 the authenticated rz4life account had pull access but no push/admin access to romanpaolo/forge-web. Vercel linked production still served upstream main bdd1b06d, and fork protection required project authorization for previews. Normal maintainer merge and deployment confirmation remain necessary. No direct production deployment, permissions changes, customer messages or checkout actions were performed.
