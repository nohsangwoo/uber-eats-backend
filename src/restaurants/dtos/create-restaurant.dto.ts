import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

// @ArgsType을 쓸수도있음
// 불러올때 @Args()로 비워두고 사용
// ex createRestaurant(name:"",coverImg:"",address:"") 이런형식으로 바로 사용가능

@InputType()
// DTO는 graphl에서 전달받거나 return 하는 값의 validation이다.
// 설정된 값의 조건에 따라서만 input과 output이 엄격하게 동작하도록 설정하는것
// 여기선 그 validation해주는 class의 이름은 CreateRestaurantInput 이고
// 그 구성은 직접 써도 되지만
// restaurant.entity 에서 몇개를 불러와서 사용할것이다 (picktype)
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImg',
  'address',
]) {
  // 추가로 string type의 categoryName 또한 validation 도 validation 목록에 추가
  @Field(type => String) //for graphql
  categoryName: string;
}

// 위와 같은 개념이지만 CoreOutput의 모든 내용을 불러와서 Validation 목록을 만듬
@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {
  @Field(type => Int)
  restaurantId?: number;
}
