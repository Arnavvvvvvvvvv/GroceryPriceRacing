-- Update product images with specific, accurate photos per product type.
-- Each distinct product now gets its own image instead of all sharing one generic photo.

-- Maggi: instant noodles
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/6940988/pexels-photo-6940988.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'maggi' AND name ILIKE '%masala%instant%';
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/6940988/pexels-photo-6940988.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'maggi' AND name ILIKE '%masala%noodles%';
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/6940988/pexels-photo-6940988.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'maggi' AND name ILIKE '%family%pack%';
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/6940988/pexels-photo-6940988.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'maggi' AND name ILIKE '%pack of 4%';
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/4518673/pexels-photo-4518673.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'maggi' AND name ILIKE '%chicken%';

-- Butter: block of butter
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/7965940/pexels-photo-7965940.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'amul butter' AND name ILIKE '%salted%' AND quantity = '100 g';
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/7966354/pexels-photo-7966354.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'amul butter' AND quantity = '500 g';
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/8188934/pexels-photo-8188934.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'amul butter' AND name ILIKE '%garlic%';

UPDATE product_catalog SET image = 'https://images.pexels.com/photos/7965940/pexels-photo-7965940.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'butter' AND name ILIKE '%amul%salted%';
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/8188934/pexels-photo-8188934.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'butter' AND name ILIKE '%nutralite%';
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/7966354/pexels-photo-7966354.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'butter' AND name ILIKE '%britannia%';

-- Milk: carton/bottle
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/6804191/pexels-photo-6804191.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'milk';

-- Bread: sliced loaf
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/8599583/pexels-photo-8599583.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'bread';

-- Coca Cola: bottle
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/4113629/pexels-photo-4113629.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'coca cola';

-- Lays: potato chips bag
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/13060679/pexels-photo-13060679.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'lays';

-- Eggs: crate
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/33982117/pexels-photo-33982117.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'eggs';

-- Tea: tea leaves
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/12944684/pexels-photo-12944684.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'tea' AND name NOT ILIKE '%green%';
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/7565503/pexels-photo-7565503.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'tea' AND name ILIKE '%green%';

-- Coffee: instant coffee jar
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/29306575/pexels-photo-29306575.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'coffee';

-- Atta: wheat flour
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/11726089/pexels-photo-11726089.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'atta';

-- Rice: rice grains bowl
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/31555433/pexels-photo-31555433.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'rice';

-- Oil: cooking oil bottle
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/4910159/pexels-photo-4910159.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'oil';

-- Sugar: granulated sugar
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/15206766/pexels-photo-15206766.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'sugar' AND name NOT ILIKE '%brown%';
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/37105582/pexels-photo-37105582.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'sugar' AND name ILIKE '%brown%';

-- Chips: potato chips bag
UPDATE product_catalog SET image = 'https://images.pexels.com/photos/13060681/pexels-photo-13060681.jpeg?auto=compress&cs=tinysrgb&h=200&w=200' WHERE search_term = 'chips';
