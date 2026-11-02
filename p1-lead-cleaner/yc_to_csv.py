import csv, json, random

companies = json.load(open("b2b.json", encoding="utf-8"))

# Your ICP filter: active, 11-200 people, US/UK/EU
TARGET = {"United States of America", "United Kingdom", "Ireland", "Germany",
          "France", "Netherlands", "Spain", "Sweden", "Denmark", "Finland",
          "Belgium", "Austria", "Portugal", "Poland", "Italy", "Estonia"}
keep = [c for c in companies
        if c.get("status") == "Active"
        and 11 <= (c.get("team_size") or 0) <= 200
        and TARGET & set(c.get("regions") or [])]
print(len(keep), "companies match the ICP filter")

random.seed(42)          # same shuffle every time you run it
random.shuffle(keep)

def write(path, rows):
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["source", "source_record_id", "company_name", "website",
                    "country", "city", "employees", "industry", "linkedin_url"])
        for c in rows:
            first = (c.get("all_locations") or "").split(";")[0]
            parts = [p.strip() for p in first.split(",")]
            w.writerow(["yc", c["id"], c["name"], c.get("website") or "",   
                        parts[-1] if parts[0] else "",
                        parts[0] if len(parts) > 1 else "",
                        c.get("team_size") or "", c.get("subindustry") or "", ""])
    print("Wrote", len(rows), "rows to", path)

write("src_yc.csv", keep[:120])
write("extra_pool.csv", keep[120:150])