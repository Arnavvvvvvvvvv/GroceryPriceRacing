# Design Note — PriceDuel

## Architecture

```
Browser (React)
  │
  ├──▶ Supabase Edge Function (Deno)
  │      ├──▶ Blinkit API  (zeptonow.com/api/v1/search)
  │      ├──▶ Instamart API (swiggy.com/api/instamart/search)
  │      ├──▶ PostgreSQL cache (10-min TTL, for live results)
  │      └──▶ PostgreSQL product_catalog (fallback when APIs block)
  │
  └──▶ Client-side product matching (Jaccard similarity)
```

**Why this over alternatives:**

- *Edge Function proxy* over direct browser calls: Blinkit and Instamart both enforce CORS,
  so the browser can't reach their APIs. A thin Deno proxy adds the right headers, handles
  timeouts, and caches results — without standing up a full Node server.
- *Client-side matching* over server-side: the matching is CPU-light (string similarity on
  ≤40 products per search) and lets us iterate on heuristics without redeploying the backend.
- *PostgreSQL cache* over in-memory: Edge Functions are stateless — each request may hit a
  fresh instance with no shared memory. The database is the only durable store, so the
  10-minute cache lives there. This keeps upstream request volume reasonable.

## The real-world problem: APIs fight back

Both Blinkit (via zeptonow.com) and Swiggy Instamart actively block automated requests.
In testing, Blinkit returned **429 (rate-limited)** and Instamart returned **403 (forbidden)**
within a few requests. This is the messy reality the challenge warned about.

**My response — a transparent fallback, not a silent failure:**

1. The Edge Function tries both live APIs in parallel (with 8s timeouts).
2. If a live API fails (429, 403, timeout, network error), it falls back to a **seeded
   product catalog** stored in PostgreSQL — 80+ realistic products across 10 search terms,
   with different prices on each platform to demonstrate the comparison.
3. The response includes a `source` field (`"live"` or `"catalog"`) per platform, and the UI
   shows a **blue banner** when displaying catalog data and a **green banner** for live data.
   The user always knows which mode they're in.
4. The matching and comparison logic is **identical** in both modes — the catalog data goes
  through the same Jaccard similarity + quantity bonus pipeline as live data.

This is a deliberate engineering call: a working demo with transparent data sourcing beats
a broken app that "would work if the APIs cooperated." The live API code is intact and will
work when the platforms aren't blocking — the catalog is a safety net, not a replacement.

## Product matching: how "same product" is decided

1. **Normalize names**: lowercase, strip quantities ("210g"), strip marketing words
   ("new", "classic", "premium"), remove punctuation.
2. **Remove brand tokens** so "Amul Taaza Toned Milk" and "Taaza Toned Milk" still match.
3. **Extract core token sets** from what remains.
4. **Jaccard similarity** between Blinkit and Instamart token sets; threshold ≥ 0.35.
5. **Quantity bonus**: exact match +0.2, near-match (±5%) +0.1, mismatch −0.15. Prevents
   "Maggi 70g" from pairing with "Maggi 280g Family Pack".
6. **Greedy assignment**: each Blinkit product takes its best-scoring unmatched Instamart
   counterpart. Leftovers appear as platform-only cards.

## Where matching breaks down

- **Brand spelling**: "Amul" vs "GCMMF" — brand removal helps but isn't perfect.
- **Private labels**: Blinkit's own brand will never token-match Instamart's equivalent.
- **Short/ambiguous names**: searching "milk" yields 50+ results; a 200ml Amul Taaza may
  false-match a 500ml Mother Dairy despite the quantity bonus.
- **Variant explosion**: "Maggi 70g", "Maggi 70g Pack of 4", "Maggi 2-Min Masala 70g" are
  separate listings — the matcher may pair wrong variants across platforms.
- **No canonical IDs**: neither platform exposes UPC/GTIN. All matching is heuristic. A
  production version needs a curated catalogue or barcode database.

## Scaling to many locations / many users

**Locations:** Replace the hardcoded 8-location map with a geocode endpoint (pincode → lat/lon)
or the browser geolocation API. The cache already keys on location, so there are no
cross-location conflicts. Both upstream APIs already accept lat/lon, so the API layer scales.

**Users:** The 10-minute cache cuts upstream calls dramatically. For more traffic, increase
TTL or add a background pre-warm for popular queries. Edge Functions auto-scale horizontally.
Add per-IP rate limiting to prevent abuse, and a dedicated scraping service with rotating IPs
if platforms start blocking. Matching is client-side, so CPU cost scales with the user's
browser, not the server.

**API resilience:** The catalog fallback means the app degrades gracefully under rate limiting
or IP blocks. A production version would add a dedicated scraping layer with residential
proxies, request queues, and retry-with-backoff — but the fallback architecture stays the same.
