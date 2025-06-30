export interface AssetPayload {
  id: string;
  assetTag: string;
  name: string;
  description: string | null;
  categoryId: number;
  status: string;
  condition: string | null;
  serialNumber: string | null;
  location: string;
  department: string | null;
  manufacturer: string | null;
  installDate: Date | null;
  warrantyExpiry: Date | null;
  lastMaintenance: Date | null;
  nextMaintenance: Date | null;
  assetValue: number | null;
  utilizationRate: number | null;
  createdAt: Date;
  createdById: string;
  assignedToId: string | null;
  breakdowns: Array<{
    id: string;
    status: string;
    priority: string | null;
  }>;
}

export interface AssetStats {
  total: number;
  new: number;
  active: number;
  maintenance: number;
  critical: number;
}
