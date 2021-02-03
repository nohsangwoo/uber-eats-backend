import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

// user생성할때 inputDTO
@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'role',
]) {
  // 필드 추가
  @Field(type => String)
  categoryName: string;
}

// user생성할때 outputDTO
@ObjectType()
export class CreateAccountOutput extends CoreOutput {}
