/*
# Create product_catalog table with seeded grocery data

1. New Tables
- `product_catalog`
  - `id` (uuid, primary key)
  - `search_term` (text, the search term this product should appear for, e.g. "maggi")
  - `platform` (text, "blinkit" or "instamart")
  - `name` (text, product display name)
  - `brand` (text, brand name)
  - `price` (numeric, current selling price)
  - `mrp` (numeric, maximum retail price)
  - `quantity` (text, pack size, e.g. "210 g")
  - `image` (text, product image URL)
  - `in_stock` (boolean, whether the product is currently in stock)
  - `deeplink` (text, URL to the product on the platform)
  - `created_at` (timestamptz, defaults to now())
  - Index on (search_term, platform) for fast lookups

2. Security
- Enable RLS on `product_catalog`.
- Allow anon + authenticated SELECT because this is a no-auth app and catalog data is intentionally public.
- No INSERT/UPDATE/DELETE for anon — catalog is managed via migrations only.

3. Seed data
- Includes realistic products across multiple search terms: maggi, amul butter, milk, bread,
  coca cola, lays, with different prices on Blinkit vs Instamart to demonstrate comparison.
- Prices reflect typical real-world pricing as of 2025-2026.
*/

CREATE TABLE IF NOT EXISTS product_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_term text NOT NULL,
  platform text NOT NULL,
  name text NOT NULL,
  brand text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  mrp numeric NOT NULL DEFAULT 0,
  quantity text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  in_stock boolean NOT NULL DEFAULT true,
  deeplink text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalog_search_platform ON product_catalog (search_term, platform);

ALTER TABLE product_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_catalog" ON product_catalog;
CREATE POLICY "anon_select_catalog" ON product_catalog FOR SELECT
  TO anon, authenticated USING (true);

-- Seed data: Maggi
INSERT INTO product_catalog (search_term, platform, name, brand, price, mrp, quantity, image, in_stock, deeplink) VALUES
('maggi', 'blinkit', 'Maggi 2-Minute Masala Instant Noodles', 'Nestle', 14, 14, '70 g', 'https://images.pexels.com/photos/39007274/pexels-photo-39007274.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/maggi-2-minute-masala-instant-noodles/prid/MPN001'),
('maggi', 'instamart', 'Maggi 2 Minute Masala Noodles', 'Nestle', 15, 15, '70 g', 'https://images.pexels.com/photos/39007274/pexels-photo-39007274.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/MAGGI2MIN'),
('maggi', 'blinkit', 'Maggi Masala Noodles Family Pack', 'Nestle', 84, 84, '4 x 70 g', 'https://images.pexels.com/photos/39007274/pexels-photo-39007274.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/maggi-masala-noodles-family-pack/prid/MPN004'),
('maggi', 'instamart', 'Maggi Masala Noodles Pack of 4', 'Nestle', 80, 84, '4 x 70 g', 'https://images.pexels.com/photos/39007274/pexels-photo-39007274.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/MAGGI4PACK'),
('maggi', 'blinkit', 'Maggi Chicken Noodles', 'Nestle', 16, 16, '70 g', 'https://images.pexels.com/photos/39007274/pexels-photo-39007274.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/maggi-chicken-noodles/prid/MCN001'),
('maggi', 'instamart', 'Maggi Chicken Instant Noodles', 'Nestle', 16, 16, '70 g', 'https://images.pexels.com/photos/39007274/pexels-photo-39007274.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', false, 'https://www.swiggy.com/instamart/item/MAGGICHK');

-- Seed data: Amul Butter
INSERT INTO product_catalog (search_term, platform, name, brand, price, mrp, quantity, image, in_stock, deeplink) VALUES
('amul butter', 'blinkit', 'Amul Butter Salted', 'Amul', 58, 60, '100 g', 'https://images.pexels.com/photos/7965940/pexels-photo-7965940.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/amul-butter-salted/prid/ABT100'),
('amul butter', 'instamart', 'Amul Salted Butter', 'Amul', 56, 60, '100 g', 'https://images.pexels.com/photos/7965940/pexels-photo-7965940.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/AMULBTR100'),
('amul butter', 'blinkit', 'Amul Butter Salted', 'Amul', 272, 285, '500 g', 'https://images.pexels.com/photos/7965940/pexels-photo-7965940.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/amul-butter-salted-500g/prid/ABT500'),
('amul butter', 'instamart', 'Amul Salted Butter Block', 'Amul', 268, 285, '500 g', 'https://images.pexels.com/photos/7965940/pexels-photo-7965940.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/AMULBTR500'),
('amul butter', 'blinkit', 'Amul Garlic Butter', 'Amul', 65, 65, '100 g', 'https://images.pexels.com/photos/7965940/pexels-photo-7965940.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/amul-garlic-butter/prid/AGB100'),
('amul butter', 'instamart', 'Amul Garlic Butter', 'Amul', 65, 65, '100 g', 'https://images.pexels.com/photos/7965940/pexels-photo-7965940.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', false, 'https://www.swiggy.com/instamart/item/AMULGBTR');

