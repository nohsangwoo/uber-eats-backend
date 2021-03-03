import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Category } from '../entities/cetegory.entity';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CreateCategoryInput extends PickType(Category, [
  'name',
  'coverImg',
]) {}

@ObjectType()
export class CreateCategoryOutput extends CoreOutput {}
