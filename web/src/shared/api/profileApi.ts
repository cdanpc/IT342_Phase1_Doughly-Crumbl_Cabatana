import axiosInstance from './axiosInstance';
import type { Product } from '../types';

export interface CustomerProfile {
  id?: number;
  userId?: number;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  role?: string;
  totalOrders?: number;
  completedOrders?: number;
  cancelledOrders?: number;
  rating?: number;
  meritTier?: number;
  meritTierName?: string;
}

export interface UpdateCustomerProfileRequest {
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
}

export interface DeliveryAddress {
  id: number;
  label: string;
  address: string;
  defaultAddress: boolean;
}

export interface DeliveryAddressRequest {
  label: string;
  address: string;
  defaultAddress: boolean;
}

export async function getProfile(): Promise<CustomerProfile> {
  const response = await axiosInstance.get<CustomerProfile>('/profile');
  return response.data;
}

export async function updateProfile(data: UpdateCustomerProfileRequest): Promise<CustomerProfile> {
  const response = await axiosInstance.put<CustomerProfile>('/profile', data);
  return response.data;
}

export async function getAddresses(): Promise<DeliveryAddress[]> {
  const response = await axiosInstance.get<DeliveryAddress[]>('/profile/addresses');
  return response.data;
}

export async function addAddress(data: DeliveryAddressRequest): Promise<DeliveryAddress> {
  const response = await axiosInstance.post<DeliveryAddress>('/profile/addresses', data);
  return response.data;
}

export async function updateAddress(id: number, data: DeliveryAddressRequest): Promise<DeliveryAddress> {
  const response = await axiosInstance.put<DeliveryAddress>(`/profile/addresses/${id}`, data);
  return response.data;
}

export async function deleteAddress(id: number): Promise<void> {
  await axiosInstance.delete(`/profile/addresses/${id}`);
}

export async function getFavorites(): Promise<Product[]> {
  const response = await axiosInstance.get<Product[]>('/profile/favorites');
  return response.data;
}

export async function addFavorite(productId: number): Promise<Product[]> {
  const response = await axiosInstance.post<Product[]>(`/profile/favorites/${productId}`);
  return response.data;
}

export async function removeFavorite(productId: number): Promise<void> {
  await axiosInstance.delete(`/profile/favorites/${productId}`);
}
