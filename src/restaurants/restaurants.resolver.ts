import { SetMetadata } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User, UserRole } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
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
import { Category } from './entities/cetegory.entity';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(of => Restaurant)
export class RestaurantResolver {
  // 서비스를 가져와 사용하고싶을때 constructor에 추가
  // 서비스파일엔 실질적인 기능을 가지고있는 함수들이 모여있음
  // resolver는 도어맨 역할을 함
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(returns => CreateRestaurantOutput) //for graphql
  @Role(['Owner'])
  async createRestaurant(
    // 로그인된 유저인지 인증단계를 거쳐야함
    // AuthUser는 커스텀 데코레이터임
    // 그리고 User정보를 authUser로 담아주고 createRestaurant의 첫번째 인자로 전달해줌
    @AuthUser() authUser: User,
    // DTO를 사용하여 input validation을 진행해줌
    //for graphql and typescript 양쪽에서 다 적용됨
    @Args('input') createRestaurantInput: CreateRestaurantInput
    //for typescript
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput
    );
  }

  @Mutation(returns => EditRestaurantOutput)
  // 접속한 사용자가 Client, owner, deliver중 owner일때만 작동 가능한 기능이다라고 user-validation을 진행
  // Role은 커스텀 데코레이터임
  // Owner가 로그인한 상태에서만 editRestaurant 접근 가능
  @Role(['Owner'])
  editRestaurant(
    //AuthUser는 graphql에서 사용 가능하도록 설정된 context(User의 data)를 가져와 사용하는것
    @AuthUser() owner: User,
    @Args('input') editRestaurantInput: EditRestaurantInput
  ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(owner, editRestaurantInput);
  }

  @Mutation(returns => EditRestaurantOutput)
  @Role(['Owner'])
  deleteRestaurant(
    //AuthUser는 graphql에서 사용 가능하도록 설정된 context(User의 data)를 가져와 사용하는것
    @AuthUser() owner: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(
      owner,
      deleteRestaurantInput
    );
  }

  @Mutation(returns => EditRestaurantOutput)
  @Role(['Owner'])
  deleteedRestaurant(
    //AuthUser는 graphql에서 사용 가능하도록 설정된 context(User의 data)를 가져와 사용하는것
    @AuthUser() owner: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(
      owner,
      deleteRestaurantInput
    );
  }
}

//category의 resolver라고 설정
//category resolver를 따로 만들지 않고 restaurant resolver파일에 추가해서 사용
@Resolver(of => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  //매번 request마다 계산된 행동을 해줌
  //db와 별개의 움직임
  @ResolveField(type => Int) //for graphql
  //restaurantCount라는 dynamic field를 만들었음
  // field형식으로 사용되는restaurantCount의 반환값을 각각 계산해준다
  //즉 restaurantCount는 entity마냥 field형식으로 graphql의 return 값중 하나로 사용될텐데
  // 해당 반환값의 부모는 각각의 category이다(직접 사용해보면 금방 이해함 readme.md #10.13참고)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurants(category);
  }

  //단순히 모든 카테고리를 찾아주는 기능
  @Query(type => AllCategoriesOutput) //for graphql
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.allCategories();
  }

  // category에 해당하는 레스토랑을 검색
  @Query(type => CategoryOutput)
  category(@Args() categoryInput: CategoryInput): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }
}
