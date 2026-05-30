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
import { DoorLockEventsModule } from '../doorLockEvents/door-lock-events.module';
import { DoorLockEvent } from '../doorLockEvents/door-lock-event.model';
import { User } from '../users/user.model';
import { DoorLockUser } from '../doorLockUsers/door-locks-users.model';
import { StatisticsService } from './statistics.service';

@Module({
  imports: [
    SequelizeModule.forFeature([DoorLocks, DoorLockEvent, User, DoorLockUser]),
    ConfigModule,
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
    }),
    forwardRef(() => DoorLockUserModule),
    DoorLockEventsModule,
  ],
  controllers: [DoorLocksController],
  providers: [DoorLocksService, DoorLocksGateway, StatisticsService],
  exports: [DoorLocksService, StatisticsService],
})
export class DoorLocksModule { }
