import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { DishOption } from 'src/restaurants/entities/dish.entity';

// 주문시 옵션을 선택할때
@InputType()
class CreateOrderItemInput {
  @Field(type => Int)
  dishId: number;

  //   Json형식의 Object entity..
  //   order Item엔 옵션이 없을수도있으니 nullable:ture
  @Field(type => DishOption, { nullable: true })
  options?: DishOption[];
}

// 주문을 생성할때
@InputType()
export class CreateOrderInput {
  @Field(type => Int)
  restaurantId: number;

  @Field(type => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}
