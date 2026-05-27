import { Controller, Get, Post, Body, Param, Put, Delete, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateDoorLocksDto } from './dto/createDoorLocks.dto';
import { updateDoorLocksDto } from './dto/updateDoorLocks.dto';
import { DoorLocksService } from './door-locks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('door-locks')
@ApiBearerAuth('access-token') 
@Controller('door-locks')
export class DoorLocksController {
  constructor(private readonly doorLocksService: DoorLocksService) { }

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
  async update(@Param('id') id: string, @Body() UpdateDoorLocksDto: updateDoorLocksDto) {
    return this.doorLocksService.update(id, UpdateDoorLocksDto);
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
