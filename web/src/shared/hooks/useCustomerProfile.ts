import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  addAddress,
  deleteAddress,
  getAddresses,
  getProfile,
  updateAddress,
  updateProfile,
  type CustomerProfile,
  type DeliveryAddress,
  type DeliveryAddressRequest,
  type UpdateCustomerProfileRequest,
} from '../api/profileApi';
import { getApiErrorMessage } from '../utils/apiError';

export function useCustomerProfile(enabled: boolean) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressActionId, setAddressActionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const [profileData, addressData] = await Promise.all([getProfile(), getAddresses()]);
      setProfile(profileData);
      setAddresses(addressData);
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to load your account details.');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfile = useCallback(async (data: UpdateCustomerProfileRequest) => {
    setIsSavingProfile(true);
    try {
      const updated = await updateProfile(data);
      setProfile(updated);
      toast.success('Profile updated.');
      return updated;
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to update profile.');
      toast.error(message);
      throw err;
    } finally {
      setIsSavingProfile(false);
    }
  }, []);

  const saveAddress = useCallback(async (data: DeliveryAddressRequest, id?: number) => {
    setIsSavingAddress(true);
    setAddressActionId(id ?? null);
    try {
      const saved = id ? await updateAddress(id, data) : await addAddress(data);
      setAddresses((prev) => {
        const exists = prev.some((address) => address.id === saved.id);
        const next = exists
          ? prev.map((address) => (address.id === saved.id ? saved : address))
          : [saved, ...prev];
        return saved.defaultAddress
          ? next.map((address) => ({ ...address, defaultAddress: address.id === saved.id }))
          : next;
      });
      toast.success(id ? 'Address updated.' : 'Address saved.');
      return saved;
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to save address.');
      toast.error(message);
      throw err;
    } finally {
      setIsSavingAddress(false);
      setAddressActionId(null);
    }
  }, []);

  const removeAddress = useCallback(async (id: number) => {
    setAddressActionId(id);
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((address) => address.id !== id));
      toast.success('Address deleted.');
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to delete address.');
      toast.error(message);
      throw err;
    } finally {
      setAddressActionId(null);
    }
  }, []);

  return {
    profile,
    addresses,
    isLoading,
    isSavingProfile,
    isSavingAddress,
    addressActionId,
    error,
    reload: loadProfile,
    saveProfile,
    saveAddress,
    removeAddress,
  };
}
