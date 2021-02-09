import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from 'src/users/users.module';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [UsersModule],
  providers: [
    {
      // provider의 이름은 APP_GUARD이고
      // 사용하는 class는 AuthGuard이다.
      // 모든resolver에서 AuthGuard를 사용하고싶다면  APP_GUARD를 이용하면됨
      // 이걸 app.module에 imports해줘야함
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
