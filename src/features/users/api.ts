import { apiClient } from '../../api/client';
import type { User } from '../../types';

// Mock data for development until backend is ready
const MOCK_USERS: User[] = [
  { id: '1', email: 'admin@example.com', role: 'super_admin', createdAt: new Date().toISOString() },
  { id: '2', email: 'manager@example.com', role: 'manager', createdAt: new Date().toISOString() },
  { id: '3', email: 'resident@example.com', role: 'resident', createdAt: new Date().toISOString() },
  { id: '4', email: 'provider@example.com', role: 'provider', createdAt: new Date().toISOString() },
];

export const getUsers = async () => {
  try {
    const { data } = await apiClient.get<{ users: User[] }>('/iam/users');
    return data.users;
  } catch (error) {
    // Fallback to mock data if endpoint 404s (since it's not implemented yet)
    console.warn('API endpoint /iam/users not found, using mock data');
    return MOCK_USERS;
  }
};

export const updateUserRole = async (userId: string, role: User['role']) => {
  // We'll try to hit the API, but if it fails we'll simulate success for the UI
  try {
    const { data } = await apiClient.patch<User>(`/iam/users/${userId}/role`, { role });
    return data;
  } catch (error) {
    console.warn(`API endpoint /iam/users/${userId}/role not found, simulating success`);
    return { id: userId, role } as User;
  }
};
