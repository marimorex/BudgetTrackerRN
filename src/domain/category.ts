import { CategoryId, CategoryType } from "./types";

export interface Category {
  id: CategoryId;
  name: string;
  type: CategoryType; // INCOME | EXPENSE
  description?: string | null;
}