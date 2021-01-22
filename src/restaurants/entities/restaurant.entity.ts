import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Category } from './cetegory.entity';

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

  @Field(type => String)
  @Column()
  @IsString()
  coverImg: string;

  // 값을 채워넣지 않으면 기본값으로 '강남'을 채워넣겠다는 뜻
  @Field(type => String, { defaultValue: '강남' })
  @Column()
  @IsString()
  address: string;

  //nullable은 이 값이 필수로 채워지지 않아도 된다라는 뜻
  @Field(type => Category, { nullable: true })
  @ManyToOne(
    type => Category,
    category => category.restaurants,
    { nullable: true, onDelete: 'SET NULL' }
  )
  category: Category;

  @Field(type => User)
  @ManyToOne(
    type => User,
    user => user.restaurants,
    { onDelete: 'CASCADE' }
  )
  owner: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;
}
