import { Field, ObjectType } from '@nestjs/graphql';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
export class CoreEntity {
  @PrimaryGeneratedColumn() //for typeorm
  @Field(type => Number) //for graphql
  id: number;

  // 자동으로 만든날짜 만들어줌
  @CreateDateColumn() //for typeorm
  @Field(type => Date) //for graphql
  createdAt: Date;

  // 자동으로 업데이트된 날짜 만들어줌
  @UpdateDateColumn() //for typeorm
  @Field(type => Date) //for graphql
  updatedAt: Date;
}
