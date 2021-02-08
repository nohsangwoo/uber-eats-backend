import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Order, OrderStatus } from '../entities/order.entity';

@InputType()
export class GetOrdersInput {
  // 전달받는 인자중 하나는 status인데 OrderStatus이다
  /* OrderStatus는 order.entity에 에 존재하고
  주문 현황을 위한 enum 으로 구성됐다.
export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}*/
  // 즉 모든 상태의 주문현황을 볼수도있고
  // pending상태인것만 조회하던가
  //cooking상태인것만 조회하던가... 등등
  @Field(type => OrderStatus, { nullable: true })
  status?: OrderStatus;
}

// 그리고 반환받는 데이터는 입력받은 OrderStatus의 status를 기준으로 조회된 orders이다.
@ObjectType()
export class GetOrdersOutput extends CoreOutput {
  @Field(type => [Order], { nullable: true })
  orders?: Order[];
}
