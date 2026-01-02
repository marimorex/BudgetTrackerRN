import { CategoryDao } from "../../dao/CategoryDao";
import { Category, CategoryType } from "../../domain";
import { uuid } from "../uuid";

export class CreateCategoryUseCase {
  constructor(private readonly categoryDao: CategoryDao) {}

  execute(input: { name: string; type: CategoryType, description?: string }): Category {
    const category: Category = {
      id: uuid(),
      name: input.name,
      type: input.type,
      description: input.description,
    };
    this.categoryDao.create(category);
    return category;
  }
}
