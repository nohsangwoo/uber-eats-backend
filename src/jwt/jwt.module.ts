import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOptions } from './jwt.interfaces';
import { JwtService } from './jwt.service';

@Module({})
//이제 이 모듈은 다른모듈 어디서든 제약없이 불러다 사용할수있음
@Global()
export class JwtModule {
  // 스태틱 모듈 안에서 다이나믹 모듈을 구성하기위해 이렇게 설정한것임
  // 따라서 forRoot라는 이름은 편의상 헷갈리지 않게 forRoot로 지었고
  // 해당 forRoot는 일반적인 옵션 설정을 하듯이
  // privateKey:string 인 형식을 JwtModuleOptions interface에서 불러옴
  // 또한 DynamicModule은 단지 다른 모듈을 반환하기위한 모듈임
  // 정확한 비유는 아니지만 DynamicModule은 styled components 에서의 css기능과 비슷한 느낌
  // 모듈 안에서 또다른 모듈을 불러오기위한 ...
  //static함수는 그냥 바로 실행되는 함수
  // 정적 메서드는 클래스의 인스턴스 없이 호출이 가능하며 클래스가 인스턴스화되면 호출할 수 없다. 정적 메서드는 종종 어플리케이션의 유틸리티 함수를 만드는데 사용된다.
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      //app.module.ts에서 스태틱모듈형식으로 만들고
      //jwt.module.ts에서 다이나믹 형식으로 모듈을 만들어 구동하게끔 만든다
      // 말하자면 스태틱 모듈인 JwtModule이 자기 자신을 다이나믹 모듈형식으로 호출하여 옵션 설정을함
      module: JwtModule,
      // CONFIG_OPTIONS라는 상수와
      // options의 정보를 JwtModule 안의 전역에서 사용가능하도록 providers에 추가해줌
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        //위와 마찬가지의 이유로 JwtService파일을 추가해줌
        JwtService,
      ],
      // JwtService파일을 JwtModule에서만 사용하는게 아니라
      // 다른 모듈에서도 JwtService파일을 불러와 사용할수 있도록 설정해줌
      exports: [JwtService],
    };
  }
}
