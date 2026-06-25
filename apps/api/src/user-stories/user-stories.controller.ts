import {
  Controller,
  Get,
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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DEFAULT_AUTH_COOKIE_NAME } from '../auth/auth.constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MAX_CSV_FILE_SIZE_BYTES } from './constants';
import { ImportUserStoriesResponseDto } from './dto/import-user-stories-response.dto';
import { ListUserStoriesResponseDto } from './dto/user-story-response.dto';
import { UserStoriesService } from './user-stories.service';

@ApiTags('user-stories')
@ApiCookieAuth(DEFAULT_AUTH_COOKIE_NAME)
@UseGuards(JwtAuthGuard)
@Controller('user-stories')
export class UserStoriesController {
  constructor(private readonly userStoriesService: UserStoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List imported user stories' })
  @ApiOkResponse({
    description: 'User stories ordered by createdAt desc',
    type: ListUserStoriesResponseDto,
  })
  findAll() {
    return this.userStoriesService.findAll();
  }

  @Post('import')
  @HttpCode(201)
  @ApiOperation({ summary: 'Import user stories from CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV file with user stories',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Import summary with imported/failed counts',
    type: ImportUserStoriesResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid or missing CSV file',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_CSV_FILE_SIZE_BYTES },
    }),
  )
  import(@UploadedFile() file: Express.Multer.File) {
    return this.userStoriesService.importFromCsv(file);
  }
}
