import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Edit2, MapPin, Plus, Trash2, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { DeliveryAddress, DeliveryAddressRequest } from '../../shared/api/profileApi';

interface AddressManagerProps {
  addresses: DeliveryAddress[];
  isSaving: boolean;
  actionId: number | null;
  onSave: (data: DeliveryAddressRequest, id?: number) => Promise<unknown>;
  onDelete: (id: number) => Promise<void>;
}

interface AddressForm {
  label: string;
  address: string;
  defaultAddress: boolean;
}

interface AddressErrors {
  label?: string;
  address?: string;
}

const emptyForm: AddressForm = {
  label: '',
  address: '',
  defaultAddress: false,
};

function validateAddress(form: AddressForm): AddressErrors {
  const errors: AddressErrors = {};
  if (!form.label.trim()) errors.label = 'Label is required.';
  if (form.label.trim().length > 80) errors.label = 'Label must not exceed 80 characters.';
  if (!form.address.trim()) errors.address = 'Address is required.';
  if (form.address.trim().length > 255) errors.address = 'Address must not exceed 255 characters.';
  return errors;
}

export default function AddressManager({
  addresses,
  isSaving,
  actionId,
  onSave,
  onDelete,
}: AddressManagerProps) {
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | undefined>();
  const [errors, setErrors] = useState<AddressErrors>({});

  useEffect(() => {
    if (addresses.length === 0 || editingId) return;
    // Auto-check "default" when adding the first address — intentional state sync from derived condition
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((prev) => ({ ...prev, defaultAddress: true }));
  }, [addresses.length, editingId]);

  function startEdit(address: DeliveryAddress) {
    setEditingId(address.id);
    setForm({
      label: address.label,
      address: address.address,
      defaultAddress: address.defaultAddress,
    });
    setErrors({});
  }

  function resetForm() {
    setEditingId(undefined);
    setForm({
      ...emptyForm,
      defaultAddress: addresses.length === 0,
    });
    setErrors({});
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextErrors = validateAddress(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await onSave({
      label: form.label.trim(),
      address: form.address.trim(),
      defaultAddress: form.defaultAddress,
    }, editingId);
    resetForm();
  }

  return (
    <section className="address-manager" aria-labelledby="address-manager-title">
      <div className="account-section__header">
        <div>
          <h3 id="address-manager-title">Saved addresses</h3>
          <p>Use saved addresses to speed up delivery checkout later.</p>
        </div>
      </div>

      <div className="address-manager__list">
        {addresses.length === 0 ? (
          <div className="address-manager__empty">
            <MapPin size={18} />
            <span>No saved addresses yet.</span>
          </div>
        ) : (
          addresses.map((address) => (
            <article className="address-card" key={address.id}>
              <div>
                <div className="address-card__title">
                  {address.label}
                  {address.defaultAddress && <span>Default</span>}
                </div>
                <p>{address.address}</p>
              </div>
              <div className="address-card__actions">
                <button type="button" onClick={() => startEdit(address)} aria-label={`Edit ${address.label}`}>
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(address.id)}
                  disabled={actionId === address.id}
                  aria-label={`Delete ${address.label}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <form className="address-form" onSubmit={handleSubmit} noValidate>
        <div className="address-form__title">
          <Plus size={15} />
          <span>{editingId ? 'Edit address' : 'Add address'}</span>
          {editingId && (
            <button type="button" onClick={resetForm} aria-label="Cancel address edit">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="address-form__grid">
          <Input
            id="address-label"
            label="Label"
            placeholder="Home, Office, Dorm"
            value={form.label}
            error={errors.label}
            onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
          />
          <Input
            id="address-value"
            label="Address"
            value={form.address}
            error={errors.address}
            autoComplete="street-address"
            onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
          />
        </div>
        <label className="address-form__default">
          <input
            type="checkbox"
            checked={form.defaultAddress}
            onChange={(e) => setForm((prev) => ({ ...prev, defaultAddress: e.target.checked }))}
          />
          Set as default delivery address
        </label>
        <div className="address-form__actions">
          <Button type="submit" variant="secondary" isLoading={isSaving}>
            {editingId ? 'Update address' : 'Save address'}
          </Button>
        </div>
      </form>
    </section>
  );
}
