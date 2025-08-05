import { SetMetadata } from '@nestjs/common';

export const M2M_KEY = 'm2m';
export const M2M_SCOPES_KEY = 'm2mScopes';
export const M2M_PERMISSIONS_KEY = 'm2mPermissions';

export interface M2MOptions {
  scopes?: string[];
  permissions?: string[];
  description?: string;
}


export const M2M = (options?: M2MOptions) => SetMetadata(M2M_KEY, {
  isM2M: true,
  scopes: options?.scopes || [],
  permissions: options?.permissions || [],
  description: options?.description,
});


export const M2MScopes = (scopes: string[]) => SetMetadata(M2M_SCOPES_KEY, scopes);


export const M2MPermissions = (permissions: string[]) => SetMetadata(M2M_PERMISSIONS_KEY, permissions); 