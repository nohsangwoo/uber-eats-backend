import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Like, Repository } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
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
          // update를 한다면 id를 같이 보내줘야함
          // 만약 id를 보내지 않는다면 새로운 객체를 insert하겠다는 의미가 됨
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

  // 레스토랑 삭제기능
  async deleteRestaurant(
    // 로그인한 사용자의 정보를 가져옴
    owner: User,
    { restaurantId }: DeleteRestaurantInput
  ): Promise<DeleteRestaurantOutput> {
    try {
      // 레스토랑에서 id로 검색하여 하나라도 결과값이 나오면 즉시 검색중단
      // (어차피 유니크 속성이라 중복되는값이 없고 더 검색해봐야 리소스 낭비이기때문에)
      const restaurant = await this.restaurants.findOne(restaurantId);
      //레스토랑을 찾지 못했다면 찾지 못했다는 에러메시지를 false와 함께 반환
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      // 로그인한 사용자의 id와 레스토랑의 주인 id 가 같지 않다면
      // 삭제할수 없다는 메시지와 false값을 반환
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't delete a restaurant that you don't own",
        };
      }

      //위 단계를 통과하여 restaurant의 findOne값이 존재한다면
      // argument로 전달받은 restauranId를 기준으로 해당 id와 같은 레스토랑을 삭제
      await this.restaurants.delete(restaurantId);
      return {
        ok: true,
      };
    } catch {
      //어쨌든 위 과정에서 의도하지 않은 에러가 나온다면 에러메시지와함께 false반환
      return {
        ok: false,
        error: 'Could not delete restaurant.',
      };
    }
  }

  // 모든 카테고리를 찾아주는 함수 => input이 필요하지않음
  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      // 모든 카테고리를 찾아서 그 정보를 categories변수에 담아줘라
      const categories = await this.categories.find();
      // 찾ㅇ면 true와 함께 categories반환
      return {
        ok: true,
        categories,
      };
      // 못찾거나 에러가 발생하면 에러 메시지와함께 false반환
    } catch {
      return {
        ok: false,
        error: 'Could not load categories',
      };
    }
  }

  // restaurant의 개수를 계산해주는 기능
  // 전달받는 인자는 category
  //countRestaurants 으로 보낸 category에 해당하는 restaurant을 count하는 것
  countRestaurants(category: Category) {
    return this.restaurants.count({ category });
  }

  // category에 해당하는 레스토랑을 검색
  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      // category를 통하여 restaurant를 검색하는것
      // category를 통하여 restaurant를 검색할 수 있다는것은 category와 restaurant는 relataion으로 서로 묶여있다는 의미이다
      // 따라서 이경우 findOne같은 함수로 검색하여 category를 통하여 restaurant를 검색할때는 relations:['restaurant']를 옵션으로 추가해줘야한다
      const category = await this.categories.findOne({ slug });
      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }
      // 여기까지 온거면 카테고리가 있다는거고 뭔가 찾았다는 뜻
      // restaurants변수에 category조건에 맞는 restaurant를
      // where을 이용하여 category에 해당하는 restaurant를 가져온다
      const setPageContents = 25;
      const restaurants = await this.restaurants.find({
        where: {
          category,
        },
        //한 페이지당 25개씩 표시
        take: setPageContents,
        // 첫번째 페이지에선 page는 기본값이 1이니깐 1-1*25하면 0만큼 skip한다
        // 그다음 페이지가 2라면 2-1*25니깐 25만큼 skip
        skip: (page - 1) * setPageContents,
      });

      const totalResults = await this.countRestaurants(category);

      return {
        ok: true,
        restaurants,
        category,
        totalPages: Math.ceil(totalResults / setPageContents),
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load category',
      };
    }
  }

  // 모든 레스토랑을 검색함 (pagination적용)
  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      // find의 옵션을 잘 사용해서 검색
      // findAndCount는 array를 반환하는데 총 검색된 데이터와 count 된 개수를 array안에 포함해서 반환한다.
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        // 앞부분데이터를 얼마나 skip을 할껀지
        skip: (page - 1) * 25,
        //각 페이지별 로딩되는 데이터는 25개씩
        take: 25,
      });
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / 25),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load restaurants',
      };
    }
  }

  // id를 기준으로 레스토랑을 검색
  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      // 레스토랑 id를 전달받아서 한개라도 검색되면 바로 값을 반환과 동시에 검색 중단
      // unique한 데이터이기때문에 한개라도 검색된다면 더 이상 검색 동작을 진행할 이유없음
      const restaurant = await this.restaurants.findOne(restaurantId);
      // 레스토랑이 없을때 핸들링
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      // 레스토랑을 찾았을때 핸들링
      return {
        ok: true,
        restaurant,
      };

      // 어던 에러가 발생할때 핸들링
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurant',
      };
    }
  }

  // 레스토랑이름으로 레스토랑 검색
  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      // 레스토랑의 이름으로 검색하여 검색된 레스토랑의 총 데이터를 반환하고 그다음 카운트된 레스토랑의 개수를 반환
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          // like는 비슷한 값을 찾아주는것
          // 여기선 query라는 단어가 앞뒤 중간 어디라도 포함된다면 검색해달라는 뜻
          // 만약 Like(`${query}%`) 이런식이라면 query라는 단어로 시작되는 데이터를 검색해달라는 뜻
          name: Like(`%${query}%`),
        },
      });
    } catch {
      return { ok: false, error: 'Could not search for restaurants' };
    }
  }
}
