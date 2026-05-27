import { Injectable, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { DoorLockUserService } from '../doorLockUsers/door-locks-users.service';

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
