import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';

// service 상용구 injectable데코레이터 선언
@Injectable()
export class PaymentService {
  constructor(
    //   어디선가 가져다 끌어와 사용하고싶을때 이런 방식으로 가져옴
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>
  ) {}
}
