import { v4 as uuidv4 } from 'uuid';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

// InputType과 ObjectType을 같이 쓰려면 둘중 하나는 추상적인 개념으로 사용해야함
@InputType({ isAbstract: true })
@ObjectType()
@Entity()
// CoreEntity에는 id와createAt updatedAt이 있다. 그걸 끌어와 가져다 씀
export class Verification extends CoreEntity {
  @Column()
  @Field(type => String)
  code: string;

  //onDelete: CASCASDE  여기서는 user 테이블쪽에서 필드가 삭제되면
  // 그에 의존하고있는(1:1관계인 verification)필드도 같이 삭제된다는 뜻
  @OneToOne(type => User, { onDelete: 'CASCADE' })
  // verification 테이블에서 user쪽으로 접근한다는 의미(어느곳에서 접근하냐에따라 JoinColumn을 정의하는 곳이 다름 이경우엔 verification쪽에 정의)
  @JoinColumn()
  user: User;

  // verification이 생성되기전에 uuidv4로 암호화하여 code에 저장
  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4();
  }
}
