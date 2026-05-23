import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductFormModal from '../../components/admin/ProductFormModal';
import ProductImage from '../../components/product/ProductImage';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { createProduct, deleteProduct, getAdminProducts, updateProduct, uploadProductImage } from '../../shared/api/productApi';
import type { Product, ProductRequest } from '../../shared/types';
import { formatPrice } from '../../shared/utils/formatters';
import '../../shared/components/LoadingSpinner.css';
import './AdminProducts.css';

const EMPTY_FORM: ProductRequest = {
  name: '',
  description: '',
  price: 0,
  imageUrl: '',
  category: 'CLASSIC',
  available: true,
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
  const [imagePreview, setImagePreview] = useState('');
  const [formErrors, setFormErrors] = useState<{ name?: string; price?: string }>({});
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        : 'Failed to load products - backend may be unreachable';
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
    setFormErrors({});
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
    setFormErrors({});
    setShowModal(true);
  }

  function closeProductModal() {
    if (isSaving) return;
    setShowModal(false);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are accepted (PNG, JPG, WebP, GIF).');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Maximum size is 5 MB.');
      e.target.value = '';
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    const errs: { name?: string; price?: string } = {};
    if (!form.name.trim()) errs.name = 'Product name is required.';
    if (form.price <= 0) errs.price = 'Price must be greater than PHP 0.';
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});

    setIsSaving(true);
    try {
      let finalForm = { ...form, name: form.name.trim(), description: form.description.trim() };
      if (imageFile) {
        const uploadedUrl = await uploadProductImage(imageFile);
        finalForm = { ...finalForm, imageUrl: uploadedUrl };
      }

      if (editingId) {
        await updateProduct(editingId, finalForm);
        toast.success('Product updated.');
      } else {
        await createProduct(finalForm);
        toast.success('Product created.');
      }

      setShowModal(false);
      fetchProducts();
    } catch {
      toast.error('Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (deleteTargetId === null) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTargetId);
      toast.success('Product deleted.');
      setProducts((prev) => prev.filter((p) => p.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch {
      toast.error('Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  }

  const filtered = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="admin-products__loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="admin-products">
      <div className="admin-products__header">
        <div>
          <h2 className="admin-products__title">Products</h2>
          <p className="admin-products__count">{products.length} products</p>
        </div>
        <button className="admin-products__add-btn" onClick={openCreate}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <input
        className="admin-products__search"
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="admin-products__table-wrap">
        <table className="admin-products__table">
          <thead>
            <tr>
              <th className="admin-products__th">Image</th>
              <th className="admin-products__th">Name</th>
              <th className="admin-products__th">Category</th>
              <th className="admin-products__th">Price</th>
              <th className="admin-products__th">Available</th>
              <th className="admin-products__th admin-products__th--right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id}>
                <td className="admin-products__td">
                  <ProductImage
                    src={product.imageUrl}
                    alt={product.name}
                    className="admin-products__product-img"
                  />
                </td>
                <td className="admin-products__td admin-products__td--name">{product.name}</td>
                <td className="admin-products__td">
                  <span className="admin-products__category-badge">{product.category}</span>
                </td>
                <td className="admin-products__td admin-products__td--price">
                  {formatPrice(product.price)}
                </td>
                <td className="admin-products__td">
                  <span className={product.available ? 'admin-products__avail--yes' : 'admin-products__avail--no'}>
                    {product.available ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="admin-products__td admin-products__td--right">
                  <button
                    className="admin-products__action-btn"
                    onClick={() => openEdit(product)}
                    aria-label={`Edit ${product.name}`}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="admin-products__action-btn admin-products__action-btn--danger"
                    onClick={() => setDeleteTargetId(product.id)}
                    aria-label={`Delete ${product.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="admin-products__empty">No products found.</div>
        )}
      </div>

      <ProductFormModal
        isOpen={showModal}
        isEditing={Boolean(editingId)}
        form={form}
        formErrors={formErrors}
        imagePreview={imagePreview}
        isSaving={isSaving}
        onClose={closeProductModal}
        onSave={handleSave}
        onFileChange={handleFileChange}
        onFormChange={setForm}
        onClearError={(field) => setFormErrors((prev) => ({ ...prev, [field]: undefined }))}
      />

      <ConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => { if (!isDeleting) setDeleteTargetId(null); }}
        onConfirm={confirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        isDanger
        isConfirming={isDeleting}
      />
    </div>
  );
}
