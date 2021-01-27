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

entity를 생성하고 사용하고 싶으면 app.module.ts에서 typeorm.forRoot(typeorm옵션 설정)의 항목중 entities항목에 사용하고자 하는 entity를 추가해줘야함

# 3.1 DATA MAPPER pattern 을 이용

# 3.1 Entity

이유는 대규모 프로젝트에선 DATA MAPPER 패턴이 유리하다해서 적용

- Entity는 데이터베이스에 저장되는 데이터의형태를 보여주는 모델
- 이렇게 설정한 DB는(Restaurant테이블) app.module.ts에서 typeOrmModule.forRoot({ 설정의 entities:[Restaurant]}) 에 예시처럼 추가한다

# 3.4 save

DB에 컬럼을 저장하는 방법
create()로 일단 객체를 만들어 준비를 한다.
그다음 save()기능을 사용하여 create로 준비된 객체를 불러와 저장한다.

- await 를 쓸때는 promise로 반환타입을 설정해줘야함 ex) promise<boolean>

- @InputType과 @ObjectType을 같이 사용할때는 유니크한 스키마 이름을 써야하는데
  동일한 스키마에 위 두가지를 같이 쓰고싶다면 둘중 하나에 {isAbstrack:true}를 사용하면, 해당 데코레이터의 스키마는 어딘가 복사해서 하나의 새로운 스키마 처럼 사용가능(동일 스키마 이름이지만 다르다고 해석함)
  또는 DTO에서 불러올때 두번째 인자로 InputType을 설정해줌

# 3.6

# 4 USER CRUD

# 4.7 listener는 entity에 무슨일이 생길때 실행되는것

- @BeforeInsert()
  해당 entity에서 insert되기 직전에 실행되는 내용
- @BeforeUpdate()
  해당 entity에서 update되기 직전에 실행되는내용

-모듈생성

- entity파일에 테이블을 만든다.
  이때 이 entity파일은 기본적으로 graphql을 위한 validation과 typeorm을 위한 validation을 같이 해준다.
  그리고 entity파일을 사용하기위해 해당 모듈의 module.ts파일 에 import : TypeOrmModule.forFeature([User, Verification, another entity...]) 이런형식으로 추가해준다.(상용구)
- resolver파일과 service파일을 생성하는데 이파일은 해당 모듈의 module.ts 파일에 providers: [UserResolver, UserService] 이런형식으로 추가해준다.(상용구)
- resolver파일은 graphql을 위한 도어맨 역할만 해준다.
  말하자면 실질적인 기능은 없고 해당 기능으로 가기위한 문 같은 기능
  유저생성하고 싶어요 유저 생성하는 함수를 가져와주세요 => graphlql요청 :::: 이 요청을 받아주는 곳이 resolver
- service파일은 실질적인 기능들(함수들)이 모여있는 파일
  해당파일에 실제로 유저를 생성하는 typeorm을 위한 createUser의 DB조작 명령어가 담겨있음

그리고 entity, resolver, service 파일은 각각에 해당하는 상용구가 있음

- DTO
  mutation시 전달되는 arguement의 type과 종류 , 해당 쿼리가 실행되고 return되는 type과 종류를 validation해줄수있음 (DTO)
  DTO파일은 entity를 extends해와서 partialtype(옵셔널- entity에서 불러온 목록을 사용해도되고 안해도되고로 설정) , picktype(entity에서 불러온 목록을 required(필수)를 기본으로 해서 설정)
  @InputType은 보통 mutation시 전달되는 DTO에 붙는 데코레이션
  @ObjectType은 보통 반환되는 DTO에 붙는 데코레이션
- @ObjectType 과 @InputType데코레이션을 같이 써야하는경우(input형식과 return 형식이 같은경우)는
  @InputType("input이름", {isAbstract: true })
  @ObjectType()
  이렇게 사용한다
  isAbstract은 해당 DTO를 그대로 가져다 쓰는게아니라 추상적으로 어딘가에 복사하여 사용한다는 의미 어쨌든 같이 동작하게 하려면 이옵션 true로 하면됨

