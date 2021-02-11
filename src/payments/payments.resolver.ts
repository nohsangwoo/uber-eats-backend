import { Resolver } from '@nestjs/graphql';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payments.service';

@Resolver(of => Payment)
export class PaymentResolver {
  // 뭔가 가져다 끌어와 사용하려면 constructor 안에 정의
  constructor(private readonly paymentService: PaymentService) {}
}
