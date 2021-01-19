# Nuber Eats

The Backend of Nuber Eats Clone

## User Model:

- id
- createdAt
- updatedAt

- email
- password
- role(client|owner|delivery)

## User CRUD:

- Create Account
- Log In
- See Profile
- Edit Profile
- Verify Email

---

@Column은 typeorm을 위한거
@Filed를 graphql을 위한거

npm i @nestjs/graphql@7.9.1 이상 버젼에서 에러가 나타나는 버그가 있음
7.9.1버젼으로 진행하는거 추천
#4.5에 pgadmin 질문올림

# 1 GRAPHQL API

# 1.0 apollo server setup

- main.ts를 통해서 appModule(app.Module.ts)을 불러와 렌더링 한다
  app.Module.ts에서 모든 모듈이나 GRAPHQL 또는 DATABASE를 불러온다
- forRoot()라는건 모듈을 불러올때 설정값을 조정하는것
- GRAPHQL API는 스키마랑 리졸버가 한개이상 구성돼있어야함 (따라서 처음에 그래프큐엘 세팅시 스키마랑 리졸버가 구성안돼있으니 에러 나올수있음)

# 1.1 Our First Resolver

- graphQl은 기본적으로 apolloserver위에서 동작함
- (nest g mo restaurant) 명령어로 restaurant 모듈을 생성함
- 생성된 restaurant모듈은 자동으로 app.module.ts에 import됨
- restaurant.resolver파일을 생성하고 거기에 도어맨 역할을 하는 기능의 함수 생성
- 도어맨 역할이란? 실질적인 기능은 없고 실질적인 기능을 불러오는 기능만 해줌 -> 말그대로 문을 열어주기만함

- 생성한 resolver파일은 restaurant.module.ts에서 providers에 추가해준다
- resolver파일은 @Resolver() 데코레이터로 선언하면 됨 (그럼 자동으로 resolver 파일이라고 인식하는듯 )
- 생성한 sevice파일은 restaurant.module.ts에서 providers에 추가해준다

- 해당 resolver에서는 mutation이나 query등을 선언할수있는데 위에 말했듯이 도어맨 역할만 해줌 (이건 어떤이름의 쿼리구나! 이건 어떤 이름의 뮤테이션이구나!)
- 이때 쿼리는 @Query() 데코레이터로 선언 / from "@nestjs/graphql
- mutation도 마찬가지
- 또한 쿼리문이나 뮤테이션 데코레이터 선언시
  ex) @Query(returns => Boolean) 이런식으로 반환되는 타입을 미리 graphql을 위해 선언해줌
  예시)
  @Resolver()
  export class RestaurantResolver{
  @Query(returns=>Boolean) //for graphql
  isPizzaGood():Boolean{ //for typescript
  return: true
  }
  }

# 1.2 ObjectType

entity

- restaurant.entity.ts
- DB의 (테이블)모델을 구성함

- @InputType() from '@nestjs/graphql';
  전달되는 arguments가 있다
- @ObjectType() from '@nestjs/graphql';
  말 그대로 object type이다
  이후 선언되는 type을 지정
- graphlql을 위해 선언하는건 @Field(type => String)
  type은 말그대로 해당 Field의 type을 선언
- typeorm을 위해 선언되는건 @Column()

* about
  @IsString()
  @Length(5)
  이런것들은 validation을 선언 꼭 string이어야하고 꼭 길이가 5개 이내여야하고...

- @Field(type => Boolean, { nullable: true })
  기본적으론 Boolean type이지만 null형식이 허용된다.라는 뜻(필수로 값이 채워지지 않아도 된다 Not Required)

# 1.5 class-validation

- class-validation을 사용하기 위해선 main.ts에서 useGlobalPipe설정 해줘야함

# 2 postgresql 세팅 및 dotenv를 nestjs방식으로 불러오기

# 3 TypeORM AND NEST

# 3.1 Entity

- Entity는 데이터베이스에 저장되는 데이터의형태를 보여주는 모델
- 이렇게 설정한 DB는(Restaurant테이블) app.module.ts에서 typeOrmModule.forRoot({ 설정의 entities:[Restaurant]}) 에 예시처럼 추가한다

# 6 - USER AUTHENTICATION

