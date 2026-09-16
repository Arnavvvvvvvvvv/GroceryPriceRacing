import { useState, useCallback, useEffect } from "react";
import {
  Search, MapPin, TrendingUp, Zap, ArrowRight, ExternalLink,
  CheckCircle2, XCircle, Store, Sparkles, ChevronDown, Clock,
  Package, ShoppingCart, Info, RefreshCw, Home,
} from "lucide-react";
import { fetchComparison } from "./lib/api";
import { matchProducts } from "./lib/matching";
import { LOCATIONS, type CompareResponse, type MatchedProduct } from "./lib/types";

type SortOption = "savings" | "price-low" | "name";

function App() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState<string>(LOCATIONS[0]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<CompareResponse | null>(null);
  const [matched, setMatched] = useState<MatchedProduct[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("savings");

  const popularSearches = ["Maggi", "Amul Butter", "Milk", "Bread", "Coca Cola", "Lays", "Eggs", "Tea"];

  const doSearch = useCallback(async (q: string, loc: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setMatched([]);
    try {
      const data = await fetchComparison(q, loc);
      setResults(data);
      setMatched(matchProducts(data.blinkit, data.instamart));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query, location);
  };

  const sortedMatched = [...matched].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.bestPrice || 0) - (b.bestPrice || 0);
      case "name":
        return a.normalizedName.localeCompare(b.normalizedName);
      default:
        if (a.blinkit && a.instamart && b.blinkit && b.instamart) {
          return b.savingsPercent - a.savingsPercent;
        }
        if (a.blinkit && a.instamart) return -1;
        if (b.blinkit && b.instamart) return 1;
        return 0;
    }
  });

  const stats = {
    total: matched.length,
    matchedPairs: matched.filter((m) => m.blinkit && m.instamart).length,
    blinkitOnly: matched.filter((m) => m.blinkit && !m.instamart).length,
    instamartOnly: matched.filter((m) => m.instamart && !m.blinkit).length,
    totalSavings: matched.reduce((sum, m) => sum + (m.savingsPercent > 0 ? m.priceDifference : 0), 0),
  };

  useEffect(() => {
    if (!locationOpen) return;
    const handler = () => setLocationOpen(false);
    setTimeout(() => document.addEventListener("click", handler), 0);
    return () => document.removeEventListener("click", handler);
  }, [locationOpen]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Header
        results={results}
        onReset={() => {
          setResults(null);
          setMatched([]);
          setQuery("");
        }}
      />

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {!results && !loading && (
          <HeroSection />
        )}

        {/* Search Bar */}
        <div className={`${!results && !loading ? "pb-8" : "pt-6 pb-6"}`}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for Maggi, Amul butter, milk..."
                className="w-full rounded-xl border border-stone-200 bg-white py-3.5 pl-12 pr-4 text-base shadow-sm outline-none transition-all placeholder:text-stone-400 focus:border-stone-400 focus:ring-2 focus:ring-stone-900/5"
                autoFocus
              />
            </div>

            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setLocationOpen(!locationOpen)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-sm font-medium text-stone-700 shadow-sm transition-all hover:border-stone-300 sm:w-auto"
              >
                <MapPin className="h-4 w-4 text-stone-500" />
                <span className="truncate">{location.split(",")[0]}</span>
                <ChevronDown className="h-4 w-4 text-stone-400" />
              </button>
              {locationOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 max-h-72 w-64 overflow-y-auto rounded-xl border border-stone-200 bg-white py-1.5 shadow-xl animate-fade-in">
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setLocation(loc);
                        setLocationOpen(false);
                        if (query.trim()) doSearch(query, loc);
                      }}
                      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-stone-50 ${
                        location === loc ? "font-semibold text-stone-900" : "text-stone-600"
                      }`}
                    >
                      <MapPin className="h-4 w-4 flex-shrink-0 text-stone-400" />
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Searching..." : "Compare"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {!results && !loading && !error && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-stone-500">Popular:</span>
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term);
                    doSearch(term, location);
                  }}
                  className="rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-sm font-medium text-stone-700 shadow-sm transition-all hover:border-stone-300 hover:bg-stone-50"
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && <LoadingState />}

        {error && !loading && (
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center animate-fade-in">
            <Info className="mx-auto mb-3 h-8 w-8 text-red-400" />
            <h3 className="text-base font-semibold text-red-900">Something went wrong</h3>
            <p className="mt-1.5 text-sm text-red-700">{error}</p>
            <button
              onClick={() => doSearch(query, location)}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {results && !loading && !error && (
          <ResultsView
            results={results}
            matched={sortedMatched}
            stats={stats}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onRefresh={() => doSearch(query, location)}
          />
        )}
      </main>

      <footer className="mt-16 border-t border-stone-200 bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="text-center text-xs text-stone-500">
            PriceDuel — Compare grocery prices across Blinkit & Instamart for Delhi NCR delivery.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Header({ results, onReset }: { results: CompareResponse | null; onReset: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <button onClick={onReset} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-white shadow-sm">
            <Zap className="h-5 w-5" fill="white" />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-bold tracking-tight">PriceDuel</h1>
            <p className="hidden text-xs text-stone-500 sm:block">Blinkit vs Instamart — Delhi NCR</p>
          </div>
        </button>
        {results && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm transition-all hover:bg-stone-50"
          >
            <Home className="h-4 w-4" />
            Home
          </button>
        )}
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <div className="flex flex-col items-center pt-16 pb-12 text-center sm:pt-24">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm font-medium text-stone-600 shadow-sm">
        <Sparkles className="h-4 w-4 text-amber-500" />
        The Great Grocery Price Race
      </div>
      <h2 className="max-w-2xl text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
        Is it cheaper on
        <span className="relative mx-2 inline-block">
          <span className="relative z-10 text-yellow-500">Blinkit</span>
          <span className="absolute bottom-1 left-0 z-0 h-3 w-full bg-yellow-200/60" />
        </span>
        or
        <span className="relative mx-2 inline-block">
          <span className="relative z-10 text-orange-500">Instamart</span>
          <span className="absolute bottom-1 left-0 z-0 h-3 w-full bg-orange-200/60" />
        </span>
        ?
      </h2>
      <p className="mt-4 max-w-lg text-base text-stone-600">
        Search once. Compare prices from both quick-commerce apps, for delivery anywhere in Delhi NCR.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-stone-500">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100">
            <Zap className="h-4 w-4 text-yellow-600" />
          </div>
          <span>Live prices</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <span>Side-by-side comparison</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <MapPin className="h-4 w-4 text-blue-600" />
          </div>
          <span>10 Delhi NCR areas</span>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mt-8 animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
        <p className="text-sm font-medium text-stone-600">Fetching prices from Blinkit & Instamart...</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex gap-4">
              <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-stone-100 animate-shimmer" />
              <div className="flex-1 space-y-2.5">
                <div className="h-4 w-3/4 rounded bg-stone-100 animate-shimmer" />
                <div className="h-3 w-1/2 rounded bg-stone-100 animate-shimmer" />
                <div className="flex gap-2 pt-1">
                  <div className="h-7 w-20 rounded-lg bg-stone-100 animate-shimmer" />
                  <div className="h-7 w-20 rounded-lg bg-stone-100 animate-shimmer" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsView({
  results,
  matched,
  stats,
  sortBy,
  setSortBy,
  onRefresh,
}: {
  results: CompareResponse;
  matched: MatchedProduct[];
  stats: { total: number; matchedPairs: number; blinkitOnly: number; instamartOnly: number; totalSavings: number };
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  onRefresh: () => void;
}) {
  const hasData = matched.length > 0;
  const isCatalog = results.source === "catalog";

  return (
    <div className="animate-fade-in pb-12">
      {/* Search summary + source badge */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight">
            <span className="text-stone-900">"{results.query}"</span>
            <span className="ml-2 text-stone-400 font-normal">in {results.location}</span>
          </h2>
          <DataSourceBadge isCatalog={isCatalog} />
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-600 shadow-sm transition-all hover:bg-stone-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats bar */}
      {hasData && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <StatChip icon={<Package className="h-4 w-4 text-stone-500" />} value={stats.total} label="products" />
          {stats.matchedPairs > 0 && (
            <StatChip
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              value={stats.matchedPairs}
              label="matched on both"
              color="emerald"
            />
          )}
          {stats.blinkitOnly > 0 && (
            <StatChip
              icon={<Store className="h-4 w-4 text-yellow-600" />}
              value={stats.blinkitOnly}
              label="Blinkit only"
              color="yellow"
            />
          )}
          {stats.instamartOnly > 0 && (
            <StatChip
              icon={<Store className="h-4 w-4 text-orange-600" />}
              value={stats.instamartOnly}
              label="Instamart only"
              color="orange"
            />
          )}
          {stats.totalSavings > 0 && (
            <StatChip
              icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
              value={`₹${stats.totalSavings}`}
              label="potential savings"
              color="emerald"
            />
          )}
        </div>
      )}

      {/* Sort controls */}
      {hasData && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-stone-500">Sort by:</span>
          {(["savings", "price-low", "name"] as SortOption[]).map((opt) => (
            <button
              key={opt}
              onClick={() => setSortBy(opt)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                sortBy === opt
                  ? "bg-stone-900 text-white"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              {opt === "savings" ? "Biggest savings" : opt === "price-low" ? "Lowest price" : "Name A–Z"}
            </button>
          ))}
        </div>
      )}

      {/* Results grid */}
      {hasData ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {matched.map((product, idx) => (
            <ProductCard key={product.key} product={product} index={idx} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function DataSourceBadge({ isCatalog }: { isCatalog: boolean }) {
  if (isCatalog) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-100">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        Catalog
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Live
    </span>
  );
}

function StatChip({
  icon,
  value,
  label,
  color = "neutral",
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color?: "neutral" | "emerald" | "yellow" | "orange";
}) {
  const colorMap = {
    neutral: "bg-white border-stone-200",
    emerald: "bg-emerald-50 border-emerald-200",
    yellow: "bg-yellow-50 border-yellow-200",
    orange: "bg-orange-50 border-orange-200",
  };
  return (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm shadow-sm border ${colorMap[color]}`}>
      {icon}
      <span className="font-semibold text-stone-900">{value}</span>
      <span className="text-stone-500">{label}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto mt-12 max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center animate-fade-in">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100">
        <Search className="h-6 w-6 text-stone-300" />
      </div>
      <h3 className="text-base font-semibold text-stone-900">No products found</h3>
      <p className="mt-1.5 text-sm text-stone-600">
        Try a different search term — like "Maggi", "milk", or "bread". Both platforms might not stock every item.
      </p>
    </div>
  );
}

