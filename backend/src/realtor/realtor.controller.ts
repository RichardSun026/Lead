import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { RealtorInput, RealtorService } from './realtor.service';

@Controller('realtor')
export class RealtorController {
  constructor(private readonly realtors: RealtorService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() body: RealtorInput) {
    return this.realtors.createRealtor(body);
  }
}