# User authentication

# 5.0 recap

1. service를 export하여 어디서 사용할것인가를 설정가능 (dependency injection)
2. 위 export한 service를 app.module에서 불러와 전역에서 사용가능하게 만들수도있고
3. 특정 module에서 끌어와 해당 모듈에서만 사용가능하게 consumer를 건들여 설정하는 방법이 있음

# 5.1 ConfigService

- (dependency injection) - 다른 모듈 파일 에서도 사용할수있게 설정하는 방법
  app.module.ts에서 ConfigModule에 추가된(설치된) 설정값은
  불러오고자하는 module.ts에서 ConfigService를 imports에 추가하고
  해당 모듈에서 설정값을 사용하고자하는곳에서 불러와사용할수있다
  예를들면 service파일에서 private readonly config:ConfigService 로 불러와서
  this.config.get("SecretKey") 이런식으로 사용가능

- 이때  
  ConfigModule.forRoot({
  isGlobal: true,
  ...
  })
  이런식으로 isGlobal가 true라면 전역의 모든 모듈에서
  위 설정처럼 ConfigService로 적용하지 않아도 아무데서나 ConfigModule의 설정값을 끌어다 사용할수 있다.

# 5.2 recap

- jwt.io 에서 jwt토큰을 디코딩 가능함
- 토큰을 사용하는이유
  서버단에서 배포된 토큰에 정보가 변경됐는지를 감지하여 사용자의 행동제약 조건을 설정할 수 있음

- StaticModule
  옵션설정이 필요하지않고 모듈 자체적으로 다 갖춰져있음

- DynamicModule
  옵션설정을 forRoot같은걸로 적용해주는 모듈을 말함
  기본적으로 모듈은 StaticModule이고 DynamicModule을 반환하는 형식
  따라서 단지 또다른 모듈을 반환해주는 모듈

# 5.3 JWT module

- 로그인시 토큰을 생성하는 모듈을 아예 따로 만들어줌
  모듈 파일에 상세내용 적어둠
  기본적으로 JWT MODULE은 graphql에서 따로 호출하여 작동하는 방식이 아니라 resolver파일은 없음

- @Global()
  이제 이 모듈은 다른모듈 어디서든 제약없이 불러다 사용할수있음

# 5.4 providers 작동원리 feat JWT module

# 5.5 JWT service구현

providers의 생략되지 않은 작동방식을 구현

- providers 작동원리

# 인증과정

1. login하면 token생성 jsonwebtoken을 이용하여 암호화 함.
2. http header로 해당 token정보를 보냄 (headers['x-jwt'])란 곳으로 저장됨
   //middleware--start
3. 생성된 token의 정보로 무엇인가 요청할때마다 권한종류를 알아내기위해verify작업 함.(암호화된 token을 해독하는 작업)
4. 위에서 decoded된 token의 정보(login한 user)를 request object에 붙여서 보냄
   //middleware---end
5. 이제 middleware단에서 변경된 request object를 모든 resolver에서 사용가능!

# 5.6 token 받아오기 JWT Middleware 미들웨어 설치 방법

- http headers 를 활용하는 방식으로 받아올꺼임

//request.headers['x-jwt']에 저장된 토큰값을 뽑아와서 서버단에 저장된 토큰값이랑 일치하는지 확인하는 작업을 해줌
//request 말그대로 요청한다는 뜻 뭔가를 가져오거나 하는걸 요청할때
//response는 반대로 응답하는 작동 (client로 부터의...)

- middleware설치 방법
  main.ts에서 bootstrap에서 설치하여 전구간에 사용가능하도록 설치
  (이때 미들웨어는 function 형식이어야 함)
  app.module.ts에서 consumer를 이용하여 일련의 상용구로 설치가능
  (이때 미들웨어는 class형식이어야 함)

