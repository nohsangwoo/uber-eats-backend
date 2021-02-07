import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

// 상용구같은 개념 사용하고싶으면 걍 이렇게쓰셈
@Injectable()
export class OrderService {
  constructor(
    //   DB를 사용하기 위해서 설정
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>
  ) {}

  //   주문 만들기
  async crateOrder(
    //  resolver를 통해 전달받은 client권한일때의 user정보
    customer: User,
    { restaurantId, items }: CreateOrderInput
  ): Promise<CreateOrderOutput> {
    //주문을 하려면 어떤 레스토랑에서 주문을해야하는지 알아야하니깐
    //   레스토랑을 검색한다
    const restaurant = await this.restaurants.findOne(restaurantId);
    // 레스토랑이 검색되지 않았을때의 에러 핸들링
    if (!restaurant) {
      return {
        ok: false,
        error: 'Restaurant not found',
      };
    }
    // 레스토랑 을 찾았다면 주문내용 Object생성 및 DB저장
    // 아이템의 length만큼 반복하는데
    //각각의 아이템을 DB에 저장하는 절차
    items.forEach(async item => {
      // order item을 추가할 메뉴를 찾음
      const dish = await this.dishes.findOne(item.dishId);
      //   메뉴를 찾지 못했을때 에러 핸들링
      if (!dish) {
        // abort this whole thing
      }

      //   메뉴를 찾았다면 DB에 저장
      await this.orderItems.save(
        this.orderItems.create({
          dish,
          options: item.options,
        })
      );
    });
    /* const order = await this.orders.save(
      this.orders.create({
        customer,
        restaurant,
      })
    );
    console.log(order);*/
  }
}
