import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateRealtorDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID()
  @IsNotEmpty()
  userId!: string;
}