# 5.7 verify token from jwt middleware

jwt미들웨어 구현

- jwtmiddleware.ts에서 UserService를 사용하고싶을때
  users.module.ts에서 exports:[UserService] 설정을 해주면 됨

# 5.8 request context (appmodule)

req단에 저장된 데이터를 graphql단에 끌어와 사용하는 방법

request context는 각 request에서 사용이 가능하다.
context가 함수로 정의되면 매 request마다 호출된다.
이것은 req property를 포함한 object를 express로 부터 받는다

즉 context에 저장된 데이터는 graphql의 어떤 쿼리문이나 mutation문에서든 불러올수있다.

- context적용방법
  app.module.ts에서 imports 안에
  GraphQLModule.forRoot({
  autoSchemaFile: true,
  context: ({ req }) => ({ user: req['user'] }),
  }),
  이와같은 형식으로 설정한다.
  이경우 뜻은
  jwtmiddleware로부터 저장된 req['user']의 값을 불러와
  user라는 키값에 할당된 오브젝트를 모든 구역의 graphql에서 불러올수있음

1. apollo server나 graphql의 모든 resolver에서 사용가능하도록 설정해줌(ex..req)
2. JWTmiddleware를 거쳐서 graqhql context에 request user를 전달해줌
   token을 전달한 http와 같음

- user.resolver.ts에서
  me(@context() context){
  console.log(context.user);
  }
  이런 방식으로 불러와서 사용가능

# 5.9 AuthGuard

- guard concept

1. implements CanActivate해서 사용(상용구 auth.guard참고)
   CanActivate => true를 return 하면 request를 진행시키고 false를 return 하면 request를 멈춤
2. function의 기능을 보충해줌 조건에 따라 true false로 함수의 기능을 사용할지 차단할지 설정해줌
   =====이안에서 사용될 함수의 이름은 canActivate====
3. 위에서 http형식의 context를 graphql형식으로 변환해서 가져옴
4. 전달받은 내용을 가지고 조건을 걸어서 true or false를 return함
   // ExecutionContext는 (app.module.ts => graphqlmodule.forRoot => 전역 사용하게 가능한 context)에서 전역설정된 http의 context를 가져다 사용하겠다는말
   // 그 가져온 데이터값을 context라는 변수에 넣어줌끌어와 사용하는 작업)
   // 위에서 가져온 http의 context를 graphql에서 사용할수있게 변환후 gqlContext라는 변수에 넣어줌

   auth-user.decorator.ts의 내용해석(중요해서 여기서도 설명함)

5. 인증과정을 통하여 request를 진행시킬지 말지 결정가능

- authentication
  누가 자원을 요청하는지 확인하는 과정(token으로 identity를 확인하는 작업)

- authorization
  user가 어떤일을 하기전에 permission을 가지고있는지 확인하는 작업(ex. userRole)

# 5.10 AuthUser Decorator

- login 되어있지 않다면 request를 멈추게 할꺼고 login됐다면 request를 진행시킬꺼임
- createParamDecorator
  데코레이터를 만드는 함수

1. 데코레이터 적용은 custom된 데코레이터 파일을 불러와서 resolver에 설치 가능
   (여기선@AuthUser라는 이름의 데코레이터를 users.resolver.ts에 설치)
2. 위 데코레이터의 인증과정이 끝나면 users.resolver.ts에서 graphql형식으로 변환된 user데이터를 끌어와 사용할수있음
   (resolver는 graphql을 위한 작업파일이니깐!)

# 5.11 recap about 5.0~5.10 - me() Qurery

