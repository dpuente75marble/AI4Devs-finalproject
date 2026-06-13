import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SprintAnalysisRowDto } from './dto/sprint-analysis-response.dto';
import { SprintAnalysisService } from './sprint-analysis.service';

@ApiTags('sprint-analysis')
@Controller('sprint-analysis')
export class SprintAnalysisController {
  constructor(private readonly sprintAnalysisService: SprintAnalysisService) {}

  @Get()
  @ApiOperation({
    summary: 'Analyze sprint demand versus adjusted capacity',
    description:
      'Aggregates imported user stories, sprint capacity and sprint absences by sprint, then returns demand, utilization and overload status for each sprint.',
  })
  @ApiOkResponse({
    description:
      'Sprint analysis rows ordered alphabetically by sprint name',
    type: SprintAnalysisRowDto,
    isArray: true,
  })
  findAll() {
    return this.sprintAnalysisService.findAll();
  }
}
