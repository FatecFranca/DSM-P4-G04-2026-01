import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserAuthDto {
  @ApiProperty({
    description: 'Endereço de e-mail do usuário',
    example: 'arthur@example.com',
  })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  password: string;
}
