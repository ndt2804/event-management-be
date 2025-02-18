import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
    constructor(private readonly mailService: MailService) { }

    @Post('send')
    async sendMail(@Body() body: { to: string; subject: string; text: string }) {
        const { to, subject, text } = body;
        return this.mailService.sendEmail(to, subject, text);
    }
}
