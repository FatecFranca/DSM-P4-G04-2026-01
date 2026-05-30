import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, fn, col, literal } from 'sequelize';
import { DoorLocks } from './door-locks.model';
import { User } from '../users/user.model';
import { DoorLockUser } from '../doorLockUsers/door-locks-users.model';
import { DoorLockEvent } from '../doorLockEvents/door-lock-event.model';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(DoorLocks) private readonly lockModel: typeof DoorLocks,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(DoorLockUser) private readonly accessModel: typeof DoorLockUser,
    @InjectModel(DoorLockEvent) private readonly eventModel: typeof DoorLockEvent,
  ) {}

  /**
   * Devolve a lista de IDs de fechaduras que o usuario tem acesso (owner, admin ou guest active).
   */
  private async getUserLockIds(userId: number): Promise<number[]> {
    const accesses = await this.accessModel.findAll({
      where: { userId, status: 'active' },
      attributes: ['doorLockId'],
    });
    return accesses.map((a) => a.doorLockId);
  }

  /**
   * Overview - 4 cards do topo do dashboard
   */
  async getOverview(userId: number) {
    const lockIds = await this.getUserLockIds(userId);
    const totalLocks = lockIds.length;

    let activeLocks = 0;
    let inactiveLocks = 0;
    if (totalLocks > 0) {
      const locks = await this.lockModel.findAll({ where: { id: { [Op.in]: lockIds } } });
      activeLocks = locks.filter((l) => String(l.status).toLowerCase() === 'on').length;
      inactiveLocks = locks.length - activeLocks;
    }

    // total de usuarios distintos com acesso a alguma fechadura do usuario
    let totalUsers = 0;
    if (totalLocks > 0) {
      const others = await this.accessModel.findAll({
        where: { doorLockId: { [Op.in]: lockIds }, status: 'active' },
        attributes: [[fn('COUNT', literal('DISTINCT "userId"')), 'cnt']],
        raw: true,
      });
      totalUsers = Number((others[0] as any)?.cnt || 0);
    }

    return { totalLocks, activeLocks, inactiveLocks, totalUsers };
  }

  /**
   * Linha do tempo dos ultimos 7 dias - aberturas/fechamentos por dia.
   */
  async getUsageTimeline(userId: number) {
    const lockIds = await this.getUserLockIds(userId);
    const days: Array<{ date: string; opens: number; closes: number }> = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // monta os 7 dias (de 6 dias atras ate hoje), formato dd/mm
    const buckets: Record<string, { opens: number; closes: number; iso: string }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets[iso] = { opens: 0, closes: 0, iso };
      days.push({ date: label, opens: 0, closes: 0 });
    }

    if (lockIds.length === 0) return days;

    const start = new Date(today);
    start.setDate(start.getDate() - 6);

    const events = await this.eventModel.findAll({
      where: {
        doorLockId: { [Op.in]: lockIds },
        createdAt: { [Op.gte]: start },
      },
      attributes: ['action', 'createdAt'],
      raw: true,
    });

    for (const ev of events as any[]) {
      const iso = new Date(ev.createdAt).toISOString().slice(0, 10);
      if (!buckets[iso]) continue;
      if (ev.action === 'OPEN') buckets[iso].opens++;
      else if (ev.action === 'CLOSE') buckets[iso].closes++;
    }

    // sincroniza buckets com days
    const result: Array<{ date: string; opens: number; closes: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      result.push({ date: label, opens: buckets[iso].opens, closes: buckets[iso].closes });
    }
    return result;
  }

  /**
   * Top fechaduras com mais eventos (todas as datas).
   */
  async getMostUsed(userId: number, limit = 5) {
    const lockIds = await this.getUserLockIds(userId);
    if (lockIds.length === 0) return [];

    const rows = await this.eventModel.findAll({
      where: { doorLockId: { [Op.in]: lockIds } },
      attributes: ['doorLockId', [fn('COUNT', col('id')), 'usageCount']],
      group: ['doorLockId'],
      order: [[literal('"usageCount"'), 'DESC']],
      limit,
      raw: true,
    });

    if (rows.length === 0) return [];

    const ids = (rows as any[]).map((r) => r.doorLockId);
    const locks = await this.lockModel.findAll({ where: { id: { [Op.in]: ids } } });
    const nameById: Record<number, string> = {};
    locks.forEach((l) => (nameById[l.id] = l.name));

    return (rows as any[]).map((r) => ({
      id: r.doorLockId,
      name: nameById[r.doorLockId] || `Fechadura ${r.doorLockId}`,
      usageCount: Number(r.usageCount),
    }));
  }

  /**
   * Distribuicao de status: quantas estao ativas (on) vs inativas (off).
   */
  async getStatusDistribution(userId: number) {
    const lockIds = await this.getUserLockIds(userId);
    if (lockIds.length === 0) {
      return [
        { name: 'Ativas', value: 0 },
        { name: 'Inativas', value: 0 },
      ];
    }
    const locks = await this.lockModel.findAll({ where: { id: { [Op.in]: lockIds } } });
    const active = locks.filter((l) => String(l.status).toLowerCase() === 'on').length;
    const inactive = locks.length - active;
    return [
      { name: 'Ativas', value: active },
      { name: 'Inativas', value: inactive },
    ];
  }

  /**
   * Ultimos eventos com nome da fechadura e do usuario.
   */
  async getRecentActivity(userId: number, limit = 20) {
    const lockIds = await this.getUserLockIds(userId);
    if (lockIds.length === 0) return [];

    const events = await this.eventModel.findAll({
      where: { doorLockId: { [Op.in]: lockIds } },
      order: [['createdAt', 'DESC']],
      limit,
      include: [
        { model: this.lockModel, attributes: ['id', 'name'] },
        { model: this.userModel, attributes: ['id', 'name'] },
      ],
    });

    return events.map((e: any) => ({
      id: e.id,
      lockName: e.doorLock?.name ?? `Fechadura ${e.doorLockId}`,
      action: e.action,
      user: e.user?.name ?? (e.source === 'RFID' ? 'Cartao RFID' : e.source === 'SEED' ? 'Sistema' : '—'),
      timestamp: e.createdAt,
    }));
  }

  /**
   * Dump bruto de eventos com nomes - usado pelo PDF.
   */
  async getFullReport(userId: number) {
    const [overview, timeline, mostUsed, statusDist, recent] = await Promise.all([
      this.getOverview(userId),
      this.getUsageTimeline(userId),
      this.getMostUsed(userId, 10),
      this.getStatusDistribution(userId),
      this.getRecentActivity(userId, 100),
    ]);
    return { overview, timeline, mostUsed, statusDist, recent, generatedAt: new Date() };
  }

  /**
   * SEEDER - popula eventos fake nos ultimos 7 dias para visualizacao do dashboard.
   * Apaga eventos com source='SEED' antes para nao duplicar (chama-se varias vezes).
   * Eventos reais (source='APP', 'RFID', 'API') sao preservados.
   */
  async seedDemoEvents(userId: number) {
    const lockIds = await this.getUserLockIds(userId);
    if (lockIds.length === 0) {
      return { seeded: 0, message: 'Usuario sem fechaduras - nenhum evento criado' };
    }

    // limpa SEED anteriores das fechaduras do usuario
    await this.eventModel.destroy({
      where: { doorLockId: { [Op.in]: lockIds }, source: 'SEED' },
    });

    const events: Array<Partial<DoorLockEvent>> = [];
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    // distribui ~6 a 12 eventos por fechadura nos ultimos 7 dias
    for (const lockId of lockIds) {
      const total = 6 + Math.floor(Math.random() * 7); // 6-12 eventos
      for (let i = 0; i < total; i++) {
        const offset = Math.random() * SEVEN_DAYS_MS;
        const dt = new Date(now - offset);

        // viesa para horarios diurnos (8h-22h)
        const hourBias = 8 + Math.floor(Math.random() * 14);
        dt.setHours(hourBias, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0);

        const action = Math.random() > 0.5 ? 'OPEN' : 'CLOSE';
        const sourceRoll = Math.random();
        const source = sourceRoll < 0.5 ? 'APP' : sourceRoll < 0.85 ? 'RFID' : 'API';

        events.push({
          doorLockId: lockId,
          userId: source === 'RFID' ? null : userId,
          action,
          source: 'SEED',
          createdAt: dt,
          updatedAt: dt,
        } as any);
      }
    }

    // ordena por data crescente para o gravar ficar "natural"
    events.sort((a: any, b: any) => +a.createdAt - +b.createdAt);
    await this.eventModel.bulkCreate(events as any[]);

    return {
      seeded: events.length,
      message: `${events.length} eventos fake gerados em ${lockIds.length} fechadura(s)`,
    };
  }

  /**
   * Remove apenas os eventos SEED do usuario (preserva eventos reais).
   */
  async clearDemoEvents(userId: number) {
    const lockIds = await this.getUserLockIds(userId);
    if (lockIds.length === 0) return { removed: 0 };
    const removed = await this.eventModel.destroy({
      where: { doorLockId: { [Op.in]: lockIds }, source: 'SEED' },
    });
    return { removed };
  }
}
