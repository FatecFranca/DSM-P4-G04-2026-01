import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDoorLockUserDto {
  @ApiProperty({ description: 'ID do usuário com acesso à fechadura' })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: 'ID da fechadura' })
  @IsInt()
  @IsNotEmpty()
  doorLockId: number;

  @ApiProperty({
    description: 'Papel do usuário na fechadura (owner, admin, guest...)',
    example: 'guest',
  })
  @IsString()
  @IsNotEmpty()
  paper: string;

  @ApiProperty({
    description: 'Status do acesso (active, pending, revoked)',
    example: 'active',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'ID do usuário que compartilhou essa fechadura',
    required: false,
  })
  @IsOptional()
  @IsInt()
  sharedBy?: number;

  @ApiProperty({
    description: 'Data/hora a partir de quando o acesso é válido',
    required: false,
    example: '2025-10-01T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startsAt?: Date;

  @ApiProperty({
    description: 'Data/hora até quando o acesso é válido (ex: para guests)',
    required: false,
    example: '2025-10-10T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}
