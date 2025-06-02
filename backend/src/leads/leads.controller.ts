import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Query,
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

  @Get('user')
  async getUser(@Query('tracking') tracking: string) {
    return this.leads.findByTracking(tracking);
  }

  @Get('realtor')
  async getRealtor(@Query('uuid') uuid: string) {
    console.log('[GET /realtor] uuid:', uuid);
    const realtor = await this.leads.findRealtor(uuid);
    if (!realtor) {
      console.warn('[GET /realtor] realtor not found');
    }
    return realtor;
  }
}
