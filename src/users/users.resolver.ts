import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { Role } from 'src/auth/role.decorator';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import { User } from './entities/user.entity';
import { UserService } from './users.service';

// 리졸버 파일을 만들때의 상용구
// 이 리졸버의 type은 User다
@Resolver(of => User)
export class UserResolver {
  constructor(private readonly usersService: UserService) {}

  @Mutation(returns => CreateAccountOutput)
  async createAccount(
    //graphql에서 전달받는 변수의 형식은CreateAccountInput을 따른다
    @Args('input') createAccountInput: CreateAccountInput
    // 보통 mutation되는 작업은 DTO를 promise로 감싸줌
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }

  // 로그인 성공하면 토큰을 반환해줌
  @Mutation(returns => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }

  // 로그인한상태가 내가 맞는지 확인
  @Query(returns => User)
  @Role(['Any'])
  // 유저의 인증과정을 커스텀된 데코레이터로 인증하고
  // 해당 데코레이터는 인증에 성공하면 User의 정보를 return 해줌
  // @AuthUser가 return한 값은 authUser라는 변수에 User라는 type으로 저장됨
  // authUser에 저장된값을 me라는 graphql Query문의 반환값으로 지정
  // @UseGuards(AuthGuard) //AuthGuard 사용방법
  me(@AuthUser() authUser: User) {
    return authUser;
  }

  @Query(returns => UserProfileOutput)
  @Role(['Any'])
  async userProfile(
    @Args() userProfileInput: UserProfileInput
  ): Promise<UserProfileOutput> {
    return this.usersService.findById(userProfileInput.userId);
  }

  @Mutation(returns => EditProfileOutput)
  @Role(['Any'])
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(authUser.id, editProfileInput);
  }

  @Mutation(returns => VerifyEmailOutput)
  verifyEmail(
    @Args('input') { code }: VerifyEmailInput
  ): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(code);
  }
}
