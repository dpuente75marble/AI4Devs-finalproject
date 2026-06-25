import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../infrastructure/prisma/prisma.module';
import { SprintAnalysisController } from './sprint-analysis.controller';
import { SprintAnalysisService } from './sprint-analysis.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SprintAnalysisController],
  providers: [SprintAnalysisService],
})
export class SprintAnalysisModule {}
