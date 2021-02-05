import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { Category } from '../entities/cetegory.entity';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CategoryInput extends PaginationInput {
  @Field(type => String)
  slug: string;
}

// category가 없는경우도 있으니 nullable:true로 설정
// 반환되는 값이 null일수도있다(값이 존재하지 않을수도 있다)
@ObjectType()
export class CategoryOutput extends PaginationOutput {
  @Field(type => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];

  @Field(type => Category, { nullable: true })
  category?: Category;
}
