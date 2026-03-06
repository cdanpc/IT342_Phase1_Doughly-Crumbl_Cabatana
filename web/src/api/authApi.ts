import axiosInstance from './axiosInstance';
import type { AuthUser, LoginRequest, RegisterRequest } from '../types';

export async function login(data: LoginRequest): Promise<AuthUser> {
  const response = await axiosInstance.post<AuthUser>('/auth/login', data);
  return response.data;
}

export async function register(data: RegisterRequest): Promise<AuthUser> {
  const response = await axiosInstance.post<AuthUser>('/auth/register', data);
  return response.data;
}
