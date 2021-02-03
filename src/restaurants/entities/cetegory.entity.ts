import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field(type => String)
  // name은 유니크한 존재다(딱 한개만 존재해야함 중복되는 경우 없어야함)
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  // coverImg는 null값을 가질수있다
  // 즉 coverImg의 값이 존재 하지 않아도 괜찮음
  @Field(type => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  coverImg: string;

  // name과 비슷하지만 name을 일련의 규칙으로 변환하여 만들어진 slug
  // 앞뒤 빈칸없애기, 나머지 빈칸 "-"로 대체, 모든문자 소문자로 변환 ..등
  @Field(type => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  // restaurant와의 관계 정리 1:N관계
  // 1개의 cateogry는 여러개의 restaurant를 포함할수있다.
  @Field(type => [Restaurant], { nullable: true })
  @OneToMany(
    type => Restaurant,
    restaurant => restaurant.category
  )
  restaurants: Restaurant[];
}