-- Seed data: Milk
INSERT INTO product_catalog (search_term, platform, name, brand, price, mrp, quantity, image, in_stock, deeplink) VALUES
('milk', 'blinkit', 'Amul Taaza Toned Milk', 'Amul', 27, 28, '500 ml', 'https://images.pexels.com/photos/20489330/pexels-photo-20489330.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/amul-taaza-toned-milk/prid/ATM500'),
('milk', 'instamart', 'Amul Taaza Toned Milk', 'Amul', 28, 28, '500 ml', 'https://images.pexels.com/photos/20489330/pexels-photo-20489330.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/AMULTAAZA'),
('milk', 'blinkit', 'Mother Dairy Toned Milk', 'Mother Dairy', 25, 27, '500 ml', 'https://images.pexels.com/photos/20489330/pexels-photo-20489330.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/mother-dairy-toned-milk/prid/MDTM500'),
('milk', 'instamart', 'Mother Dairy Toned Milk Fresh', 'Mother Dairy', 26, 27, '500 ml', 'https://images.pexels.com/photos/20489330/pexels-photo-20489330.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/MDTONED'),
('milk', 'blinkit', 'Amul Gold Full Cream Milk', 'Amul', 38, 40, '500 ml', 'https://images.pexels.com/photos/20489330/pexels-photo-20489330.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/amul-gold-full-cream-milk/prid/AGM500'),
('milk', 'instamart', 'Amul Gold Full Cream Milk', 'Amul', 40, 40, '500 ml', 'https://images.pexels.com/photos/20489330/pexels-photo-20489330.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/AMULGOLD'),
('milk', 'blinkit', 'Nestle a+ Slim Milk', 'Nestle', 30, 32, '500 ml', 'https://images.pexels.com/photos/20489330/pexels-photo-20489330.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/nestle-a-slim-milk/prid/NSM500'),
('milk', 'instamart', 'Nestle Slim Milk', 'Nestle', 29, 32, '500 ml', 'https://images.pexels.com/photos/20489330/pexels-photo-20489330.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', false, 'https://www.swiggy.com/instamart/item/NESTLESILM');

-- Seed data: Bread
INSERT INTO product_catalog (search_term, platform, name, brand, price, mrp, quantity, image, in_stock, deeplink) VALUES
('bread', 'blinkit', 'Britannia White Bread', 'Britannia', 45, 50, '400 g', 'https://images.pexels.com/photos/1366594/pexels-photo-1366594.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/britannia-white-bread/prid/BWB400'),
('bread', 'instamart', 'Britannia White Bread Slices', 'Britannia', 42, 50, '400 g', 'https://images.pexels.com/photos/1366594/pexels-photo-1366594.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/BRITWHITEBRD'),
('bread', 'blinkit', 'Modern Multigrain Bread', 'Modern', 55, 55, '400 g', 'https://images.pexels.com/photos/1366594/pexels-photo-1366594.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/modern-multigrain-bread/prid/MMB400'),
('bread', 'instamart', 'Modern Multigrain Bread', 'Modern', 55, 55, '400 g', 'https://images.pexels.com/photos/1366594/pexels-photo-1366594.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/MODMULTI'),
('bread', 'blinkit', 'Harvest Gold Brown Bread', 'Harvest Gold', 50, 50, '400 g', 'https://images.pexels.com/photos/1366594/pexels-photo-1366594.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', false, 'https://blinkit.com/prn/harvest-gold-brown-bread/prid/HGB400'),
('bread', 'instamart', 'Harvest Gold Brown Bread', 'Harvest Gold', 48, 50, '400 g', 'https://images.pexels.com/photos/1366594/pexels-photo-1366594.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/HARVESTBRN');

