import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';
// restaurant의 resolver에는 client 위한 기능, delivery를 위한기능, owner(사장)을 위한 기능이 각각있는데
// 이 구분을 SetMetadata로 지정해서 구분해줌

// AllowedRoles는 타입이 UserRole이거나 또는 아무거나 입력받을수있음
// any의 이유는 어떤경우에는 모든 상태의 user(client,delivery,owner)가  무엇인가 작동하게 해야할때가 있으니깐.
export type AllowedRoles = keyof typeof UserRole | 'Any';

export const Role = (roles: AllowedRoles[]) => {
  // console.log('작동');
  // SetMetadata는 두가지 argument를 가질 수 있다.
  // 하나는 key이고 하나는 value
  return SetMetadata('roles', roles);
};
