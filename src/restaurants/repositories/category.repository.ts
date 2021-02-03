import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../entities/cetegory.entity';

// custom repository하는법
// extends Repository<Category> 하면됨
@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  // 카테고리를 가져오거나 또는 오브젝트를 만들어버림(for javascript)
  async getOrCreate(name: string): Promise<Category> {
    // slug란 일련의 규칙으로 통일된 무엇가를 뜻함
    // 1. 카테고리이름의 앞뒤 빈칸을 모두 지워줌
    // 2. 카테고리이름을 소문자로 만들어준다
    const categoryName = name.trim().toLowerCase();
    // 3.. categoryName중 빈칸이 있다면 모든 빈칸은 "-" 로 대체 한다.
    const categorySlug = categoryName.replace(/ /g, '-');
    // 검색은 category DB의 slug 필드로 검색함
    // 검색하는 방법 ({검색할 필드: 검색할 단어})
    // fineOne 처음 검색되는 한개만 검색결과를 반환하고 처음 발견되는 검색결과를 반환하고 검색을 중지함
    // (unique한 단어를 검색할때는 검색결과가 한개이상 나올이유가 없으니 최적화의 개념임)
    let category = await this.findOne({ slug: categorySlug });
    // 해당 카테고리가 존재하지 않으면 해당 카테고리를 DB에 새로 저장
    if (!category) {
      // 저장되는 방식은 원본(name)과 변환된 검색용 단어(slug)를 오브젝트형식으로 저장한다.

      category = await this.save(
        this.create({ slug: categorySlug, name: categoryName })
      );
    }
    return category;
  }
}
