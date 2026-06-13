import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateSprintAbsenceDto } from './dto/create-sprint-absence.dto';
import {
  ListSprintAbsenceResponseDto,
  SprintAbsenceResponseDto,
} from './dto/sprint-absence-response.dto';
import { SprintAbsencesService } from './sprint-absences.service';

@ApiTags('sprint-absences')
@Controller('sprint-absences')
export class SprintAbsencesController {
  constructor(private readonly sprintAbsencesService: SprintAbsencesService) {}

  @Get()
  @ApiOperation({ summary: 'List sprint absence records' })
  @ApiOkResponse({
    description: 'Sprint absence records ordered by createdAt desc',
    type: ListSprintAbsenceResponseDto,
  })
  findAll() {
    return this.sprintAbsencesService.findAll();
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create sprint absence record' })
  @ApiCreatedResponse({
    description: 'Sprint absence record created',
    type: SprintAbsenceResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid sprint absence input',
  })
  create(@Body() body: CreateSprintAbsenceDto) {
    return this.sprintAbsencesService.create(body);
  }
}
