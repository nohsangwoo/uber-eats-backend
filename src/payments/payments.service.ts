import { Injectable } from '@nestjs/common';
import { Cron, Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { LessThan, Repository } from 'typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOuput,
} from './dtos/create-payment.dto';
import { GetPaymentsOutput } from './dtos/get-payments.dto';
import { Payment } from './entities/payment.entity';

// service 상용구 injectable데코레이터 선언
@Injectable()
export class PaymentService {
  constructor(
    //   어디선가 가져다 끌어와 사용하고싶을때 이런 방식으로 가져옴
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private schedulerRegistry: SchedulerRegistry
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

      // for promote ------------------------
      // isPromoted를 true값으로 추가
      restaurant.isPromoted = true;
      // 현재 날짜를 가져옴
      const date = new Date();
      // date.getDate()는 날짜 추출
      // date.setDate()는 milliseconds까지 return함
      // 즉 현재 날짜를 기준으로 milliseconds까지 기입된 정확한 기준으로 7일 후 날짜 정보를 가져옴
      date.setDate(date.getDate() + 7);
      // 언제까지 실행할껀지의 날짜 정보를 promotedUntil에 넣어준다
      restaurant.promotedUntil = date;

      // 위에서 계산한 7일후의 정확한 날짜(millisecond단위)와 promote의 현상태를 DB에 저장함
      this.restaurants.save(restaurant);
      // end of promote ------------------------
      return {
        ok: true,
      };
      //   위 과정중 뭔가 에러가 나면 핸들링
    } catch {
      return { ok: false, error: 'Could not create payment.' };
    }
  }

  async getPayments(user: User): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.payments.find({ user: user });
      return {
        ok: true,
        payments,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load payments.',
      };
    }
  }

  // 날짜가 만료됐음에도 여전히 promote되고있는 restaurant를 체크하는것
  // 2초마다 반복
  @Interval(20000)
  async checkPromotedRestaurants() {
    // isPromoted가 true인거랑
    // 현재 날짜보다 promotedUntil가 이전의 상태인것을 검색한다(날짜가 지난것)
    const restaurants = await this.restaurants.find({
      isPromoted: true,
      //LessThan: typeorm 기능 ::: 오늘 날짜보다 적은 것
      promotedUntil: LessThan(new Date()),
    });
    console.log(restaurants);
    // 지난것을 검색했으면 검색된 restaurant를 반복해서 각각
    // isPromote=false  promotedUntil=null 처리 해서 DB에 저장해준다(update)
    restaurants.forEach(async restaurant => {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
      await this.restaurants.save(restaurant);
    });
  }
}
