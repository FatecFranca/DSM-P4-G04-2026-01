import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../users/user.model';
import { DoorLocks } from '../doorLocks/door-locks.model';
import { DoorLockUser } from '../doorLockUsers/door-locks-users.model';
import { DoorLockUserController } from '../doorLockUsers/door-locks-users.controller';
import { DoorLockUserService } from '../doorLockUsers/door-locks-users.service';

@Module({
  imports: [
    SequelizeModule.forFeature([DoorLockUser, User, DoorLocks]),
    forwardRef(() => DoorLockUserModule)
  ],
  controllers: [DoorLockUserController],
  providers: [DoorLockUserService],
  exports: [DoorLockUserService], 
})
export class DoorLockUserModule {}
