// src/app/modules/users/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateDoorLocksDto {
  @ApiProperty({
    description: 'Nome da fechadura',
    example: 'Fechadura 1',
  })
  @IsNotEmpty({ message: 'O nome da fechadura é obrigatória' })
  name: string;

  @ApiProperty({
    description: 'Localização da fechadura',
    example: 'Porta Principal',
  })
  @IsNotEmpty({ message: 'Localização é obrigatória' })
  localization: string;

  @ApiProperty({
    description: 'Status de atividade da fechadura',
    example: 'ON',
  })
  @IsNotEmpty({ message: 'Localização é obrigatório' })
  status: string;
}
