import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOptions } from './jwt.interfaces';

//서비스 파일의 상용구
@Injectable()
export class JwtService {
  constructor(
    // option을 JwtModuleOptions형식으로 받아와서 사용할꺼라고 선언
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions
  ) {}
  // 받아온 id를 jwt으로 인코딩하여 토큰을 생성해줌
  sign(userId: number): string {
    //사실 ConfigService로 this.ConfigService.get("privateKey")이런형식으로 불러와 사용할수도있음(이게 더 편한듯)
    return jwt.sign({ id: userId }, this.options.privateKey);
  }

  //client단에서 전달받은 token이 서버단에서 가지고있는 token이랑 같은지 비교해줌
  //jwt middleware에서 일단 사용됨
  verify(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}
