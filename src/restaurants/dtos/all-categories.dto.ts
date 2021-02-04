import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Category } from '../entities/cetegory.entity';

//category의 output type을 설정
@ObjectType()
export class AllCategoriesOutput extends CoreOutput {
  //categories 값은 null값일수도 있다(값이 비어있을수도 있다)
  @Field(type => [Category], { nullable: true }) //for grapgql
  //categories의 데이터는 비어있을수도있다
  categories?: Category[];
}
