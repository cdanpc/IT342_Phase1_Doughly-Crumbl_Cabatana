import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import type { CustomerProfile, UpdateCustomerProfileRequest } from '../../shared/api/profileApi';

interface ProfileFormProps {
  profile: CustomerProfile | null;
  fallbackName: string;
  fallbackEmail: string;
  isSaving: boolean;
  onSubmit: (data: UpdateCustomerProfileRequest) => Promise<void>;
}

type ProfileErrors = Partial<Record<keyof UpdateCustomerProfileRequest, string>>;

const PHONE_PATTERN = /^(09\d{9}|\+639\d{9})$/;

function validateProfile(data: UpdateCustomerProfileRequest): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!data.name.trim()) errors.name = 'Name is required.';
  if (data.name.trim().length > 100) errors.name = 'Name must not exceed 100 characters.';

  if (!data.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Enter a valid email address.';
  } else if (data.email.trim().length > 150) {
    errors.email = 'Email must not exceed 150 characters.';
  }

  if (data.phoneNumber && !PHONE_PATTERN.test(data.phoneNumber.trim())) {
    errors.phoneNumber = 'Use 09xxxxxxxxx or +639xxxxxxxxx.';
  }

  if (data.address && data.address.trim().length > 255) {
    errors.address = 'Address must not exceed 255 characters.';
  }

  return errors;
}

export default function ProfileForm({
  profile,
  fallbackName,
  fallbackEmail,
  isSaving,
  onSubmit,
}: ProfileFormProps) {
  const initialData = useMemo<UpdateCustomerProfileRequest>(() => ({
    name: profile?.name ?? fallbackName,
    email: profile?.email ?? fallbackEmail,
    phoneNumber: profile?.phoneNumber ?? '',
    address: profile?.address ?? '',
  }), [profile, fallbackName, fallbackEmail]);

  const [form, setForm] = useState<UpdateCustomerProfileRequest>(initialData);
  const [errors, setErrors] = useState<ProfileErrors>({});

  useEffect(() => {
    // Intentional: reset form when parent provides new profile data (e.g. after save or modal reopen)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(initialData);
    setErrors({});
  }, [initialData]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextErrors = validateProfile(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await onSubmit({
      name: form.name.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber?.trim() || undefined,
      address: form.address?.trim() || undefined,
    });
  }

  return (
    <form className="account-form" onSubmit={handleSubmit} noValidate>
      <div className="account-form__grid">
        <Input
          id="account-name"
          label="Full name"
          value={form.name}
          error={errors.name}
          autoComplete="name"
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        />
        <Input
          id="account-email"
          label="Email"
          type="email"
          value={form.email}
          error={errors.email}
          autoComplete="email"
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        />
        <Input
          id="account-phone"
          label="Phone number"
          type="tel"
          value={form.phoneNumber ?? ''}
          error={errors.phoneNumber}
          placeholder="09xxxxxxxxx"
          autoComplete="tel"
          onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
        />
        <Input
          id="account-address"
          label="Default address"
          value={form.address ?? ''}
          error={errors.address}
          autoComplete="street-address"
          onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
        />
      </div>
      <div className="account-form__actions">
        <Button type="submit" isLoading={isSaving}>
          Save profile
        </Button>
      </div>
    </form>
  );
}
