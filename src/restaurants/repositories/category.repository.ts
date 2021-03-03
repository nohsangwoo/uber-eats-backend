import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../entities/cetegory.entity';

@EntityRepository(Category)
// category레포지토리를 거치기전 처리기를 만들고 사용할수있음
// 마치 resolver에서 service의 함수를 사용하듯이
export class CategoryRepository extends Repository<Category> {
  async getOrCreate(name: string): Promise<Category> {
    const categoryName = name.trim().toLowerCase();
    const categorySlug = categoryName.replace(/ /g, '-');
    let category = await this.findOne({ slug: categorySlug });
    if (!category) {
      category = await this.save(
        this.create({ slug: categorySlug, name: categoryName }),
      );
    }
    return category;
  }
}
