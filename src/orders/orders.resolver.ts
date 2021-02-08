import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';

const pubsub = new PubSub();

@Resolver(of => Order)
export class OrderResolver {
  constructor(private readonly ordersService: OrderService) {}

  //  client의 주문 생성 작업
  @Mutation(returns => CreateOrderOutput)
  //   로그인한 유저의 권한은 client여야 한다
  @Role(['Client'])
  async createOrder(
    //   주문시 권한은 client이니깐 그에따른 변수이름은 customer로 보기좋게 설정
    @AuthUser() customer: User,
    @Args('input')
    createOrderInput: CreateOrderInput
  ): Promise<CreateOrderOutput> {
    return this.ordersService.crateOrder(customer, createOrderInput);
  }

  // 모든 주문 현황을 가져옴
  @Query(returns => GetOrdersOutput)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput
  ): Promise<GetOrdersOutput> {
    return this.ordersService.getOrders(user, getOrdersInput);
  }

  // 한개의 주문 현황을 가져옴
  @Query(returns => GetOrderOutput)
  @Role(['Any'])
  async getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput
  ): Promise<GetOrderOutput> {
    return this.ordersService.getOrder(user, getOrderInput);
  }

  // 주문수정기능
  // 주문 수정 에서 수정 가능한 내용은 오직 status일뿐 나머지 주문내용은 변경하지 못함
  // 로그인한 유저라면 누구든 수정가능 (이건 주문의 단계를 변경시키는것이기때문에)
  @Mutation(returns => EditOrderOutput)
  @Role(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput
  ): Promise<EditOrderOutput> {
    return this.ordersService.editOrder(user, editOrderInput);
  }

  // subscript을 사용 하는방법
  @Mutation(returns => Boolean)
  potatoReady() {
    //hotPotatos라는 트리거를 이용하여 subscription을 작동시킴
    pubsub.publish('hotPotatos', {
      // @Subscription안에있는 메소드 이름을 사용
      // publish의 payload는 object여야 함 이때 mutation function(메소드)과 이름이 같으면 됨(이경우는 readyPotato)
      readyPotato: 'YOur potato is ready. love you.',
    });
    return true;
  }

  // subscription을 하는 방법(상용구라고 생각하면됨)
  @Subscription(returns => String)
  readyPotato() {
    // 이 subscript을 사용할때의 트리거는 hotPotatos라는 striong
    return pubsub.asyncIterator('hotPotatos');
  }
}
