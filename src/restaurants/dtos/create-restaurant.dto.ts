import {
  Field,
  InputType,
  ObjectType,
  OmitType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
//  Restaurant에서 name, coverImg, address만 골라서 끌어와 사용하겠다
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImg',
  'address',
]) {
  @Field(type => String)
  categoryName: string;
}

@ObjectType()
// CoreOutPut.dto.ts에서 끌어와 사용하겠다 (ok와 error)
export class CreateRestaurantOutput extends CoreOutput {}
