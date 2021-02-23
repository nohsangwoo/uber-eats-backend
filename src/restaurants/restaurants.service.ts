import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Like, Raw, Repository } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { MyRestaurantInput, MyRestaurantOutput } from './dtos/my-restaurant';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { Category } from './entities/cetegory.entity';
import { Dish } from './entities/dish.entity';
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
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>, //Dish의 DB를 사용하겠다는말
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
        restaurantId: newRestaurant.id,
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
        order: {
          // isPromoted의 정렬이 내림차순 순
          // promote된 상태가 제일 먼저 검색되는 순..
          isPromoted: 'DESC',
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
        totalResults,
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
    let pageSize = 25;
    try {
      // find의 옵션을 잘 사용해서 검색
      // findAndCount는 array를 반환하는데 총 검색된 데이터와 count 된 개수를 array안에 포함해서 반환한다.
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        // 앞부분데이터를 얼마나 skip을 할껀지
        skip: (page - 1) * pageSize,
        //각 페이지별 로딩되는 데이터는 25개씩
        take: pageSize,
        // isPromoted의 정렬이 내림차순 순
        // promote된 상태가 제일 먼저 검색되는 순..

        order: {
          isPromoted: 'DESC',
        },
      });
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / pageSize),
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
      // relation관계의 menu도 포함해서 검색
      const restaurant = await this.restaurants.findOne(restaurantId, {
        relations: ['menu'],
      });
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
          // `${name} ILIKE '%${query}%'` 이건 sql문임
          name: Raw(name => `${name} ILIKE '%${query}%'`),
        },
        // pagination을 위한 옵션
        skip: (page - 1) * 25,
        take: 25,
      });
      return {
        ok: true,
        // 검색된 레스토랑들
        //(이름으로 검색하면 중복된 레스토랑이 검색될 가능성이 있으니깐 복수의 개념)
        restaurants,
        // 이름으로 검색된 레스토랑의 총 개수
        totalResults,
        // 이름으로 검색된 레스토랑의 총 페이지 개수
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch {
      return { ok: false, error: 'Could not search for restaurants' };
    }
  }

  // dish만들기 (레스토랑의 메뉴 추가 기능)
  async createDish(
    owner: User,
    createDishInput: CreateDishInput
  ): Promise<CreateDishOutput> {
    try {
      // 레스토랑에서 전달받은 레스토랑의 id를 기준으로 resaturant가 존재하는지 검사
      const restaurant = await this.restaurants.findOne(
        createDishInput.restaurantId
      );
      // 레스토랑이 없다면 에러핸들링
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      // 로그인된 id와 메뉴를 추가하려는 레스토랑의 소유주 id가 같지 않다면 이또한 에러 핸들링(권한이 있는지 확인하는것)
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't do that.",
        };
      }
      // 위 과정을 다 통과했다면
      // 해당 레스토랑에 의존하는 Dish(메뉴)를 만들어준다
      // create로 object생성후 save로 DB에 저장
      await this.dishes.save(
        // restaurant.id로 추가하지않고 restaurant를 추가 하지 않는 이유 :
        // typeorm이 자동으로 restaurant의 id를 찾아서 restaurantId에 추가 해준다
        // relation관계니깐 자동으로 찾아주는듯
        this.dishes.create({ ...createDishInput, restaurant })
      );
      return {
        ok: true,
      };

      // 어쨌든 뭔가 에러가 났다면 에러 핸들링
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: 'Could not create dish',
      };
    }
  }

  // 메뉴의 주인을 확인?
  async checkDishOwner(ownerId: number, dishId: number) {}

  // 메뉴 수정하는기능
  async editDish(
    // 유저정보 전달받고
    owner: User,
    //input 인자 전달받고
    editDishInput: EditDishInput
  ): Promise<EditDishOutput> {
    try {
      // 일단 메뉴를 수정하려면 수정하려는 메뉴를 찾아와서 정보를 불러옴
      // 전달받은 메뉴의 아이디로 메뉴를 불러오는데 이때 메뉴에 속해있는 restaurant필드는 realation설정이 돼있기때문에
      //relation옵션으로 해당 메뉴의 레스토랑 정보를 같이 불러온다
      const dish = await this.dishes.findOne(editDishInput.dishId, {
        relations: ['restaurant'],
      });
      // 메뉴가 없다면 수정할 수 없으니깐 에러 핸들링
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }
      //메뉴가 있지만 로그인한 유저의 id와 해당 메뉴가 의존하고있는 레스토랑의 owner id가 같지 않다면
      //권한 없음을 에러 핸들링
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: "You can't do that.",
        };
      }

      //위 과정을 다 통과했다면
      //메뉴를 수정해줌
      // DB를 update한다면 update하려는 대상의id를 추가해줘야함
      //여기선 dishId가 대상
      await this.dishes.save([
        {
          id: editDishInput.dishId,
          //수정하려는 메뉴정보를 업데이트
          ...editDishInput,
        },
      ]);
      // 업데이트가 성공적으로 완료되면 ok:true 반환
      return {
        ok: true,
      };
      // 업데이트시 어떤 에러든 발생하면 해당 에러 핸들링
    } catch {
      return {
        ok: false,
        error: 'Could not update dish',
      };
    }
  }

  // 메뉴 삭제 기능
  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne(dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: "You can't do that.",
        };
      }
      await this.dishes.delete(dishId);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete dish',
      };
    }
  }

  // owner가 자기기가진 레스토랑의 정보를 전부 보고싶을때
  async myRestaurants(owner: User): Promise<MyRestaurantsOutput> {
    try {
      const restaurants = await this.restaurants.find({ owner });
      return {
        restaurants,
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurants.',
      };
    }
  }

  // 내가가진 레스토랑중 하나의 정보를 알고싶을때
  async myRestaurant(
    owner: User,
    { id }: MyRestaurantInput
  ): Promise<MyRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        { owner, id },
        { relations: ['menu', 'orders'] }
      );
      return {
        restaurant,
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurant',
      };
    }
  }
}