# 5.0~5.7

1. service를 export하여 어디서 사용할것인가를 설정가능 (dependency injection)
2. 위 export한 service를 app.module에서 불러와 전역에서 사용가능하게 만들수도있고
3. 특정 module에서 끌어와 해당 모듈에서만 사용가능하게 consumer를 건들여 설정하는 방법이 있음

# 인증과정

1. login하면 token생성 jsonwebtoken을 이용하여 암호화 함.
2. http header로 해당 token정보를 보냄 (headers['x-jwt'])란 곳으로 저장됨
   //middleware--start
3. 생성된 token의 정보로 무엇인가 요청할때마다 권한종류를 알아내기위해verify작업 함.(암호화된 token을 해독하는 작업)
4. 위에서 decoded된 token의 정보(login한 user)를 request object에 붙여서 보냄
   //middleware---end
5. 이제 middleware단에서 변경된 request object를 모든 resolver에서 사용가능!

# context (appmodule)

1. apollo server나 graphql의 모든 resolver에서 사용가능하도록 설정해줌(ex..req)
2. 그니깐 JWTmiddleware를 거쳐서 graqhql context에 request user를 전달해줌
   token을 전달한 http와 같음

# guard concept

1. implements CanActivate해서 사용(상용구 auth.guard참고)
2. function의 기능을 보충해줌 조건에 따라 true false로 함수의 기능을 사용할지 차단할지 설정해줌
   =====이안에서 사용될 함수의 이름은 canActivate====
3. 위에서 전역 graphql resolver에서 사용가능하게 만들어준 context를 graphql에서 사용가능하도록 변환한다음 불러옴
4. 전달받은 내용을 가지고 조건을 걸어서 true or false를 return함
   (app.module.ts => graphqlmodule.forRoot => 전역 사용하게 가능한 context 설정 => http req로 전달된 user object를 다른곳에서 끌어와 사용하는 작업)
5. 여기서 request를 진행시킬지 말지 결정가능

# AuthUser Decorator

1. 위 인증과정 적용은 (@UseGuards)을 이용하여 resolver에 설치 가능
2. 위 인증과정이 끝나면 users.resolver.ts에서 user를 끌어와 사용할수있음

# 5.12진도 ~16 editProfile

1. 개인정보수정 기능(email, password)
2. edit profile 의input과 output의 DTO를 만들어줌
3. 위 기준으로 user.service.ts에서 실질적인 editprofile 기능을 구현 이때 save로 구현
4. middleware단에서(user.entity.ts) @beforUpdate() 데코레이터로 save되기직전 해시화 할수있게 설정
5. user.resolver.ts에서 구현된 userservice.ts안의 editprofile을 인자와함꼐 call하는 resolver작성
6. 원래는 update()로 수정을 구현하려고했는데 이렇게하면 beforeupdate 데코레이터를 사용할수없음
   왜냐하면 update()는 빠른대신 아무것도 확인안하고 그냥 무조건 쿼리를 날려버림
   따라서 save를 사용하고 beforeupdate를 미들웨어단에서 불러와 password수정시 해시화 할수있게 설정해줌
7. 때에 따라서 update()를 save()대신 사용하던가 할수있음(간단하고 빠르기때문에)

# 6 - EMAIL VERIFICATION

# 7.5

"coveragePathIgnorePatterns": [
"node_modules",
".entity.ts",
".constants.ts"
]
test:cov에서 현재 얼마나 테스트가 완료됐는지 계산해서 퍼센테이지를 보여주는데
entify파일과 constants 파일은 테스트 할필요가 없으니 제외하기위해서 poackage.js에 추가해준다

# 특정파일만 검사하고싶을때

@blackstar0223 Check "collectCoverageFrom" in package.json.
In my case:
"collectCoverageFrom": [
"**/*.(t|j)s"
],

I modified it:
"collectCoverageFrom": [
"**/*.service.(t|j)s"
],
And then jest --coverage shows only \*.service.ts(or js if exists) files.
and I didn't set coveragePathIgnorePatterns

이런식으로 설정가능

# jwt.middleware단에서 {user로 뽑아줘야 제대로 작동함}

const { user } = await this.userService.findById(decoded['id']);
