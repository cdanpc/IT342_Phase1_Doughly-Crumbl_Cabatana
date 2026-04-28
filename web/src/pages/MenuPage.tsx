import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { getProducts } from '../api/productApi';
import { useCart } from '../store/CartContext';
import { formatPrice } from '../utils/formatters';
import type { Product } from '../types';
import toast from 'react-hot-toast';
import './MenuPage.css';

const CATEGORIES = [
  { value: 'All', label: 'All' },
  { value: 'CLASSIC', label: 'Classic' },
  { value: 'SPECIALTY', label: 'Specialty' },
  { value: 'SEASONAL', label: 'Seasonal' },
  { value: 'BEST_SELLERS', label: 'Best Sellers' },
];

export default function MenuPage() {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const { addToCart, openOrderPanel } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: { search?: string; category?: string; size?: number } = { size: 50 };
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const data = await getProducts(params);
      setProducts(data.content);
    } catch {
      toast.error('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function handleAddToCart(e: React.MouseEvent, product: Product) {
    e.stopPropagation();
    await addToCart(product.id, 1);
    openOrderPanel();
  }

  return (
    <div className="menu-page">
      {/* Hero Banner */}
      <div className="menu-hero">
        <div className="menu-hero__content">
          <p className="menu-hero__label">Welcome to Doughly Crumbl</p>
          <h2 className="menu-hero__title">Freshly Baked Happiness</h2>
          <button className="menu-hero__btn">Order Now</button>
        </div>
      </div>

      {/* Products Section */}
      <section className="menu-section">
        <div className="menu-section__header">
          <h3 className="menu-section__title">Featured Delights</h3>
        </div>

        {/* Category Pills */}
        <div className="menu-category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`menu-category-tab${selectedCategory === cat.value ? ' menu-category-tab--active' : ''}`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-card product-card--skeleton">
                <div className="product-card__image-wrapper skeleton" />
                <div className="product-card__body">
                  <div className="skeleton skeleton-text" style={{ width: '80%', height: 14 }} />
                  <div className="skeleton skeleton-text skeleton-text--short" style={{ width: '50%', height: 12 }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="menu-empty">
            <div className="menu-empty__icon">🍪</div>
            <p className="menu-empty__text">No products found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-card__image-wrapper">
                  <img
                    className="product-card__image"
                    src={product.imageUrl || 'https://placehold.co/300x300/f0f0f0/999?text=🍪'}
                    alt={product.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/300x300/f0f0f0/999?text=🍪';
                    }}
                  />
                </div>
                <div className="product-card__body">
                  <div className="product-card__name-row">
                    <span className="product-card__name">{product.name}</span>
                    <button className="product-card__cart-btn" onClick={(e) => handleAddToCart(e, product)}>
                      <ShoppingCart size={18} />
                      <span className="sr-only">Add 1 item</span>
                    </button>
                  </div>
                  <div className="product-card__price-row">
                    <span className="product-card__price">{formatPrice(product.price)}</span>
                    <span className="product-card__rating">★ 4.8</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
