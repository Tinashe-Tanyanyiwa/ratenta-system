// Mock data for development - will be replaced with Directus API calls

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface Farmer {
  id: string;
  grower_number: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address: string;
  region: string;
  total_bales: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Box {
  id: string;
  box_number: string;
  capacity: number;
  current_count: number;
  location: string;
  status: 'available' | 'full' | 'in_transit';
  created_at: string;
}

export interface Bale {
  id: string;
  bale_id: string;
  barcode: string;
  weight: number;
  grade: 'A' | 'B' | 'C' | 'D';
  farmer_id: string;
  farmer_name: string;
  box_id: string | null;
  box_number: string | null;
  has_fault: boolean;
  fault_description: string | null;
  status: 'pending' | 'processed' | 'shipped' | 'rejected';
  created_at: string;
  updated_at: string;
}

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@ratenta.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
  },
  {
    id: '2',
    email: 'operator@ratenta.com',
    first_name: 'John',
    last_name: 'Operator',
    role: 'operator',
  },
  {
    id: 'emergency',
    email: 'tanyanyiwatinashe7@gmail.com',
    first_name: 'Emergency',
    last_name: 'Admin',
    role: 'admin',
  },
];

export const mockFarmers: Farmer[] = [
  {
    id: '1',
    grower_number: 'GRW-001',
    first_name: 'James',
    last_name: 'Moyo',
    phone: '+263 77 123 4567',
    email: 'james.moyo@email.com',
    address: '123 Farm Road, Harare',
    region: 'Mashonaland East',
    total_bales: 45,
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    grower_number: 'GRW-002',
    first_name: 'Sarah',
    last_name: 'Chiweshe',
    phone: '+263 77 234 5678',
    email: 'sarah.chiweshe@email.com',
    address: '456 Tobacco Lane, Bindura',
    region: 'Mashonaland Central',
    total_bales: 32,
    status: 'active',
    created_at: '2024-01-20T14:30:00Z',
  },
  {
    id: '3',
    grower_number: 'GRW-003',
    first_name: 'Peter',
    last_name: 'Ncube',
    phone: '+263 77 345 6789',
    email: 'peter.ncube@email.com',
    address: '789 Grower Street, Chinhoyi',
    region: 'Mashonaland West',
    total_bales: 28,
    status: 'active',
    created_at: '2024-02-01T09:15:00Z',
  },
  {
    id: '4',
    grower_number: 'GRW-004',
    first_name: 'Grace',
    last_name: 'Mutasa',
    phone: '+263 77 456 7890',
    email: 'grace.mutasa@email.com',
    address: '321 Field Avenue, Mutare',
    region: 'Manicaland',
    total_bales: 51,
    status: 'active',
    created_at: '2024-02-10T11:45:00Z',
  },
  {
    id: '5',
    grower_number: 'GRW-005',
    first_name: 'Michael',
    last_name: 'Dube',
    phone: '+263 77 567 8901',
    email: 'michael.dube@email.com',
    address: '654 Harvest Road, Masvingo',
    region: 'Masvingo',
    total_bales: 19,
    status: 'inactive',
    created_at: '2024-02-15T16:20:00Z',
  },
];

export const mockBoxes: Box[] = [
  {
    id: '1',
    box_number: 'BOX-001',
    capacity: 50,
    current_count: 45,
    location: 'Warehouse A',
    status: 'available',
    created_at: '2024-01-10T08:00:00Z',
  },
  {
    id: '2',
    box_number: 'BOX-002',
    capacity: 50,
    current_count: 50,
    location: 'Warehouse A',
    status: 'full',
    created_at: '2024-01-12T09:30:00Z',
  },
  {
    id: '3',
    box_number: 'BOX-003',
    capacity: 50,
    current_count: 30,
    location: 'Warehouse B',
    status: 'available',
    created_at: '2024-01-15T10:15:00Z',
  },
  {
    id: '4',
    box_number: 'BOX-004',
    capacity: 50,
    current_count: 0,
    location: 'Transit',
    status: 'in_transit',
    created_at: '2024-01-18T14:00:00Z',
  },
];

