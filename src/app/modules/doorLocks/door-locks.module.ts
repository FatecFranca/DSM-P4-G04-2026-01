import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DoorLocksService } from './door-locks.service';
import { DoorLocksController } from './door-locks.controller';
import { DoorLocks } from './door-locks.model';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { DoorLockUserModule } from '../doorLockUsers/door-locks-users.module';
import { DoorLocksGateway } from './door-locks.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([DoorLocks]),
    ConfigModule,
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    forwardRef(() => DoorLockUserModule),
  ],
  controllers: [DoorLocksController],
  providers: [DoorLocksService, DoorLocksGateway],
  exports: [DoorLocksService],
})
export class DoorLocksModule { }
