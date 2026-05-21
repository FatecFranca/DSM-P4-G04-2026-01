// auth.controller.ts
import { Controller, Post, Body, UnauthorizedException, UseGuards, Get, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginUserAuthDto } from './dto/loginUserAuth.dto';
import * as cookieParser from 'cookie-parser';
import type { Response } from 'express';

@ApiTags('auth')
@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(
        @Body() body: LoginUserAuthDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException();
        }

        const token = await this.authService.login(user);

        res.cookie('access_token', token.access_token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });

        return { access_token: token.access_token };
    }

    @ApiBearerAuth('jwt-auth')
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req: any) {
        return req.user;
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token', { httpOnly: true, sameSite: 'lax' });
        return { message: 'Logout feito com sucesso' };
    }

}
