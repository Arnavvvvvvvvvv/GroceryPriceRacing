import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ProductListing {
  name: string;
  brand: string;
  price: number;
  mrp: number;
  quantity: string;
  image: string;
  inStock: boolean;
  deeplink: string;
  platform: string;
}

interface BlinkitProduct {
  product_id?: string;
  name?: string;
  title?: string;
  brand?: string;
  manufacturer?: string;
  price?: number;
  offer_price?: number;
  mrp?: number;
  unit?: string;
  quantity?: string;
  packsize?: string;
  image?: string;
  images?: string[];
  available?: boolean;
  in_stock?: boolean;
  inventory?: number;
  deeplink?: string;
  link?: string;
}

interface InstamartProduct {
  id?: string;
  name?: string;
  title?: string;
  brand?: string;
  price?: number;
  mrp?: number;
  selling_price?: number;
  unit?: string;
  quantity?: string;
  pack_quantity?: string;
  image?: string;
  images?: string[];
  available?: boolean;
  in_stock?: boolean;
  deeplink?: string;
  link?: string;
  out_of_stock?: boolean;
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

async function getCachedResults(query: string, platform: string, location: string): Promise<any[] | null> {
  const { data } = await supabase
    .from("search_cache")
    .select("results, created_at")
    .eq("query", query.toLowerCase())
    .eq("platform", platform)
    .eq("location", location.toLowerCase())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  const age = Date.now() - new Date(data.created_at).getTime();
  if (age > CACHE_TTL_MS) return null;
  return data.results as any[];
}

async function setCachedResults(query: string, platform: string, location: string, results: any[]): Promise<void> {
  await supabase.from("search_cache").insert({
    query: query.toLowerCase(),
    platform,
    location: location.toLowerCase(),
    results,
  });
}

// ─── Delhi NCR locations ──────────────────────────────────

const DELHI_LOCATIONS: Record<string, { lat: number; lon: number }> = {
  "connaught place, delhi": { lat: 28.6315, lon: 77.2167 },
  "saket, delhi": { lat: 28.5244, lon: 77.2066 },
  "vasant kunj, delhi": { lat: 28.5246, lon: 77.1570 },
  "dwarka, delhi": { lat: 28.5921, lon: 77.0460 },
  "rohini, delhi": { lat: 28.7325, lon: 77.0876 },
  "karol bagh, delhi": { lat: 28.6519, lon: 77.1909 },
  "lajpat nagar, delhi": { lat: 28.5677, lon: 77.2434 },
  "sector 18, noida": { lat: 28.5244, lon: 77.3317 },
  "cyber city, gurugram": { lat: 28.4949, lon: 77.0898 },
  "rajouri garden, delhi": { lat: 28.6500, lon: 77.1206 },
};

function resolveLocation(location: string): { lat: number; lon: number } {
  const key = location.toLowerCase().trim();
  if (DELHI_LOCATIONS[key]) return DELHI_LOCATIONS[key];
  for (const [k, v] of Object.entries(DELHI_LOCATIONS)) {
    if (k.includes(key) || key.includes(k.split(",")[0])) return v;
  }
  return { lat: 28.6315, lon: 77.2167 };
}

// ─── Live API: Blinkit ────────────────────────────────────

async function searchBlinkitLive(query: string, location: string): Promise<ProductListing[]> {
  const { lat, lon } = resolveLocation(location);

  const url = `https://www.zeptonow.com/api/v1/search?q=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}`;
  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.zeptonow.com/",
    "Origin": "https://www.zeptonow.com",
    "x-domain": "blinkit",
  };

  const resp = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
  if (!resp.ok) throw new Error(`Blinkit API returned ${resp.status}`);
  const json: any = await resp.json();

  const rawProducts: BlinkitProduct[] =
    json?.data?.products ||
    json?.data?.items ||
    json?.products ||
    json?.items ||
    [];

  return rawProducts.slice(0, 20).map((p) => {
    const name = p.name || p.title || "Unknown product";
    const price = Number(p.price ?? p.offer_price ?? 0);
    const mrp = Number(p.mrp ?? price);
    const image = p.image || (p.images && p.images[0]) || "";
    const quantity = p.unit || p.quantity || p.packsize || "";
    const deeplink = p.deeplink || p.link || `https://blinkit.com/prn/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"))}/prid/${p.product_id || ""}`;
    return {
      name,
      brand: p.brand || p.manufacturer || "",
      price,
      mrp,
      quantity,
      image,
      inStock: p.available !== false && p.in_stock !== false && (p.inventory === undefined || p.inventory > 0),
      deeplink,
      platform: "Blinkit",
    };
  });
}

