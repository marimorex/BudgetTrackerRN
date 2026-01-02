import { CategoryDao } from "../../dao/CategoryDao";
import { CategoryId } from "../../domain/types";

export class DeleteCategoryUseCase {
  constructor(private readonly categoryDao: CategoryDao) {}

  execute(id: CategoryId): void {
    this.categoryDao.delete(id);
  }
}
