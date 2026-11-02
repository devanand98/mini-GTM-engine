Clay free tier only allows 200 rows per table. Your combined working table holds about 195 rows. A real team with 50,000 rows would pay for Clay. This is a constraint I am working with for this project as I am using Clay free tier.


This lead cleaner workflow protects the CFO, Customer, sales reps, legal teams and also helps save a bit of revenue. Bad data could have multiple reps chasing the same client which would lead to bad client relationships. Could avoid sending outbound messages to unsubscribed users. Region not cleaned properly could lead to territory specific pipelines. Duplicates sent for enrichment could add up in costs over large quantities. Hence the lead cleaning is a crucial part of the GTM pipeline.


## D1: match key order
Decision: To identify a unique company from a messy dataset, the usual idea is a cascade or series of steps which usually starts with domain matching first, then cleaned company name, followed by domain stem (acme from acme.io and acme.com) and finally human identification.
Why: Domain is usually the unique identifier for each business. Every business usually has its own unique domain. Next comes company name but  sometimes multiple companies might use the same name. If both are not working, the next is domain stem which catches the name from the url.
Where it fails: Some parent and child companies might share same url. Multiple business might use the same name so even domain stem wont catch these,
Revisit after: (e.g. Session 5)


## D2: Display value vs match key
The display value is what a rep sees in the CRM: "Acme Analytics". The match key is what the machine compares: "acme analytics", with no suffix, no accents, no punctuation and no leading "the".
A match key is allowed to be ugly and lossy, because no human ever sees it. Stripping "The" from "The Browser Company" helps matching and would be wrong on screen. Using one column for both jobs gives you either bad matching or ugly CRM data. Keep them separate.


## D3. Fixed value lists for country and headcount
Decision: Country is stored only as a two-letter ISO code, looked up from ref_country, never as free text. Headcount is stored only as one of five buckets (1-10, 11-50, 51-200, 201-500, 500+), never as a raw number.
Why: A fixed list collapses "United Kingdom", "UK", "England" and "uk" into one value a report can group on. Buckets do the same job for headcount: two sources that disagree on the exact number (57 vs "51-200") still agree on the bucket, so the disagreement stops looking like a data conflict. This also matches the destination system: a HubSpot dropdown property rejects any value outside its option list at import time, so using a fixed list here means I make the mapping decision once, instead of HubSpot making it inconsistently on every future import.
Where it fails: The country lookup only catches spellings already in ref_country; a sixth spelling still needs a person to add the alias. Buckets lose precision a report might eventually want, so the raw employees_num column is kept alongside the bucket, never discarded.
Revisit after: Session 4 edge-case testing, once I know how many spellings actually turned up.

## D4. Unmapped values are flagged, never guessed
Decision: A value that can't be mapped to a fixed list is left blank in the mapped column and recorded in dq_flags. It is never guessed and never silently defaulted.
Why: A wrong guess is more expensive than a visible gap, because nobody re-checks a field that already looks filled. "Remote" guessed as "US" pollutes every US-country report with no trace it was a guess; "Remote" left blank and flagged as unmapped_country gets caught the moment someone filters dq_flags is not empty.
Where it fails: If dq_flags is never actually reviewed, a flagged blank is no better than a silent guess — it just fails later instead of immediately. This decision only holds if a person is scheduled to work the flagged rows down to zero, which Session 4 makes me commit to doing at least once.
Revisit after: Session 4, once there's a real count of unmapped rows, to see whether a recurring one (like "Remote") should get promoted into ref_country instead of staying flagged forever.


 ## D9: ICP proxy
  ICP says Series A–B, but this free data has no funding round. I am using "active, 11–200 people, B2B, US/UK/EU" as a stand-in. Project 2's enrichment fixes it.

  
## D5: Source priority
Decision: The fresh directory list is merged first and the legacy CRM export second, so when a company appears in both, the fresh record is kept and the CRM copy is marked as its duplicate.
Why: The fresh list has more reliable websites; the old CRM has stale domains, missing websites and an email address typed into the website field. Blanks in the kept record (such as LinkedIn URLs) are filled from the duplicate, so nothing useful is lost.
Where it fails: If the old CRM held the more accurate value for a field, the fresh value still wins.
