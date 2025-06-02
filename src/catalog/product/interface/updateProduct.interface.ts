export interface UpdateProduct {
  name: string;
  price: number;
  stock: boolean;
  description: string;
  familyId: number | undefined;
}