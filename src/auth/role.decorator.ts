import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

type AlloweRoles = keyof typeof UserRole | 'Any';
export const Role = (roles: AlloweRoles[]) => SetMetadata('roles', roles);
