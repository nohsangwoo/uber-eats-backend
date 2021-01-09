import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from './category.entity';

// validation과 동시에 graphql 및 postgresql의 table을 구성하는 속성
@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field(type => String) //for graphql
  @Column() // for table
  @IsString()
  @Length(5)
  name: string;

  @Field(type => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field(type => String, { defaultValue: '강남' })
  @Column()
  @IsString()
  address: string;

  // restaurant의 필드는 null타입의category를 가질수있도록 설정
  // 카테고리가 없는 테이블 생성도 가능하거나 포함하고있는 카테고리의 필드가 지워졌어도 문제가 생기지 않도록 설정
  @Field(type => Category, { nullable: true })
  @ManyToOne(
    type => Category,
    category => category.restaurants,
    // 카테고리가 없는 테이블 생성도 가능하도록 설정
    { nullable: true, onDelete: 'SET NULL' },
  )
  category: Category;

  @Field(type => User)
  @ManyToOne(
    type => User,
    user => user.restaurants,
    // 카테고리가 없는 테이블 생성도 가능하도록 설정
    // { nullable: true, onDelete: 'SET NULL' },
  )
  owner: User;
}
