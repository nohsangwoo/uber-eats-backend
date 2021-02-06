import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderResolver } from './orders.resolver';
import { OrderService } from './orders.service';

@Module({
  //각종 DB를 사용하기위해 TypeOrmModule로 DB table들을 추가
  imports: [TypeOrmModule.forFeature([Order])],
  //   service 및 resolver등을 사용하기위해 추가
  providers: [OrderService, OrderResolver],
})
export class OrdersModule {}
