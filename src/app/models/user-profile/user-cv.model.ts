/**
 * UserCvDto interface
 * Matches API schema: NextHireApp.UserCVs.UserCvDto
 */
export interface UserCvDto {
  cvId: string; // UUID format
  userCode: string | null;
  cvName: string | null;
  createdAt: string; // date-time format (ISO 8601)
  isDefault: boolean;
  version: number; // integer
}

/**
 * UserCvDetailDto interface
 * Matches API schema: NextHireApp.UserCVs.UserCvDetailDto
 * Includes file content for download
 */
export interface UserCvDetailDto {
  cvId: string; // UUID format
  userCode: string | null;
  cvName: string | null;
  createdAt: string; // date-time format (ISO 8601)
  isDefault: boolean;
  version: number; // integer
  fileCv: string | null; // Base64 encoded file content or URL
}

/**
 * Create/Update CV request DTO
 */
export interface CreateUserCvDto {
  cvName: string;
  file: File;
  isDefault?: boolean;
}

/**
 * Update CV metadata request DTO
 */
export interface UpdateUserCvDto {
  cvName: string;
}

/**
 * Set default CV request DTO
 * Matches API schema: NextHireApp.UserCVs.SetDefaultUserCvDto
 */
export interface SetDefaultUserCvDto {
  cvId: string; // UUID format
}

