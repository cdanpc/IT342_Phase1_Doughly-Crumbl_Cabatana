import axiosInstance from './axiosInstance';
import type { Product, ProductPage, ProductRequest } from '../types';

const PRODUCT_CACHE_TTL_MS = 60_000;
const productCache = new Map<string, { expiresAt: number; data: ProductPage }>();
const pendingProductRequests = new Map<string, Promise<ProductPage>>();

function productCacheKey(params?: {
  search?: string;
  category?: string;
  page?: number;
  size?: number;
}): string {
  return JSON.stringify({
    category: params?.category ?? '',
    page: params?.page ?? 0,
    search: params?.search?.trim().toLowerCase() ?? '',
    size: params?.size ?? 20,
  });
}

export async function getProducts(params?: {
  search?: string;
  category?: string;
  page?: number;
  size?: number;
}): Promise<ProductPage> {
  const key = productCacheKey(params);
  const cached = productCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const pending = pendingProductRequests.get(key);
  if (pending) return pending;

  const request = axiosInstance
    .get<ProductPage>('/products', { params })
    .then((response) => {
      productCache.set(key, {
        expiresAt: Date.now() + PRODUCT_CACHE_TTL_MS,
        data: response.data,
      });
      return response.data;
    })
    .finally(() => {
      pendingProductRequests.delete(key);
    });

  pendingProductRequests.set(key, request);
  return request;
}

export function clearProductCache() {
  productCache.clear();
  pendingProductRequests.clear();
}

// Admin endpoints
export async function getAdminProducts(): Promise<Product[]> {
  const response = await axiosInstance.get<{ content: Product[] }>('/admin/products');
  return response.data.content;
}

export async function uploadProductImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosInstance.post<{ url: string }>('/admin/products/upload-image', formData);
  return response.data.url;
}

export async function createProduct(data: ProductRequest): Promise<Product> {
  const response = await axiosInstance.post<Product>('/admin/products', data);
  clearProductCache();
  return response.data;
}

export async function updateProduct(id: number, data: Partial<ProductRequest>): Promise<Product> {
  const response = await axiosInstance.put<Product>(`/admin/products/${id}`, data);
  clearProductCache();
  return response.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await axiosInstance.delete(`/admin/products/${id}`);
  clearProductCache();
}
