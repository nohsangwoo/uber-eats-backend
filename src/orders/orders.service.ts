import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';

// 상용구같은 개념 사용하고싶으면 걍 이렇게쓰셈
@Injectable()
export class OrderService {
  constructor(
    //   DB를 사용하기 위해서 설정
    @InjectRepository(Order)
    private readonly orders: Repository<Order>
  ) {}
}
