import { ArgsType, Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from './output.dto';

//paginaation의 dto
@InputType()
export class PaginationInput {
  @Field(type => Int, { defaultValue: 1 })
  page: number;
}

//pagination output dto
@ObjectType()
// 총 페이지
export class PaginationOutput extends CoreOutput {
  @Field(type => Int, { nullable: true })
  totalPages?: number;

  // 검색된 총 결과물 개수
  @Field(type => Int, { nullable: true })
  totalResults?: number;
}
