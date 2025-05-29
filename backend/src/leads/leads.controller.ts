import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Body('name') name: string,
    @Body('phone') phone: string,
    @Body('email') email: string,
    @Body('realtorUuid') realtorUuid: string,
    @Body('tracking') tracking: string,
  ) {
    if (!name || !phone || !email) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      await this.leads.createLead({
        name,
        phone,
        email,
        realtorUuid,
        tracking,
      });
      return { status: 'ok' };
    } catch {
      throw new HttpException(
        'Unable to save lead',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
