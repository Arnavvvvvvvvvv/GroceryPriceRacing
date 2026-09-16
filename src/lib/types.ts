export interface ProductListing {
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

export interface CompareResponse {
  query: string;
  location: string;
  blinkit: ProductListing[];
  instamart: ProductListing[];
  source?: "live" | "catalog";
  blinkitSource?: "live" | "catalog";
  instamartSource?: "live" | "catalog";
}

export interface MatchedProduct {
  key: string;
  normalizedName: string;
  brand: string;
  quantity: string;
  blinkit?: ProductListing;
  instamart?: ProductListing;
  bestPlatform: string;
  bestPrice: number;
  priceDifference: number;
  savingsPercent: number;
}

export const LOCATIONS = [
  "Connaught Place, Delhi",
  "Saket, Delhi",
  "Vasant Kunj, Delhi",
  "Dwarka, Delhi",
  "Rohini, Delhi",
  "Karol Bagh, Delhi",
  "Lajpat Nagar, Delhi",
  "Rajouri Garden, Delhi",
  "Sector 18, Noida",
  "Cyber City, Gurugram",
] as const;
