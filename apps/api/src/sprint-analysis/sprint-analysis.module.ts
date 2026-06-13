import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/prisma/prisma.module';
import { SprintAnalysisController } from './sprint-analysis.controller';
import { SprintAnalysisService } from './sprint-analysis.service';

@Module({
  imports: [PrismaModule],
  controllers: [SprintAnalysisController],
  providers: [SprintAnalysisService],
})
export class SprintAnalysisModule {}
