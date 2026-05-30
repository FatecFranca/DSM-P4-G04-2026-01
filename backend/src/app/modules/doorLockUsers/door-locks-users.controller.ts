import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DoorLockUserService } from './door-locks-users.service';
import { CreateDoorLockUserDto } from './dto/createDoorLockUsers.dto';
import { UpdateDoorLockUserDto } from './dto/updateDoorLockUsers.dto';

@ApiTags('door-lock-user')
@Controller('door-lock-user')
export class DoorLockUserController {
  constructor(private readonly doorLockUserService: DoorLockUserService) {}

 @Post()
  @ApiOperation({ summary: 'Criar vínculo de usuário com fechadura' })
  @ApiResponse({ status: 201, description: 'Vínculo criado com sucesso.' })
  async create(@Body() createDoorLockUserDto: CreateDoorLockUserDto) {
    return this.doorLockUserService.create(createDoorLockUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  async findAll() {
    return this.doorLockUserService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  async findOne(@Param('id') id: string) {
    return this.doorLockUserService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um usuário pelo ID' })
  async update(@Param('id') id: string, @Body() updateDoorLockUserDto: UpdateDoorLockUserDto) {
    return this.doorLockUserService.update(id, updateDoorLockUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um usuário pelo ID' })
  async remove(@Param('id') id: string) {
    await this.doorLockUserService.remove(id);
    return { deleted: id };
  }
}
