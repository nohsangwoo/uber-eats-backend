import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    // app.module.ts에서 mail.module.ts를 통해 전달받은 인자(apiKey,domain,fromEmail)를 사용하기위한 상용구
    // 이때 ㅂMailModuleOptions형식으로 받아온다.
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions
  ) {}

  //  이 밑에 부분은 그냥 보일러플레이트(상용구)라고 보면됨 메일 사용하는 방법은 이렇게 사용하면 된다~ 이거임
  async sendEmail(
    subject: string,
    template: string,
    emailVars: EmailVar[]
  ): Promise<boolean> {
    const form = new FormData();
    form.append(
      'from',
      `Nico from Nuber Eats <mailgun@${this.options.domain}>`
    );
    // form사용방법
    form.append('to', `fairyfloss0909@gmail.com`);
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach(eVar => form.append(`v:${eVar.key}`, eVar.value));
    try {
      // got패키지를 이용하여 post를 request함
      // 어디로? : 메일 서버로 메일보내달라고!
      // 그럼 메일서버에서 메일보낸요청에대하여 성공했는지 실패했는지 응답이 오고
      // 그 응답결과에따라 행동을 지정하면됨 여기선 try catch로 핸들링함
      await got.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`
            ).toString('base64')}`,
          },
          body: form,
        }
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    // 제목 , template이름, 사용되는(전달되는)  변수
    this.sendEmail('Verify Your Email', 'verify-email', [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
