// src/app/modules/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateDoorLocksDto } from './createDoorLocks.dto';

export class updateDoorLocksDto extends PartialType(CreateDoorLocksDto) {}
