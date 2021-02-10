import { Inject } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { PUB_SUB } from 'src/common/common.constants';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
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

  // subscript을 사용 하는방법
  @Mutation(returns => Boolean)
  async potatoReady(@Args('potatoId') potatoId: number) {
    //hotPotatos라는 트리거를 이용하여 subscription을 작동시킴
    await this.pubSub.publish('hotPotatos', {
      // @Subscription안에있는 메소드 이름을 사용
      // publish의 payload는 object여야 함 이때 mutation function(메소드)과 이름이 같으면 됨(이경우는 readyPotato)
      readyPotato: potatoId,
    });
    return true;
  }

  // subscription을 하는 방법(상용구라고 생각하면됨)
  @Subscription(returns => String, {
    // 특정조건만 Subscription 할수있게 필터링해주는것
    // filter에는 3개의 인자를받는다(filter(payload,variables,context))
    // 1. payload는 potatoReady 등 같은 함수에서 전달받은 값
    // 2. variable은 listening을 시작하기 전에 subscription에 준variables를 가진 object
    //  ex
    //  subscription{
    //    readypotato(potatoId:1)   <= 여기서 1이 variable
    //  }
    filter: ({ readyPotato }, { potatoId }) => {
      // readyPotato와 potatoId값이 같은 경우에만 subscription이 동작하겠다 라는뜻
      return readyPotato === potatoId;
    },
  })
  @Role(['Any'])
  readyPotato(@Args('potatoId') potatoId: number) {
    // 이 subscript을 사용할때의 트리거는 hotPotatos라는 striong
    return this.pubSub.asyncIterator('hotPotatos');
  }
}
