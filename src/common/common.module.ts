import { Global, Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from './common.constants';

const pubsub = new PubSub();

// 전지역에서 사용할수있게 해줌
@Global()
@Module({
  providers: [
    {
      // 다른곳에서도 PUBSUB을 사용하기위해 providers에 추가해줌
      provide: PUB_SUB,
      useValue: pubsub,
    },
  ],
  //   PUBSUB을 common.module.ts에서만 사용하지 않고
  // 다른 모듈들에서도 다 끌어와 사용하고싶을때 이렇게 설정함
  exports: [PUB_SUB],
})
export class CommonModule {}
