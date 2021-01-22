import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@InputType()
//login의 input DTO
// user entity에서 email, password를 가져와서 재활용
export class LoginInput extends PickType(User, ['email', 'password']) {}

@ObjectType()
// login의 output DTO
export class LoginOutput extends CoreOutput {
  // 토큰도 반환하는데 툐큰값이 있을수도있고 없을수도있다로 설정
  @Field(type => String, { nullable: true })
  token?: string;
}
