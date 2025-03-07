import { IsString, IsDate, IsInt } from 'class-validator';

export class CreateEventDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsString()
    location: string;

    @IsDate()
    startDate: Date;

    @IsDate()
    endDate: Date;

    @IsDate()
    saleStartTime: Date; // 👈 Thêm trường này

    @IsString()
    category: string;

    @IsInt()
    totalTickets: number;

    @IsString()
    organizerId: string;
}
