import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/prisma/prisma.module';
import { SprintCapacityController } from './sprint-capacity.controller';
import { SprintCapacityService } from './sprint-capacity.service';

@Module({
  imports: [PrismaModule],
  controllers: [SprintCapacityController],
  providers: [SprintCapacityService],
})
export class SprintCapacityModule {}
