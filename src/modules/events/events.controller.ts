import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { EventService } from './events.service';
import { CreateEventDto } from './dto/event.dto';

@Controller('events')
export class EventController {
    constructor(private readonly eventService: EventService) { }

    @Post('create')
    async createEvent(@Body() createEventDto: CreateEventDto) {
        return this.eventService.createEvent(createEventDto);
    }
    @Get()  // Add this decorator to map the GET /events route
    getAllEvents() {
        return this.eventService.getAllEvents();
    }

    @Get(':id')
    getEventById(@Param('id') eventId: string) {
        return this.eventService.getEventById(eventId);
    }
}
