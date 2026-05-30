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
import { DoorLockEventsService } from '../doorLockEvents/door-lock-events.service';
import { User } from '../users/user.model';
import { CreateDoorLocksDto } from './dto/createDoorLocks.dto';

export interface UpdateOptions {
  userId?: number | null;
  source?: string; // 'API' | 'APP' | 'RFID' | 'IOT'
}

@Injectable()
export class DoorLocksService {
  constructor(
    @InjectModel(DoorLocks)
    private doorLocksModel: typeof DoorLocks,

    @Inject(forwardRef(() => DoorLockUserService))
    private doorLockUserService: DoorLockUserService,
    @Inject(forwardRef(() => DoorLocksGateway))
    private doorLocksGateway?: DoorLocksGateway,
    @Inject(DoorLockEventsService)
    private events?: DoorLockEventsService,
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

  /**
   * Atualiza a fechadura. Se o STATUS mudar, grava um evento em doorLockEvents
   * (OPEN se virou 'on', CLOSE se virou 'off') com a origem informada.
   */
  async update(
    id: string,
    data: Partial<DoorLocks>,
    options: UpdateOptions = {},
  ): Promise<DoorLocks> {
    const doorLocks = await this.findOne(id);
    const statusAntes = String(doorLocks.status || '').toLowerCase();
    const updated = await doorLocks.update(data);
    const statusDepois = String(updated.status || '').toLowerCase();

    // grava evento se houve troca real de status
    if (statusAntes !== statusDepois && (statusDepois === 'on' || statusDepois === 'off')) {
      try {
        await this.events?.record({
          doorLockId: updated.id,
          userId: options.userId ?? null,
          action: statusDepois === 'on' ? 'OPEN' : 'CLOSE',
          source: options.source || 'API',
        });
      } catch (err) {
        // nao bloqueia o update se a gravacao do evento falhar
      }
    }

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
