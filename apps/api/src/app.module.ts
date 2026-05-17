import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { UserStoriesModule } from './user-stories/user-stories.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, UserStoriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
