import { Controller, Get, Post, Body, Param, Put, Delete, Req, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateDoorLocksDto } from './dto/createDoorLocks.dto';
import { updateDoorLocksDto } from './dto/updateDoorLocks.dto';
import { DoorLocksService } from './door-locks.service';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('door-locks')
@ApiBearerAuth('access-token')
@Controller('door-locks')
export class DoorLocksController {
  constructor(
    private readonly doorLocksService: DoorLocksService,
    private readonly statisticsService: StatisticsService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Criar um nova fechadura' })
  @ApiResponse({ status: 201, description: 'Fechadura criado com sucesso.' })
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  create(@Body() createDoorLockDto: CreateDoorLocksDto, @Req() req: any) {
    const userId = req.user.id;
    return this.doorLocksService.create(createDoorLockDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os fechaduras' })
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: any) {
    const userId = req.user?.id;
    return this.doorLocksService.findAllForUser(userId);
  }

  // ============================================================
  // ESTATISTICAS - precisam vir ANTES de '/:id' para nao colidir
  // ============================================================

  @Get('statistics/overview')
  @ApiOperation({ summary: '4 cards do dashboard (totais)' })
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  async overview(@Req() req: any) {
    return this.statisticsService.getOverview(req.user.id);
  }

  @Get('statistics/usage-timeline')
  @ApiOperation({ summary: 'Aberturas/fechamentos por dia (ultimos 7 dias)' })
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  async usageTimeline(@Req() req: any) {
    return this.statisticsService.getUsageTimeline(req.user.id);
  }

  @Get('statistics/most-used')
  @ApiOperation({ summary: 'Top fechaduras mais utilizadas' })
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  async mostUsed(@Req() req: any) {
    return this.statisticsService.getMostUsed(req.user.id);
  }

  @Get('statistics/status-distribution')
  @ApiOperation({ summary: 'Distribuicao de fechaduras ativas vs inativas' })
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  async statusDistribution(@Req() req: any) {
    return this.statisticsService.getStatusDistribution(req.user.id);
  }

  @Get('statistics/recent-activity')
  @ApiOperation({ summary: 'Ultimos eventos das fechaduras do usuario' })
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  async recentActivity(@Req() req: any) {
    return this.statisticsService.getRecentActivity(req.user.id);
  }

  @Get('statistics/full-report')
  @ApiOperation({ summary: 'Relatorio completo (todos os blocos + 100 eventos)' })
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  async fullReport(@Req() req: any) {
    return this.statisticsService.getFullReport(req.user.id);
  }

  @Post('statistics/seed-demo')
  @HttpCode(201)
  @ApiOperation({ summary: 'Popula eventos fake para a demo (preserva eventos reais)' })
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  async seedDemo(@Req() req: any) {
    return this.statisticsService.seedDemoEvents(req.user.id);
  }

  @Delete('statistics/seed-demo')
  @ApiOperation({ summary: 'Remove apenas os eventos fake (mantem reais)' })
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  async clearDemo(@Req() req: any) {
    return this.statisticsService.clearDemoEvents(req.user.id);
  }

  // ============================================================
  // CRUD por id (precisa vir DEPOIS das rotas acima)
  // ============================================================

  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Buscar fechadura por ID' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.doorLocksService.findOneForUser(id, userId);
  }

  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um fechadura pelo ID' })
  async update(
    @Param('id') id: string,
    @Body() UpdateDoorLocksDto: updateDoorLocksDto,
    @Req() req: any,
  ) {
    return this.doorLocksService.update(id, UpdateDoorLocksDto, {
      userId: req.user?.id,
      source: 'APP',
    });
  }

  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um fechadura pelo ID' })
  async remove(@Param('id') id: string) {
    await this.doorLocksService.remove(id);
    return { deleted: id };
  }
}
