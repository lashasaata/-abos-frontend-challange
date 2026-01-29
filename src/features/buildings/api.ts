import { apiClient } from '../../api/client';
import type { Building } from '../../types';

export const getBuildings = async () => {
  const { data } = await apiClient.get<{ buildings: Building[] }>('/buildings/');
  return data.buildings;
};
