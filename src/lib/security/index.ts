// Security module exports

// Encryption utilities
export {
  encrypt,
  decrypt,
  createSearchableHash,
  generateKeyId,
  encryptSensitiveData,
  decryptSensitiveData,
  verifyEncryptionConfig,
} from "./encryption";

// Data masking utilities
export {
  maskNationalId,
  maskPhone,
  maskPermit,
  maskEmail,
  maskName,
  canViewSensitiveData,
  maskDriverData,
  maskDriversData,
  maskFields,
  createDisplaySafeData,
} from "./data-masking";

// Audit logging utilities
export {
  createAuditLog,
  logSensitiveDataAccess,
  logDecryptionEvent,
  logDataExport,
  logPermissionDenied,
  logLogin,
  logLogout,
  logResourceAction,
  getAuditLogs,
  getUserAuditStats,
} from "./audit";
