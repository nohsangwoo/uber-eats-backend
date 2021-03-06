<div>
  
# Uber Eats BackEnd
- https://github.com/nohsangwoo/uber-eats-frontend 와 연동됩니다(FrontEnd)
- deploy: https://uber-eats-clone-fe-noh.netlify.app/
    (백엔드배포된 서비스의 상태가 무료버전이라 처음 접속시 sleep된상태에서 깨어나느라 조금 시간이 걸림(1~2분정도 기다려야함))
# 설명에 첨부된 gif파일 크기로 인하여 readme파일을 불러오는데 시간이 좀더 소요될 수 있습니다. 많이 기다려주세요.

<br><br>

<hr>
<br><br>

# 구현 내용 및 컨셉

|                        Users                        |                Restaurants                |
| :-------------------------------------------------: | :---------------------------------------: |
|                ✔ User Authentication                |             ✔ Restaurant CRUD             |
|                ✔ Email Verification                 |                ✔ Dish CRUD                |
|                   ✔ Photo Upload                    |     ✔ Realtime Order<br>Notification      |
| ✔ User / Delivery Man/ <br>Restaurant Owner Profile |   ✔ Premium Feature<br>(Online Payment)   |
|                                                     | ✔ Sales Dashboard<br>(Data Visualization) |

| Nest Concepts |            Feature            |
| :-----------: | :---------------------------: |
|   ✔ Modules   | ✔ Online Payments<br>(paddle) |
|   ✔ Guards    |         ✔ Google Maps         |
| ✔ MiddleWares |        ✔ Unit Testing         |
| ✔ Decorators  |     ✔ End to End Testing      |
|               |        ✔ Tailwind CSS         |
|               |     ✔ JWT Authentication      |

<br><br>

<hr>
<br><br>

# 사용된 기술

- NestJS
- typescript(for javascript)
- graphql
- postgresql
- nodejs
- aws-sdk
- Jest(for Unit and E2E testing)
- websocket(for realtime subscription)

<br><br>

# Entity Relationship Diagram

![1-diagram](./README_IMAGE/entity_relationship_diagram.png)

# 1 Graphql API setting up

- 렌더링 순서
  main.ts은 appModule(app.Module.ts)을 불러오고 appModule은 각종 모듈로 통하는 도어맨 역할
  (app.Module.ts에서 모든 모듈이나 Graphql resolver 또는 database entity 등을 한곳에 불러모음)
- forRoot()
  모듈을 불러올때 설정값을 조정하는것
- GRAPHQL API는 스키마랑 리졸버가 한개이상 구성돼있어야함 (따라서 처음에 그래프큐엘 세팅시 스키마랑 리졸버가 구성안돼있으니 에러 나올수있음)

# entity

Entity 클래스는 실제 DataBase의 테이블과 1 : 1로 매핑 되는 클래스로, DB의 테이블내에 존재하는 컬럼만을 속성(필드)으로 가져야 한다.
Entity 클래스는 상속을 받거나 구현체여서는 안되며, 테이블내에 존재하지 않는 컬럼을 가져서도 안된다.

- \*.entity.ts
- 해당 파일로 DB table이 구현됨
- 해당 파일은 각 모듈에서 TypeOrmModule로 import해서 사용한다.

# Type

- @InputType() // from '@nestjs/graphql';
  전달하는 arguments 존재
- @ObjectType() // from '@nestjs/graphql';
  object type
  이후 선언되는 type을 지정
- @Field(type => String) // for graphql

- @Column() // for typeorm

# about

- validation
  @IsString(), @Length(5) // type은 string, text의 길이는 5자 이상 등등 validation을 위한 다양한 데코레이터 존재

- @Field(type => Boolean, { nullable: true })
  해석 : 기본적으론 Boolean type이지만 null형식이 허용된다. (필수로 값이 채워지지 않아도 된다 Not Required, 대신 값이 지정되지 않으면 null값으로 채워짐)

# class-validation

- class-validation을 사용하기 위해선 main.ts에서 useGlobalPipe설정 해줘야한다

# TypeORM AND NEST

- entity생성 후 사용시, app.module.ts => typeorm.forRoot(typeorm옵션 설정)의 항목중 entities항목에 사용하고자 하는 entity를 추가
  (src/app.module.ts)참고

# Data Mapper vs Active Record

typeorm 사용시 Data Mapper와 Active Record 둘중 하나의 패턴을 사용할 수 있음(typeorm을 사용하는 방식)

- data mapper pattern 채택이유
  data mapper pattern이 유지관리와 대규모 프로젝트에 보다 적합하고 또한 nestjs사용시 좀더 친화적으로 사용가능(Repository 기능)

# listener

entity에 변화가 있을때 custom으로 무엇인가 작업을 할때 사용되는 기술
간단한 예)

- @BeforeInsert()
  해당 entity에서 insert되기 직전에 실행되는 내용
- @BeforeUpdate()
  해당 entity에서 update되기 직전에 실행되는내용

  ```
    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void> {
        if (this.password) {
        try {
            this.password = await bcrypt.hash(this.password, 10);
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException();
        }
        }
    }

  ```

  등등 이러한 형태로 사용가능.

# DTO(Data Transfer Object)

- Entity와 DTO를 분리해서 관리해야 하는 이유는 DB Layer와 View Layer 사이의 역할을 분리 하기 위함
  Entity 클래스는 실제 테이블과 매핑되어 만일 변경되게 되면 여러 다른 클래스에 영향을 끼치고, DTO 클래스는 View와 통신하며 자주 변경되므로 분리 해주어야함

- view layer와 DB layer 사이의 data type과 종류, 해당 쿼리가 실행되고 return되는 type과 종류를 validation 해줄수있음
  DTO파일은 entity를 extends해와서 partialtype(옵셔널- entity에서 불러온 목록을 사용해도되고 안해도되고로 설정) , picktype(entity에서 불러온 목록을 required(필수)를 기본으로 해서 설정)

- 간단한 데코레이터 설명
  @InputType과 DTO를 묶어 DB로 전달 하는 args의 validation을 진행
  @ObjectType과 DTO를 묶어 결과값을 반환하는 data의 validation을 진행
  사용예)

  ```
  @InputType()
  export class LoginInput extends PickType(User, ['email', 'password']) {}
  @ObjectType()

  export class LoginOutput extends CoreOutput {
  @Field(type => String, { nullable: true })
  token?: string;
  }
  ```

- entity에서 @ObjectType 과 @InputType데코레이션을 같이 사용 하는경우
  DTO사용시 어차피 picktype이나 omittype등으로 entity에서 요소를 골라 사용하기때문에
  같은내용울 두번 지정할 필요없이 한번에 entity인 동시에 inputype과 objecttype으로 사용가능하다고 설정
  사용예)

  ```
  @InputType('OrderItemInputType', { isAbstract: true })
  @ObjectType()
  @Entity()
  export class OrderItem extends CoreEntity {
  @Field(type => Dish)
  @ManyToOne(type => Dish, { nullable: true, onDelete: 'CASCADE' })
  dish: Dish;

  @Field(type => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[];
  ```

- isAbstract
  해당 DTO를 그대로 가져다 쓰는게아니라 추상적으로 어딘가에 복사하여 사용한다는 의미
  어쨌든 objecttype과 동시에 설정 하려면 해당 옵션을 true로 설정