-- Seed data: Coca Cola
INSERT INTO product_catalog (search_term, platform, name, brand, price, mrp, quantity, image, in_stock, deeplink) VALUES
('coca cola', 'blinkit', 'Coca-Cola Soft Drink', 'Coca-Cola', 40, 40, '750 ml', 'https://images.pexels.com/photos/31614260/pexels-photo-31614260.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/coca-cola-soft-drink/prid/CC750'),
('coca cola', 'instamart', 'Coca Cola Pet Bottle', 'Coca-Cola', 38, 40, '750 ml', 'https://images.pexels.com/photos/31614260/pexels-photo-31614260.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/COCA750'),
('coca cola', 'blinkit', 'Coca-Cola Diet Can', 'Coca-Cola', 45, 50, '300 ml', 'https://images.pexels.com/photos/31614260/pexels-photo-31614260.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/coca-cola-diet-can/prid/CCD300'),
('coca cola', 'instamart', 'Coca Cola Diet Can', 'Coca-Cola', 50, 50, '300 ml', 'https://images.pexels.com/photos/31614260/pexels-photo-31614260.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/COCADIET'),
('coca cola', 'blinkit', 'Coca-Cola Mini Pet Bottle', 'Coca-Cola', 20, 20, '250 ml', 'https://images.pexels.com/photos/31614260/pexels-photo-31614260.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/coca-cola-mini/prid/CCM250'),
('coca cola', 'instamart', 'Coca-Cola Mini Bottle', 'Coca-Cola', 20, 20, '250 ml', 'https://images.pexels.com/photos/31614260/pexels-photo-31614260.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/CCMINI250');

-- Seed data: Lays
INSERT INTO product_catalog (search_term, platform, name, brand, price, mrp, quantity, image, in_stock, deeplink) VALUES
('lays', 'blinkit', 'Lays American Style Cream & Onion Chips', 'Lays', 20, 20, '28 g', 'https://images.pexels.com/photos/38127820/pexels-photo-38127820.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/lays-cream-onion/prid/LCO28'),
('lays', 'instamart', 'Lays Cream & Onion Potato Chips', 'Lays', 20, 20, '28 g', 'https://images.pexels.com/photos/38127820/pexels-photo-38127820.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/LAYSCO28'),
('lays', 'blinkit', 'Lays Magic Masala Chips', 'Lays', 20, 20, '28 g', 'https://images.pexels.com/photos/38127820/pexels-photo-38127820.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/lays-magic-masala/prid/LMM28'),
('lays', 'instamart', 'Lays Magic Masala Potato Chips', 'Lays', 22, 22, '28 g', 'https://images.pexels.com/photos/38127820/pexels-photo-38127820.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/LAYSMM28'),
('lays', 'blinkit', 'Lays Classic Salted Chips Family Pack', 'Lays', 50, 55, '95 g', 'https://images.pexels.com/photos/38127820/pexels-photo-38127820.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/lays-classic-salted-family/prid/LCS95'),
('lays', 'instamart', 'Lays Classic Salted Large Pack', 'Lays', 48, 55, '95 g', 'https://images.pexels.com/photos/38127820/pexels-photo-38127820.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/LAYSCS95');

-- Seed data: Butter (generic, for "butter" search)
INSERT INTO product_catalog (search_term, platform, name, brand, price, mrp, quantity, image, in_stock, deeplink) VALUES
('butter', 'blinkit', 'Amul Butter Salted', 'Amul', 58, 60, '100 g', 'https://images.pexels.com/photos/7965940/pexels-photo-7965940.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/amul-butter-salted/prid/ABT100'),
('butter', 'instamart', 'Amul Salted Butter', 'Amul', 56, 60, '100 g', 'https://images.pexels.com/photos/7965940/pexels-photo-7965940.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/AMULBTR100'),
('butter', 'blinkit', 'Nutralite Classic Table Spread', 'Nutralite', 45, 50, '200 g', 'https://images.pexels.com/photos/7965940/pexels-photo-7965940.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/nutralite-classic-spread/prid/NCS200'),
('butter', 'instamart', 'Nutralite Classic Spread', 'Nutralite', 47, 50, '200 g', 'https://images.pexels.com/photos/7965940/pexels-photo-7965940.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/NUTRALITE200'),
('butter', 'blinkit', 'Britannia Butter', 'Britannia', 52, 55, '100 g', 'https://images.pexels.com/photos/7965940/pexels-photo-7965940.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', false, 'https://blinkit.com/prn/britannia-butter/prid/BB100'),
('butter', 'instamart', 'Britannia Butter Smooth', 'Britannia', 52, 55, '100 g', 'https://images.pexels.com/photos/7965940/pexels-photo-7965940.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/BRITBTR');