export const mockBales: Bale[] = [
  {
    id: '1',
    bale_id: 'BLE-2024-001',
    barcode: '7890123456789',
    weight: 125.5,
    grade: 'A',
    farmer_id: '1',
    farmer_name: 'James Moyo',
    box_id: '1',
    box_number: 'BOX-001',
    has_fault: false,
    fault_description: null,
    status: 'processed',
    created_at: '2024-03-01T08:30:00Z',
    updated_at: '2024-03-01T10:00:00Z',
  },
  {
    id: '2',
    bale_id: 'BLE-2024-002',
    barcode: '7890123456790',
    weight: 118.2,
    grade: 'B',
    farmer_id: '1',
    farmer_name: 'James Moyo',
    box_id: '1',
    box_number: 'BOX-001',
    has_fault: false,
    fault_description: null,
    status: 'processed',
    created_at: '2024-03-01T09:15:00Z',
    updated_at: '2024-03-01T11:30:00Z',
  },
  {
    id: '3',
    bale_id: 'BLE-2024-003',
    barcode: '7890123456791',
    weight: 130.8,
    grade: 'A',
    farmer_id: '2',
    farmer_name: 'Sarah Chiweshe',
    box_id: '1',
    box_number: 'BOX-001',
    has_fault: true,
    fault_description: 'Minor moisture damage on outer layer',
    status: 'processed',
    created_at: '2024-03-02T07:45:00Z',
    updated_at: '2024-03-02T09:20:00Z',
  },
  {
    id: '4',
    bale_id: 'BLE-2024-004',
    barcode: '7890123456792',
    weight: 115.0,
    grade: 'C',
    farmer_id: '3',
    farmer_name: 'Peter Ncube',
    box_id: '2',
    box_number: 'BOX-002',
    has_fault: false,
    fault_description: null,
    status: 'shipped',
    created_at: '2024-03-03T10:00:00Z',
    updated_at: '2024-03-05T14:00:00Z',
  },
  {
    id: '5',
    bale_id: 'BLE-2024-005',
    barcode: '7890123456793',
    weight: 122.3,
    grade: 'B',
    farmer_id: '4',
    farmer_name: 'Grace Mutasa',
    box_id: null,
    box_number: null,
    has_fault: false,
    fault_description: null,
    status: 'pending',
    created_at: '2024-03-10T08:00:00Z',
    updated_at: '2024-03-10T08:00:00Z',
  },
  {
    id: '6',
    bale_id: 'BLE-2024-006',
    barcode: '7890123456794',
    weight: 98.5,
    grade: 'D',
    farmer_id: '5',
    farmer_name: 'Michael Dube',
    box_id: null,
    box_number: null,
    has_fault: true,
    fault_description: 'Significant pest damage, quality downgraded',
    status: 'rejected',
    created_at: '2024-03-11T11:30:00Z',
    updated_at: '2024-03-11T15:45:00Z',
  },
  {
    id: '7',
    bale_id: 'BLE-2024-007',
    barcode: '7890123456795',
    weight: 127.1,
    grade: 'A',
    farmer_id: '2',
    farmer_name: 'Sarah Chiweshe',
    box_id: '3',
    box_number: 'BOX-003',
    has_fault: false,
    fault_description: null,
    status: 'processed',
    created_at: '2024-03-12T09:00:00Z',
    updated_at: '2024-03-12T12:00:00Z',
  },
  {
    id: '8',
    bale_id: 'BLE-2024-008',
    barcode: '7890123456796',
    weight: 119.8,
    grade: 'B',
    farmer_id: '4',
    farmer_name: 'Grace Mutasa',
    box_id: '3',
    box_number: 'BOX-003',
    has_fault: false,
    fault_description: null,
    status: 'processed',
    created_at: '2024-03-13T14:20:00Z',
    updated_at: '2024-03-13T16:00:00Z',
  },
];

// Helper function to generate unique IDs
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Helper function to generate bale ID
export const generateBaleId = (): string => {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  return `BLE-${year}-${num}`;
};

// Helper function to generate grower number
export const generateGrowerNumber = (): string => {
  const num = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `GRW-${num}`;
};

// Helper function to generate box number
export const generateBoxNumber = (): string => {
  const num = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `BOX-${num}`;
};
