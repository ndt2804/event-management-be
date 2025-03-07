import { Module } from '@nestjs/common';
import { EventService } from './events.service';
import { EventController } from './events.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    controllers: [EventController],
    providers: [EventService, PrismaService],
})
export class EventModule { }
