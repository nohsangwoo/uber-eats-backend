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

```
I found another solution.

To find a table to look up, put the schema name in front of table name in the query sentence.

just put the schema name front of table name(with dot)!

(윈도우유저 pgadmin4 사용중 user테이블 조회안될때) 저처럼 user이름이 뭔가랑 중복돼서(뭐랑중복됐는진 모르겠음) 제대로 표시안되면 찾으려는 테이블이름앞에 스키마이름을 붙여주면 제대로 조회됩니다.

ex)

SELECT * FROM user => SELECT * FROM public.user

DELET FROM user WHERE ID=1 => DELET FROM public.user WHERE ID=1

스키마 이름 찾는법?

1 sqlshell 접속

2 \list (모든 DB조회)

3 \c DB이름 사용자이름 (DB선택)

4 \dt ( 선택한 DB안의 모든 table 정보 조회)

또는 최상위 경로에서

select nspname from pg_catalog.pg_namespace

이 쿼리날리면 모든 스키마 명 검색됨

이러면 스키마 이름이 나타남

If someone has a similar problem with me, please refer to it.
```

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

https://app.mailgun.com/app/dashboard 참고

- mail 모듈 관련 세팅

사용자 인증이끝나면 verifycation의 항목을 지워줌

# 6.6 mail.service.ts 작성

nodeJs에서 request를 쉽게 작성하게 해주는 GOT패키지를 설치
거기에 form-data패키지를 사용하여 form 처리 완료

# 6.8

- mailgun template service
  메일받았을때 form을 html과 css로 꾸밀수있음

# unit Testing the user test

Jest를 이용한 uit test방법

# 7.0 unit test for user part

user.service.spec.ts생성(테스트파일)
npm run test:watch

- beforeAll 테스트 모듈을 만들어줌
  \*\*즉 graphql등 과 상관없이 오직 UserService파일만을 위한 독립된 별개의 테스팅환경을 만들어주는것

# 7.1 Jest 경로 에러 수정 및 Mocking

- Jest 경로 에러 수정은 package.json에서 수정해줌
  "jest": {
  "moduleNameMapper": {

    <!-- src로 시작하는 경로포함방식을 찾는다면 
    해당 모든 황작자와 모든 경로는 Root Directory에서 찾아내라고 알려주는 설정 -->

  "^src/(.\*)$": "<rootDir>/$1"
  },
  "rootDir": "src"

  <!-- 여기가 root Directory -->

  ...
  }

- mocking (가짜 함수)
  repository를 포함하고 있는 모듈에서 repository를 가짜로 속이려고 만드는 설정
  즉 Mock repository를 생성 => 이런 일련의 작업을 mockicng 이라고함
  첫번째로 테스팅 모듈 생성시 providers에서 최상위 대체 대상을 모킹하고
  그 대체대상이 포함하고있는 함수를 사용할경우
  //---------------
  const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
  });
  //---------------
  const mockJwtService = () => ({
  sign: jest.fn(() => 'signed-token-baby'),
  verify: jest.fn(),
  });
  //---------------
  const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
  });

  이런식으로 설정하여 사용한다
  설정된 함수는 테스팅 모듈을 포함할때 useVale에 포함한다.

# 7.2 mocking part two

# 7.4 recap

# 7.5

- 테스트를 제외해도 되는 부분 설정(package.json)
  "coveragePathIgnorePatterns": [
  "node_modules",
  ".entity.ts",
  ".constants.ts"
  ]
  이런식으로 설정
  test:cov에서 현재 얼마나 테스트가 완료됐는지 계산해서 퍼센테이지를 보여주는데
  entify파일과 constants 파일은 테스트 할필요가 없으니 제외하기위해서 poackage.js에 추가해준다

- 테스트하는 방식은 테스트 하는사람의 자유
- toHaveBeenCalled() 몇번 호출됐는지 상관없이 호출됐는지만 확인(안쓰여서 부가 설명)
- npm run test:cov 얼마나 테스팅이 진행됐는지 퍼센테이지와 어디가 진행안됐는지 모니터링 해줌

# 7.8

