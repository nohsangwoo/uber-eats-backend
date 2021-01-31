import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserService } from './users.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'signed-token-baby'),
  verify: jest.fn(),
});

const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});

// type MockRepository는 Repository의 모든 함수를 말하는데
// 이함수들의 타입이 jest.Mock함수인 것이다.
// for javascript (그냥 복붙 ㄱㄱ)
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  // UserService 를 testing에 불러와 사용하고자 하는 작업 - 1
  // 나머지 작업도 같은의미
  let service: UserService;
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  // NestJs의 모든것을 사용하려 테스팅 모듈을 만들어준다
  beforeEach(async () => {
    // 테스팅 모듈은 import가 필요함
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        // repository를 포함하고 있는 모듈에서
        // repository를 가짜로 속이려고 만드는 설정
        // 즉 Mock repository를 생성 => 이런 일련의 작업을 mockicng 이라고함
        {
          // User의 repository 대체 함수를 제공하고
          provide: getRepositoryToken(User),
          // 그 안의 값들은 상단에서 mokcing된  mockRepository()로 대체한다
          useValue: mockRepository(),
        },
        {
          // Verification의 repository 대체 함수를 제공하고
          provide: getRepositoryToken(Verification),
          // 그 안의 값들은 상단에서 mokcing된  mockRepository()로 대체한다
          useValue: mockRepository(),
        },
        {
          // 위와 같은 개념 다만 repository가 아닌경우 그냥 불러옴
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();
    // UserService 를 testing에 불러와 사용하고자 하는 작업 - 2
    // 나머지 작업도 같은의미
    service = module.get<UserService>(UserService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
  });

  // service(UserService)가 정의 됐길 기대하는 테스팅함수
  // 즉 독림된 모듈로 분리되어 정의됐길 기대한다
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    // createAccount의 전달 받는 인자를 속이기 위해 가짜로 데이터를 생성
    const createAccountArgs = {
      email: 'bs@email.com',
      password: 'bs.password',
      //enum type은 이런식으로 불러와 준다
      // UserRole은 user.entity.ts에서 불러온다
      role: UserRole.Client,
    };

    // 사용자가 있다면 실패하길 기대하는 테스트
    it('should fail if user exists', async () => {
      // findOne함수가 사용하는 값을 mocking해준다
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: '',
      });
      // 그다음 계성생성하는 함수를 실행한다음 결과를 반환하여 result에 저장
      // role이 enum type이라서 inputType 안맞는다고 에러나는데 상관없음
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with that email already',
      });
    });
    // end of ...

    // 정상적으로 user를 생성했을때의 테스팅
    it('should create a new user', async () => {
      // fineOne의 반환된 데이터가 없다고 설정. 원문에서 exists로 반환되는데 이값이 없어야 나머지 구문이 진행되게 if문을 사용했음
      // 따라서 exists변수가 false인 경우 정상진행이 되기때문에 findOne을 false로 반환하게 하기위해 설정하는 값
      usersRepository.findOne.mockResolvedValue(undefined);
      // 상단에서 만들어진 createAccountArgs mock args를 재황용하여 create와 save함수를 테스트
      //  usersRepository.create의 반환값은 createAccountArgs 이다 라고 mocking
      usersRepository.create.mockReturnValue(createAccountArgs);
      // 이게 돼야 verification 테스트 진행가능
      usersRepository.save.mockResolvedValue(createAccountArgs);

      // 또한 verificationsRepository도 create와 save함수를 테스트
      verificationsRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      // 이게 돼야 mailservice 테스트 진행가능
      verificationsRepository.save.mockResolvedValue({
        code: 'code',
      });

      // UserService.createAccount를 실행하고 result에 결과값을 담았다고 가상환경에서 테스팅함
      // 이 result변수는 하단에서 테스팅용으로 재활용
      const result = await service.createAccount(createAccountArgs);

      // toHaveBeenCalledTimes : 이 함수가 한번만 호출될것을 기대함
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      // toHaveBeenCalledWith : 이 함수가 어떤 args 함꼐 호출될것을 기대함 (여기서는 createAccountArgs)
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

      // toHaveBeenCalledTimes : 이 함수가 한번만 호출될것을 기대함
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      // toHaveBeenCalledWith : 이 함수가 어떤 args 함꼐 호출될것을 기대함 (여기서는 createAccountArgs)
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      // 위와 같음
      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        // verificationsRepository.create는 createAccountArgs가 호출돼야한다는 이야기
        user: createAccountArgs,
      });

      // 위와 같음
      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      // 위와같음
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      // 여기선 두개의 인자와 같이 호출되길 기대하는데 각각의 인자타입은 String 과 String으로 기대함
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String)
      );
      // 모든것이 다 정상작동하면 함수의 반환값은 ok:true이길 기대한다
      expect(result).toEqual({ ok: true });
    });
    // end of create new user testing...

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error: "Couldn't create account" });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'bs@email.com',
      password: 'bs.password',
    };
    it('should fail if user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object)
      );
      expect(result).toEqual({
        ok: false,
        error: 'User not found',
      });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: 'Wrong password' });
    });

    it('should return token if password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({ ok: true, token: 'signed-token-baby' });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: "Can't log user in." });
    });
  });

  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };
    it('should find an existing user', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toEqual({ ok: true, user: findByIdArgs });
    });

    it('should fail if no user is found', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({ ok: false, error: 'User Not Found' });
    });
  });

  describe('editProfile', () => {
    it('should change email', async () => {
      const oldUser = {
        email: 'bs@old.com',
        verified: true,
      };
      const editProfileArgs = {
        userId: 1,
        input: { email: 'bs@new.com' },
      };
      const newVerification = {
        code: 'code',
      };
      const newUser = {
        verified: false,
        email: editProfileArgs.input.email,
      };

      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationsRepository.create.mockReturnValue(newVerification);
      verificationsRepository.save.mockResolvedValue(newVerification);

      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        editProfileArgs.userId
      );

      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationsRepository.save).toHaveBeenCalledWith(
        newVerification
      );

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code
      );
    });

    it('should change password', async () => {
      const editProfileArgs = {
        userId: 1,
        input: { password: 'new.password' },
      };
      usersRepository.findOne.mockResolvedValue({ password: 'old' });
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editProfile(1, { email: '12' });
      expect(result).toEqual({ ok: false, error: 'Could not update profile.' });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const mockedVerification = {
        user: {
          verified: false,
        },
        id: 1,
      };
      verificationsRepository.findOne.mockResolvedValue(mockedVerification);

      const result = await service.verifyEmail('');

      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object)
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });

      expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.delete).toHaveBeenCalledWith(
        mockedVerification.id
      );
      expect(result).toEqual({ ok: true });
    });

    it('should fail on verification not found', async () => {
      verificationsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail('');
      expect(result).toEqual({ ok: false, error: 'Verification not found.' });
    });

    it('should fail on exception', async () => {
      verificationsRepository.findOne.mockRejectedValue(new Error());
      const result = await service.verifyEmail('');
      expect(result).toEqual({ ok: false, error: 'Could not verify email.' });
    });
  });
});
