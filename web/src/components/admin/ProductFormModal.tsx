import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import type { ProductRequest } from '../../shared/types';

interface ProductFormErrors {
  name?: string;
  price?: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  form: ProductRequest;
  formErrors: ProductFormErrors;
  imagePreview: string;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFormChange: (form: ProductRequest) => void;
  onClearError: (field: keyof ProductFormErrors) => void;
}

export default function ProductFormModal({
  isOpen,
  isEditing,
  form,
  formErrors,
  imagePreview,
  isSaving,
  onClose,
  onSave,
  onFileChange,
  onFormChange,
  onClearError,
}: ProductFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Product' : 'Add Product'}
      description="Manage the cookie details customers see in the menu."
      maxWidth={520}
      preventClose={isSaving}
      className="admin-product-modal"
    >
      <div className="admin-product-modal__fields">
        <div>
          <label className="admin-product-field-label" htmlFor="admin-product-name">Name *</label>
          <input
            id="admin-product-name"
            className={`admin-product-input ${formErrors.name ? 'admin-product-input--error' : ''}`}
            value={form.name}
            onChange={(e) => {
              onFormChange({ ...form, name: e.target.value });
              onClearError('name');
            }}
            aria-invalid={Boolean(formErrors.name)}
            aria-describedby={formErrors.name ? 'admin-product-name-error' : undefined}
          />
          {formErrors.name && (
            <span id="admin-product-name-error" className="admin-product-field-error" role="alert">
              {formErrors.name}
            </span>
          )}
        </div>

        <div>
          <label className="admin-product-field-label" htmlFor="admin-product-description">Description</label>
          <textarea
            id="admin-product-description"
            className="admin-product-input admin-product-textarea"
            value={form.description}
            onChange={(e) => onFormChange({ ...form, description: e.target.value })}
          />
        </div>

        <div>
          <label className="admin-product-field-label" htmlFor="admin-product-price">Price *</label>
          <input
            id="admin-product-price"
            className={`admin-product-input ${formErrors.price ? 'admin-product-input--error' : ''}`}
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => {
              onFormChange({ ...form, price: Number(e.target.value) });
              onClearError('price');
            }}
            aria-invalid={Boolean(formErrors.price)}
            aria-describedby={formErrors.price ? 'admin-product-price-error' : undefined}
          />
          {formErrors.price && (
            <span id="admin-product-price-error" className="admin-product-field-error" role="alert">
              {formErrors.price}
            </span>
          )}
        </div>

        <div>
          <label className="admin-product-field-label">Product Image</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="admin-product-upload__input"
            onChange={onFileChange}
          />
          <button
            type="button"
            className="admin-product-upload__area"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Product preview"
                className="admin-product-upload__preview"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <Upload size={24} className="admin-product-upload__icon" />
            )}
            <span className="admin-product-upload__hint">
              {imagePreview ? 'Click to change image' : 'Click to upload image'}
            </span>
            <span className="admin-product-upload__meta">JPEG, PNG, WebP, GIF - max 5 MB</span>
          </button>
        </div>

        <div>
          <label className="admin-product-field-label" htmlFor="admin-product-category">Category</label>
          <select
            id="admin-product-category"
            className="admin-product-input"
            value={form.category}
            onChange={(e) => onFormChange({ ...form, category: e.target.value })}
          >
            <option value="CLASSIC">Classic</option>
            <option value="SPECIALTY">Specialty</option>
            <option value="SEASONAL">Seasonal</option>
            <option value="BEST_SELLERS">Best Sellers</option>
          </select>
        </div>

        <label className="admin-product-checkbox-row">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => onFormChange({ ...form, available: e.target.checked })}
          />
          Available
        </label>
      </div>

      <div className="admin-product-modal__actions">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="button" onClick={onSave} isLoading={isSaving}>
          {isEditing ? 'Update' : 'Create'}
        </Button>
      </div>
    </Modal>
  );
}
