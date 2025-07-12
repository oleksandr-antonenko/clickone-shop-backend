export interface CreateProduct {
  name: string;
  price: number;
  stock: boolean;
  description: string;
  sku: string;
  categoryId: number;
  familyId?: number;
  comparePrice?: number;
  translations?: Record<
    string,
    {
      name: string;
      description: string;
    }
  >;
  seoTitle?: string;
  seoDescription?: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  status: 'active' | 'draft' | 'archived';
}

export enum ProductStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}
