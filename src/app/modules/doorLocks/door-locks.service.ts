import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DoorLocks } from './door-locks.model';
import { DoorLockUserService } from '../doorLockUsers/door-locks-users.service';
import { DoorLocksGateway } from './door-locks.gateway';
import { User } from '../users/user.model';
import { CreateDoorLocksDto } from './dto/createDoorLocks.dto';
import { DoorLockUser } from '../doorLockUsers/door-locks-users.model';

@Injectable()
export class DoorLocksService {
  constructor(
    @InjectModel(DoorLocks)
    private doorLocksModel: typeof DoorLocks,

    @Inject(forwardRef(() => DoorLockUserService))
    private doorLockUserService: DoorLockUserService,
    @Inject(forwardRef(() => DoorLocksGateway))
    private doorLocksGateway?: DoorLocksGateway,
  ) {}

  async create(data: CreateDoorLocksDto, userId: number) {
    const createdDoorLock = await this.doorLocksModel.create(data as DoorLocks);

    await this.doorLockUserService.create({
      userId,
      doorLockId: createdDoorLock.id,
      paper: 'owner',
      status: 'active',
    });

    try {
      this.doorLocksGateway?.emitDoorLockUpdated(createdDoorLock);
    } catch (err) {}
    return createdDoorLock;
  }

  async findAll(): Promise<DoorLocks[]> {
    return this.doorLocksModel.findAll();
  }

  async findAllForUser(userId: number): Promise<DoorLocks[]> {
    if (!userId) return [];

    return this.doorLocksModel.findAll({
      include: [
        {
          model: User,
          where: { id: userId },
          through: { attributes: [] },
          required: true,
        },
      ],
    });
  }

  async findOne(id: string): Promise<DoorLocks> {
    const doorLocks = await this.doorLocksModel.findByPk(id);
    if (!doorLocks) throw new NotFoundException('Door lock not found');
    return doorLocks;
  }

  async findOneForUser(id: string, userId: number): Promise<DoorLocks> {
    const doorLock = await this.doorLocksModel.findOne({
      where: { id },
      include: [
        {
          model: User,
          where: { id: userId },
          through: { attributes: [] },
          required: true,
        },
      ],
    });

    if (!doorLock)
      throw new NotFoundException('Door lock not found or access denied');
    return doorLock;
  }

  async update(id: string, data: Partial<DoorLocks>): Promise<DoorLocks> {
    const doorLocks = await this.findOne(id);
    const updated = await doorLocks.update(data);
    try {
      this.doorLocksGateway?.emitDoorLockUpdated(updated);
    } catch (err) {}
    return updated;
  }

  async remove(id: string): Promise<void> {
    const doorLocks = await this.findOne(id);
    await doorLocks.destroy();
    try {
      this.doorLocksGateway?.emitDoorLockRemoved(Number(id));
    } catch (err) {}
  }
}
