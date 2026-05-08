import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get API health status' })
  @ApiOkResponse({
    description: 'Health status response',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        service: { type: 'string', example: 'deliveryops-api' },
      },
    },
  })
  getHealth() {
    return this.appService.getHealth();
  }
}
