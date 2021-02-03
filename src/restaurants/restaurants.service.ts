import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { Category } from './entities/cetegory.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

// 서비스파일 상용구
@Injectable()
export class RestaurantService {
  constructor(
    // restaurant entiry를 가져와 사용할수있음
    // repository를 가져올때 사용하는 상용구
    // const restaurants = connection.getRepository(Restaunrant); 가 함축돼있는 데코레이터

    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>, // restaurants DB를 사용하겠다는 말
    // Repository<Category>를 extends하고있어서 CategoryRepository를 불러오기만 함
    private readonly categories: CategoryRepository
  ) {}

  // 카테고리를 가져오거나 또는 만들어버림
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
    let category = await this.categories.findOne({ slug: categorySlug });
    // 해당 카테고리가 존재하지 않으면 해당 카테고리를 DB에 새로 저장
    if (!category) {
      // 저장되는 방식은 원본(name)과 변환된 검색용 단어(slug)를 오브젝트형식으로 저장한다.
      category = await this.categories.save(
        this.categories.create({ slug: categorySlug, name: categoryName })
      );
    }
    return category;
  }

  async createRestaurant(
    // 이 owner는  @AuthUser() 로 인증과정을 거쳐서 전달받은 User정보이다.
    owner: User,
    // Input DTO
    createRestaurantInput: CreateRestaurantInput
    // output DTO
  ): Promise<CreateRestaurantOutput> {
    try {
      // typeOrm 명ㅇ]령어중 create명령어를사용하여 javascript상에서만 존재하는 오브젝트를 생성
      // (아직 DB저장 안함)
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      // 생성된 객체에서 owner를 덮어씌어줌
      newRestaurant.owner = owner;
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName
      );
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
      // 에러롤 수동으로 처리해주는 과정
    } catch {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }

  // Restaurant 수정
  // async function은 promise를 반환함
  async editRestaurant(
    // @AuthUser로 전달받은 user를 가져오고
    owner: User,
    // EditRestaurantInput DTO를 통과한 argument를 가져온다
    editRestaurantInput: EditRestaurantInput
    // EditRestaurantOutput DTO를 통과한 값을 반환한다.
    // 이때 async 함수면 promise형식을 반환함
  ): Promise<EditRestaurantOutput> {
    try {
      // 일단 restaurants DB에서 전달받은 restaurantId(수정할 대상의 restaurantId)를 기준으로 findOne하여 조건에 맞는 restaurant를 가져온다
      const restaurant = await this.restaurants.findOne(
        editRestaurantInput.restaurantId
      );
      // 만약 findOne에서 아무것도 찾을수 없다면 에러를 반환(찾을수없다는 메시지로 핸들링)
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      // 로그인한 사용자의 아이디(owner.id)와 수정할 레스토랑의 실제 주인(restaurant.ownerId)가 같지 않다면 해당 레스토랑 정보를 수정할 권한이 없다고 에러메시지와함께 핸들링
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't edit a restaurant that you don't own",
        };
      }

      // 카테고리를 입력받을수도있고 아닐수도 있음
      // 카테고리를 입력받지 않는경우에는 update에 포함시키지 않는 조건을 만들기 위해서 null값을 기본으로 입력함
      let category: Category = null;
      // 인자로 전달받은 categoryName이 있다면
      // category를 가져와 category변수에 넣어주던가 또는 만약 category가없다면 새로 오브젝트를 만들어 category변수에 넣어줌
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName
        );
      }
      // 위에서 조건에 따라 만들어진 category를 포함하여 edit된 restaurant정보를 save해줌
      // 업데이트하는경우에는 배열안에다 넣어줌 create안에 넣어주는게 아님
      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          // editRestaurantInput의 값은 옵셔널로 지정돼서 모든 인자가 무조건 전달 받는것은 아님
          // edit하고 싶은 것만 전달받아서 스프레드식으로 업데이트 해줌
          ...editRestaurantInput,
          // 위에서 category의 값은 기본으로 null값으로 정의됐기 때문에
          // category값을 받아오지 않는다면 category의 데이터를 update에 포함하지 않음
          ...(category && { category }),
        },
      ]);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit Restaurant',
      };
    }
  }
}
