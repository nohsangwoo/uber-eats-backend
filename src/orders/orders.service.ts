import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

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
    private readonly dishes: Repository<Dish>
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
            if (dishOption.extra) {
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
      await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          // relationship을 저장하는것
          // manyToMany임
          items: orderItems,
        })
      );
      return {
        ok: true,
      };
      // 무언가 에러가 난다면 에러핸들링
    } catch {
      return {
        ok: false,
        error: 'Could not create order.',
      };
    }
  }

  // 주문 상태 확인 기능
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
          },
        });
        // 만약 로그인한 유저가 Delivery라면 driver:user라는 조건에 들어맞는걸 모두 찾는다
        //찾은 내용은 orders에 담는다
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: {
            driver: user,
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
      }

      // 위 과정 client, delivery, owner중 누가 로그인 했든 orders를 조건에 맞게 가져와서 반환한다
      return {
        ok: true,
        orders,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not get orders',
      };
    }
  }
}
