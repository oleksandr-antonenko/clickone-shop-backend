export interface UpdateProduct {
  name: string;
  price: number;
  stock: boolean;
  description: string;
  familyId?: number;
  attributes?: number[];
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
  sku: string;
  status: 'active' | 'draft' | 'archived';
}
