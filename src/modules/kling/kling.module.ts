import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { KlingService } from '#root/modules/kling/kling.service';
import { KlingQueue } from '#root/modules/kling/kling.queue';
import { KlingController } from '#root/modules/kling/kling.controller';
import { HttpModule } from '@nestjs/axios';
import { BunnyModule } from '#root/modules/bunny/bunny.module';

@Module({
	imports: [
		BullModule.registerQueue({
			name: 'generate',
		}),
		HttpModule,
		BunnyModule,
	],
	controllers: [KlingController],
	providers: [KlingService, KlingQueue],
	exports: [KlingService, KlingQueue],
})
export class KlingModule {}
