import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { CreateRestaurantInput } from './create-restaurant.dto';

// DTO는 graphl에서 전달받거나 return 하는 값의 validation이다.
// 설정된 값의 조건에 따라서만 input과 output이 엄격하게 동작하도록 설정하는것
// @InputType => 말그대로 Input하고자하는 Data의 Type
@InputType()
// input은 @InputType으로 arg라고 선언하고
// partialType은 optionanl이다 (해당CreateRestaurantInput의 Filed가 있어도되고 없어도됨 like a nullable)
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {
  // 대신 restaurantId은 필수로 포함되어야함
  @Field(type => Number)
  restaurantId: number;
}

// output DTO 는 CoreOutput의 형식을 그대로 가져다 씀
@ObjectType()
export class EditRestaurantOutput extends CoreOutput {}