// ─── Live API: Instamart (Swiggy) ─────────────────────────

async function searchInstamartLive(query: string, location: string): Promise<ProductListing[]> {
  const { lat, lon } = resolveLocation(location);

  const url = `https://www.swiggy.com/api/instamart/search?query=${encodeURIComponent(query)}&lat=${lat}&lng=${lon}`;
  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.swiggy.com/instamart",
    "Origin": "https://www.swiggy.com",
  };

  const resp = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
  if (!resp.ok) throw new Error(`Instamart API returned ${resp.status}`);
  const json: any = await resp.json();

  const rawProducts: InstamartProduct[] =
    json?.data?.products ||
    json?.data?.items ||
    json?.data?.tiles?.filter((t: any) => t?.data?.type === "PRODUCT")?.map((t: any) => t?.data?.content) ||
    json?.products ||
    json?.items ||
    [];

  return rawProducts.slice(0, 20).map((p) => {
    const name = p.name || p.title || "Unknown product";
    const price = Number(p.price ?? p.selling_price ?? 0);
    const mrp = Number(p.mrp ?? price);
    const image = p.image || (p.images && p.images[0]) || "";
    const quantity = p.unit || p.quantity || p.pack_quantity || "";
    const deeplink = p.deeplink || p.link || `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(name)}`;
    return {
      name,
      brand: p.brand || "",
      price,
      mrp,
      quantity,
      image,
      inStock: p.available !== false && p.in_stock !== false && !p.out_of_stock,
      deeplink,
      platform: "Instamart",
    };
  });
}

// ─── Fallback: seeded catalog ─────────────────────────────

async function searchCatalog(query: string, platform: string): Promise<ProductListing[]> {
  const { data, error } = await supabase
    .from("product_catalog")
    .select("*")
    .ilike("search_term", query.toLowerCase().trim())
    .ilike("platform", platform.toLowerCase().trim());

  if (error || !data) return [];

  return data.map((row: any) => ({
    name: row.name,
    brand: row.brand || "",
    price: Number(row.price),
    mrp: Number(row.mrp),
    quantity: row.quantity || "",
    image: row.image || "",
    inStock: row.in_stock ?? true,
    deeplink: row.deeplink || "",
    platform: platform === "blinkit" ? "Blinkit" : "Instamart",
  }));
}

// ─── Main Handler ─────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("query") || "";
    const location = url.searchParams.get("location") || "Connaught Place, Delhi";

    if (!query.trim()) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Check cache for both platforms
    const [cachedBlinkit, cachedInstamart] = await Promise.all([
      getCachedResults(query, "blinkit", location),
      getCachedResults(query, "instamart", location),
    ]);

    // Try live APIs only if cache miss
    const [blinkitPromise, instamartPromise] = await Promise.allSettled([
      cachedBlinkit ? Promise.resolve(cachedBlinkit) : searchBlinkitLive(query, location),
      cachedInstamart ? Promise.resolve(cachedInstamart) : searchInstamartLive(query, location),
    ]);

    let blinkitResults: ProductListing[] = [];
    let instamartResults: ProductListing[] = [];
    let blinkitSource: "live" | "catalog" = "live";
    let instamartSource: "live" | "catalog" = "live";

    if (blinkitPromise.status === "fulfilled") {
      blinkitResults = blinkitPromise.value;
    } else {
      blinkitResults = await searchCatalog(query, "blinkit");
      blinkitSource = "catalog";
    }

    if (instamartPromise.status === "fulfilled") {
      instamartResults = instamartPromise.value;
    } else {
      instamartResults = await searchCatalog(query, "instamart");
      instamartSource = "catalog";
    }

    // Cache fresh live results only
    if (!cachedBlinkit && blinkitSource === "live" && blinkitResults.length > 0) {
      await setCachedResults(query, "blinkit", location, blinkitResults);
    }
    if (!cachedInstamart && instamartSource === "live" && instamartResults.length > 0) {
      await setCachedResults(query, "instamart", location, instamartResults);
    }

    const source = (blinkitSource === "catalog" || instamartSource === "catalog")
      ? "catalog"
      : "live";

    // No errors array sent to the client — the fallback is silent and seamless.
    // The `source` field tells the UI which mode it's in, displayed as a subtle info badge.
    return new Response(
      JSON.stringify({
        query,
        location,
        blinkit: blinkitResults,
        instamart: instamartResults,
        source,
        blinkitSource,
        instamartSource,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
