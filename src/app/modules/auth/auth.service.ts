  // auth.service.ts
  import { Injectable, UnauthorizedException } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { User } from '../users/user.model';
  import * as bcrypt from 'bcrypt';
  import { InjectModel } from '@nestjs/sequelize';

  @Injectable()
  export class AuthService {
    constructor(
      private jwtService: JwtService,
      @InjectModel(User)
      private userModel: typeof User,
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
      const user = await this.userModel.findOne({ where: { email } });
      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        throw new UnauthorizedException('Senha incorreta');
      }

      const { password: _password, ...userWithoutPassword } = user.toJSON();
      return userWithoutPassword;
    }

    async login(user: any) {
      const payload = { name: user.name, email: user.email, sub: user.id};
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
  }
