import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthUser = createParamDecorator(
  // ExecutionContext는 (app.module.ts => graphqlmodule.forRoot => 전역 사용하게 가능한 context)에서 전역설정된 nestjs의 context를 가져다 사용하겠다는말
  // 그 가져온 데이터값을 context라는 변수에 넣어줌
  (data: unknown, context: ExecutionContext) => {
    //  위에서 가져온 http의 context를 graphql에서 사용할수있게 변환후 gqlContext라는 변수에 넣어줌
    // (app.module.ts의 graphql.forRoot에서 설정된 context의 값을 보면 user라는 key에 저장했으니 뽑아올때도 gqlContext['user] 식으로 가져옴 )
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    console.log(user);
    return user;
  }
);
