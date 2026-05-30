import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DoorLockEvent } from './door-lock-event.model';

@Injectable()
export class DoorLockEventsService {
  constructor(
    @InjectModel(DoorLockEvent)
    private readonly model: typeof DoorLockEvent,
  ) {}

  /**
   * Grava um evento de mudanca de estado da fechadura.
   * action: 'OPEN' ou 'CLOSE'
   * source: 'API' | 'APP' | 'RFID' | 'IOT' | 'SEED'
   */
  async record(params: {
    doorLockId: number;
    userId?: number | null;
    action: string;
    source?: string;
    createdAt?: Date;
  }): Promise<DoorLockEvent> {
    return this.model.create({
      doorLockId: params.doorLockId,
      userId: params.userId ?? null,
      action: params.action,
      source: params.source ?? 'API',
      ...(params.createdAt ? { createdAt: params.createdAt, updatedAt: params.createdAt } : {}),
    } as any);
  }

  async bulkCreate(events: Array<Partial<DoorLockEvent>>): Promise<DoorLockEvent[]> {
    return this.model.bulkCreate(events as any[]);
  }

  async clearAll(): Promise<number> {
    return this.model.destroy({ where: {}, truncate: false });
  }
}
