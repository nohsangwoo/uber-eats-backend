import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';

@Resolver(of => Order)
export class OrderResolver {
  constructor(private readonly ordersService: OrderService) {}

  //  client의 주문 생성 작업
  @Mutation(returns => CreateOrderOutput)
  //   로그인한 유저의 권한은 client여야 한다
  @Role(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input')
    createOrderInput: CreateOrderInput
  ): Promise<CreateOrderOutput> {
    return {
      ok: true,
    };
  }
}
