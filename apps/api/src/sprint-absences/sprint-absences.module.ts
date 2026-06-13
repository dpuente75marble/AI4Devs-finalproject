import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/prisma/prisma.module';
import { SprintAbsencesController } from './sprint-absences.controller';
import { SprintAbsencesService } from './sprint-absences.service';

@Module({
  imports: [PrismaModule],
  controllers: [SprintAbsencesController],
  providers: [SprintAbsencesService],
})
export class SprintAbsencesModule {}