-- Seed data: Eggs
INSERT INTO product_catalog (search_term, platform, name, brand, price, mrp, quantity, image, in_stock, deeplink) VALUES
('eggs', 'blinkit', 'Farm Fresh Eggs', 'Suguna', 72, 80, '6 pcs', 'https://images.pexels.com/photos/3167310/pexels-photo-3167310.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/farm-fresh-eggs/prid/FFE6'),
('eggs', 'instamart', 'Suguna Farm Fresh Eggs', 'Suguna', 75, 80, '6 pcs', 'https://images.pexels.com/photos/3167310/pexels-photo-3167310.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/SUGUNA6'),
('eggs', 'blinkit', 'Country Eggs Free Range', 'Naturally Good', 90, 95, '6 pcs', 'https://images.pexels.com/photos/3167310/pexels-photo-3167310.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/country-eggs-free-range/prid/CEF6'),
('eggs', 'instamart', 'Free Range Country Eggs', 'Naturally Good', 88, 95, '6 pcs', 'https://images.pexels.com/photos/3167310/pexels-photo-3167310.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/FREERANGE6');

-- Seed data: Tea
INSERT INTO product_catalog (search_term, platform, name, brand, price, mrp, quantity, image, in_stock, deeplink) VALUES
('tea', 'blinkit', 'Tata Tea Premium', 'Tata', 95, 100, '250 g', 'https://images.pexels.com/photos/18925020/pexels-photo-18925020.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/tata-tea-premium/prid/TTP250'),
('tea', 'instamart', 'Tata Tea Premium Leaf Tea', 'Tata', 92, 100, '250 g', 'https://images.pexels.com/photos/18925020/pexels-photo-18925020.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/TATATEA250'),
('tea', 'blinkit', 'Red Label Natural Care Tea', 'Brooke Bond', 130, 135, '500 g', 'https://images.pexels.com/photos/18925020/pexels-photo-18925020.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/red-label-natural-care/prid/RLNC500'),
('tea', 'instamart', 'Brooke Bond Red Label Natural Care', 'Brooke Bond', 128, 135, '500 g', 'https://images.pexels.com/photos/18925020/pexels-photo-18925020.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/REDLABEL500'),
('tea', 'blinkit', 'Tetley Green Tea Bags', 'Tetley', 110, 120, '25 bags', 'https://images.pexels.com/photos/18925020/pexels-photo-18925020.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/tetley-green-tea-bags/prid/TGT25'),
('tea', 'instamart', 'Tetley Green Tea Bags Lemon', 'Tetley', 115, 120, '25 bags', 'https://images.pexels.com/photos/18925020/pexels-photo-18925020.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', false, 'https://www.swiggy.com/instamart/item/TETLEYGT25');

-- Seed data: Coffee
INSERT INTO product_catalog (search_term, platform, name, brand, price, mrp, quantity, image, in_stock, deeplink) VALUES
('coffee', 'blinkit', 'Nescafe Classic Instant Coffee', 'Nestle', 140, 145, '50 g', 'https://images.pexels.com/photos/18925020/pexels-photo-18925020.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/nescafe-classic-instant/prid/NCI50'),
('coffee', 'instamart', 'Nescafe Classic Coffee Jar', 'Nestle', 142, 145, '50 g', 'https://images.pexels.com/photos/18925020/pexels-photo-18925020.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/NESCAFE50'),
('coffee', 'blinkit', 'Bru Instant Coffee', 'Bru', 130, 135, '100 g', 'https://images.pexels.com/photos/18925020/pexels-photo-18925020.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/bru-instant-coffee/prid/BIC100'),
('coffee', 'instamart', 'Bru Instant Coffee Gold', 'Bru', 128, 135, '100 g', 'https://images.pexels.com/photos/18925020/pexels-photo-18925020.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/BRU100'),
('coffee', 'blinkit', 'Davidoff Cafe Rich aroma', 'Davidoff', 220, 230, '100 g', 'https://images.pexels.com/photos/18925020/pexels-photo-18925020.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', false, 'https://blinkit.com/prn/davidoff-cafe-rich-aroma/prid/DCR100'),
('coffee', 'instamart', 'Davidoff Cafe Rich Aroma', 'Davidoff', 225, 230, '100 g', 'https://images.pexels.com/photos/18925020/pexels-photo-18925020.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/DAVIDOFF100');

