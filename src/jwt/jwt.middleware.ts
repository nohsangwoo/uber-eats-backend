import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

@Injectable()
// NestMiddleware라는 interface를 implements 한다
// NestMiddleware interface는 use라는 property가 필요함
export class JwtMiddleware implements NestMiddleware {
  // 끌어와 사용하고싶은 변수나 모듈은 constructor에 설정
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    //request.headers['x-jwt']에 저장된 토큰값을 뽑아온다
    //request 말그대로 요청한다는 뜻 뭔가를 가져오거나 하는걸 요청할때
    //response는 반대로 응답하는 작동 (client로 부터의...)
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      try {
        // client의 headers['x-jwt']로 부터 가져온 값이 서버단에서 기억하고있는 토큰값과 일치하는지 확인하기위한 작업
        const decoded = this.jwtService.verify(token.toString());
        // decoded의 타입이 object이고 동시에 decoded의 property중 id가 존재한다면 진행
        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          // 토큰을 보낸 유저의 id를 이제 decoded['id'] 에서 확인할수 있고
          // 해당 변수로 유저를 찾아오고 결과를 반환한다
          const { user, ok } = await this.userService.findById(decoded['id']);
          // 성공적으로 user가 불려와지면 requset["user"]에 user정보를 담는다
          if (ok) {
            req['user'] = user;
          }
        }
      } catch (e) {}
      // next() : 현재 라우터에서 판단하지 않고 다음 라우터로 넘기겠다.
      // 상단작업에서 req, res작업을 해준이후에는 next()함수를 호출해줌
    }
    next();
  }
}