- beforeAll 과 beforeEach차이
  beforeAll 각 테스팅시 호출스택을 공유하고 beforeEach은 각 테스팅마다 호출을 별개의것으로 구분한다

# 7.9 findById

- mockResolvedValue와 mockReturnValue의 차이
  반환값이 있을때 promise를 return 하는가 아닌가의 차이
  반환값이 promise를 return하면 mockResolvedValue
  (ex. save,findeOne..등 보통 여기선 DB를 제어하는 함수인경우)
  반환값이 promise를 return하 않으면면 mockReturnValue
  (ex. create..등 보통 여기선 일반 javascript 함수인경우 물론 예외도 있음)
  가장 중요한건 mockResolvedValue와 mockReturnValue는 반환값을 mocking하는것

# 7.12 verifyEmail 테스팅

# 8 UNIT TESTING JWT AND MAIL

# 8.1 jwt service unit test

# 8.2 mail service unit test

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

# 9 E2E Testing 나중에 보기

# 10 RESTAURANT CRUD

# 10.0 RESTAURANT MODELS

## Restaurant model

- name
- category(foreign key)
- address
- coverImage

- create restaurant.entity.ts
- create category.entity.ts

- relation 정의 (Restaurant와 Category의 관계 정의)
  OneToMany and ManyToOne

# 10.1 relationship and inputtype

- inputType 설정
  relation이 정의된 entity간은 서로 @InputType의 첫번째 인자에
  인풋시 정의될 인풋호출명?을 설정한다

# 10.2 restaurant 기본 구성 설정 및 Code Cleanup

# 10.3 createRestaurant

category가 존재하지 않으면 그 category를 새로 만들고 싶고
존재한다면 그 category를 get하고 싶음

또한 어떻게 category를 찾을지도 정의해야함(slug)

# 10.4 Roles part one 메타데이터 사용(SetMetadata 사용법)

- SetMetadata를 이용한 role Decorator만들기

restaurant의 resolver에는 user를 위한 기능, delivery를 위한기능, owner(사장)을 위한 기능이 각각있는데
이 구분을 SetMetadata로 지정해서 구분해줌

# 10.5 // 모든resolver에서 AuthGuard를 사용하고싶다면 APP_GUARD를 이용하면됨

- 메타데이터가 설정됐으면 해당 resolver는 public이면 안됨
  (즉 메타데이터가 설정됐다면 user의 role을 확인해야 한다는 뜻)
- 메타데이터가 설정안됐다면 user auithentication을 신경쓰지 않는다는 의미
  예컨데 user의 createAccount나 login에는 메타데이터가 필요하지 않음
  (누구나 만들거나 로그인 시도 할수있어야하니깐)

- 설정한 metadata를 불러와서 사용하는 방법
  여기선 auth.guard.ts에서 설정된role메타데이터를 불러와서 사용함

- authGuard는 CanActivate를 상속받음
  따라서 AuthGuard 는 true 또는 false만 return 함
  true를 반환하면 request진행이 허용됨
  false를 반환하면 request진행이 불가함을 결정

- 메타데이터를 설정했다는건 로그인된 상태이길 기대하는 것임
  //정리 : 메타데이터로 owner만 접근 가능하게 resolver에서 setmetadator로 설정된 resolver가 있는데
  //만약 로그인한 유저가 client이거나 deliver라면 해당 resolver의 기능은 사용할수없고
  // 오직 owner의 권한을 가진 user가 로그인해야만 해당 기능을 사용 가능함

# 10.6 recap role part

# 10.7~8 editRestaurant

- @RelationId()
  정의된 relation 대상의 id를 가져옴
- 132

# 10.9 custom repository 방법 3가지

이번엔 catogory repository를 custom하는데
해당 category repository를 로드할 때마다 getOrCreate를 실행해줌

# 10.10

// update를 한다면 id를 같이 보내줘야함
// 만약 id를 보내지 않는다면 새로운 객체를 insert하겠다는 의미가 됨

# 10.11 delete restaurant

1. resolve 만들고 필요한 인자값은 restaurantId, 반환되는 결과값은 ok error
2. DTO만들기
3. service에 실제 사용되는 함수 구현

# 10.12 category part one

