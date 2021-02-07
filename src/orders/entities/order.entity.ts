import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsNumber } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

// 주문 현황을 위한 enum : 이것중 하나여야만 함!
export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  // 한개의 user는 여러개의 order를 가질수있음
  @Field(type => User, { nullable: true })
  @ManyToOne(
    type => User,
    user => user.orders,
    // 헤딩 유저가 삭제된다해도 주문은 안지워진다는뜻
    { onDelete: 'SET NULL', nullable: true }
  )
  customer?: User;

  //   주문당시 드라이버가 지정되지 않으니깐 일단 nullable:true정의
  @Field(type => User, { nullable: true })
  @ManyToOne(
    type => User,
    user => user.rides,
    // 헤딩 유저가 삭제된다해도 주문은 안지워진다는뜻
    { onDelete: 'SET NULL', nullable: true }
  )
  driver?: User;

  // restaurant.entity와 ManyToOne관계 가짐
  // 한개의 restaurant는 여러개의 order를 가질수있음
  //   이 주문을 받고있는 레스토랑의 정보
  @Field(type => Restaurant)
  @ManyToOne(
    type => Restaurant,
    restaurant => restaurant.orders,
    // 헤딩 유저가 삭제된다해도 주문은 안지워진다는뜻
    { onDelete: 'SET NULL', nullable: true }
  ) //for typeorm @column() 데코레이션 안써도됨
  restaurant: Restaurant;

  // Dish.entity랑  ManyToMany관계를 가짐
  // ManyToMany관계 : 서로 여러개를 가짐 dish는 order를 여러개 가지고 order또한 dish를 여러개 가짐
  //  주문의 내용엔 여러개의 메뉴가 있어야 하니깐
  // 그리고 메뉴는 여러개의 주문을 가질수있음(많은 사용자가 하나의 메뉴를 동시에 주문할 수 있다는거랑 같은뜻)
  @Field(type => [OrderItem])
  @ManyToMany(type => OrderItem)
  //   JoinTable은 소유하고있는 쪽의 relation에만 추가해주면됨
  @JoinTable()
  items: OrderItem[];

  //  주문한 메뉴들의 총 가격
  @Column({ nullable: true }) //for typeorm
  //   $12.55같은 값도 나올수있으니깐 Float형식 반환
  @Field(type => Float, { nullable: true })
  @IsNumber()
  total: number;

  //   주문 현황 표시기
  @Column({ type: 'enum', enum: OrderStatus }) //for typeorm
  @Field(type => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
