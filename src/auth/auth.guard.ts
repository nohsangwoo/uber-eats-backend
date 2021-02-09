import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from 'src/jwt/jwt.service';
import { User } from 'src/users/entities/user.entity';
import { UserService } from 'src/users/users.service';
import { AllowedRoles } from './role.decorator';

// 신분증 검사 같은 개념임
// 너 누구야? 라고 불어보는 기능
@Injectable()
// CanActivate를 상속받음
// AuthGuard 는 true 또는 false만 return 함
// true를 반환하면 request진행이 허용됨
// false를 반환하면 request진행이 불가함을 결정
export class AuthGuard implements CanActivate {
  // 메타데이터를 불러오기위해선Reflector를 사용해야하기때문에 불러오는 것
  // ExecutionContext는 (app.module.ts => graphqlmodule.forRoot => 전역 사용하게 가능한 context)에서 전역설정된 nestjs의 context를 가져다 사용하겠다는말
  // 그 가져온 데이터값을 context라는 변수에 넣어줌
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}
  async canActivate(context: ExecutionContext) {
    // role을 가져옴
    // 모든 resolver에서 rolse을 가져옴 role이 없는 경우엔 (ex createAccount, login...)undefind반환
    // role데코레이터를 사용해서 role이 전달됐다면 해당 UserRole을 가져오는 상용구
    const roles = this.reflector.get<AllowedRoles>(
      // 메타데이터를 roles라는 키와함께 가져와서 roles에 담는다
      // .여기서의 roles는 role데코레이터에서 SetMetadata로 저장한 첫번째 인자랑 같은 이름이여야함
      //  role.decorator.ts의 SetMetadata('roles', roles); <=  key and value로 저장되기 때문
      'roles',
      context.getHandler()
    );

    // 메타데이터가 없다면 public이란 뜻이라서 true (그냥 통과 시켜줌)
    if (!roles) {
      return true;
    }

    // 메타데이터를 가질경우 User를 가져오는데
    // 위에서 가져온 http의 context를 graphql에서 사용할수있게 GqlExecutionContext를 사용하여 변환후 gqlContext라는 변수에 넣어줌
    const gqlContext = GqlExecutionContext.create(context).getContext();
    // (app.module.ts의 graphql.forRoot에서 설정된 context의 값을 보면 user라는 key에 저장했으니 뽑아올때도 gqlContext['user] 식으로 가져옴 )

    // 이때 user가 있다면 로그인된거
    // 메타데이터는 있는데 user가 없다면 로그아웃상태니깐 false리턴
    const token = gqlContext.token;
    if (token) {
      // 만약 코드가 있다면 jwtService.verify를 이용하여 디코드 할꺼임
      const decoded = this.jwtService.verify(token.toString());
      // 그리고 이코드가 object형식이고 id라는 객체값을 포함하고있다면
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        //userService에서 decoded['id']의 값을 기준으로 검색하여 user정보를 뽑아온다
        const { user } = await this.userService.findById(decoded['id']);
        // 유저정보가 존재하면
        if (user) {
          // graphql을 위해 gqlContext['user'] 에 user정보를 추가 이제 gql에서 사용가능
          gqlContext['user'] = user;
          // role이 Any를 포함하고있다면 true반환
          if (roles.includes('Any')) {
            return true;
          }
          // roles가 any가 아니라면 그 무엇이든 반환한다
          return roles.includes(user.role);
        }
      }
    }

    // 메타데이터도 있고 로그인(누구든 상관없음) 됐고 any도 있으면
    // 로그인 한 모든사람이 접근 가능한 상태이니 true를 리턴

    // user.role은 로그인한 user의 role이다 (로그인한 사람의 권한 client? owner? delivery?)
    //roles는 메타데이터로 설정된 roles
    //(즉 해당 resolve는 client? owner? delivery?중 하나를 선택하여 해당 권한을 가진사람만 사용하길 기대함)
    // (user의 role은 cliient인데) 메타 데이터로 전달받은 role은 Owner라면 필터링돼서 false리턴

    //정리 : 메타데이터로 owner만 접근 가능하게 resolver에서 setmetadator로 설정된 resolver가 있는데
    //만약 로그인한 유저가 client이거나 deliver라면 해당 resolver의 기능은 사용할수없고
    // 오직 owner의 권한을 가진 user가 로그인해야만 해당 기능을 사용 가능함
    return false;
  }
}
