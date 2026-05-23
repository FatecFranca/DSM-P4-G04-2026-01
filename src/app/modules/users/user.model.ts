import { AutoIncrement, BelongsToMany, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { DoorLockUser } from '../doorLockUsers/door-locks-users.model';
import { DoorLocks } from '../doorLocks/door-locks.model';

@Table({ tableName: 'users' })
export class User extends Model<User> {
  @ApiProperty()
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
  })
  declare id: number;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare password: string;

  @HasMany(() => DoorLockUser, 'userId')
  doorLockUsers: DoorLockUser[];

  @BelongsToMany(() => DoorLocks, () => DoorLockUser, 'userId', 'doorLockId')
  doorLocks: DoorLocks[];
}
