import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Dish } from '../entities/dish.entity';

@InputType()
// 수정하려는 메뉴는 옵셔널(PartialType이고 Dish entity에서 일부 뽑아옴(PickType)
export class EditDishInput extends PickType(PartialType(Dish), [
  'name',
  'options',
  'price',
  'description',
]) {
  // 수정하려는 메뉴의 id는 필수
  @Field(type => Int)
  dishId: number;
}

@ObjectType()
export class EditDishOutput extends CoreOutput {}