- 모든 카테고리를 찾아주는 함수 => input이 필요하지않음
  category part를 새로운 모듈로 만들지 않는 이유는 단지 규모가 너무 작아서 그렇기 때문 모듈을 따로 나눠도 상관없음

- @ResolveField
  매번 request마다 계산된 행동을 해줌
  (db와 별개의 움직임 graphql에서 자체적으로 동작하는 함수)

# 10.13 category part two => restaurant count

- restaurantCount라는 dynamic field를 만들었음
  해당 카테고리에 속하는 restaurant의 개수를 계산해줌
- @Parent()
  restaurantCount는 entity마냥 field형식으로 graphql의 return 값중 하나로 사용되고 Parent는 category라고 연결해줌
- ex

```
{
  allCategories {
    ok
    error
    categories {
      id
      slug
      name
      restaurantCount
    }
  }
}
```

이런식으로 사용된다고했을때

```
{
  "data": {
    "allCategories": {
      "ok": true,
      "error": null,
      "categories": [
        {
          "id": 1,
          "slug": "korean-bbq",
          "name": "korean bbq",
          "restaurantCount": 0
        },
        {
          "id": 2,
          "slug": "the-bestest-grater-food-restraurant",
          "name": "the bestest grater food restraurant",
          "restaurantCount": 1
        }
      ]
    }
  }
}
```

이런결과값을 가짐
(즉 각각의 category결과값에대한 restaurant가 count된 값을 계산해서 반환함)

# 10.14 category

- category에 해당하는 레스토랑을 검색
  (category를 통하여 restaurant를 검색하는것)
- relation옵션
  category를 통하여 restaurant를 검색할 수 있다는것은 category와 restaurant는 relataion으로 서로 묶여있다는 의미이다
  따라서 이경우 findOne같은 함수로 검색하여 category를 통하여 restaurant를 검색할때는 relations:['restaurant']를 옵션으로 추가해줘야한다

# 10.15 pagination feat category

- category에 해당하는 레스토랑을 검색시 pagination기능을 추가
- pagination을 수동으로 구현함

1. pagination에 필요한 dto 구성
2. restaurant정보를 무조건 다 불러오는게 아니라 25개씩 나눠서 불러옴
   (전엔 모든 카테고리에서 restaurant를 불러왔는데 그게아니라 따로 나눠서 25개씩 조건에 따라 나눠서 불러옴)
3. 불러온 25개의 restaurant 데이터를 category에 추가해줌
   (obect형식)
4. category 총 개수, category를 25개씩 나눈 총 페이지 수

# 10.16 restaurant with pagination

모든 레스토랑 검색

- findAndCount는
  // findAndCount는 array를 반환하는데 총 검색된 데이터와 count 된 개수를 array안에 포함해서 반환한다.

# 10.17 Restaurant and search

아이디로 레스트랑을 검색하던가 레스토랑 이름으로 레스토랑을 검색하는 두가지 방법을 구현
findRestaurantById
searchRestaurantByName

- Like사용법 sql 명령어중 하나임
  // like는 비슷한 값을 찾아주는것
  // 여기선 query라는 단어가 앞뒤 중간 어디라도 포함된다면 검색해달라는 뜻
  // 만약 Like(`${query}%`) 이런식이라면 query라는 단어로 시작되는 데이터를 검색해달라는 뜻
  name: Like(`%${query}%`),

# 10.18 ILike sql문 사용법

Like는 대문자 소문자를 구분검색 ILike는 대소문자 구분없이 검색

- Raw는 nest에서 제공하는 typeorm이 아닌 수동으로 sql문을 사용하고 싶을때

For those who use MySQL, LIKE is already case-insensitive. If you want to search case-sensitively, you have to use BINARY.
이미 sql의 like는 대소문자를 구분하지 않음
오히려 대소문자를 구분하고 싶다면 BINARY를 사용해야함
아래 예시 참조
ex) Raw(name => `${name} LIKE BINARY '%${query}%'`)

# 11.0 dish entity

-

1.  dish.entity.ts만든다
2.  app.module에 엔티티 추가
3.  restaurant와 @OneToMany관계 설정
    restaurant와의 관계는 레스토랑이 one dish가 many
    (즉 하나의 restaurant은 여러개의 dish를 가지고있을수있다)