function ProductCard({ product, index }: { product: MatchedProduct; index: number }) {
  const isMatched = !!(product.blinkit && product.instamart);
  const blinkitPrice = product.blinkit?.price;
  const instamartPrice = product.instamart?.price;
  const blinkitCheaper = isMatched && blinkitPrice !== undefined && instamartPrice !== undefined && blinkitPrice < instamartPrice;
  const instamartCheaper = isMatched && blinkitPrice !== undefined && instamartPrice !== undefined && instamartPrice < blinkitPrice;
  const samePrice = isMatched && blinkitPrice === instamartPrice;

  const animationDelay = `${Math.min(index * 40, 400)}ms`;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all hover:shadow-md animate-slide-up"
      style={{ animationDelay, opacity: 0 }}
    >
      <div className="flex items-start gap-4 p-4">
        <ProductImage product={product.blinkit || product.instamart} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold leading-snug text-stone-900">{product.normalizedName}</h3>
          {product.brand && <p className="mt-0.5 truncate text-xs text-stone-500">{product.brand}</p>}
          {product.quantity && (
            <span className="mt-1.5 inline-block rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
              {product.quantity}
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-stone-100">
        {isMatched ? (
          <div className="grid grid-cols-2">
            <PriceColumn
              platform="Blinkit"
              color="yellow"
              price={product.blinkit!.price}
              mrp={product.blinkit!.mrp}
              inStock={product.blinkit!.inStock}
              deeplink={product.blinkit!.deeplink}
              isWinner={blinkitCheaper}
            />
            <PriceColumn
              platform="Instamart"
              color="orange"
              price={product.instamart!.price}
              mrp={product.instamart!.mrp}
              inStock={product.instamart!.inStock}
              deeplink={product.instamart!.deeplink}
              isWinner={instamartCheaper}
            />
          </div>
        ) : product.blinkit ? (
          <div className="grid grid-cols-2">
            <PriceColumn
              platform="Blinkit"
              color="yellow"
              price={product.blinkit.price}
              mrp={product.blinkit.mrp}
              inStock={product.blinkit.inStock}
              deeplink={product.blinkit.deeplink}
              isWinner={false}
            />
            <div className="flex flex-col items-center justify-center border-l border-stone-100 bg-stone-50/50 py-4">
              <XCircle className="h-5 w-5 text-stone-300" />
              <p className="mt-1.5 text-xs font-medium text-stone-400">Not on Instamart</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2">
            <div className="flex flex-col items-center justify-center py-4 bg-stone-50/50">
              <XCircle className="h-5 w-5 text-stone-300" />
              <p className="mt-1.5 text-xs font-medium text-stone-400">Not on Blinkit</p>
            </div>
            <PriceColumn
              platform="Instamart"
              color="orange"
              price={product.instamart!.price}
              mrp={product.instamart!.mrp}
              inStock={product.instamart!.inStock}
              deeplink={product.instamart!.deeplink}
              isWinner={false}
            />
          </div>
        )}
      </div>

      {isMatched && product.savingsPercent > 0 && (
        <div className={`flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold ${
          blinkitCheaper ? "bg-yellow-50 text-yellow-800" : "bg-orange-50 text-orange-800"
        }`}>
          <TrendingUp className="h-4 w-4" />
          Save ₹{product.priceDifference} ({product.savingsPercent}%) on {product.bestPlatform}
        </div>
      )}
      {isMatched && samePrice && blinkitPrice !== undefined && instamartPrice !== undefined && blinkitPrice > 0 && (
        <div className="flex items-center justify-center gap-1.5 bg-stone-50 py-2.5 text-sm font-medium text-stone-500">
          Same price on both platforms
        </div>
      )}
    </div>
  );
}

function ProductImage({ product }: { product?: { image: string; name: string } }) {
  const [imgError, setImgError] = useState(false);

  if (!product || !product.image || imgError) {
    return (
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-stone-100">
        <Store className="h-6 w-6 text-stone-300" />
      </div>
    );
  }

  return (
    <img
      src={product.image}
      alt={product.name}
      onError={() => setImgError(true)}
      className="h-16 w-16 flex-shrink-0 rounded-xl object-cover bg-stone-100"
      loading="lazy"
    />
  );
}

function PriceColumn({
  platform,
  color,
  price,
  mrp,
  inStock,
  deeplink,
  isWinner,
}: {
  platform: string;
  color: "yellow" | "orange";
  price: number;
  mrp: number;
  inStock: boolean;
  deeplink: string;
  isWinner: boolean;
}) {
  const colorClasses = {
    yellow: { bg: "bg-yellow-50", text: "text-yellow-700", badge: "bg-yellow-400" },
    orange: { bg: "bg-orange-50", text: "text-orange-700", badge: "bg-orange-400" },
  };
  const c = colorClasses[color];
  const hasDiscount = mrp > price && mrp > 0;

  return (
    <a
      href={deeplink}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative flex flex-col items-center justify-center py-4 transition-colors ${
        color === "orange" ? "border-l border-stone-100" : ""
      } ${isWinner ? c.bg : ""} hover:bg-stone-50`}
    >
      {isWinner && (
        <div className={`absolute top-2 right-2 rounded-full ${c.badge} px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm`}>
          Best
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <span className={`text-xs font-semibold ${c.text}`}>{platform}</span>
        <ExternalLink className="h-3 w-3 text-stone-300" />
      </div>
      {inStock ? (
        <>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-stone-900">₹{price}</span>
            {hasDiscount && <span className="text-xs text-stone-400 line-through">₹{mrp}</span>}
          </div>
          {hasDiscount && (
            <span className="mt-0.5 text-[11px] font-semibold text-emerald-600">
              {Math.round(((mrp - price) / mrp) * 100)}% off
            </span>
          )}
        </>
      ) : (
        <div className="mt-1.5 flex items-center gap-1 text-sm text-stone-400">
          <XCircle className="h-4 w-4" />
          Out of stock
        </div>
      )}
    </a>
  );
}

export default App;
