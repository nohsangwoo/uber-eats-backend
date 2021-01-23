import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { MailService } from 'src/mail/mail.service';

// 서비스 파일의 상용구
@Injectable()
export class UserService {
  constructor(
    //  user Entity를 사용하기위한 상용구
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      // DB안에서 해당내용을 찾아 가장 첫번째 결과를 가져와서 exists 변수에 넣어줘라
      const exists = await this.users.findOne({ email });
      // 만약 존재하면  오브젝트를 반환하는데
      //error:이메일이 있다는 경고문 저장, ok:false저장
      //위 오브젝트를 반환한다
      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      }
      // resolver에서 전달받은 email,password,role변수를 create하여 자바스크립트 상에 저장하여 object를 준비하고
      //준비된 object를 save하여 실제 DATABASE에 저장한다
      const user = await this.users.save(
        this.users.create({ email, password, role })
      );
      const verification = await this.verifications.save(
        this.verifications.create({
          user,
        })
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      // email로 유저 찾아서 없으면 false와 에러문을 반환
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] }
      );
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }

      // 비밀번호가 맞는지 확인
      //위에 users에서 찾은값을 저장한 user변수와는 전혀 상관없는
      // user.checkPassword의 user (이건 user entity에서 온 user이다)
      // user entity에서 checkPassword 함수 실행(password전달)
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }

      // 비밀번호가 맞으면 토큰 발급(세션 유지용  )
      // 토큰이 암호화는 되지만 누구나 볼수있고
      // 디코딩 방법도 어렵지 않아서 user의 id 정보만 저장
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error: "Can't log user in.",
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return { ok: false, error: 'User Not Found' };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (email) {
        user.email = email;
        user.verified = false;
        await this.verifications.delete({ user: { id: user.id } });
        const verification = await this.verifications.save(
          this.verifications.create({ user })
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return { ok: false, error: 'Could not update profile.' };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne(
        { code },
        { relations: ['user'] }
      );
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verifications.delete(verification.id);
        return { ok: true };
      }
      return { ok: false, error: 'Verification not found.' };
    } catch (error) {
      return { ok: false, error: 'Could not verify email.' };
    }
  }
}