-- Seed data: Atta (Flour)
INSERT INTO product_catalog (search_term, platform, name, brand, price, mrp, quantity, image, in_stock, deeplink) VALUES
('atta', 'blinkit', 'Aashirvaad Shudh Chakki Atta', 'Aashirvaad', 280, 290, '5 kg', 'https://images.pexels.com/photos/30689829/pexels-photo-30689829.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/aashirvaad-chakki-atta/prid/ACA5KG'),
('atta', 'instamart', 'Aashirvaad Shudh Chakki Atta Whole Wheat', 'Aashirvaad', 275, 290, '5 kg', 'https://images.pexels.com/photos/30689829/pexels-photo-30689829.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/AASHIRVAAD5'),
('atta', 'blinkit', 'Pillsbury Chakki Fresh Atta', 'Pillsbury', 270, 280, '5 kg', 'https://images.pexels.com/photos/30689829/pexels-photo-30689829.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/pillsbury-chakki-atta/prid/PCA5KG'),
('atta', 'instamart', 'Pillsbury Chakki Fresh Atta', 'Pillsbury', 268, 280, '5 kg', 'https://images.pexels.com/photos/30689829/pexels-photo-30689829.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/PILLSBURY5'),
('atta', 'blinkit', 'Fortified Chakki Atta', 'Patanjali', 240, 245, '5 kg', 'https://images.pexels.com/photos/30689829/pexels-photo-30689829.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/patanjali-chakki-atta/prid/PAT5KG'),
('atta', 'instamart', 'Patanjali Whole Wheat Chakki Atta', 'Patanjali', 235, 245, '5 kg', 'https://images.pexels.com/photos/30689829/pexels-photo-30689829.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/PATANJALI5');

-- Seed data: Rice
INSERT INTO product_catalog (search_term, platform, name, brand, price, mrp, quantity, image, in_stock, deeplink) VALUES
('rice', 'blinkit', 'India Gate Basmati Rice Classic', 'India Gate', 320, 340, '1 kg', 'https://images.pexels.com/photos/30689829/pexels-photo-30689829.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/india-gate-basmati-classic/prid/IGBC1'),
('rice', 'instamart', 'India Gate Classic Basmati Rice', 'India Gate', 315, 340, '1 kg', 'https://images.pexels.com/photos/30689829/pexels-photo-30689829.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/INDIAGATE1'),
('rice', 'blinkit', 'Daawat Devaaya Basmati Rice', 'Daawat', 180, 190, '1 kg', 'https://images.pexels.com/photos/30689829/pexels-photo-30689829.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/daawat-devaaya-basmati/prid/DDB1'),
('rice', 'instamart', 'Daawat Devaaya Basmati Rice', 'Daawat', 175, 190, '1 kg', 'https://images.pexels.com/photos/30689829/pexels-photo-30689829.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/DAAWAT1'),
('rice', 'blinkit', 'Fortune Everyday Basmati Rice', 'Fortune', 150, 155, '1 kg', 'https://images.pexels.com/photos/30689829/pexels-photo-30689829.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/fortune-everyday-basmati/prid/FEB1'),
('rice', 'instamart', 'Fortune Everyday Basmati Rice', 'Fortune', 148, 155, '1 kg', 'https://images.pexels.com/photos/30689829/pexels-photo-30689829.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', false, 'https://www.swiggy.com/instamart/item/FORTUNE1');

