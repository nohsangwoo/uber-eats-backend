import { SetMetadata } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User, UserRole } from 'src/users/entities/user.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
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
    @AuthUser() authUser: User,
    // DTO를 사용하여 input validation을 진행해줌
    //for graphql and typescript 양쪽에서 다 적용됨
<<<<<<< HEAD
    @Args('input') createRestaurantInput: CreateRestaurantInput,
=======
    @Args('input') createRestaurantInput: CreateRestaurantInput
>>>>>>> 80b3dc1a97e738fc72e3994371b8df53fadac9f4
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
  @Role(['Owner'])
  editRestaurant(
    @AuthUser() AuthUser: User,
    @Args('input') editRestaurantInput: EditRestaurantInput
  ): EditRestaurantOutput {
    return { ok: true };
  }
}
