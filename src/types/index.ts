export interface User {
  id: string;
  email: string;
  role: 'resident' | 'building_admin' | 'manager' | 'provider' | 'super_admin';
  createdAt: string;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  createdAt: string;
}

export interface Unit {
  id: string;
  buildingId: string;
  unitNumber: string;
  floor: number;
  createdAt: string;
}

export interface Ticket {
  id: string;
  buildingId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
}
