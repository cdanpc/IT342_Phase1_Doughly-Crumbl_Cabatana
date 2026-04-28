import axiosInstance from './axiosInstance';
import type { Order, CheckoutRequest, UpdateOrderStatusRequest } from '../types';

export async function placeOrder(data: CheckoutRequest): Promise<Order> {
  const response = await axiosInstance.post<Order>('/orders', data);
  return response.data;
}

export async function getMyOrders(): Promise<Order[]> {
  const response = await axiosInstance.get<Order[]>('/orders/my-orders');
  return response.data;
}

export async function getOrderById(id: number): Promise<Order> {
  const response = await axiosInstance.get<Order>(`/orders/${id}`);
  return response.data;
}

export async function cancelOrder(id: number, reason?: string): Promise<Order> {
  const response = await axiosInstance.put<Order>(`/orders/${id}/cancel`, null, {
    params: reason ? { reason } : undefined,
  });
  return response.data;
}

export async function submitPayment(id: number, proofFile?: File): Promise<Order> {
  const formData = new FormData();
  if (proofFile) {
    formData.append('proof', proofFile);
  }
  const response = await axiosInstance.put<Order>(`/orders/${id}/submit-payment`, formData);
  return response.data;
}

// Admin endpoints
export async function getAdminOrders(params?: {
  status?: string;
  page?: number;
  size?: number;
}): Promise<Order[]> {
  const response = await axiosInstance.get<Order[]>('/admin/orders', { params });
  return response.data;
}

export async function getAdminOrderById(id: number): Promise<Order> {
  const response = await axiosInstance.get<Order>(`/admin/orders/${id}`);
  return response.data;
}

export async function updateOrderStatus(id: number, data: UpdateOrderStatusRequest): Promise<Order> {
  const response = await axiosInstance.put<Order>(`/admin/orders/${id}/status`, data);
  return response.data;
}

export async function quoteDeliveryFee(id: number, fee: number): Promise<Order> {
  const response = await axiosInstance.put<Order>(`/admin/orders/${id}/delivery-fee`, null, {
    params: { fee },
  });
  return response.data;
}
