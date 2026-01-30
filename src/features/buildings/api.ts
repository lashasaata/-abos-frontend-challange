import { apiClient } from '../../api/client';
import type { Building, Unit, Membership } from '../../types';

export const getBuildings = async () => {
  const { data } = await apiClient.get<{ buildings: Building[] }>('/buildings/');
  return data.buildings;
};

export const getBuildingById = async (id: string) => {
  const { data } = await apiClient.get<Building>(`/buildings/${id}`);
  return data;
};

export const getBuildingUnits = async (id: string) => {
  const { data } = await apiClient.get<{ units: Unit[] }>(`/buildings/${id}/units`);
  return data.units;
};

export const createBuilding = async (data: { name: string; address: string }) => {
  const response = await apiClient.post<Building>('/buildings/', data);
  return response.data;
};

export const createBuildingUnits = async (buildingId: string, units: { unitNumber: string; floor: number }[]) => {
  const response = await apiClient.post<{ units: Unit[] }>(`/buildings/${buildingId}/units`, { units });
  return response.data.units;
};

export const assignUserToUnit = async (buildingId: string, data: { userId: string; unitId: string; role: Membership['role'] }) => {
  const response = await apiClient.post<Membership>(`/buildings/${buildingId}/memberships`, data);
  return response.data;
};

export const getPendingMemberships = async (buildingId: string) => {
  const { data } = await apiClient.get<{ memberships: Membership[] }>(`/buildings/${buildingId}/memberships/pending`);
  return data.memberships;
};

export const verifyMembership = async (buildingId: string, membershipId: string, data: { status: 'active' | 'rejected' }) => {
  const response = await apiClient.patch<Membership>(`/buildings/${buildingId}/memberships/${membershipId}/verify`, data);
  return response.data;
};

export const requestBuildingAccess = async (buildingId: string, data: { unitId: string }) => {
  const response = await apiClient.post<Membership>(`/buildings/${buildingId}/request-access`, data);
  return response.data;
};

export const getMyMembershipStatus = async (buildingId: string) => {
  try {
    const { data } = await apiClient.get<Membership>(`/buildings/${buildingId}/me`);
    return data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};
