import axiosInstance from './axiosInstance';
import type { Notification } from '../types';

export async function getNotifications(): Promise<Notification[]> {
  const { data } = await axiosInstance.get<Notification[]>('/notifications');
  return data;
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await axiosInstance.get<{ count: number }>('/notifications/unread-count');
  return data.count;
}

export async function markNotificationRead(id: number): Promise<void> {
  await axiosInstance.put(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await axiosInstance.put('/notifications/read-all');
}
