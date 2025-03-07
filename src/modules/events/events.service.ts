import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/event.dto';

@Injectable()
export class EventService {
    constructor(private prisma: PrismaService) { }
    async createEvent(data: CreateEventDto) {
        return this.prisma.event.create({
            data: {
                title: data.title,
                description: data.description,
                location: data.location,
                startDate: data.startDate,
                endDate: data.endDate,
                saleStartTime: data.saleStartTime,
                category: data.category,
                totalTickets: data.totalTickets,
                soldTickets: 0,
                organizer: { connect: { id: data.organizerId } },
            },
        });
    }
    async getAllEvents() {
        return this.prisma.event.findMany({
            include: {
                organizer: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                ticketTypes: {
                    include: {
                        tickets: true,  // Include tickets for each TicketType
                    },
                },
            },
        });
    }

    async getEventById(eventId: string) {
        return this.prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizer: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                ticketTypes: {
                    include: {
                        tickets: true,  // Include tickets for each TicketType
                    },
                },
            },
        });
    }



}