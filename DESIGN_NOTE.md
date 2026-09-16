# Grocery Price Racing — Design Note

## 1. Overall Architecture

The application follows a simple **client-side comparison architecture** designed for the challenge's scope. The frontend handles search, filtering, comparison, and presentation of normalized product data from Blinkit and Instamart.

I chose this approach over a heavier backend/microservices architecture because the main challenge is **product normalization and comparison**, rather than complex business logic. For a small application, adding multiple services, queues, or a dedicated search infrastructure would introduce unnecessary complexity.

For a production version, I would evolve this into:

```text
Frontend
   ↓
API / Comparison Service
   ↓
Product Normalization Layer
   ↓
Platform-specific Data Sources
   ├── Blinkit
   └── Instamart
```

This keeps platform-specific integrations separate from the core comparison logic.

---

## 2. How We Decide If Two Listings Are the Same Product

The same product can have different names across platforms. For example:

```text
Blinkit:    Amul Taaza Toned Milk 1 L
Instamart:  Amul Taaza Milk - 1L
```

Before comparison, product information is **normalized** by considering:

* **Brand**
* **Product name**
* **Pack size / quantity**
* **Unit**

Text is normalized for differences such as casing, spacing, and unnecessary formatting. Pack size is also considered so that products with different quantities are not incorrectly treated as identical.

For example:

```text
₹60  — 500 ml
₹110 — 1 L
```

are treated as different pack sizes rather than simply comparing their names.

### Where the Matching Breaks Down

The current approach is intentionally simple and is **not a perfect SKU-level matching system**. It can produce incorrect or missed matches when:

* Brand information is missing or inconsistent.
* Platforms use abbreviations or significantly different product names.
* Products have different flavours or variants.
* Pack sizes are represented differently.
* Multipacks are confused with individual products.
* Similar product names refer to different formulations.
* The same product has substantially different metadata on each platform.

For a production system, I would improve this using a combination of:

```text
GTIN / Barcode
      +
Structured attributes
      +
Fuzzy text matching
      +
Image / embedding similarity
      ↓
Confidence Score
```

Ambiguous matches could then be flagged rather than automatically merged.

---

## 3. Scaling to Many Locations and Users

The current implementation is designed around a **single-location challenge scenario**. To support multiple locations, location would become a first-class part of the data model.

Instead of storing only:

```text
Product → Platform → Price
```

the production model would store:

```text
Product
   ↓
Platform
   ↓
Location / Warehouse
   ↓
Price + Stock + Timestamp
```

This is important because quick-commerce prices and availability can vary by delivery location.

For many users, I would introduce:

* **PostgreSQL** for products, locations, prices, and platform data.
* **Redis** for caching frequently requested product/location combinations.
* **Database indexes** on product identity, platform, and location.
* **Debouncing and pagination** for search requests.
* **Background workers / queues** to refresh prices asynchronously.
* **Stateless API servers** behind a load balancer for horizontal scaling.

Platform-specific data collection would also be isolated behind separate adapters:

```text
Comparison Engine
       ↓
   Data Adapter
   ├── Blinkit Adapter
   ├── Instamart Adapter
   └── Future Platform Adapter
```

This means adding another platform or scaling the number of locations would not require rewriting the core comparison logic.

**The main design principle is to keep the challenge implementation simple while keeping product matching, platform integrations, and location-specific data sufficiently separated to support future scale.**
