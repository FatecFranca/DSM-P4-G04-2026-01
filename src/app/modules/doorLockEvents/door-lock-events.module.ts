import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DoorLockEvent } from './door-lock-event.model';
import { DoorLockEventsService } from './door-lock-events.service';

@Module({
  imports: [SequelizeModule.forFeature([DoorLockEvent])],
  providers: [DoorLockEventsService],
  exports: [DoorLockEventsService, SequelizeModule],
})
export class DoorLockEventsModule {}
