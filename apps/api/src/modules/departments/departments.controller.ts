import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Departments & Authorities')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all Kerala civic departments (PWD, KWA, KSEB, LSGD)' })
  async findAll() {
    return this.departmentsService.findAll();
  }

  @Public()
  @Get(':code')
  @ApiOperation({ summary: 'Get department details, officials, and assigned infrastructure projects' })
  async findByCode(@Param('code') code: string) {
    return this.departmentsService.findByCode(code);
  }
}