4.  이때 dish는 restaurant에 {onDelete:CASCADE}속성을 가짐
    (restaurant가 삭제된다면 restaurant에 연결된 모든 dish가 같이 삭제됨)
5.  dish.entity.ts에서 @RelationId()데코레이션을 이용하여 restaurantId 을 가져옴
    (RelationId는 foreign key이다)

# 11.1 dish option

예를들면 피자를 주문할때 선택하는 맛(옵션)
ex..피글빼주세요, 치즈 더 추가해주세요..등등

- create-dish

1. create dish시 DishOption과 관련된 항목을 dish.entity에 추가
   DishOption은 type:json 형식이다
   (구조화된 데이터를 저장하거나 특정 형태를 가진 데이터를 저장해야할때 json type을 사용)
   완전 정석으로 하려면 json type이 아니라 새로운 DishOption entity를 만들고 relation 정의를 해주고...등등 해줘야함
2. create-dish.dto.ts 만들어준다
3. dish resolver를 restaurant.resolver.ts파일에 추가해줌
4. createDish기능을 dish resolver에 추가
5. createDish의 실제로 작동되는 기능은 restaurants.service.ts 에 추가
6. 이때 레스토랑 검색시 relation관계에 있는 menu도 같이 검색가능하게 만들기위해

```
findRestaurantById의 레스토랑 검색하는 부분을
const restaurant = await this.restaurants.findOne(restaurantId, {
        relations: ['menu'],  //<== 추가된 부분
      });
```

로 변경

# 11.2 create dish service안에 createDish의 method만들기

# 11.3 edit dish, delete dish

# 11.4 Order Entity

주문 기능을 위해 order모듈 생성 및 entity파일 생성

- nest g mo orders

- ManyToMany관계
  서로 여러개를 가짐 dish는 order를 여러개 가지고 order또한 dish를 여러개 가짐

- order.entity.ts 작성(DB 테이블 만들기)

- 테이블간 relation을 정의

- relation정의된 field는 @column() 데코레이션 안써도됨

# 11.5

- createOrder의 resolver,service, appModule 및 DTO 생성

# Json형식의 object Type Entity

- 일종의 가상 entity같은 느낌...entity인데 json형식임

# 11.6 dish option을 위한 추가 작업

- order-item 만들기
- relation은 반대쪽에 항상 설정해줘야하는건아님(접근을 원할때만 설정)
  ex) ManyToOne설정을 했다면 반대편에도 OneToMany설정을 해줘야하는가? ㄴㄴ

# 11.7 실제로 createOrder기능 만들기

# 11.8 자잘한것들 수정

그리고 createOrder 테스트(client 권한으로)

# 11.9

service 추가

# 11.10

forEach return할수없다(에러 핸들링이 불가능)
따라서 forEach를 for로 변경 (orders.serivice.ts)

# 11.11

# 11.12 getOrders part One

- 주문 현황 확인
  고객은 자신이 주문한 내용을 전부 보고싶을꺼고
  주인은 자신이 주문 받은 내용을 전부 보고싶을것이고
  배달원또한 자신이 배달하려는 주문을 모두 보고싶을 것이다
  따라서 getOrders의 권한은 로그인한 모든 사람 Any(로그인을 햇다면 누구나 접근가능)

* flat() 중첩 배열 평탄화 및 배열의 빈값 제거

- 중첩배열 평탄화 예시

