import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import { getAdminProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from '../../shared/api/productApi';
import { formatPrice } from '../../shared/utils/formatters';
import type { Product, ProductRequest } from '../../shared/types';
import toast from 'react-hot-toast';
import '../../shared/components/LoadingSpinner.css';

const EMPTY_FORM: ProductRequest = {
  name: '', description: '', price: 0, imageUrl: '', category: 'CLASSIC', available: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductRequest>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const data = await getAdminProducts();
      setProducts(data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg = status
        ? `Failed to load products (HTTP ${status})`
        : 'Failed to load products — backend may be unreachable';
      toast.error(msg, { duration: 8000 });
    } finally {
      setIsLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  }

  function openEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      available: product.available,
    });
    setImageFile(null);
    setImagePreview(product.imageUrl || '');
    setShowModal(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!form.name.trim() || form.price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      let finalForm = { ...form };
      if (imageFile) {
        const uploadedUrl = await uploadProductImage(imageFile);
        finalForm = { ...finalForm, imageUrl: uploadedUrl };
      }
      if (editingId) {
        await updateProduct(editingId, finalForm);
        toast.success('Product updated!');
      } else {
        await createProduct(finalForm);
        toast.success('Product created!');
      }
      setShowModal(false);
      fetchProducts();
    } catch {
      toast.error('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error('Failed to delete product');
    }
  }

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) ||
           p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28 }}>Products</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 4 }}>
            {products.length} products
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--color-primary)', color: '#fff', padding: '10px 20px',
            borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 14,
            border: 'none', cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <input
        style={{
          width: '100%', maxWidth: 400, padding: '10px 16px',
          border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-full)',
          fontSize: 14, marginBottom: 24, outline: 'none',
        }}
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <th style={thStyle}>Image</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Available</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                <td style={tdStyle}>
                  <img
                    src={product.imageUrl || 'https://placehold.co/40x40/f0f0f0/999?text=🍪'}
                    alt={product.name}
                    style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/f0f0f0/999?text=🍪'; }}
                  />
                </td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{product.name}</td>
                <td style={tdStyle}>
                  <span style={{
                    background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                    fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-full)',
                  }}>
                    {product.category}
                  </span>
                </td>
                <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--color-primary)' }}>
                  {formatPrice(product.price)}
                </td>
                <td style={tdStyle}>
                  <span style={{ color: product.available ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600, fontSize: 13 }}>
                    {product.available ? 'Yes' : 'No'}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <button onClick={() => openEdit(product)} style={actionBtnStyle}>
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} style={{ ...actionBtnStyle, color: 'var(--color-error)' }}>
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-muted)' }}>
            No products found.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: '#fff', borderRadius: 'var(--radius-md)', padding: 32,
            width: 480, maxHeight: '90vh', overflowY: 'auto', position: 'relative',
          }}>
            <button onClick={() => setShowModal(false)} style={{
              position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer',
            }}>
              <X size={20} />
            </button>

            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 24 }}>
              {editingId ? 'Edit Product' : 'Add Product'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label style={labelStyle}>Price *</label>
                <input style={inputStyle} type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div>
                <label style={labelStyle}>Product Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-sm)',
                    padding: '16px', textAlign: 'center', cursor: 'pointer',
                    background: '#FAFAFA', transition: 'border-color 0.15s',
                  }}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'contain', borderRadius: 6, marginBottom: 8 }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <Upload size={24} style={{ color: 'var(--color-text-muted)', marginBottom: 8 }} />
                  )}
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                    {imagePreview ? 'Click to change image' : 'Click to upload image'}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                    JPEG, PNG, WebP, GIF — max 5 MB
                  </p>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="CLASSIC">Classic</option>
                  <option value="SPECIALTY">Specialty</option>
                  <option value="SEASONAL">Seasonal</option>
                  <option value="BEST_SELLERS">Best Sellers</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
                <label style={{ fontSize: 14 }}>Available</label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: 12, background: '#f5f5f5', color: 'var(--color-text-primary)',
                fontWeight: 600, border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving} style={{
                flex: 1, padding: 12, background: 'var(--color-primary)', color: '#fff',
                fontWeight: 600, border: 'none', borderRadius: 'var(--radius-sm)',
                cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.6 : 1,
              }}>
                {isSaving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600,
  color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px', fontSize: 14, verticalAlign: 'middle',
};

const actionBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
  color: 'var(--color-text-secondary)', transition: 'color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)', fontSize: 14, outline: 'none', fontFamily: 'inherit',
};
