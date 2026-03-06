import axiosInstance from './axiosInstance';
import type { Cart, AddToCartRequest, UpdateCartItemRequest } from '../types';

export async function getCart(): Promise<Cart> {
  const response = await axiosInstance.get<Cart>('/cart');
  return response.data;
}

export async function addToCart(data: AddToCartRequest): Promise<Cart> {
  const response = await axiosInstance.post<Cart>('/cart/items', data);
  return response.data;
}

export async function updateCartItem(cartItemId: number, data: UpdateCartItemRequest): Promise<Cart> {
  const response = await axiosInstance.put<Cart>(`/cart/items/${cartItemId}`, data);
  return response.data;
}

export async function removeCartItem(cartItemId: number): Promise<Cart> {
  const response = await axiosInstance.delete<Cart>(`/cart/items/${cartItemId}`);
  return response.data;
}

export async function clearCart(): Promise<void> {
  await axiosInstance.delete('/cart');
}
