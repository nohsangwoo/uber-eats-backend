import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

export type AllowedRoles = keyof typeof UserRole | 'Any';

export const Role = (roles: AllowedRoles[]) => {
  console.log('작동');
  return SetMetadata('roles', roles);
};