```
const arr1 = [1, 2, [3, 4]];
arr1.flat();
// [1, 2, 3, 4]

const arr2 = [1, 2, [3, 4, [5, 6]]];
arr2.flat();
// [1, 2, 3, 4, [5, 6]]

const arr3 = [1, 2, [3, 4, [5, 6]]];
arr3.flat(2);
// [1, 2, 3, 4, 5, 6]

const arr4 = [1, 2, [3, 4, [5, 6, [7, 8, [9, 10]]]]];
arr4.flat(Infinity);
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

# 11.13 getOrder 주문 하나를 가져옴

# 11.14 edit Order 주문수정(주문 진행 단계 변경)

- 정확히 말하면 주문의 단계를 변화시키는것임
  (1.유저가 주문함 2. 레스토랑이 주문받고 요리 시작 3. 요리완성..등등...)

- 에러를 직접 핸들링하거나 상상할수 있는 에러나 해커의 공격을 최대한으로 상상하여 방어적으로 코드를 작성하는것을 defensive programming 이라고 하는듯

# 12

# 12.0 Subscriptions part One

- graphql-subscriptions 설치
  npm install graphql-subscriptions

- const pubsub = new PubSub() 을 이용하여 구현

- app.module.ts의 Graphql설정에서 installSubscriptionHandlers: true을 옵션으로 주고 subscription웹소켓을 활성화 시킴
  (다만 이럴때 원래 서버는 http request를 먼저 받아와야하는데 웹소켓을 먼저 받아오는 방식으로 활성화돼서 작동이안됨 )
  따라서 웹소캣에서 http를 받아오려면 또다른 설정이 필요함 #12.1 에서 계속

# 12.1 Subscriptions part Two

- context에서 connection이라는 것을 사용함
- graphql 웹소켓은 Request가 없고 Connection이라는게 존재함
- http는 매번 request할때마다 토큰을 보내지만 graphql subscription 웹소켓은 한번만 보냄그리고 연결이 끊어지지 않음

- 서버에서 graphql subscription을 만들어두면 graphql에서 해당 기능을 listening중이고
  해당 subscription을 정해진 규칙을 이용하여 웹소켓을 통하여 실시간 통신함

# 12.2 subscription Authentication part one

- subscription 보호하기
- app.module.ts graphql의 context 옵션 설정
  http와 웹소켓을 동시에 사용하는방법을 알아내야함
  // request가 있는 경우엔 request http headers에서 TOKEN KEY를 가져오고
  // reuqest가 없는경우엔 graphql web socket connection 에서 TOEN KEY를 가져온다

# 12.3 subscription Authentication part Two

- auth.guard.ts 수정 & userModule에서 UsersModule을 import해줌

- 이설정으로 이제 subscript 웹소켓일때와 http일때 둘다 인증과정 확인가능

# 12.4 pubsub

- pubsub 사용방법 및 pobsub의 기능 좀더 살표보기

# 12.5 Subscription Filter

- filter설정을 안해주면 내가 원하지 않는 부분도 Subscription해버린다.
  ex order id가 1인 내용만 Subscription하고싶은데 order id가 6이건 33이건 다른 조건도 Subscription해버린다던지...

  // 특정조건만 Subscription 할수있게 필터링해주는것
  // filter에는 3개의 인자를받는다(filter(payload,variables,context))
  // 1. payload는 potatoReady 등 같은 함수에서 전달받은 값
  // 2. variable은 listening을 시작하기 전에 subscription에 준variables를 가진 object

  ```
    ex 그래프큐엘에서 구독하는 방법
    subscription{
      readypotato(potatoId:1)   <= 여기서 1이 variable
    }
  ```

# 12.6 Subscription Resolve 설명

subscript에서 전달받은 payload를 기준으로 custom function을 만들어 반환해줌
(일반적인 resolver개념이랑 비슷한듯)

- 정리
  update를 받을지 말지는 Subscription Filter가 결정하고
  Subscription Resolve는 output의 모습을 바꿔줌

# 12.7 pendingOrders Subscription part One

- order를 업데이트한뒤 그 업데이트한 값을 반환받아서 Subscription에 pubsub을 이용하여 subscription 웹소켓서버로 업테이트값을 전달한다
  본격적으로 subscription trigger를 이용하여 order정보를 전달하고 전달받는 작업

# 12.8 pendingOrders Subscription part Two

- owner가 음식 준비를 완료하고 픽업할 준비가 되면 trigger되는 subscription이다

# 12.9 cookedOrders delivery 만 볼수있는 구독 기능

- create가 있는 상태의 반환값이랑 없는 상태의 반환값이다름
  (create가 있는경우는 order의 반환값이 모든 relation을 포함하여 잘 return됨)

- delivery는 모든 order를 전부 실시간으로 subscription해야하니 filter function을 사용하지 않음

````
      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          // relationship을 저장하는것
          // manyToMany임
          items: orderItems,
        })
      );
      ```
