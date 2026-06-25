import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DEFAULT_AUTH_COOKIE_NAME } from '../auth/auth.constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSprintCapacityDto } from './dto/create-sprint-capacity.dto';
import {
  ListSprintCapacityResponseDto,
  SprintCapacityResponseDto,
} from './dto/sprint-capacity-response.dto';
import { SprintCapacityService } from './sprint-capacity.service';

@ApiTags('sprint-capacity')
@ApiCookieAuth(DEFAULT_AUTH_COOKIE_NAME)
@UseGuards(JwtAuthGuard)
@Controller('sprint-capacity')
export class SprintCapacityController {
  constructor(private readonly sprintCapacityService: SprintCapacityService) {}

  @Get()
  @ApiOperation({ summary: 'List sprint capacity configurations' })
  @ApiOkResponse({
    description: 'Sprint capacity configurations ordered by createdAt desc',
    type: ListSprintCapacityResponseDto,
  })
  findAll() {
    return this.sprintCapacityService.findAll();
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create sprint capacity configuration' })
  @ApiCreatedResponse({
    description: 'Sprint capacity configuration created',
    type: SprintCapacityResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid sprint capacity input',
  })
  @ApiConflictResponse({
    description: 'Duplicate sprint, team and project configuration',
  })
  create(@Body() body: CreateSprintCapacityDto) {
    return this.sprintCapacityService.create(body);
  }
}
