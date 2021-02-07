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
    // items의 길이 만큼 반복
    for (const item of items) {
      // order item을 추가할 메뉴를 찾음
      const dish = await this.dishes.findOne(item.dishId);
      //   메뉴를 찾지 못했을때 에러 핸들링
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found.',
        };
      }
      // 메뉴를 찾았다면 정상진행 ㄱ
      // 메뉴가격 dish.price
      console.log(`Dish price: ${dish.price}`);
      //options의 길이만큼 반복해주고 각 반복시마다의 해당 객체는 itemOption으로 빠짐
      for (const itemOption of item.options) {
        const dishOption = dish.options.find(
          dishOption => dishOption.name === itemOption.name
        );
        //만약 옵션이 있다면 extra를 찾는다
        if (dishOption) {
          //extra가 있다면
          if (dishOption.extra) {
            console.log(`$USD + ${dishOption.extra}`);
            // extra가 없다면
          } else {
            const dishOptionChoice = dishOption.choices.find(
              // DB의 optionChoice.name 와 유저에게 입력받은 itemOption.choice 를 비교하여 같은게 있는지 확인
              optionChoice => optionChoice.name === itemOption.choice
            );
            // 입력받은 itemOption.choice가 DB에 존재한다면
            if (dishOptionChoice) {
              // dishOptionChoice.extra가 DB에 존재한다면
              if (dishOptionChoice.extra) {
                console.log(`$USD + ${dishOptionChoice.extra}`);
              }
            }
          }
        }
      }
      /*await this.orderItems.save(
        this.orderItems.create({
          dish,
          options: item.options,
        })
       ); */
    }
    /* const order = await this.orders.save(
      this.orders.create({
        customer,
        restaurant,
      })
    );
    console.log(order);*/
  }
}
