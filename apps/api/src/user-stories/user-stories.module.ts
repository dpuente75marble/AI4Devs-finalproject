import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/prisma/prisma.module';
import { UserStoriesController } from './user-stories.controller';
import { UserStoriesService } from './user-stories.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserStoriesController],
  providers: [UserStoriesService],
})
export class UserStoriesModule {}
