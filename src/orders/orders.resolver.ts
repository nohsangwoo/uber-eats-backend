import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'src/common/common.constants';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { OrderUpdatesInput } from './dtos/order-updates.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';

@Resolver(of => Order)
export class OrderResolver {
  constructor(
    private readonly ordersService: OrderService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub
  ) {}

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

  // subscription start---------------
  // subscript을 사용 하는방법
  // 특정조건만 Subscription 할수있게 필터링해주는것
  @Subscription(returns => Order, {
    // filter에는 3개의 인자를받는다(filter(payload,variables,context))
    // 1. payload는 구독상태의 pendingOrders 를 건드리는 함수에서 전달받은 값
    // 2. variable은 listening을 시작하기 전에 subscription에 준variables를 가진 object
    // 3. context는 https로 전달받은 값을 graphql에서 사용할수있게 변환해준 값을 전달받음
    filter: ({ pendingOrders: { ownerId } }, _, { user }) => {
      //ownerId는 order.service로 부터 전달받은 restaurant의 ownerId와  로그인한 user정보의 id가 같다면 subscription기능 활성화
      return ownerId === user.id;
    },

    // Subscription Resolve는 output의 모습을 바꿔줌
    //payload는 pendingOrders: { order, ownerId: restaurant.ownerId },이상태의 object값이다
    // 위 payload에서 oder를 추출하여 반환
    resolve: ({ pendingOrders: { order } }) => order,
  })
  // 이 subscript을 사용할때의 트리거는 hotPotatos라는 striong
  @Role(['Owner'])
  pendingOrders() {
    //subscription을 trigger하기위한 보일러플레이트(상용구)임
    // subscription 에서 NEW_PENDING_ORDER를 기준으로 전달받아 작동할것임
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
  }
  // end of subscription start---------------

  // 로그인한상태가 베딜원일때 작동함
  @Subscription(returns => Order)
  @Role(['Delivery'])
  cookedOrders() {
    // 구독의 상용구이고 trigger는 NEW_COOKED_ORDER
    return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
  }

  //
  @Subscription(returns => Order)
  @Role(['Any'])
  orderUpdates(@Args('input') orderUpdatesInput: OrderUpdatesInput) {
    return this.pubSub.asyncIterator(NEW_ORDER_UPDATE);
  }
}
