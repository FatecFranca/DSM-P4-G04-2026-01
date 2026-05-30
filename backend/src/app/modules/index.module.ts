import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DoorLocksModule } from './doorLocks/door-locks.module';
import { DoorLockUserModule } from './doorLockUsers/door-locks-users.module';
import { DoorLockEventsModule } from './doorLockEvents/door-lock-events.module';

@Module({
  imports: [
    UsersModule,
    DoorLocksModule,
    AuthModule,
    DoorLockUserModule,
    DoorLockEventsModule,
  ],
  exports: [
    UsersModule,
    DoorLocksModule,
    AuthModule,
    DoorLockUserModule,
    DoorLockEventsModule,
  ],
})
export class IndexModule { }