````

(create가 없는경우 업데이트된 상태를 반환못하고 또한 필드에 포함된 컬럼중 일부 컬럼만 반환됨)

```
    const newOrder = await this.orders.save({
        id: orderId,
        status,
      });
```

# 12.10 eager relation 은 DB에서 entity를 load할때마다 자동으로 load되는 relation을 정함

그니깐

```
 const order = await this.orders.findOne(orderId, {
        relations: ['restaurant'],
      });
```

이런식으로 relations: ['restaurant'], 옵션 안줘도 relation관계 데이터가 default로 불러와질수있게 설정하는것

- 별개로 lazy relation이라는게 있는데 이건 order에 있는 restaurant정보를 가져오고싶다면
  await order.restaurant.fineOnd(.....)
  이런형식으로 사용

- editOrder가 성공적으로 update됐다면 subscription trigger를 작동하여 구독기능 작동

# 12.11 orderUpdates

- order정보가 수정되면 order와 '관련된' 모든 로그인된 사용자는 수정정보를 실시간으로 확인할 수 있다.

# 12.12 take order

// 배달원이 주문을 접수하는 기능
// 배달언이 주문 접수를 안했을때 order의 driver부분은 null상태
// 배달원이 주문접수를 하면 order에 주문접수한 driver정보(이 주문을 배달하기 위한 배달원의 정보)를 업데이트 하는것

- 주문에 배달원 할당되면 미리 만들어둔 orderUpdates 구독기능을 동작시켜서 해당 주문과 관련된 로그인한 모든 user에게 실시간으로 변동사항을 알림

# 13 PAYMENT 결제방식

- stripe
- braintree
- 카카오페이
- 나이스페이

# 13.1 ~ 13.2 create Payment Module And setting

- nest g module payments
  모듈 만들고 세팅
  resolver, service ,entity, dto, app.module.ts세팅 등등 간단한 기본세팅

# 13.3 createPayment part

- createPayment 부분

# 13.4 getPayments

- 레스토랑 주인이 결제정보 읽어오는 기능

# 13.5 @nestjs/schedule

- npm install --save @nestjs/schedule

- 원하는 time interval 또는 정해진 시간과 날짜에 function을 실행할 수 있게 만듬

- cron pattern
  https://docs.nestjs.com/techniques/task-scheduling
  여기서 예시 확인
  (크론은 정확한 시간을 기준으로 반복하는것임)

- @Interval()
  ex
  @Interval(5000)은 실행된 순간을 기준으로 5초마다 반복한다는뜻임(고정된 시간 아님)

- @Timeout()
  ex
  @Timeout(20000)은 20초 뒤에 딱 한번만 실행됨
  @Timeout('notification',20000) 이런식으로 이름을 지정해서 실행하면
  이 Timeout을 제어할 수 있음

  Timeout뿐만아니라 이름을 붙이면 해당 기능을 제어가능하다.

예를 들면 이 기능들을 조합해서 로그인후 30분마다 로그아웃해주는 기능을 만든다던지..
(따로 연장 버튼을 클릭해야 로그인 연장) 또는 일정 기간동안 아무작업을 안하면 로그인된다던지...

스케쥴을 미리만들어두고 특정 타이밍에 추가하거나 삭제하거나... 등등 고급제어가 가능

// 크론패턴으로 얼마나 반복할건지 정의
//30초 매분 매시 매일 매달 매주 마다 실행함 즉
// 즉 매분 초침이 30초를 가리킬때 실행함(무한반복)
// 이 Cron기능을 제어하기위해서 myJob이라는 이름을 붙여줌
ex)

```
@Cron('30 * * * * *', {
  name: 'myJob',
})
checkForPayments() {
  console.log('Checking for payments....(cron)');
  // 해당 기능을 제어하기위한 설정
  // 이건 크론잡이 얼마나 실행됐나를 가져옴
  const job = this.schedulerRegistry.getCronJob('myJob');
  // 매분 30초마다 실행되는 checkForPayments()함수를 멈춤
  job.stop();
}

// 실행된 순간을 기준으로 5초마다 반복한다는뜻임(고정된 시간 아님)
@Interval(5000)
checkForPaymentsI() {
  console.log('Checking for payments....(interval)');
}

@Timeout(20000)
afterStarts() {
  console.log('Congrats!');
}

```

