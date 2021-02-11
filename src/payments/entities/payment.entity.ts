import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

// InputType ObjectType 데코레이터를 같이 사용하려면 { isAbstract: true } 설정이 필요함 자세한 설명은 restaurants.entityㄱㄱ
@InputType('PaymentInputType', { isAbstract: true })
@ObjectType()
@Entity() //for typeorm
export class Payment extends CoreEntity {
  // paddle이란 결제 api에서 받아올 transactionId
  @Field(type => String)
  @Column()
  transactionId: string;

  //   결제한 사람의 정보를 위한 user 정보
  @Field(type => User)
  @ManyToOne(
    type => User,
    user => user.payments
  )
  user: User;

  //   user를 위한 Foreign key
  @RelationId((payment: Payment) => payment.user)
  userId: number;

  //   결제와 restaurant관계설정을 위한 정의
  @Field(type => Restaurant)
  @ManyToOne(type => Restaurant)
  restaurant: Restaurant;

  //   restaurant를 위한 Foreign key
  @Field(type => Int)
  @RelationId((payment: Payment) => payment.restaurant)
  restaurantId: number;
}
