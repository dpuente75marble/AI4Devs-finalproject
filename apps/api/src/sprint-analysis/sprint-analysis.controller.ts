import { Controller, Get, StreamableFile } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { buildSprintAnalysisExportFilename } from './domain/sprint-analysis-export-filename';
import { SprintAnalysisRowDto } from './dto/sprint-analysis-response.dto';
import { SprintAnalysisService } from './sprint-analysis.service';

const SPRINT_ANALYSIS_EXPORT_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

@ApiTags('sprint-analysis')
@Controller('sprint-analysis')
export class SprintAnalysisController {
  constructor(private readonly sprintAnalysisService: SprintAnalysisService) {}

  @Get()
  @ApiOperation({
    summary: 'Analyze sprint demand versus adjusted capacity',
    description:
      'Aggregates imported user stories, sprint capacity and sprint absences by sprint, team and project, then returns demand, utilization and overload status for each combination.',
  })
  @ApiOkResponse({
    description:
      'Sprint analysis rows ordered alphabetically by sprint, teamName and projectName',
    type: SprintAnalysisRowDto,
    isArray: true,
  })
  findAll() {
    return this.sprintAnalysisService.findAll();
  }

  @Get('export')
  @ApiOperation({
    summary: 'Export sprint analysis as Excel',
    description:
      'Generates a downloadable Excel workbook (.xlsx) from the current sprint analysis. Response is binary with Content-Disposition: attachment; filename="sprint-analysis-YYYY-MM-DD.xlsx" where the date is UTC.',
  })
  @ApiProduces(SPRINT_ANALYSIS_EXPORT_CONTENT_TYPE)
  @ApiOkResponse({
    description:
      'Binary Excel workbook with Content-Type application/vnd.openxmlformats-officedocument.spreadsheetml.sheet and Content-Disposition attachment header including sprint-analysis-YYYY-MM-DD.xlsx filename (UTC date).',
  })
  async exportToXlsx(): Promise<StreamableFile> {
    const buffer = await this.sprintAnalysisService.exportToXlsx();
    const filename = buildSprintAnalysisExportFilename();

    return new StreamableFile(buffer, {
      type: SPRINT_ANALYSIS_EXPORT_CONTENT_TYPE,
      disposition: `attachment; filename="${filename}"`,
    });
  }
}
