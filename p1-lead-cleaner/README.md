
# Project 1: Lead Cleaner

Two lead sources overlap, spell things differently, and include companies that are already customers. This workflow merges them into one list a sales rep can trust, and explains every merge.

## Result

| | Count |
| --- | --- |
| Rows in (120 fresh list + 45 legacy CRM export) | 165 |
| Unique accounts | 126 |
| Duplicates, each linked to the account it matched | 38 (31 by domain, 7 by company name) |
| Sent to a human for review | 1 |
| Existing customers flagged, never prospected | 12 |

126 + 38 + 1 = 165. Nothing is lost, and the same input always gives the same account IDs.

## How it works

Upload form → read both CSVs → label the CRM rows → merge (fresh list first) → clean → split into accounts / duplicates / review → save as CSV.

The cleaning step:

1. **Normalise** the website to a bare domain (drops https://, www., paths, tracking parameters; takes the domain from an email address typed into the website field).
2. **Match** each row against companies already seen, in order: domain, then cleaned company name, then domain stem.
3. **Keep** the first record seen; fill blanks in it from later duplicates.
4. **Flag** anything unmappable (unknown country, missing size) instead of guessing.
5. **Review** rows that can't be identified safely (no website and no name match).

## Key decisions

See [decisions.md](decisions.md). In short:

- **D1 Match cascade.** Domain first, then name, then domain stem, then a human. Three companies appeared on different domains in the two sources; a domain-only dedupe would have counted them twice, and two of them were customers.
- **D2 Display value vs match key.** "The Browser Company" stays on screen; the machine compares "browser company".
- **D3 Fixed value lists.** Country as a 2-letter code; headcount in 5 buckets, with the raw number kept.
- **D4 Flag, never guess.**
- **D5 Source priority.** The fresh list goes first because its websites are more reliable than the old CRM's.

## Files

| File | What it is |
| --- | --- |
| `P1_Lead_Cleaner.json` | The n8n workflow (import it into n8n) |
| `lead_cleaner.js` | The cleaning logic used in the workflow's Code node |
| `yc_to_csv.py` | Builds the two source files from the public directory export |
| `src_yc.csv` | Source 1: fresh list, 120 companies |
| `src_legacy_crm.csv` | Source 2: legacy CRM export, 45 rows with planted problems |
| `accounts.csv`, `duplicates.csv`, `review.csv` | Output |
| `decisions.md` | Design decisions with reasons and limits |
