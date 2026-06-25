import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../infrastructure/prisma/prisma.module';
import { SprintAbsencesController } from './sprint-absences.controller';
import { SprintAbsencesService } from './sprint-absences.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SprintAbsencesController],
  providers: [SprintAbsencesService],
})
export class SprintAbsencesModule {}
