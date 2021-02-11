import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOuput,
} from './dtos/create-payment.dto';
import { Payment } from './entities/payment.entity';

// service 상용구 injectable데코레이터 선언
@Injectable()
export class PaymentService {
  constructor(
    //   어디선가 가져다 끌어와 사용하고싶을때 이런 방식으로 가져옴
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>
  ) {}

  //   결제 생성
  async createPayment(
    owner: User,
    { transactionId, restaurantId }: CreatePaymentInput
  ): Promise<CreatePaymentOuput> {
    try {
      //
      const restaurant = await this.restaurants.findOne(restaurantId);
      //   결제를 생성할 레스토랑이 존재하지 않으면 에러핸들링
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found.',
        };
      }
      //   로그인한 사람이 레스토랑의 주인이 아니라면 에러핸들링
      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: 'You are not allowed to do this.',
        };
      }
      //   object 생성과 동시에 DB저장
      await this.payments.save(
        this.payments.create({
          transactionId,
          user: owner,
          restaurant,
        })
      );
      return {
        ok: true,
      };
      //   위 과정중 뭔가 에러가 나면 핸들링
    } catch {
      return { ok: false, error: 'Could not create payment.' };
    }
  }
}
