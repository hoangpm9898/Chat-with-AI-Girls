import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from '#root/modules/app/app.controller';

@Module({
	imports: [ScheduleModule.forRoot()],
	controllers: [AppController],
})
export class AppModule {}
