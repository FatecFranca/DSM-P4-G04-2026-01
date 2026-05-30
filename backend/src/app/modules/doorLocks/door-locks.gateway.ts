import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { DoorLockUserService } from '../doorLockUsers/door-locks-users.service';
import { DoorLocksService } from './door-locks.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class DoorLocksGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(DoorLocksGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private doorLockUserService: DoorLockUserService,
    @Inject(forwardRef(() => DoorLocksService))
    private doorLocksService: DoorLocksService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) {
        this.logger.warn(`Conexão sem token - desconectando ${client.id}`);
        client.disconnect(true);
        return;
      }

      const payload: any = this.jwtService.verify(token);
      const userId = payload?.sub || payload?.id;
      if (!userId) {
        this.logger.warn(`Token inválido - desconectando ${client.id}`);
        client.disconnect(true);
        return;
      }

      client.data.userId = userId;
      client.join(`user:${userId}`);
      this.logger.log(`[WS] Cliente conectado: ${client.id} (user:${userId})`);

      // handlers simples expostos via socket
      client.on('join-lock', async ({ lockId }) => {
        try {
          const access = await this.doorLockUserService.findByUserAndLock(userId, lockId);
          if (!access) {
            client.emit('error', { message: 'Acesso negado a essa fechadura' });
            return;
          }
          client.join(`lock:${lockId}`);
          client.emit('joined-lock', { lockId });
        } catch (err) {
          this.logger.error('Erro join-lock', err);
        }
      });

      client.on('leave-lock', ({ lockId }) => {
        client.leave(`lock:${lockId}`);
      });

      // alterna estado da fechadura: valida acesso, persiste no banco e faz broadcast
      client.on('toggle-lock', async ({ lockId, status }) => {
        try {
          if (!lockId || !status) {
            client.emit('error', { message: 'lockId e status são obrigatórios' });
            return;
          }

          const access = await this.doorLockUserService.findByUserAndLock(userId, lockId);
          if (!access) {
            client.emit('error', { message: 'Acesso negado a essa fechadura' });
            return;
          }

          const normalized = String(status).toLowerCase() === 'on' ? 'on' : 'off';
          await this.doorLocksService.update(
            String(lockId),
            { status: normalized } as any,
            { userId, source: 'APP' },
          );
          // emitDoorLockUpdated já é disparado dentro de service.update(), faz broadcast para lock:{id}
        } catch (err) {
          this.logger.error('Erro toggle-lock', err);
          client.emit('error', { message: 'Falha ao atualizar fechadura' });
        }
      });
    } catch (err) {
      this.logger.warn(`Falha ao validar token socket: ${err.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    this.logger.log(`[WS] Cliente desconectado: ${client.id} (user:${userId})`);
  }

  emitDoorLockUpdated(lock: any) {
    this.logger.log(`Emitindo door-lock-updated para lock:${lock.id}`);
    this.server.to(`lock:${lock.id}`).emit('door-lock-updated', {
      id: lock.id,
      name: lock.name,
      localization: lock.localization,
      status: lock.status,
    });
  }

  emitDoorLockRemoved(lockId: number) {
    this.server.to(`lock:${lockId}`).emit('door-lock-removed', { id: lockId });
  }
}
