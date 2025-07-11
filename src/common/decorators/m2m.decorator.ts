import { SetMetadata } from '@nestjs/common';

export const M2M_KEY = 'm2m';
export const M2M_SCOPES_KEY = 'm2mScopes';
export const M2M_PERMISSIONS_KEY = 'm2mPermissions';

export interface M2MOptions {
  scopes?: string[];
  permissions?: string[];
  description?: string;
}

/**
 * Decorator to mark endpoints as accessible via M2M authentication
 * @param options Configuration for M2M access including required scopes and permissions
 */
export const M2M = (options?: M2MOptions) => SetMetadata(M2M_KEY, {
  isM2M: true,
  scopes: options?.scopes || [],
  permissions: options?.permissions || [],
  description: options?.description,
});

/**
 * Decorator to specify required scopes for M2M access
 * @param scopes Array of required scopes
 */
export const M2MScopes = (scopes: string[]) => SetMetadata(M2M_SCOPES_KEY, scopes);

/**
 * Decorator to specify required permissions for M2M access
 * @param permissions Array of required permissions
 */
export const M2MPermissions = (permissions: string[]) => SetMetadata(M2M_PERMISSIONS_KEY, permissions); 