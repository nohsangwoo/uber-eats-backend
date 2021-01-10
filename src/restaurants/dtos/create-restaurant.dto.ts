import { InputType, ObjectType, OmitType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
//  Restaurant.entity.ts 에서 'id',  'category',   'owner', 를 제외한 나머지만 끌어와 사용하겠다
export class CreateRestaurantInput extends OmitType(Restaurant, [
  'id',
  'category',
  'owner',
]) {}

@ObjectType()
// CoreOutPut.dto.ts에서 끌어와 사용하겠다 (ok와 error)
export class CreateRestaurantOutput extends CoreOutput {}