-- Seed data: Oil
INSERT INTO product_catalog (search_term, platform, name, brand, price, mrp, quantity, image, in_stock, deeplink) VALUES
('oil', 'blinkit', 'Fortune Sunflower Refined Oil', 'Fortune', 165, 170, '1 L', 'https://images.pexels.com/photos/32418799/pexels-photo-32418799.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/fortune-sunflower-oil/prid/FSO1L'),
('oil', 'instamart', 'Fortune Sunlite Refined Sunflower Oil', 'Fortune', 160, 170, '1 L', 'https://images.pexels.com/photos/32418799/pexels-photo-32418799.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/FORTUNESO1'),
('oil', 'blinkit', 'Saffola Gold Refined Oil', 'Saffola', 250, 260, '1 L', 'https://images.pexels.com/photos/32418799/pexels-photo-32418799.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/saffola-gold-oil/prid/SGO1L'),
('oil', 'instamart', 'Saffola Gold Refined Oil', 'Saffola', 245, 260, '1 L', 'https://images.pexels.com/photos/32418799/pexels-photo-32418799.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/SAFFOLA1'),
('oil', 'blinkit', 'Dhara Mustard Oil', 'Dhara', 175, 180, '1 L', 'https://images.pexels.com/photos/32418799/pexels-photo-32418799.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/dhara-mustard-oil/prid/DMO1L'),
('oil', 'instamart', 'Dhara Filtered Mustard Oil', 'Dhara', 172, 180, '1 L', 'https://images.pexels.com/photos/32418799/pexels-photo-32418799.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/DHARAMO1');

-- Seed data: Sugar
INSERT INTO product_catalog (search_term, platform, name, brand, price, mrp, quantity, image, in_stock, deeplink) VALUES
('sugar', 'blinkit', 'Madhur Pure Sugar', 'Madhur', 55, 55, '1 kg', 'https://images.pexels.com/photos/30689829/pexels-photo-30689829.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/madhur-pure-sugar/prid/MPS1'),
('sugar', 'instamart', 'Madhur Pure Sugar Refined', 'Madhur', 52, 55, '1 kg', 'https://images.pexels.com/photos/30689829/pexels-photo-30689829.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/MADHUR1'),
('sugar', 'blinkit', 'Saffola Sugar Free Gold', 'Saffola', 120, 125, '100 g', 'https://images.pexels.com/photos/30689829/pexels-photo-30689829.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/saffola-sugar-free/prid/SSG100'),
('sugar', 'instamart', 'Saffola Sugar Free Gold', 'Saffola', 118, 125, '100 g', 'https://images.pexels.com/photos/30689829/pexels-photo-30689829.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/SAFFOLASG100'),
('sugar', 'blinkit', 'Natural Brown Sugar', 'Trust', 80, 80, '500 g', 'https://images.pexels.com/photos/30689829/pexels-photo-30689829.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', false, 'https://blinkit.com/prn/natural-brown-sugar/prid/NBS500'),
('sugar', 'instamart', 'Organic Brown Sugar', 'Trust', 85, 80, '500 g', 'https://images.pexels.com/photos/30689829/pexels-photo-30689829.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/BROWN500');

-- Seed data: Chips (for generic "chips" search)
INSERT INTO product_catalog (search_term, platform, name, brand, price, mrp, quantity, image, in_stock, deeplink) VALUES
('chips', 'blinkit', 'Lays American Style Cream & Onion Chips', 'Lays', 20, 20, '28 g', 'https://images.pexels.com/photos/38127820/pexels-photo-38127820.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/lays-cream-onion/prid/LCO28'),
('chips', 'instamart', 'Lays Cream & Onion Potato Chips', 'Lays', 20, 20, '28 g', 'https://images.pexels.com/photos/38127820/pexels-photo-38127820.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/LAYSCO28'),
('chips', 'blinkit', 'Bingo Mad Angles Chips', 'Bingo', 20, 20, '28 g', 'https://images.pexels.com/photos/38127820/pexels-photo-38127820.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/bingo-mad-angles/prid/BMA28'),
('chips', 'instamart', 'Bingo Mad Angles Achari Chips', 'Bingo', 22, 22, '28 g', 'https://images.pexels.com/photos/38127820/pexels-photo-38127820.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/BINGO28'),
('chips', 'blinkit', 'Uncle Chipps Spicy Treat', 'Uncle Chipps', 20, 20, '28 g', 'https://images.pexels.com/photos/38127820/pexels-photo-38127820.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://blinkit.com/prn/uncle-chipps-spicy/prid/UCS28'),
('chips', 'instamart', 'Uncle Chipps Classic Salted', 'Uncle Chipps', 18, 20, '28 g', 'https://images.pexels.com/photos/38127820/pexels-photo-38127820.jpeg?auto=compress&cs=tinysrgb&h=200&w=200', true, 'https://www.swiggy.com/instamart/item/UNCLE28');
