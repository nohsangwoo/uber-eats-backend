import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Category } from './restaurants/entities/cetegory.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { Dish } from './restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';

@Module({
  imports: [
    // dotenv를 불러오는 nestjs방식
    // Joi는 자바스크립트용 Validation 해주는 라이브러리
    // 여기서 validation된 key는 하단에서 import된 모듈에서 끌어다 사용가능함
    ConfigModule.forRoot({
      isGlobal: true,
      // package.json에서 설정한 NODE_ENV의 값에따라서 불러오는 env파일을 다르게함
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      // 서버에 deploy할때 환경변수 파일을 사용하지 않는다는 뜻
      // 여기선 prod상태일때만 사용하지 않음
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'prod', 'test')
          .required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        //for jwt tokken
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      //  synchronize : TypeOrm이 Entity를 찾고 알아서 migration 해주는 작업
      // DB의 구성을 자동으로 바꿔줌
      // 하지만 이번엔 Production모드가 아닐때만 synchrinize가 실행됨
      synchronize: process.env.NODE_ENV !== 'prod',
      // 현재 돌아가고있는 DB의 모든 log를 불러오게 해주는 옵션
      logging:
        process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test',
      // entity를 사용하려면(DB 구조) entity항목을 여기에 추가해줘야함
      entities: [
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
      ],
    }),
    GraphQLModule.forRoot({
      // subscriptions의 웹소켓을 활성화하기위한 설정
      installSubscriptionHandlers: true,
      // 스키마 파일을 따로 만들어두지 않고 자동으로 생성해줌
      autoSchemaFile: true,
      // http의 request object를 graphql 형식으로 use라는 값에 담아 모든 resolver에서 사용가능하게 설정
      // 이렇게되면 매번 모든 request를 get할시에 적용된다.
      context: ({ req, connection }) => {
        // request가 있으면 http의 user정보를빼와서 반환해줄텐데
        // 하지만 request가 없음
        const TOKEN_KEY = 'x-jwt';
        return {
          // request가 있는 경우엔 request http headers에서 TOKEN KEY를 가져오고
          // reuqest가 없는경우엔 graphql web socket connection 에서 TOEN KEY를 가져온다
          token: req ? req.headers[TOKEN_KEY] : connection.context[TOKEN_KEY],
        };
      },
    }),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
    }),
    AuthModule,
    UsersModule,
    RestaurantsModule,
    OrdersModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(JwtMiddleware)
//       // 이 미들웨어를 정확이 어디 라우트에 적용하고 싶은지 설정가능
//       //  forRoutes를 통해 "/graphql"라우트이고 메소드가 post인 경우에만 적용
//       // 만약 특정 경로만 제외하고 싶다면 forRoutes 대신 exclude를 사용하여 경로와 메소드를 지정하면 해당 조건을 제외하는 구간에서 전부 미들웨어를 적용해줌
//       .forRoutes({ path: '/graphql', method: RequestMethod.POST });
//   }
// }
