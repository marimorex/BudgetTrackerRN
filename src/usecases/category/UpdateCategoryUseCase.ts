import { CategoryDao } from "../../dao/CategoryDao";
import { Category, CategoryType } from "../../domain";
import { CategoryId } from "../../domain/types";

export class UpdateCategoryUseCase {
  constructor(private readonly categoryDao: CategoryDao) {}

  execute(input: { id: CategoryId, name: string; type: CategoryType, description?: string }): Category {
    const existingCategory = this.categoryDao.getById(input.id);
    if (!existingCategory) {
      throw new Error(`Category with id ${input.id} not found`);
    }

    const category: Category = {
      ...existingCategory,
      name: input.name,
      type: input.type,
      description: input.description,
    };
    
    this.categoryDao.update(category);
    return category;
  }
}
