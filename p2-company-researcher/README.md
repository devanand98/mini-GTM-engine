# Project 2: Company Researcher

Researches each prospect before a rep contacts them. Facts come from a trusted directory first; AI is used only for what the directory doesn't have, and every AI answer must be backed by an exact quote from the company's website.

## Result

| | Count |
| --- | --- |
| Accounts in (from Project 1) | 126 |
| Customers removed | 12 |
| Prospects researched (sample) | 15 |
| Websites that blocked automated access | 2 |
| Hand audit: answers matching my own check | 11 of 15 |

All 4 audit misses went the same way: the system said "unknown" when the answer was clear. It fails towards unknown, not towards wrong answers.

## How it works

Upload → join accounts to the company directory on domain (enrichment) → drop customers → for each company, one at a time: fetch homepage → keep only visible text → AI extracts answers and quotes → check each quote is really on the page → wait (rate limit) → save.

## Signals

| Signal | Source |
| --- | --- |
| is_hiring | Company directory (enrichment) |
| b2b_saas | AI reading the homepage, with a verified quote |
| data_product | AI reading the homepage, with a verified quote |

## Key decisions

- **D6 AI extracts evidence, rules score.** AI scores change between runs and can't be explained; evidence can be checked.
- **D7 "Hiring" means any role,** not specifically sales. A known limit of the directory data.
- **D8 Only a proven "yes" counts.** An unproven "no" is stored as unknown; both score zero later, so nothing is lost.
- **D9 Stopped after one improvement pass.** The remaining errors are safe unknowns, and answers shift slightly between runs, so further tuning on 15 companies would chase noise.

## Known limitations

- 2 of 15 websites block automated visitors.
- Text extracted from web pages can run words together, which makes exact quote matching too strict.
- A quote can be real and still not support the answer. The check proves the quote exists, not that it's relevant.
- AI answers vary slightly between runs even at temperature 0, so one run is a sample.

## Files

| File | What it is |
| --- | --- |
| `P2_Company_Researcher.json` | The n8n workflow (no API key inside; it lives in an n8n credential) |
| `yc_enrichment.csv` | Directory data keyed on domain: hiring flag, one-liner, batch, stage, tags |
| `evidence.csv` | Output: one row per researched company |
| `audit.csv` | My hand check of 5 companies against the output |
| `decisions.md` | Design decisions D6 to D9 |

