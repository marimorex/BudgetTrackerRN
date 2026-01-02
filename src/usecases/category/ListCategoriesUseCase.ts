import { CategoryDao } from "../../dao/CategoryDao";
import { Category, CategoryType } from "../../domain";

export class ListCategoriesUseCase {
  constructor(private readonly categoryDao: CategoryDao) {}

  execute(filter?: { type?: CategoryType }): Category[] {
    return this.categoryDao.list(filter);
  }
}