- (##authentication 작동 정리)

- 이전 단계에서 만들어진 token을 graphql의 HTTP HEADERS에서 "x-jwt"라는 이름으로 담아 server로 전달하고있음
  headers는 http 기술중 하나다
  그래서 http기술을 사용하기위해 jwt.middleware.ts를 만들었음

- part1 => jwt.middleware.ts의 기능
  0 NestMiddleware를 implements하여 middleware로 만들어준다(use기능을 꼭 포함하여야함)
  1 req.headers['x-jwt']로 token을 가져와 token이란 변수에 담아준다
  2 가져온 token을 디코딩한다 - jwt.verify함수를 이용하여 서버단의 privateKey를 가지고 디코딩하고 decoded라는 변수에 저장하는 작업 (그과정에 privateKey를 사용하여 token의 값이 변경됐는지 확인해줌)
  3 그다음 디코딩된 decoded에서 id를 추출하여 users DB에서 해당 id와 동일한 user data를 찾아와 request object에 붙여 반환한다.
  (이때 찾지못하면 fail error를 던짐)
  이 middleware를 가장 먼저 만나기 때문에 middleware가 원하는대로 request object를 바꿀 수 있다.
  그러면 middleware에 의해 바귄request object를 모든 resolver에서 사용가능
  token이 없거나 에러가 나거나 디코딩된 totken으로(id값이 jwt로 token화 됨) user를 찾을수 없다면 request object에 데이터가 추가되지 않는다

- part2 => context
  (app.module에서 graphlQLModule.forRoot의 context)
  apollo server의 context나 graphql의 context는 모든 resolver에 정보를 보낼수 있는 property이다
  context get이 매 request마다 호출될것이다
  context에서 function을 만들면 해당 function이 request object를 줄것이다. 여기서 request object는 전에 만들어둔 user key(token)를 가진 http이다

  ! jwtmiddleware를 거치고 graphql context에 request user를 보내는 순서로 진행됨

- part3 => authGuard
  canActivate는 function의 기능을 보충해주는데 이 function은 true나 false를 return 한다
  이때 true를 return하면 request를 진행시키고 false를 return하면 request를 중단한다.
  그리고 여기서 불러오는 context:ExecutionContext는 nestjs Context이다(이게좀 헷갈림 )
  어쨌든 graphql 형식으로 변환해주는 작업을 거쳐( GqlExecutionContext.create(context).getContext()) 변수에 저장한다(gqlContext) 여기서 불러오는 getContext는 app.module.ts의 graphql.forRoot에서 설정된 context의 값이다

  그리고 반환된 context object에서 user라는 key를 뽑아와 user라는 변수에 저장한다.
  (app.module.ts의 graphql.forRoot에서 설정된 context의 값을 보면 user라는 key에 저장했으니 뽑아올때도 gqlContext['user] 식으로 가져옴 )
  여기서 user가 존재하면 true를 반환 존재하지 않으면 false를 반환하여 canActivate를 활성화

  ! jwtmiddleware를 거치고 apollo server의 context를 거치고 graphql context에 user key를 가진 object를 보내고 authorization guard를 거쳐서 마지막으로 reeesolver에 도착하면 데코레이터가 있음

- part4 => auth-user.decorator.ts (@AuthUser)
  이 데코레이터도 graphql context를 가져오는 작업을 거쳐 gqlContext['user']를 가져온다
  이 데코레이터가 user의 값을 가져오는것을 성공하면 반환값을 가지는데
  me(@AuthUser() authUser: User) {
  return authUser;
  }
  이런형식으로 사용한다 이때 @AuthUser() 의 반환된 user값은 authUser변수에 저장되고 그 type은 User이다(user.entity.ts에서 설정된 validation)

  ! jwtmiddleware를 거치고 apollo server의 context를 거치고 graphql context에 user key를 가진 object를 보내고 authorization guard에 의해 request가 authrize되면 마지막으로 resolver의 @AuthUser데코레이터에 도착하는데, 이 데코레이터는 context에서 user를 찾아와 그 값을 authUser에 저장하여 me qeury의 반환값으로 설정해줌

# 5.12진도 ~16 editProfile

user.resolver.ts 에 추가 user의 정보를 불러오는 작업

0. editProfile 의input과 output의 DTO를 만들어줌
1. 개인정보수정 기능(email, password)
1. edit profile 의input과 output의 DTO를 만들어줌
1. 위 기준으로 user.service.ts에서 실질적인 editprofile 기능을 구현 이때 save로 구현
1. middleware단에서(user.entity.ts) @beforUpdate() 데코레이터로 save되기직전 해시화 할수있게 설정
1. 원래는 update()로 수정을 구현하려고했는데 이렇게하면 beforeupdate 데코레이터를 사용할수없음
   왜냐하면 update()는 빠른대신 아무것도 확인안하고 그냥 무조건 쿼리를 날려버림 그래서 beforeUpdate도 작동안함
   따라서 save를 사용하고 beforeupdate를 미들웨어단에서 불러와 password수정시 해시화 할수있게 설정해줌
1. 때에 따라서 update()를 save()대신 사용하던가 할수있음(간단하고 빠르기때문에)

# 6 - EMAIL VERIFICATION (이메일 검증)

유저가 계정을 생성하면 일련의 인증과정을 거쳐서 생성되게함 그 과정을 담당하는 table이 verification이고 이것은 email인증으로 이루어질것임

이메일인증은 서버단에서 이메일로 일련의 암호화된 코드? 를 보내면 유저는 해당 이메일에서 그것을 인증하여 최종적으로 계정이 만들어지는 과정을 거침

# 6.0 verification 테이블 생성

users/entities에 verification.entity.ts추가 (테이블을 하나 만드는것)

- OneToOne (1:1관계)
  verification은 users와 1:1관계이다 그리고 둘중 한곳에 @JoinColumn()가 정의돼야함 이경우엔 verification쪽에 정의함
  (verification에서 user로 접근하는경우엔 verification쪽에 @JoinColumn()가 정의되고
  user에서 verification로 접근하는경우엔 user쪽에 @JoinColumn()가 정의됨)
  @JoinColumn()을 포함하고있는쪽에 relation id를 외래키로 가지고있음

# 6.1

# 6.2 select:false

// 다른곳에서 relations:['user']로 선택해서 user를 불러올때 password는 선택되지 않게 하는 작업
@Column({ select: false })
@Field(type => String)
@IsString()
password: string;

- verification을 통하여 user를 불러오고 싶으면 확실하게 설정해줘야 불러올수있음
  const verification = await this.verifications.findOne(
  { code },
  { relations: ['user'] }
  );
  (즉 이런식으로 relations를 user로 지정해줘야 verification.user를 사용가능)

verification은 user와 거의 비슷해서 따로 모듈을 만들지 않고 그냥 user모듈의 일부분으로 합침
verification code를 사용해서 그들의verification을 찾음, 그걸 지우고 그다음 user를 verifiaction함

- 정리
  users.service.ts의 uverifyEmail에서 relations:['user']로 user을 불러오고 select할때
  user.entity.ts의 password설정이 select:false라서 password를 제외하고 불러옴
  따라서 이때 user.entity의 @BeforeUpdate에서 hashPassword가 작동되지 않음(조건문으로 password가 있을때만 실행되게 설정함)

//onDelete: CASCASDE 여기서는 user 테이블쪽에서 필드가 삭제되면
// 그에 의존하고있는(1:1관계인 verification)필드도 같이 삭제된다는 뜻

# 6.5 mailugun setup

- mail 모듈 관련 세팅

사용자 인증이끝나면 verifycation의 항목을 지워줌

# 6.6 mail.service.ts 작성

nodeJs에서 request를 쉽게 작성하게 해주는 GOT패키지를 설치
거기에 form-data패키지를 사용하여 form 처리 완료

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
#mac 연결

npm install eslint eslint-plugin-react eslint-babel –save-dev
