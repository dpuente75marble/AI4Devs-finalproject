import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { SprintAbsencesModule } from './sprint-absences/sprint-absences.module';
import { RefinementModule } from './refinement/refinement.module';
import { SprintAnalysisModule } from './sprint-analysis/sprint-analysis.module';
import { SprintCapacityModule } from './sprint-capacity/sprint-capacity.module';
import { UserStoriesModule } from './user-stories/user-stories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserStoriesModule,
    SprintCapacityModule,
    SprintAbsencesModule,
    SprintAnalysisModule,
    RefinementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
