import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MailModule } from './modules/mail/mail.module';
import { EventModule } from './modules/events/events.module';
@Module({
  imports: [AuthModule, UsersModule, MailModule, EventModule],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule { }
