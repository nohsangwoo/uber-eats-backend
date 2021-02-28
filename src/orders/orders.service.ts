import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'src/common/common.constants';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { TakeOrderInput, TakeOrderOutput } from './dtos/take-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    //DB를 끌어와 사용하고 싶을때의 상용구
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    @Inject(PUB_SUB) private readonly pubSub: PubSub
  ) {}

  // 주문 만들기(client권한일때: 일반 주문 고객)
  async crateOrder(
    // customer의 User 정보를 resolver로부터 받아온다
    // CreateOrderInput라는 DTO를 통해 인자를 전달받는다
    //전달받은 인자를  es6  destructuring 을 통해 추출한다
    //반환형식은  CreateOrderOutput 라는 DTO이다
    //다만 crateOrder라는 함수는 DB를 건드리는 기능이 포함됐기때문에 Promise형식으로 반환된다.
    customer: User,
    { restaurantId, items }: CreateOrderInput
  ): Promise<CreateOrderOutput> {
    try {
      // 유저로부터 전달받은 레스토랑의 아이디를 찾아서 restaurant변수에 저장
      const restaurant = await this.restaurants.findOne(restaurantId);
      // 해당 레스토랑을 DB에서 찾지 못했을때 에러 핸들링
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      // 주문 최종 가격 계산을 위한 변수 초기화
      let orderFinalPrice = 0;
      // orderItems의 형식은 OrderItem의 배열 형식이다
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const dish = await this.dishes.findOne(item.dishId);

        if (!dish) {
          return {
            ok: false,
            error: 'Dish not found.',
          };
        }

        // 여기가 문제
        // extra의 총합을 계산하기위한 변수
        let dishFinalPrice = dish.price;
        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            // DB dishOption.name 에 itemOption.name로부터 전달받은 값이 존재한다면 dishOption변수에 저장
            dishOption => dishOption.name === itemOption.name
          );
          // 위 조건에따라 DB에서 칮은 dishOption이 존재한다면
          if (dishOption) {
            // 그리고 dishOption안에 extra가 존재한다면
            if (dishOption.extra || dishOption.extra === 0) {
              // dishOption.extra를 찾을때 마다 dishFinalPrice에 추가해준다
              dishFinalPrice = dishFinalPrice + dishOption.extra;
            } else {
              const dishOptionChoice = dishOption.choices.find(
                optionChoice => optionChoice.name === itemOption.choice
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  dishFinalPrice = dishFinalPrice + dishOptionChoice.extra;
                }
              }
            }
          }
        }

        // 모든 가격의 총 합을 계산해준다 (DB저장용)
        orderFinalPrice = orderFinalPrice + dishFinalPrice;
        //dish와 options로 이루어진 orderItem을 만들고
        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          })
        );
        // orderItems이라는 배열에  orderItem 추가
        orderItems.push(orderItem);
      }
      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          // relationship을 저장하는것
          // manyToMany임
          items: orderItems,
        })
      );
      // subscription---------------------------------------------
      // subscription으로 payload값은 pendingOrders: order 로 구성된 object
      await this.pubSub.publish(NEW_PENDING_ORDER, {
        pendingOrders: { order, ownerId: restaurant.ownerId },
      });
      return {
        ok: true,
        orderId: order.id,
      };
      // 무언가 에러가 난다면 에러핸들링
    } catch {
      return {
        ok: false,
        error: 'Could not create order.',
      };
    }
  }

  // 모든 주문 현황 가져옴
  async getOrders(
    user: User,
    { status }: GetOrdersInput
  ): Promise<GetOrdersOutput> {
    try {
      //orders라는 변수는 Order의 배열형식으로 구성됐다
      let orders: Order[];
      // 만약 로그인한 유저가 client라면 customer:user라는 조건에 들어맞는걸 모두 찾는다
      // 찾은내용은 orders에 담는다
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: {
            customer: user,
            // 전달받은 status가 있다면 status 현황도 검색 조건을 걸어준다
            ...(status && { status }),
          },
        });
        // 만약 로그인한 유저가 Delivery라면 driver:user라는 조건에 들어맞는걸 모두 찾는다
        //찾은 내용은 orders에 담는다
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: {
            driver: user,
            // 전달받은 status가 있다면 status 현황도 검색 조건을 걸어준다
            ...(status && { status }),
          },
        });
        // 만약 로그인한 유저가 Owner라면 owner:user라는 조건에 들어맞는걸 모두 찾는다
        //찾은 내용은 restaurants 담는다
        //다만 이때 restaurant에는 주문받은 orders라는 정보가 relations관계로 담겨져있는데 이것을  relations: ['orders'],옵션으로 가져온다
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({
          where: {
            owner: user,
          },
          relations: ['orders'],
        });
        // 그리고 찾아온 restaurants의 데이터에서 map을돌려 orders만 뽑아온다.
        // 뽑아온 데이터를 orders에 담는다

        orders = restaurants.map(restaurant => restaurant.orders).flat(1);

        if (status) {
          orders = orders.filter(order => order.status === status);
        }
      }

      // 위 과정 client, delivery, owner중 누가 로그인 했든 orders를 조건에 맞게 가져와서 반환한다
      return {
        ok: true,
        orders,
      };
      // 실패시 에러 핸들링
    } catch {
      return {
        ok: false,
        error: 'Could not get orders',
      };
    }
  }

  // 주문 현황을 볼수있는지 없는지 권한 확인 하는것
  canSeeOrder(user: User, order: Order): boolean {
    let canSee = true;
    // 만약 로그인한 유저정보(user.role )와 client(UserRole.Client)가 같은데 주문한 유저의 아이디(order.customerId)와 로그인한 유저 아이디(user.id)가 같지 않으면
    //canSee는 false를 입력받고 canSeeOrder는 false를 반환받으니 볼수있는 권한이 없다! 라고 해석됨
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      canSee = false;
    }
    // 위와 마찬가지 개념임
    // 만약 로그인한 유저정보(user.role )와 (UserRole.Delivery)가 같은데 주문한 유저의 아이디(order.driverId)와 로그인한 유저 아이디(user.id)가 같지 않으면
    //canSee는 false를 입력받고 canSeeOrder는 false를 반환받으니 볼수있는 권한이 없다! 라고 해석됨
    if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      canSee = false;
    }
    // 위와 마찬가지 개념임
    // 만약 로그인한 유저정보(user.role )와 (UserRole.Owner)가 같은데 주문한 유저의 아이디(order.restaurant.ownerId )와 로그인한 유저 아이디(user.id)가 같지 않으면
    //canSee는 false를 입력받고 canSeeOrder는 false를 반환받으니 볼수있는 권한이 없다! 라고 해석됨
    if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
      canSee = false;
    }
    // 위 단계에서 아무것도 걸리지않고 잘 통과하면 canSee는 true이고
    // canSeeOrder true를 반환하니 즉 로그인한 유저가 주문현황을 볼수있는 권한이 있다! 라는 해석
    return canSee;
  }

  // 한개의 주문현황을 가져옴
  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId, {
        relations: ['restaurant'],
      });
      if (!order) {
        return {
          ok: false,
          error: 'Order not found.',
        };
      }
      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: 'You cant see that',
        };
      }
      return {
        ok: true,
        order,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load order.',
      };
    }
  }

  // 주문 수정 에서 수정 가능한 내용은 오직 status일뿐 나머지 주문내용은 변경하지 못함
  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput
  ): Promise<EditOrderOutput> {
    try {
      // 전달받은 주문 아이디를 가지고 검색하는데
      // orders 테이블에는 realation 상태의 restaurant가 묶여있으니 이것을 relations: ['restaurant'],옵션으로 같이 불러온다
      const order = await this.orders.findOne(orderId);
      // 만약 수정하려는 orders의 정보가 없다면 에러핸들링
      if (!order) {
        return {
          ok: false,
          error: 'Order not found.',
        };
      }
      // 볼수있는 권한이 없다면 에러핸들링
      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: "Can't see this.",
        };
      }

      // 위 과정을 잘 통과했다면 canEdit=true
      let canEdit = true;
      // 로그인한 유저와 UserRole.Clientr가 같다면 수정가능한 권한 아님
      // 즉 client는 수정이 불가능함
      if (user.role === UserRole.Client) {
        canEdit = false;
      }
      // 로그인한 유저와 UserRole.Owner가 같은데
      if (user.role === UserRole.Owner) {
        // status 와 OrderStatus.Cooking 이 같지 않고
        // 동시에 status 와 OrderStatus.Cooked가 같지 않다면
        //수정 불가능한 상태
        // 즉 Owner는 cooking이거나 cooked의 상태에서만 변경가능
        if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
          canEdit = false;
        }
      }
      // 로그인한 유저와 UserRole.Delivery가 같은데
      if (user.role === UserRole.Delivery) {
        if (
          //  status와  OrderStatus.PickedUp 이 같지 않고
          // 동시에 status 와 OrderStatus.Delivered이 같지 않다면
          //  수정 가능한 상태 아님
          // 즉 배달원은 PickedUp이거나 Delivered상태에서만 변경가능
          status !== OrderStatus.PickedUp &&
          status !== OrderStatus.Delivered
        ) {
          canEdit = false;
        }
      }
      // 만약 수정가능한 상태가 아니라면 에러 핸들링
      if (!canEdit) {
        return {
          ok: false,
          error: "You can't do that.",
        };
      }

      // subscription -------------------------------
      // 수정 가능한 상태라면 전달받은 order Id를 기준으로 status를 update함
      await this.orders.save({
        id: orderId,
        status,
      });
      const newOrder = { ...order, status };
      //만약 업데이트를 시도한게  레스토랑 주인이라면
      if (user.role === UserRole.Owner) {
        // 그리고 또한 주문상태가 coooked라면
        if (status === OrderStatus.Cooked) {
          // trigger하여  subscription을 건든다
          await this.pubSub.publish(NEW_COOKED_ORDER, {
            // 구독으로 값을 전달하는데 문제는 order의 값은 update되기 이전의 값이다
            // (create로 javascript를 위한 object를 만들지 않았기때문)
            // 따라서 이전 order의 값에 업데이트를 위해 저장된 statue값을 쌩으로 덮어씌워준다
            cookedOrders: newOrder,
          });
        }
      }
      // orderUpdates subscription을 트리거로 구독 건들고 { orderUpdates: newOrder } payload로 전달
      await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: newOrder });
      return {
        ok: true,
      };
      // 뭔가 에러가 발생한경우 에러 핸들링
    } catch {
      return {
        ok: false,
        error: 'Could not edit order.',
      };
    }
  }

  // 배달원이 주문을 접수하는 기능
  // 배달언이 주문 접수를 안했을때 order의 driver부분은 null상태
  // 배달원이 주문접수를 하면 order에 주문접수한 driver정보(이 주문을 배달하기 위한 배달원의 정보)를 업데이트 하는것
  async takeOrder(
    //resolver로부터 전달받은 로그인한 유저정보
    driver: User,
    // resolver로부터 전달받은 takeOrder의 인자(playground로 부터 전달받은 인자)
    { id: orderId }: TakeOrderInput
  ): Promise<TakeOrderOutput> {
    try {
      // 전달받은 order id(배달원이 접수하려는 주문의 id)를 검색 후 order변수에 저장
      const order = await this.orders.findOne(orderId);
      //order정보가 없다면 에러핸들링
      if (!order) {
        return {
          ok: false,
          error: 'Order not found',
        };
      }
      // 또한 만약 이미 다른 배달원이 먼저 접수했다면 에러핸들링
      // (동시에 수많은 사람들이 동시에 접근할꺼기때문에 이런 안전장치가 필요함)
      if (order.driver) {
        return {
          ok: false,
          error: 'This order already has a driver',
        };
      }
      // 위 단계를 모두 통과했다면 DB에 저장
      // 로그인한 driver 정보(이 주문을 배달하기 위한 배달원의 정보)를 업데이트
      await this.orders.save({
        //업데이트를 위한 주문의 id
        id: orderId,
        // 이 주문을 배달하기 위한 배달원의 정보
        driver,
      });
      //구독기능을 위한 trigger설정과 웹소켓에 전달하는 update된 order정보와 driver정보
      // order에 driver가 추가되면 구독기능 동작
      await this.pubSub.publish(NEW_ORDER_UPDATE, {
        orderUpdates: { ...order, driver },
      });
      // DB업데이트 성공하면 true반환
      return {
        ok: true,
      };
      // 뭔가 에러가 일어나면 에러 핸들링
    } catch {
      return {
        ok: false,
        error: 'Could not upate order.',
      };
    }
  }
}
