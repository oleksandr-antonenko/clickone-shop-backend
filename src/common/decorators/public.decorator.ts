import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const PUBLIC_ROUTES_KEY = 'publicRoutes';
export const PUBLIC_READ_KEY = 'publicRead';


export const Public = (options?: { 
  scope?: string; 
  description?: string;
}) => SetMetadata(IS_PUBLIC_KEY, { 
  isPublic: true, 
  ...options 
});


export const PublicRoutes = (routes: string[]) => SetMetadata(PUBLIC_ROUTES_KEY, routes);


export const PublicRead = () => SetMetadata(PUBLIC_READ_KEY, true); 