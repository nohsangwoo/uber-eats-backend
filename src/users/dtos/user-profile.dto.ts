import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

// user-profile input DTO
@ArgsType()
export class UserProfileInput {
  @Field(type => Number)
  userId: number;
}

// user-profile output DTO
@ObjectType()
export class UserProfileOutput extends CoreOutput {
  // user를 찾지 못하는 경우도 있으니 nullable:true
  @Field(type => User, { nullable: true })
  user?: User;
}
