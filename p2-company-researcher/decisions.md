# Project 2 decisions

## D6: AI extracts evidence, rules score
Decision: The AI only reads the homepage and returns answers with an exact supporting quote. It never scores or ranks companies.
Why: An AI score changes between runs and can't be explained to a sales rep. Evidence can be checked against the page, and plain scoring rules (Project 3) give the same score every time.
Where it fails: Extraction still depends on what the homepage happens to say.

## D7: "Hiring" means any role
Decision: is_hiring comes from the company directory, which says whether a company is hiring at all, not whether it is hiring for sales.
Why: Careers pages returned 404 for every company tested, because startups host jobs on separate job-board sites. The directory flag is free, already keyed on domain, and covers every prospect.
Where it fails: A company hiring only engineers counts the same as one hiring salespeople.

## D8: Only a proven "yes" counts
Decision: An AI answer is kept only if its quote is found on the page. An unproven "no" is stored as unknown.
Why: The AI rarely has a quote for "no", because absence isn't a sentence. In scoring, "no" and "unknown" both earn zero, so storing unproven "no" as unknown loses nothing and keeps the rule simple.
Where it fails: Reports can't tell "checked and absent" from "not checked".

## D9: Stop after one improvement pass
Decision: After the hand audit (11 of 15 agree) and one fix to the quote matching, tuning stopped.
Why: All misses were safe "unknown" answers, not wrong facts. Answers also shift slightly between runs, so more tuning on 15 companies would chase noise.
Revisit: If Project 3 scoring shows too many prospects with no proven signals.
