import axiosInstance from './axiosInstance';
import type { AdminUser } from '../types';

export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await axiosInstance.get<AdminUser[]>('/admin/users');
  return response.data;
}

export async function banUser(id: number): Promise<AdminUser> {
  const response = await axiosInstance.put<AdminUser>(`/admin/users/${id}/ban`);
  return response.data;
}

export async function unbanUser(id: number): Promise<AdminUser> {
  const response = await axiosInstance.put<AdminUser>(`/admin/users/${id}/unban`);
  return response.data;
}

export async function disableUser(id: number): Promise<AdminUser> {
  const response = await axiosInstance.delete<AdminUser>(`/admin/users/${id}`);
  return response.data;
}

export async function restoreUser(id: number): Promise<AdminUser> {
  const response = await axiosInstance.put<AdminUser>(`/admin/users/${id}/restore`);
  return response.data;
}
