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

@Controller()
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Post('leads')
  @HttpCode(201)
  async create(
    @Body('name') name: string,
    @Body('phone') phone: string,
    @Body('email') email: string,
    @Body('realtorId') realtorId: string,
    @Body('zipcode') zipcode: string,
    @Body('homeType') homeType: string,
    @Body('bedrooms') bedrooms: string,
    @Body('bathrooms') bathrooms: string,
    @Body('sqft') sqft: string,
    @Body('yearBuilt') yearBuilt: string,
    @Body('occupancy') occupancy: string,
    @Body('timeframe') timeframe: string,
    @Body('professional') professional: string,
    @Body('expert') expert: string,
  ) {
    console.debug('[LeadsController] received create lead request', {
      name,
      phone,
      email,
      realtorId,
    });
    if (!name || !phone) {
      throw new HttpException(
        'Missing required fields',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      console.debug('[LeadsController] calling LeadsService.createLead');
      await this.leads.createLead({
        name,
        phone,
        email,
        realtorId,
        zipcode,
        homeType,
        bedrooms,
        bathrooms,
        sqft,
        yearBuilt,
        occupancy,
        timeframe,
        professional,
        expert,
      });
      console.debug('[LeadsController] lead saved successfully');
      return { status: 'ok' };
    } catch {
      console.error('[LeadsController] unable to save lead');
      throw new HttpException(
        'Unable to save lead',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user')
  async getUser(@Query('phone') phone: string) {
    return this.leads.findByPhone(phone);
  }

  @Get('realtor')
  async getRealtor(@Query('realtorId') realtorId: string) {
    console.log('[GET /realtor] id:', realtorId);
    const realtor = await this.leads.findRealtor(realtorId);
    if (!realtor) {
      console.warn('[GET /realtor] realtor not found');
    }
    return realtor;
  }
}
