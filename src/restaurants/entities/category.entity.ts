import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';

// validation과 동시에 graphql 및 postgresql의 table을 구성하는 속성
// 첫번째 인자로 네이밍 가능
@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field(type => String)
  @Column({ unique: true })
  @IsString() //validation
  @Length(5) //validation
  name: string;

  @Field(type => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  coverImg: string;

  @Field(type => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  //   카테고리는 여러개의 restaurant를 가질수있음(Restaurant는 음식점 사장의 이용)
  @Field(type => [Restaurant]) //for graphql
  @OneToMany(
    type => Restaurant,
    restaurant => restaurant.category,
  )
  restaurants: Restaurant[];
}
