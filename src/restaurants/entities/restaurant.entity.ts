import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from './category.entity';

// validation과 동시에 graphql 및 postgresql의 table을 구성하는 속성
@InputType({ isAbstract: true })
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

  @ManyToOne(
    type => Category,
    category => category.restaurants,
  )
  @Field(type => Category)
  category: Category;
}
