import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>(
      // 메타데이터를 roles라는 키와함께 가져와서 roles에 담는다
      'roles',
      context.getHandler()
    );

    // 메타데이터가 없다면 public이란 뜻이라서 true
    if (!roles) {
      return true;
    }
    // 메타데이터를 가질경우
    // gqlContext에서 user를 가져옴
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext['user'];

    // 이때 user가 있다면 로그인된거
    // user가 없다면 로그아웃상태니깐 false리턴
    if (!user) {
      return false;
    }

    // 메타데이터도 있고 로그인됐고, any도 있으면
    // 모든 사람이 접근 가능한 상태
    if (roles.includes('Any')) {
      return true;
    }

    // 메타데이터의 roles에 user의 role상태를 포함하는지?
    // if(user의 role은 cliient인데)
    // 전달받은 role은 Owner라면 필터링돼서 false리턴
    // inclue는 포함여부에따라 true false를 반환해줌
    return roles.includes(user.role);
  }
}
