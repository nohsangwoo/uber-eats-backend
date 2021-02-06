import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
class DishChoice {
  @Field(type => String)
  name: string;
  @Field(type => Int, { nullable: true })
  extra?: number;
}
// json 형태의  DishOption반환 형식인데
//일종의 가상 entity같은 느낌임...
@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
export class DishOption {
  @Field(type => String)
  name: string;
  @Field(type => [DishChoice], { nullable: true })
  choices?: DishChoice[];
  @Field(type => Int, { nullable: true })
  extra?: number;
}

// 음식메뉴의 정보 entity(테이블)
//InputType 와 ObjectType을 같이 쓰려면 한쪽엔 isAbstract:true 설정을 해줘야함
//다른곳의 DTO에서 이 entity설정을 extends 해서 쓰게 하기위해 @InputType과 @ObjectType 데코레이터를 사용해줌
@InputType('DishInputType', { isAbstract: true })
// objecttype은 자동으로 스키마를 빌드하기위해 사용하는 graphql decorator임
@ObjectType()
@Entity() //for typeorm
export class Dish extends CoreEntity {
  // 음식메뉴 이름
  @Field(type => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  //  음식 메뉴의 가격
  @Field(type => Int)
  @Column()
  @IsNumber()
  price: number;

  //   음식 메뉴의 사진 주소
  //   음식메뉴의 사진이 없을수도있으니깐 nullable:true로 설정
  @Field(type => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  photo: string;

  //   음식 메뉴의 설명
  @Field(type => String)
  @Column()
  //   description의 최소 글자길이는 5개 최대 140개로 제한함
  @Length(5, 140)
  description: string;

  //   음식메뉴와 레스토랑의 relation정의
  //  한개의 레스토랑은 여러개의 디쉬를 가질수있다.
  //   이때 dish가 의존하고있는 restaurant가 삭제된다면 연결된 모든 dish도 같이 삭제된다.
  @Field(type => Restaurant)
  @ManyToOne(
    type => Restaurant,
    restaurant => restaurant.menu,
    { onDelete: 'CASCADE' }
  )
  restaurant: Restaurant;

  //   relation관계가 있는경우에는 @RelationId()로 relation관계의 id를 가져올수있는데
  //이경우 NanyToOne관계로 연결된 restaurant의 id를 가져온다
  //   이게 foreign key
  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  //   dish의 옵션
  //   예를들면 피자를 주문할때 선택하는 맛(옵션)
  // ex..피글빼주세요, 치즈 더 추가해주세요..등등
  @Field(type => [DishOption], { nullable: true })
  //   type:json 구조화된 데이터를 저장하거나 특정 형태를 가진 데이터를 저장해야할때 json type을 사용
  @Column({ type: 'json', nullable: true })
  options?: DishOption[];
}
