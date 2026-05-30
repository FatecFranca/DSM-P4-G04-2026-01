import { PartialType } from '@nestjs/swagger';
import { CreateDoorLockUserDto } from './createDoorLockUsers.dto';

export class UpdateDoorLockUserDto extends PartialType(CreateDoorLockUserDto) {}
