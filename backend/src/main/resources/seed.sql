-- ============================================
-- Doughly Crumbl — Seed Data
-- Run: psql -U doughlyuser -d doughlycrumbl -f seed.sql
-- ============================================

-- Sample products
INSERT INTO products (name, description, price, image_url, category, available) VALUES
('Classic Chocolate Chip', 'Our signature cookie loaded with rich, melty chocolate chips. A timeless favorite.', 85.00, '/images/choc-chip.jpg', 'CLASSIC', true),
('Double Chocolate Fudge', 'Deep, dark chocolate cookie with fudge chunks for the ultimate choco lover.', 95.00, '/images/double-choc.jpg', 'CLASSIC', true),
('Red Velvet', 'Velvety smooth red velvet cookie topped with a cream cheese drizzle.', 90.00, '/images/red-velvet.jpg', 'CLASSIC', true),
('Matcha Dream', 'Premium matcha-infused cookie with white chocolate chips.', 95.00, '/images/matcha.jpg', 'SPECIALTY', true),
('Ube Delight', 'Purple yam cookie with a sweet, earthy flavor, topped with ube glaze.', 100.00, '/images/ube.jpg', 'SPECIALTY', true),
('Salted Caramel Bliss', 'Buttery cookie swirled with caramel and a hint of sea salt.', 90.00, '/images/salted-caramel.jpg', 'CLASSIC', true),
('Strawberry Shortcake', 'Cookie loaded with strawberry pieces and a shortcake crumble topping.', 95.00, '/images/strawberry.jpg', 'SPECIALTY', true),
('Peanut Butter Crunch', 'Loaded with peanut butter and topped with crushed peanuts.', 85.00, '/images/peanut-butter.jpg', 'CLASSIC', true),
('Cookies and Cream', 'Vanilla cookie packed with crushed chocolate sandwich cookie pieces.', 90.00, '/images/cookies-cream.jpg', 'CLASSIC', true),
('Biscoff Blondie', 'Biscoff cookie butter blondie with a caramelized cinnamon finish.', 100.00, '/images/biscoff.jpg', 'SPECIALTY', true),
('Mango Graham', 'Mango-flavored cookie with graham cracker crumble and cream topping.', 95.00, '/images/mango-graham.jpg', 'SPECIALTY', true),
('S''mores Cookie', 'Chocolate cookie with marshmallow fluff and graham cracker crunch.', 95.00, '/images/smores.jpg', 'SEASONAL', true);

-- Create a default admin user (password: admin123 — BCrypt encoded)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@doughlycrumbl.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN');
