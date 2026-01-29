import type { Driver, MaskedDriver, UserRole } from "@/types/database";

/**
 * Masks a national ID number
 * Example: CM12345678ABCDE -> CM****78AB
 */
export function maskNationalId(value: string | null): string {
  if (!value) return "Not provided";
  if (value.length <= 4) return "****";

  // Show first 2 and last 4 characters
  const visibleStart = value.slice(0, 2);
  const visibleEnd = value.slice(-4);
  const maskedLength = Math.max(value.length - 6, 4);

  return `${visibleStart}${"*".repeat(maskedLength)}${visibleEnd}`;
}

/**
 * Masks a phone number
 * Example: +256701234567 -> ******4567
 */
export function maskPhone(value: string | null): string {
  if (!value) return "Not provided";
  if (value.length <= 4) return "****";

  // Show last 4 digits only
  const visibleEnd = value.slice(-4);
  const maskedLength = value.length - 4;

  return `${"*".repeat(maskedLength)}${visibleEnd}`;
}

/**
 * Masks a driving permit number
 * Example: UG123456789 -> UG1****789
 */
export function maskPermit(value: string | null): string {
  if (!value) return "Not provided";
  if (value.length <= 5) return "****";

  // Show first 3 and last 3 characters
  const visibleStart = value.slice(0, 3);
  const visibleEnd = value.slice(-3);
  const maskedLength = Math.max(value.length - 6, 4);

  return `${visibleStart}${"*".repeat(maskedLength)}${visibleEnd}`;
}

/**
 * Masks an email address
 * Example: john.doe@example.com -> j***e@example.com
 */
export function maskEmail(value: string | null): string {
  if (!value) return "Not provided";

  const [localPart, domain] = value.split("@");
  if (!domain || localPart.length <= 2) {
    return `****@${domain || "****"}`;
  }

  const visibleStart = localPart.slice(0, 1);
  const visibleEnd = localPart.slice(-1);
  const maskedLength = Math.max(localPart.length - 2, 3);

  return `${visibleStart}${"*".repeat(maskedLength)}${visibleEnd}@${domain}`;
}

/**
 * Masks a name (shows first and last initial only)
 * Example: John Doe -> J*** D**
 */
export function maskName(value: string | null): string {
  if (!value) return "Not provided";

  const parts = value.split(" ");
  return parts
    .map((part) => {
      if (part.length <= 1) return part;
      return `${part[0]}${"*".repeat(part.length - 1)}`;
    })
    .join(" ");
}

/**
 * Roles that can view unmasked sensitive data
 */
const SENSITIVE_DATA_ROLES: UserRole[] = ["smp_admin", "security_officer"];

/**
 * Checks if a role can view sensitive data
 */
export function canViewSensitiveData(role: UserRole | null): boolean {
  if (!role) return false;
  return SENSITIVE_DATA_ROLES.includes(role);
}

/**
 * Masks driver data based on user role
 */
export function maskDriverData(
  driver: Driver,
  userRole: UserRole | null
): MaskedDriver {
  const shouldMask = !canViewSensitiveData(userRole);

  return {
    ...driver,
    phone: shouldMask ? maskPhone(driver.phone) : driver.phone,
    national_id: shouldMask
      ? maskNationalId(driver.national_id)
      : driver.national_id,
    driving_permit_number: shouldMask
      ? maskPermit(driver.driving_permit_number)
      : driver.driving_permit_number,
    _isMasked: shouldMask,
  };
}

/**
 * Masks an array of drivers based on user role
 */
export function maskDriversData(
  drivers: Driver[],
  userRole: UserRole | null
): MaskedDriver[] {
  return drivers.map((driver) => maskDriverData(driver, userRole));
}

/**
 * Masks specific fields in any object
 */
export function maskFields<T extends Record<string, unknown>>(
  data: T,
  fieldsToMask: Array<{
    field: keyof T;
    maskFn: (value: string | null) => string;
  }>,
  userRole: UserRole | null
): T & { _isMasked: boolean } {
  if (canViewSensitiveData(userRole)) {
    return { ...data, _isMasked: false };
  }

  const maskedData = { ...data };
  for (const { field, maskFn } of fieldsToMask) {
    const value = maskedData[field];
    if (typeof value === "string" || value === null) {
      (maskedData as Record<string, unknown>)[field as string] = maskFn(value as string | null);
    }
  }

  return { ...maskedData, _isMasked: true };
}

/**
 * Creates a display-safe version of sensitive data for UI
 */
export function createDisplaySafeData(
  data: {
    phone?: string | null;
    national_id?: string | null;
    driving_permit_number?: string | null;
    email?: string | null;
  },
  userRole: UserRole | null
): {
  phone: string;
  national_id: string;
  driving_permit_number: string;
  email: string;
  _isMasked: boolean;
} {
  const shouldMask = !canViewSensitiveData(userRole);

  return {
    phone: shouldMask ? maskPhone(data.phone ?? null) : (data.phone ?? "Not provided"),
    national_id: shouldMask
      ? maskNationalId(data.national_id ?? null)
      : (data.national_id ?? "Not provided"),
    driving_permit_number: shouldMask
      ? maskPermit(data.driving_permit_number ?? null)
      : (data.driving_permit_number ?? "Not provided"),
    email: shouldMask
      ? maskEmail(data.email ?? null)
      : (data.email ?? "Not provided"),
    _isMasked: shouldMask,
  };
}
