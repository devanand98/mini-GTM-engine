# Mini GTM Engine

A step-by-step build of a go-to-market data pipeline in n8n: clean a lead list, research each company, score it, sync it to a CRM, report on it, and act on fresh signals.

Each project is a working piece on its own and becomes one stage of the full engine.

| # | Project | Status |
| --- | --- | --- |
| 1 | [Lead Cleaner](p1-lead-cleaner/) – merge two messy lead sources into one clean, deduplicated account list | Done |
| 2 | [Company Researcher](p2-company-researcher/) – enrich accounts and research each homepage with AI, keeping only answers backed by an exact quote | Done |
| 3 | ICP Scorer – turn evidence into a score with plain, explainable rules | Next |
| 4 | CRM Sync and Router | Planned |
| 5 | Funnel Report (SQL) | Planned |
| 6 | Outreach Drafter | Planned |
| 7 | Why-Now Signal | Planned |

## Principles used throughout

- **Flag, don't guess.** A value that can't be mapped is left blank and flagged, never filled with a guess.
- **AI extracts, rules decide.** AI reads messy text and must prove each answer with a quote; scoring and routing use plain rules.
- **Measure, then stop.** Every project is checked by hand against a sample, gets one improvement pass, and has its known limitations written down.

## Tools

n8n (self-hosted), Google Sheets, a free-tier LLM. No paid APIs.

All data is public company directory data. No personal data is used.
