export type SizeCategory = 'U' | 'A' | 'B' | 'C' | 'D' | 'E' | 'M';

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'operator';
  createdAt: string;
}

export interface Boat {
  id: string;
  name: string;
}

export interface Tank {
  id: string;
  number: number;
  name: string;
  active: boolean;
}

export interface OffloadRecord {
  id: string;
  boatName: string;
  offloadDate: string;
  tripNumber: string;
  externalFactory: string;
  totalKgOffloaded: number;
  totalKgReceived: number;
  totalKgDead: number;
  totalKgRotten: number;
  totalKgAlive: number;
  sizeU: number;
  sizeA: number;
  sizeB: number;
  sizeC: number;
  sizeD: number;
  sizeE: number;
  sizeM: number;
  deadOnTanks: number;
  rottenOnTanks: number;
  productId?: string;
  createdBy: string;
  createdAt: string;
}

export interface ReceivingBatch {
  id: string;
  date: string;
  batchNumber: string;
  createdBy: string;
  createdAt: string;
}

export interface CrateLineItem {
  id: string;
  receivingBatchId: string;
  boatName: string;
  offloadDate: string;
  productId: number;
  crateNumber: number;
  size: SizeCategory;
  kg: number;
  originalKg: number;
  originalSize: SizeCategory;
  status: 'received' | 'rechecked' | 'stored' | 'emptied' | 'dispatched';
  tankId?: string;
  createdBy: string;
  createdAt: string;
  modifiedBy?: string;
  modifiedAt?: string;
}

export interface LooseStock {
  id: string;
  tankId: string;
  size: SizeCategory;
  kg: number;
  fromCrateId?: string;
  boatName?: string;
  offloadDate?: string;
  status: 'stored' | 'dispatched';
  createdBy: string;
  createdAt: string;
  modifiedBy?: string;
  modifiedAt?: string;
}

export interface Loss {
  id: string;
  date: string;
  type: 'dead' | 'rotten' | 'lost';
  tankId?: string;
  crateId?: string;
  looseStockId?: string;
  size: SizeCategory;
  kg: number;
  notes: string;
  createdBy: string;
  createdAt: string;
}

export interface DispatchLineItem {
  id: string;
  tankId: string;
  crateId?: string;
  looseStockId?: string;
  size: SizeCategory;
  kg: number;
  tankNumber: number;
  crateNumber?: number;
  isLoose: boolean;
}

export interface Dispatch {
  id: string;
  type: 'export' | 'regrade';
  clientAwb: string;
  dispatchDate: string;
  lineItems: DispatchLineItem[];
  totalKg: number;
  sizeU: number;
  sizeA: number;
  sizeB: number;
  sizeC: number;
  sizeD: number;
  sizeE: number;
  createdBy: string;
  createdAt: string;
}

export interface StockSummary {
  totalKg: number;
  sizeU: number;
  sizeA: number;
  sizeB: number;
  sizeC: number;
  sizeD: number;
  sizeE: number;
}

export interface TankStock {
  tankId: string;
  tankNumber: number;
  tankName: string;
  crates: CrateLineItem[];
  looseStock: LooseStock[];
  summary: StockSummary;
}

export interface BoatTripStock {
  boatName: string;
  offloadDate: string;
  tripNumber: string;
  totalLive: number;
  totalDead: number;
  totalRotten: number;
  totalLost: number;
  totalDispatched: number;
  remaining: StockSummary;
}

export interface ProductRecord {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  stockQuantity?: number;
  supplier?: string;
  dateAdded?: string;
  createdBy?: string;
  createdAt?: string;
  sizes?: Array<string | { size: string }>;
}
