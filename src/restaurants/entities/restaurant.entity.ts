import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Category } from './cetegory.entity';
import { Dish } from './dish.entity';

@InputType('RestaurantInputType', { isAbstract: true })
// objecttype은 자동으로 스키마를 빌드하기위해 사용하는 graphql decorator임
@ObjectType() //for graphql
// typeorm(DB) 테이블의 모델 이라고 선언
@Entity() // for type orm
export class Restaurant extends CoreEntity {
  @Field(type => String) //for graphql
  @Column() //for typeorm
  @IsString() //for validaton
  // 최소 5글자 이상이어야함
  @Length(5) //for validaton
  name: string;

  // 배경이미지 url주소 필드
  @Field(type => String)
  @Column()
  @IsString()
  coverImg: string;

  // 주소 필드
  // 값을 채워넣지 않으면 기본값으로 '강남'을 채워넣겠다는 뜻
  // @Field(type => String, { defaultValue: '강남' }) //for graphql
  @Field(type => String, { defaultValue: '강남' })
  @Column() //for typeorm
  @IsString()
  address: string;

  //nullable은 이 값이 필수로 채워지지 않아도 된다라는 뜻
  // 카테고리와의 관계를 정의
  // 여러개의 restaurant은 각각 한개의 Category를 가질수 있음
  @Field(type => Category, { nullable: true })
  @ManyToOne(
    type => Category,
    category => category.restaurants,
    // 카테고리를 지울때 restaurant는 지우면 안되기 때문에 nullable:true설정
    // 카테고리가 지워지면 자동으로 restaurant의 카테고리 필드는 null로 채워짐
    // 또한 카테고리가 존재하지않는 상태로 restaurant를 생성가능
    { nullable: true, onDelete: 'SET NULL' }
  )
  category: Category;

  //  restaurant에서 user를 가져와 사용가능
  // 위와 같음 다만 이경우 user가 삭제되면 그에 연결된 restaurant도 같이 삭제되는 종속관계인 CASCADE를 정의함
  // 한개의 유저는 여러개의 레스토랑을 가짐(owner의 경우)
  @Field(type => User)
  @ManyToOne(
    type => User,
    user => user.restaurants,
    // user가 지워지면 해당 user에 연결된 restaurant도 같이 지워지는 종속관계를 설정해줌
    { onDelete: 'CASCADE' }
  )
  owner: User;

  // Order.entity와 OneToMany관계를 가짐
  // 한개의 restaurant는 여러개의 order를 가질수있음
  @Field(type => [Order])
  @OneToMany(
    type => Order,
    order => order.restaurant
  )
  orders: Order[];

  // 이경우 restaurant와 user의 관계에서 user의 id를 가져오는데
  // 이때 설정된 ownerId는 restaurant.owner에서 뽑아온다는 의미
  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  // 한개의 restaurant는 여러개의 dish를 가지고있을수 있다.
  // 여러개의 dish를 가지고있는 field이름은 menu 이다
  @Field(type => [Dish]) //for graphql
  @OneToMany(
    type => Dish,
    dish => dish.restaurant
  )
  menu: Dish[]; //for typescript
}
