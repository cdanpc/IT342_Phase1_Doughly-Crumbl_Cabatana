import axiosInstance from './axiosInstance';
import type { Product, ProductPage, ProductRequest } from '../types';

export async function getProducts(params?: {
  search?: string;
  category?: string;
  page?: number;
  size?: number;
}): Promise<ProductPage> {
  const response = await axiosInstance.get<ProductPage>('/products', { params });
  return response.data;
}

export async function getProductById(id: number): Promise<Product> {
  const response = await axiosInstance.get<Product>(`/products/${id}`);
  return response.data;
}

// Admin endpoints
export async function getAdminProducts(): Promise<Product[]> {
  const response = await axiosInstance.get<Product[]>('/admin/products');
  return response.data;
}

export async function createProduct(data: ProductRequest): Promise<Product> {
  const response = await axiosInstance.post<Product>('/admin/products', data);
  return response.data;
}

export async function updateProduct(id: number, data: Partial<ProductRequest>): Promise<Product> {
  const response = await axiosInstance.put<Product>(`/admin/products/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await axiosInstance.delete(`/admin/products/${id}`);
}
