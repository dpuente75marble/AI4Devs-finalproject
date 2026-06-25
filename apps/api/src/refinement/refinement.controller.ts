import {
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DEFAULT_AUTH_COOKIE_NAME } from '../auth/auth.constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MAX_PDF_FILE_SIZE_BYTES } from './application/pdf-validator';
import { RefinementService } from './application/refinement.service';
import { RefinementAnalysisResponseDto } from './dto/refinement-analysis-response.dto';

@ApiTags('refinement')
@ApiCookieAuth(DEFAULT_AUTH_COOKIE_NAME)
@UseGuards(JwtAuthGuard)
@Controller('refinement')
export class RefinementController {
  constructor(private readonly refinementService: RefinementService) {}

  @Post('analyze')
  @HttpCode(200)
  @ApiOperation({ summary: 'Analyze uploaded PDF requirements' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF requirement document',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Structured refinement output from extracted PDF text',
    type: RefinementAnalysisResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid or missing PDF file',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_PDF_FILE_SIZE_BYTES },
    }),
  )
  analyze(@UploadedFile() file: Express.Multer.File) {
    return this.refinementService.analyze(file);
  }
}
