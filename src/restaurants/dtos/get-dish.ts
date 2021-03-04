import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Dish } from '../entities/dish.entity';

@InputType()
export class GetDishInput {
  @Field(type => Int)
  dishId: number;
}

@ObjectType()
export class GetDishOutput extends CoreOutput {
  @Field(type => Dish, { nullable: true })
  dish?: Dish;
}
