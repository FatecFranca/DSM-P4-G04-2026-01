import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DoorLockUser } from './door-locks-users.model'


@Injectable()
export class DoorLockUserService {
  constructor(
    @InjectModel(DoorLockUser)
    private dorLockUserModel: typeof DoorLockUser
  ) {}

   async create(data: Partial<DoorLockUser>) {
    return this.dorLockUserModel.create(data as DoorLockUser);
  }

  async findAll(): Promise<DoorLockUser[]> {
    return this.dorLockUserModel.findAll();
  }

  async findOne(id: string): Promise<DoorLockUser> {
    const doorLockUser = await this.dorLockUserModel.findByPk(id);
    if (!doorLockUser) throw new NotFoundException('Vinculation not found');
    return doorLockUser;
  }

  async update(id: string, data: Partial<DoorLockUser>): Promise<DoorLockUser> {
    const doorLockUser = await this.findOne(id);
    return doorLockUser.update(data);
  }

  async remove(id: string): Promise<void> {
    const doorLockUser = await this.findOne(id);
    await doorLockUser.destroy();
  }

  async findByUserAndLock(userId: number, doorLockId: number) {
    return this.dorLockUserModel.findOne({ where: { userId, doorLockId } });
  }
}
