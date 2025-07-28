import { BunnyModule } from '#root/modules/bunny/bunny.module';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { VideoQueue } from '#root/modules/video/video.queue';
import {VideoProcessor} from "#root/modules/video/video.processor";

@Module({
	imports: [
		BunnyModule,
		BullModule.registerQueue({
			name: 'upload',
		}),
	],
	providers: [VideoQueue, VideoProcessor],
	exports: [VideoQueue],
})
export class VideoModule {}
