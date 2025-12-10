// Device and location mapping utilities

export const DEVICE_MAPPING: Record<string, string> = {
  CKEB233960333: "Office 1",
  cke24131qe2eq: "Office 1", // Add the actual device SN you're seeing
  CKE24131QE2EQ: "Office 1", // Case insensitive variant
  // Add more device mappings here
  // "DEVICE_SN_2": "Office 2",
  // "DEVICE_SN_3": "Warehouse",
  // "DEVICE_SN_4": "Factory Floor",
};

export function mapDeviceSN(deviceSN?: string): string {
  if (!deviceSN) return "-";

  return DEVICE_MAPPING[deviceSN] || deviceSN;
}

export function getDeviceLocation(deviceSN?: string): string {
  return mapDeviceSN(deviceSN);
}

// For future extensions
export const LOCATION_COLORS: Record<string, string> = {
  "Office 1": "success",
  "Office 2": "primary",
  Warehouse: "warning",
  "Factory Floor": "danger",
};

export function getLocationColor(location: string): string {
  return LOCATION_COLORS[location] || "default";
}
