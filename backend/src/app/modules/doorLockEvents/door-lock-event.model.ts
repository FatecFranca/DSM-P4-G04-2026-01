import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.model';
import { DoorLocks } from '../doorLocks/door-locks.model';

@Table({ tableName: 'doorLockEvents' })
export class DoorLockEvent extends Model<DoorLockEvent> {
  @ApiProperty()
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  declare id: number;

  @ApiProperty({ description: 'ID da fechadura' })
  @ForeignKey(() => DoorLocks)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare doorLockId: number;

  @ApiProperty({ description: 'ID do usuario que disparou o evento (null se for IoT sem auth)' })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare userId: number | null;

  @ApiProperty({ description: 'Acao: OPEN ou CLOSE' })
  @Column({ type: DataType.STRING, allowNull: false })
  declare action: string;

  @ApiProperty({ description: 'Origem do evento: API, APP, RFID, IOT, SEED' })
  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'API' })
  declare source: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @BelongsTo(() => DoorLocks, 'doorLockId')
  declare doorLock: DoorLocks;

  @BelongsTo(() => User, 'userId')
  declare user: User;
}
