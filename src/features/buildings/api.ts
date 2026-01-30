import { apiClient } from '../../api/client';
import type { Building, Unit } from '../../types';

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
