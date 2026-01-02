import { Category, CategoryId, CategoryType } from "../domain";

export interface CategoryDao {
  create(category: Category): void;
  getById(id: CategoryId): Category | null;
  list(filter?: { type?: CategoryType }): Category[];
  update(category: Category): void;
  delete(id: CategoryId): void;
}