import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Dish, DishOption } from 'src/restaurants/entities/dish.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  // Dish쪽에서 order-item에 접근하길 원하지 않고 오직 order-item쪽에서만 Dish로 접근하길 원함
  //   따라서 ManyToOne설정을 이쪽에만 해줌
  // 한개의 dish(메뉴)는 여러개의order-item을 가질수 잇음
  @Field(type => Dish)
  @ManyToOne(type => Dish, { nullable: true, onDelete: 'CASCADE' })
  dish: Dish;

  //  order와 relation으로 묶지 않는이유는
  // order-item은 레스토랑의 주인이 언제든지 변경할수있기때문에
  // 단순히 텍스트적인 개념으로만 저장되게 설정
  // 만약 order와 relation과 연결하면 이전에 주문한 내용들이 영향을 받게되기때문에 연결안함
  @Field(type => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOption[];
}
