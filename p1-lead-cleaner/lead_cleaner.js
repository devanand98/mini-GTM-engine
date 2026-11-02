// ===== Lead Cleaner v2 (your decisions D1-D4) =====
// n8n Code node, Mode: Run Once for All Items
// Input: YC rows first, then legacy CRM rows (the Merge node does this order)

// ---- Reference lists (D3: fixed value lists) ----
const REF_COUNTRY = {
  'usa':'US','us':'US','u.s':'US','u.s.':'US','united states':'US','united states of america':'US',
  'uk':'GB','united kingdom':'GB','gb':'GB','england':'GB',
  'germany':'DE','france':'FR','netherlands':'NL','ireland':'IE','spain':'ES','sweden':'SE',
  'poland':'PL','denmark':'DK','finland':'FI','belgium':'BE','austria':'AT','portugal':'PT',
  'italy':'IT','estonia':'EE'
};
// Existing Truewatch customers (from product-brief.md): never prospect these
const CUSTOMERS = ['recurrency','inbuild','auctor','fleetworks','confident lims','popl',
  'arketa','readme','humaans','imgix','langdock','semble'];
const FREE_EMAIL = ['gmail.com','yahoo.com','hotmail.com','outlook.com','icloud.com'];

// ---- Helpers ----
function cleanDomain(website) {
  let w = String(website || '').trim().toLowerCase();
  if (w.includes('@')) w = w.split('@')[1];      // email typed in the website field
  w = w.replace(/^https?:\/\//, '').replace(/^www\./, '');
  w = w.split(/[\/?#]/)[0];                       // drop path, ?utm=..., #...
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(w) ? w : '';
}
function matchKey(name) {                          // D2: ugly on purpose, never shown
  return String(name || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')   // remove accents
    .replace(/^the\s+/, '')
    .replace(/[.,]/g, ' ')
    .replace(/\b(inc|llc|ltd|limited|gmbh|corp|co)\b/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ').trim();
}
function displayName(name) {                       // D2: what a rep sees
  return String(name || '').trim().replace(/\s+/g, ' ')
    .replace(/,?\s+(INC|LTD|Inc\.?|Ltd\.?|LLC)$/,'');
}
function domainStem(domain) { return domain ? domain.split('.')[0] : ''; }
function bucket(n) {                               // D3: five fixed buckets
  if (!n) return '';
  if (n <= 10) return '1-10';
  if (n <= 50) return '11-50';
  if (n <= 200) return '51-200';
  if (n <= 500) return '201-500';
  return '500+';
}
function makeId(domain) {                          // same domain -> same ID forever
  let h = 0x811c9dc5;
  for (const c of domain) { h ^= c.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return 'acc_' + h.toString(16).padStart(8, '0');
}

// ---- Main loop ----
const accounts = [];          // surviving records
const byDomain = {}, byKey = {}, byStem = {};
const duplicates = [], review = [];
const runId = 'run_' + new Date().toISOString().slice(0,16).replace(/[-:T]/g,'');

for (const item of items) {
  const r = item.json;
  const flags = [];
  const domain = cleanDomain(r.website);
  if (!domain) flags.push(r.website ? 'invalid_website' : 'missing_website');
  if (String(r.website || '').includes('@')) flags.push('website_was_email');
  if (FREE_EMAIL.includes(domain)) flags.push('free_email_domain');

  const rawCountry = String(r.country || '').trim().toLowerCase();
  const country = REF_COUNTRY[rawCountry] || '';
  if (!country) flags.push('unmapped_country:' + r.country);   // D4: flag, never guess

  const num = parseInt(String(r.employees || '').replace(/[^0-9]/g, ''), 10) || null;
  if (!num) flags.push('missing_employees');

  const key = matchKey(r.company_name);
  const stem = domainStem(domain);

  // D1: match cascade - domain, then name key, then domain stem
  let match = null, matchedBy = '';
  if (domain && byDomain[domain])      { match = byDomain[domain]; matchedBy = 'domain'; }
  else if (key && byKey[key])          { match = byKey[key];       matchedBy = 'name_key'; }
  else if (stem && byStem[stem])       { match = byStem[stem];     matchedBy = 'domain_stem'; }

  if (match) {
    // fill blanks in the survivor from the duplicate (field-level merge)
    if (!match.linkedin_url && r.linkedin_url) { match.linkedin_url = r.linkedin_url; match.filled_from.push(r.source + ':linkedin_url'); }
    duplicates.push({ status: 'duplicate', source: r.source, source_record_id: r.source_record_id,
      company_name: r.company_name, website: r.website, duplicate_of: match.account_id,
      matched_by: matchedBy, run_id: runId });
    continue;
  }

  if (!domain) {   // can't identify it and nothing matched: a human decides (D1 last step)
    review.push({ status: 'review', source: r.source, source_record_id: r.source_record_id,
      company_name: r.company_name, website: r.website, dq_flags: flags.join('; '), run_id: runId });
    continue;
  }

  const acc = {
    status: 'accepted', account_id: makeId(domain), company_name: displayName(r.company_name),
    match_key: key, domain, country, city: r.city || '', employees_num: num || '',
    headcount_bucket: bucket(num), industry: r.industry || '', linkedin_url: r.linkedin_url || '',
    is_customer: CUSTOMERS.includes(key), source: r.source, source_record_id: r.source_record_id,
    filled_from: [], dq_flags: flags.join('; '), run_id: runId
  };
  accounts.push(acc);
  byDomain[domain] = acc; if (key) byKey[key] = acc; byStem[stem] = acc;
}

return [...accounts.map(a => ({ json: { ...a, filled_from: a.filled_from.join('; ') } })),
        ...duplicates.map(d => ({ json: d })),
        ...review.map(v => ({ json: v }))];
