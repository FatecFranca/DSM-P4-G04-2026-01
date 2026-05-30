import { AutoIncrement, BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.model';
import { DoorLockUser } from '../doorLockUsers/door-locks-users.model';

@Table({ tableName: 'doorLocks' })
export class DoorLocks extends Model<DoorLocks> {
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
  @Column({ type: DataType.STRING, allowNull: false })
  declare localization: string;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false })
  declare status: string;

  @BelongsToMany(() => User, () => DoorLockUser, 'doorLockId', 'userId')
  users: User[];
}
