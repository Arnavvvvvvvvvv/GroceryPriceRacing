# PriceDuel — Blinkit vs Instamart Price Comparison

A web app that settles the "is this cheaper on Blinkit or Instamart?" argument in one search.
Type an item, pick a delivery location, and see matching listings and prices from both
quick-commerce platforms side by side.

Built for the **CarDekho Group Great Grocery Price Race** build challenge.

---

## What it does

1. **Search** — User types a grocery item (e.g. "Maggi", "Amul butter").
2. **Compare** — The app queries both Blinkit and Instamart APIs in parallel, fetches live
   prices, and matches equivalent products across the two platforms.
3. **Decide** — Results are displayed as side-by-side comparison cards showing which platform
   is cheaper, the savings amount, and direct deeplinks to buy.

No logins. No mobile app. No APK reverse-engineering. Just a web page.

---

## Tech stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | React 18 + TypeScript + Vite        |
| Styling      | Tailwind CSS                        |
| Icons        | lucide-react                        |
| Backend      | Supabase Edge Functions (Deno)      |
| Database     | Supabase PostgreSQL (result cache)  |
| API proxy    | Edge Function (`compare-prices`)    |

---

## Setup & run (fresh machine)

### Prerequisites

- **Node.js 18+** and npm
- A Supabase project (free tier at [supabase.com](https://supabase.com))

### Steps

1. **Clone / unzip the project**

   ```bash
   cd priceduel
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

   These values come from your Supabase project → Settings → API.

4. **Apply the database migrations**

   Two tables power the app:
   - `search_cache` — caches live API results (10-minute TTL) to reduce requests.
   - `product_catalog` — seeded fallback data for when the live APIs block automated
     requests (Blinkit returns 429; Instamart returns 403 in testing).

   The migrations are already applied if using the provisioned Supabase project. To apply
   them manually, run the SQL in `supabase/migrations/` via the Supabase SQL Editor.

5. **Deploy the Edge Function**

   The `compare-prices` Edge Function proxies requests to Blinkit and Instamart.
   Deploy it from the Supabase Dashboard → Edge Functions, or:

   ```bash
   npx supabase functions deploy compare-prices
   ```

   Make sure `supabase/config.toml` has the function registered with
   `verify_jwt = false` (it's a public search endpoint).

6. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open the URL shown in your terminal (typically `http://localhost:5173`).

7. **Build for production**

   ```bash
   npm run build
   npm run preview
   ```

---

## How it works

### The API problem (and how the app handles it)

Both Blinkit and Swiggy Instamart actively block automated requests. In testing, Blinkit
returned **429 (rate-limited)** and Instamart returned **403 (forbidden)** within a few
requests. The app handles this gracefully:

1. **Try live first** — The Edge Function calls both APIs in parallel with 8-second timeouts.
2. **Fall back to catalog** — If a live API fails, the function queries a seeded
   `product_catalog` table with 80+ realistic products across 10 search terms.
3. **Be transparent** — The response includes a `source` field, and the UI shows a blue
   "Catalog mode" banner or a green "Live prices" banner so the user always knows the
   data source. The matching and comparison logic is identical in both modes.

This is a deliberate engineering call: a working demo with transparent data sourcing beats
a broken app that "would work if the APIs cooperated." The live API code is intact and will
work when the platforms aren't blocking.

### Architecture

```
User (browser)
  │
  ├──▶ React frontend (Vite)
  │      • Search bar + location picker
  │      • Product matching logic (client-side)
  │      • Comparison card UI
  │
  └──▶ Supabase Edge Function: compare-prices
         │
         ├──▶ Blinkit API (zeptonow.com/api/v1/search)
         ├──▶ Swiggy Instamart API (swiggy.com/api/instamart/search)
         │
         └──▶ Supabase PostgreSQL (search_cache table)
                • 10-minute TTL cache per (query, platform, location)
```

**Why this architecture:**

- **Edge Function as proxy** — The browser can't call Blinkit/Instamart APIs directly due
  to CORS. The Edge Function runs server-side (Deno), adds proper headers, and handles
  timeouts gracefully. It also keeps request volume reasonable with a 10-minute cache.
- **Client-side product matching** — Matching logic runs in the browser after data is
  fetched. This keeps the Edge Function thin (just data retrieval) and lets us iterate on
  matching heuristics without redeploying the backend.
- **PostgreSQL cache table** — Edge Functions are stateless; each request may hit a fresh
  instance. The database is the only durable store for the cache. This avoids hammering
  the upstream APIs on repeated searches.

**Alternatives considered:**

- *Direct browser → API calls*: Rejected due to CORS restrictions on both platforms.
- *Full backend server (Express/Node)*: Overkill for a single-endpoint proxy. Edge Functions
  are lighter and already provisioned.
- *Server-side matching*: Considered but moved to client-side for faster iteration and
  smaller backend footprint. The matching is CPU-light (string similarity on <40 products).

### Product matching

The core challenge: how do we know a Blinkit listing is "the same product" as an Instamart
listing? The two platforms use different names, brands, and pack sizes for identical items.

**My approach:**

1. **Name normalization** — Lowercase, strip quantities (e.g. "210g", "500ml"), strip common
   marketing words ("new", "classic", "premium", "diet"), remove punctuation.
2. **Brand removal** — Remove brand-name tokens from the product name so "Amul Taaza Toned Milk"
   and "Taaza Toned Milk" (same product, different brand formatting) still match.
3. **Core token extraction** — The remaining words form a "core identity" token set.
4. **Jaccard similarity** — Compare the core token sets of a Blinkit product and an Instamart
   product using Jaccard similarity (intersection / union). Threshold: ≥ 0.35 for a match.
5. **Quantity bonus** — If both products list a quantity (e.g. "210g"), matching quantities get
   a +0.2 bonus, near-matches (±5%) get +0.1, mismatches get -0.15. This prevents "Maggi 70g"
   from matching "Maggi 280g Family Pack".
6. **Greedy assignment** — For each Blinkit product, pick the best-scoring Instamart product
   that hasn't been matched yet. Unmatched products appear as platform-only entries.

**Where this breaks down (honestly):**

- **Brand spelling differences**: "Amul" on Blinkit might be "GCMMF" on Instamart. Brand
  removal helps, but if the brand is baked into the product name differently, the core tokens
  diverge.
- **Private labels**: Blinkit's own-brand products (e.g. "Blinkit Fresh Milk") will never match
  Instamart's equivalent store brand — the names are fundamentally different even if the
  product is the same category.
- **Ambiguous short names**: Searching "milk" returns 50+ results across both platforms. A
  200ml Amul Taaza and a 500ml Mother Dairy will have similar core tokens ("toned milk") and
  may incorrectly match. The quantity bonus helps but doesn't fully solve this.
- **Variant explosion**: "Maggi Masala 70g", "Maggi Masala 70g (Pack of 4)", "Maggi 2-Minute
  Masala Noodles 70g" are all different listings on the same platform. The matcher may pair
  the wrong variants across platforms.
- **No canonical product IDs**: Neither platform exposes a UPC/GTIN. Without a universal
  product identifier, all matching is heuristic. A production version would need a curated
  product catalogue or a third-party barcode database.

### Scaling to many locations / many users

**Many locations:**
- The current Edge Function has a hardcoded map of 8 locations → lat/lon. To scale, this
  would become a location search endpoint (geocode a pincode/area name → lat/lon) or use
  the browser's geolocation API.
- The cache key includes location, so each location has its own cache — no cross-location
  conflicts.
- Blinkit and Instamart both support lat/lon-based search, so the API calls themselves
  already scale to any location. The bottleneck is the location→coordinate resolution.

**Many users:**
- The 10-minute cache already reduces upstream API calls significantly. For higher traffic,
  increase the TTL (e.g. 30 minutes) or add a background refresh job that pre-warms popular
  queries.
- The Edge Function runs in parallel for both platforms, and Supabase auto-scales Edge
  Functions horizontally. No single-instance bottleneck.
- For very high traffic, add rate limiting at the Edge Function level (per-IP or per-session)
  to prevent abuse, and consider a dedicated scraping service with rotating IPs if the
  platforms start blocking.
- The product matching is client-side, so CPU cost scales with the user's browser, not the
  server.

---

## Project structure

```
priceduel/
├── src/
│   ├── App.tsx              # Main UI: search, results, comparison cards
│   ├── lib/
│   │   ├── api.ts           # Fetch wrapper for the Edge Function
│   │   ├── matching.ts      # Cross-platform product matching logic
│   │   └── types.ts         # Shared TypeScript types
│   ├── index.css            # Tailwind + custom animations
│   └── main.tsx             # React entry point
├── supabase/
│   ├── functions/
│   │   └── compare-prices/
│   │       └── index.ts     # Edge Function: live APIs + catalog fallback
│   ├── migrations/
│   │   ├── *_create_search_cache_table.sql   # API result cache
│   │   └── *_create_product_catalog_seed.sql  # Seeded fallback catalog
│   └── config.toml          # Supabase function config
├── DESIGN_NOTE.md           # One-page design note (architecture + matching)
├── README.md                # This file
└── package.json
```

---

## Ground rules compliance

- **Reasonable request volume**: 10-minute server-side cache, parallel calls, max 20 results
  per platform per search.
- **No deployment/sharing**: App runs locally only. Not deployed publicly.
- **No logins**: No authentication flows. No user accounts.
- **No mobile app / APK**: Desktop web only. Uses public web APIs.

---

## License

Built for a job application challenge. Not for commercial use.
