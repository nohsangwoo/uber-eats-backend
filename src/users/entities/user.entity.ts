import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CoreEntity } from 'src/common/entities/core.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

// 이 셋중 하나여야 한다는 의미의 규칙
export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
}

registerEnumType(UserRole, { name: 'UserRole' }); //for graqhpl

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
// Table이 만들어진다는것을 typeOrm을 위해 선언
@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  @Field(type => String)
  @IsEmail()
  email: string;

  // 다른곳에서 relations:['user']로 선택해서 user를 불러올때 password는 선택되지 않게 하는 작업
  @Column({ select: false })
  @Field(type => String)
  @IsString()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(type => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  // User의 email이 verify 됐는지 안됐는지 확인하는 컬럼
  // email인증이 끝나면 true로 변경될것임
  @Column({ default: false })
  @Field(type => Boolean)
  @IsBoolean()
  verified: boolean;

  @Field(type => [Restaurant])
  @OneToMany(
    type => Restaurant,
    restaurant => restaurant.owner
  )
  restaurants: Restaurant[];

  // insert되기 직전에
  // update되기 직전에 실행되는 내용
  @BeforeInsert()
  @BeforeUpdate()
  // password를 hashing해주는 기능
  // 어떤 promise를 반환해도 다 괜찮다는 의미
  async hashPassword(): Promise<void> {
    // save로 전달된 object에 password가 있으면 해쉬함수가 작동하는걸로
    if (this.password) {
      try {
        // save하기 직전에만들어진 instance를 기준으로 (create()로 만들어진 instance)
        //패스워드를 전달받아서 bcrypt로 10번 hashing 해준다
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
    }
  }
  // 비밀번호가 맞는지 확인해주는 기능
  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      // aPassword는 입력받는 비밀번호 , this.password는 DB의 password
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
