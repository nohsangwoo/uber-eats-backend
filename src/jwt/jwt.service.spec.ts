import { Test } from '@nestjs/testing';
// jsonwebtoken을 import해서 사용할꺼지만 mocking하기때문에 이경우는 값이 대체됨
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtService } from './jwt.service';

const TEST_KEY = 'testKey';
const USER_ID = 1;

// jsonwebtoken을 import할때 해당 모듈을  mocking함
// (즉 jwt 를 사용하면 이 값으로 대체됨)
jest.mock('jsonwebtoken', () => {
  return {
    // jsonwebtoken가 사용되는 함수를 설정
    // 이 경우 sign에서 jsonwebtoken을 사용하려 할 때 TOKEN을 무조건 반환하도록 설정
    sign: jest.fn(() => 'TOKEN'),
    // 이 경우는verify에서 jsonwebtoken을 사용하려 할 때 id:USER_ID의 오브젝트값을 반환하도록 설정
    // USER_ID는 상단에 initial했음
    verify: jest.fn(() => ({ id: USER_ID })),
  };
});

describe('JwtService', () => {
  let service: JwtService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { privateKey: TEST_KEY },
        },
      ],
    }).compile();
    service = module.get<JwtService>(JwtService);
  });

  // service가 정의됐는지 확인(정상적으로 JwtService 불러왔는지 확인)
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('should return a signed token', () => {
      const token = service.sign(USER_ID);
      expect(typeof token).toBe('string');
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenLastCalledWith({ id: USER_ID }, TEST_KEY);
    });
  });

  describe('verify', () => {
    it('should return the decoded token', () => {
      const TOKEN = 'TOKEN';
      const decodedToken = service.verify(TOKEN);
      expect(decodedToken).toEqual({ id: USER_ID });
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(TOKEN, TEST_KEY);
    });
  });
});
