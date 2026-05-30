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

@Table({ tableName: 'doorLockUsers' })  // Nome da tabela pivot
export class DoorLockUser extends Model<DoorLockUser> {
  @ApiProperty()
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  declare id: number;

  @ApiProperty({ description: 'ID do usuário com acesso à fechadura' })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number;

  @ApiProperty({ description: 'ID da fechadura' })
  @ForeignKey(() => DoorLocks)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare doorLockId: number;

  @ApiProperty({ description: 'Papel do usuário na fechadura (owner, admin, guest...)' })
  @Column({ type: DataType.STRING, allowNull: false })
  declare paper: string;

  @ApiProperty({ description: 'Status do acesso (active, pending, revoked)' })
  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'active' })
  declare status: string;

  @ApiProperty({ description: 'Usuário que compartilhou essa fechadura' })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare sharedBy: number;

  @ApiProperty({ description: 'Data/hora a partir de quando o acesso é válido' })
  @Column({ type: DataType.DATE, allowNull: true })
  declare startsAt: Date;

  @ApiProperty({ description: 'Data/hora até quando o acesso é válido (ex: para guests)' })
  @Column({ type: DataType.DATE, allowNull: true })
  declare expiresAt: Date;
  
  @BelongsTo(() => User, 'userId')
  declare user: User;

  @BelongsTo(() => DoorLocks, 'doorLockId')
  declare doorLock: DoorLocks;

  @BelongsTo(() => User, 'sharedBy')
  declare sharedByUser: User;
}
