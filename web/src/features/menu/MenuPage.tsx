import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import MenuHero from '../../components/menu/MenuHero';
import CategoryTabs from '../../components/menu/CategoryTabs';
import ProductGrid from '../../components/menu/ProductGrid';
import ProductDetailModal from '../../components/product/ProductDetailModal';
import SectionHeader from '../../components/layout/SectionHeader';
import { getProducts } from '../../shared/api/productApi';
import { useCart } from '../../shared/hooks/CartContext';
import useDebouncedValue from '../../shared/hooks/useDebouncedValue';
import type { Product } from '../../shared/types';
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
  const debouncedSearchQuery = useDebouncedValue(searchQuery.trim(), 300);
  const { addToCart, openOrderPanel } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addingId, setAddingId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailQuantity, setDetailQuantity] = useState(1);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const params: { search?: string; category?: string; size?: number } = { size: 50 };
      if (debouncedSearchQuery) params.search = debouncedSearchQuery;
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const data = await getProducts(params);
      setProducts(data.content);
    } catch (err: unknown) {
      const message = 'Failed to load products. Please try again.';
      setLoadError(message);
      toast.error(message);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function openProduct(product: Product) {
    setSelectedProduct(product);
    setDetailQuantity(1);
  }

  async function addProductToCart(product: Product, quantity = 1) {
    if (addingId !== null || !product.available) return;
    setAddingId(product.id);
    try {
      await addToCart(product.id, quantity);
      openOrderPanel();
      setSelectedProduct(null);
    } catch {
      toast.error('Failed to add item. Please try again.');
    } finally {
      setAddingId(null);
    }
  }

  async function handleCardAddToCart(event: React.MouseEvent<HTMLButtonElement>, product: Product) {
    event.stopPropagation();
    await addProductToCart(product);
  }

  return (
    <div className="menu-page">
      <MenuHero onOrderNow={() => document.getElementById('menu-products')?.scrollIntoView({ behavior: 'smooth' })} />

      <section className="menu-section" id="menu-products">
        <SectionHeader
          eyebrow="Fresh menu"
          title={debouncedSearchQuery ? `Results for "${debouncedSearchQuery}"` : 'Featured delights'}
          description="Choose a category, inspect the details, and add fresh cookies to your order bag."
        />

        <CategoryTabs
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {loadError ? (
          <div className="menu-page__error" role="alert">
            <strong>Could not load products</strong>
            <span>{loadError}</span>
            <button type="button" onClick={fetchProducts}>Try again</button>
          </div>
        ) : (
          <ProductGrid
            products={products}
            addingId={addingId}
            isLoading={isLoading}
            onAddToCart={handleCardAddToCart}
            onOpenProduct={openProduct}
          />
        )}
      </section>

      <ProductDetailModal
        product={selectedProduct}
        quantity={detailQuantity}
        isAdding={selectedProduct ? addingId === selectedProduct.id : false}
        onQuantityChange={setDetailQuantity}
        onAddToCart={() => selectedProduct && addProductToCart(selectedProduct, detailQuantity)}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
