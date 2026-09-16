import type { ProductListing, MatchedProduct } from "./types";

/**
 * Normalize a product name for comparison.
 * Lowercases, removes brand prefixes, common suffixes, and normalizes whitespace.
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b\d+\s*(g|gm|gram|gms|kg|kilogram|ml|l|litre|liter|ltr|pcs|pc|pieces|piece|pack|pkt|sachet|bottle|box|bar|unit)\b/g, "")
    .replace(/\b(0|)(new|fresh|original|classic|special|premium|extra|value|combo|family|party|mini|pro|max|plus|lite|light|diet|sugar free|sugar-free|organic|homestyle|traditional|authentic)\b/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract a numeric quantity from a quantity string (e.g. "210 g" -> 210, "1 kg" -> 1000, "500 ml" -> 500).
 * Returns 0 if no quantity is found.
 */
function extractQuantity(qty: string): number {
  if (!qty) return 0;
  const text = qty.toLowerCase();
  const match = text.match(/([\d.]+)\s*(kg|kilogram|g|gm|gram|gms|ml|l|litre|liter|ltr|pcs|pc|pieces|piece|pack|pkt|sachet)/);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = match[2];
  if (unit === "kg" || unit === "kilogram") return value * 1000;
  if (unit === "l" || unit === "litre" || unit === "liter" || unit === "ltr") return value * 1000;
  return value;
}

/**
 * Extract the core product identity — the main descriptive words after removing brand.
 */
function coreTokens(name: string, brand: string): string[] {
  let normalized = normalizeName(name);
  if (brand) {
    const brandWords = brand.toLowerCase().split(/\s+/);
    for (const w of brandWords) {
      if (w.length > 2) {
        normalized = normalized.replace(new RegExp(`\\b${w}\\b`, "g"), "");
      }
    }
  }
  const tokens = normalized.split(/\s+/).filter((t) => t.length > 1);
  return tokens;
}

/**
 * Jaccard similarity between two token sets.
 */
function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Match products across Blinkit and Instamart.
 *
 * Strategy:
 * 1. Normalize names and extract core tokens (brand removed).
 * 2. For each Blinkit product, find the best-matching Instamart product
 *    using Jaccard similarity on core tokens + quantity match bonus.
 * 3. Threshold: similarity >= 0.35 to consider a match.
 * 4. Unmatched products from either platform are included as standalone entries.
 *
 * Known limitations (documented in DESIGN_NOTE.md):
 * - Brand spelling differences (e.g. "Amul" vs "GcMMF") won't match on brand tokens.
 * - Different pack sizes of the same product may match incorrectly if core name is identical.
 * - Private label / store brands won't match across platforms.
 * - Products with very short names (e.g. "Milk") have high false-positive rates.
 */
export function matchProducts(
  blinkit: ProductListing[],
  instamart: ProductListing[],
): MatchedProduct[] {
  const matched: MatchedProduct[] = [];
  const usedInstamart = new Set<number>();

  // Pre-compute tokens for all products
  const blinkitData = blinkit.map((p) => ({
    product: p,
    tokens: coreTokens(p.name, p.brand),
    qty: extractQuantity(p.quantity),
  }));

  const instamartData = instamart.map((p) => ({
    product: p,
    tokens: coreTokens(p.name, p.brand),
    qty: extractQuantity(p.quantity),
  }));

  // Match Blinkit products to Instamart products
  for (const b of blinkitData) {
    let bestIdx = -1;
    let bestScore = 0;

    for (let i = 0; i < instamartData.length; i++) {
      if (usedInstamart.has(i)) continue;
      const inst = instamartData[i];
      const nameSim = jaccardSimilarity(b.tokens, inst.tokens);

      // Quantity match bonus
      let qtyBonus = 0;
      if (b.qty > 0 && inst.qty > 0) {
        if (b.qty === inst.qty) qtyBonus = 0.2;
        else if (Math.abs(b.qty - inst.qty) / Math.max(b.qty, inst.qty) < 0.05) qtyBonus = 0.1;
        else qtyBonus = -0.15;
      }

      const score = nameSim + qtyBonus;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    if (bestIdx >= 0 && bestScore >= 0.35) {
      usedInstamart.add(bestIdx);
      const inst = instamartData[bestIdx].product;
      const blinkitProd = b.product;

      const bp = blinkitProd.price;
      const ip = inst.price;
      const bothPriced = bp > 0 && ip > 0;
      const bestPrice = bothPriced ? Math.min(bp, ip) : (bp || ip);
      const bestPlatform = bothPriced ? (bp <= ip ? "Blinkit" : "Instamart") : (bp > 0 ? "Blinkit" : "Instamart");
      const priceDifference = bothPriced ? Math.abs(bp - ip) : 0;
      const savingsPercent = bothPriced && bestPrice > 0
        ? Math.round((priceDifference / Math.max(bp, ip)) * 100)
        : 0;

      matched.push({
        key: `${blinkitProd.name}-${inst.name}-${bestIdx}`,
        normalizedName: blinkitProd.name.length <= inst.name.length ? blinkitProd.name : inst.name,
        brand: blinkitProd.brand || inst.brand,
        quantity: blinkitProd.quantity || inst.quantity,
        blinkit: blinkitProd,
        instamart: inst,
        bestPlatform,
        bestPrice,
        priceDifference,
        savingsPercent,
      });
    } else {
      // Blinkit-only entry
      matched.push({
        key: `blinkit-only-${b.product.name}`,
        normalizedName: b.product.name,
        brand: b.product.brand,
        quantity: b.product.quantity,
        blinkit: b.product,
        bestPlatform: "Blinkit",
        bestPrice: b.product.price,
        priceDifference: 0,
        savingsPercent: 0,
      });
    }
  }

  // Add unmatched Instamart products
  for (let i = 0; i < instamartData.length; i++) {
    if (usedInstamart.has(i)) continue;
    const p = instamartData[i].product;
    matched.push({
      key: `instamart-only-${p.name}`,
      normalizedName: p.name,
      brand: p.brand,
      quantity: p.quantity,
      instamart: p,
      bestPlatform: "Instamart",
      bestPrice: p.price,
      priceDifference: 0,
      savingsPercent: 0,
    });
  }

  // Sort: matched pairs first (by savings desc), then singletons
  matched.sort((a, b) => {
    if (a.blinkit && a.instamart && !(b.blinkit && b.instamart)) return -1;
    if (b.blinkit && b.instamart && !(a.blinkit && a.instamart)) return 1;
    if (a.blinkit && a.instamart && b.blinkit && b.instamart) {
      return b.savingsPercent - a.savingsPercent;
    }
    return a.normalizedName.localeCompare(b.normalizedName);
  });

  return matched;
}