# 13.6 Promoting Restaurants

payment를 create할때 restaurant를 promote하는 방법

레스토랑 프로모션 기간 기능 추가(7일)
(이때 뭐 이벤트처럼 프로모션기간의 레스토랑을 상단에 뜨게 해준다던지... 그런 기능들)

# 13.7 Promoting Restaurants part Two

// 날짜가 만료됐음에도 여전히 promote되고있는 restaurant를 체크하는것
그리고 검색된 레스토랑이 있다면 프로모션 상태를 off해준다
(isPromote=false promotedUntil=null 처리 해서 DB에 저장해준다(update))

# 13.8 end of backend

# restaurant.entoty.tsx category eager 추가

```
  @Field(type => Category, { nullable: true })
  @ManyToOne(
    type => Category,
    category => category.restaurants,
    { nullable: true, onDelete: 'SET NULL', eager: true } <=== 추가
  )
  category: Category;
```

# restaurant.service.ts

pageSize변수로 페이지당 컨텐츠개수조절

# 추가 부분

- myRestaurants owner가 자기가 등록한 레스토랑 정보를 전부 보고싶음

- myRestaurant owner가 자기가 등록한 레스토랑 중 하나의 정보를 알고싶음

- restaurant.entity.ts에 category relation에 eager:true 설정

# 20.2 file upload part one

basic setting up

# 20.3 file upload

-apply aws sdk
https://github.com/aws/aws-sdk-js 참고

계정 로그인후

1. https://console.aws.amazon.com/iam/home?#/home 접속
2. 사용자 클릭(user)
3. 사용자 추가 클릭
4. 사용자이름 nestUpload 하단에 select AWS access type에는 프로그래매틱 액세스 체크
   (AWS와 통신하는 서버라는 의미)
5. attach existing policies directly(기본정책 직접연결)클릭
6. s3검색
7. 검색결과에서 AmazonS3FullAccess 선택
8. 하단의 set permissions boundary 클릭(권한 경계 설정)
9. create user without a permission boundary 선택((권한 경계 없이 user 생성)
10. next클릭
11. tag설정 skip(next 클릭)
12. 최종 검토(확인) 후 마지막 사용자 생성 클릭
13. 액세스 키 ID와 비밀 액세스 키 어딘가에 저장
    (특히 비밀 액세스키는 딱 한번밖에 안보여주니 꼭 저장)
14. 업로드를 위한 아마존 세팅끝
15. backend에서 보일러 플레이트 대로 세팅끝내고 사용
    https://s3.console.aws.amazon.com/s3/home 확인가능
16. 이때 백엔드의 버킷이름과 동일하게 aws s3에서도 버킷을 생성해줘야함

# 20.4 backend cors설정(백엔드로 접근가능하게)

- main.ts에서 app.enableCors() 적용

# 20.5 CreateRestaurantOutput DTO에 restaurantId?: number; 추가

# 22.6 create-order.dto.ts의 CreateOrderOutput에 orderId 반환 추가

```
@ObjectType()
export class CreateOrderOutput extends CoreOutput {
  @Field(type => Int, { nullable: true })
  orderId?: number;
}
```

# 23.1 fix bugs...

createOrder부분 mutation끝나고 orderId반환안하는거랑 dish option중 extra가 0원인경우 에러나는부분 수정

# 24 DEPLOY TO PRODUCTION

처음엔 nest build를 실행하여 dist폴더안에 javascript로 변환된 파일들이 모임

1. heroku cli 설치
2. heroku login
3. git init (이미 존재하면 안해도됨)
4. 이후 진행
5. git add .
6. git commit -am "make it better"
7. git push heroku master
8. git push -u origin master(깃 레포지토리에 업데이트는 따로해줘야함 헤로쿠랑 업로드랑 별개)

- Procfile (확장자 없는 파일을 root에 만들어줌)
  heroku에 deploy 할때 옵션
  https://devcenter.heroku.com/articles/procfile 참고
