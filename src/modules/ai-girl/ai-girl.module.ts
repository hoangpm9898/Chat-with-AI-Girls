import { Module } from '@nestjs/common';
import { AiGirlService } from './ai-girl.service';
import { VideoQueue } from '#root/modules/ai-girl/video/video.queue';
import { VideoProcessor } from '#root/modules/ai-girl/video/video.processor';
import { BunnyModule } from '#root/modules/bunny/bunny.module';
import { BullModule } from '@nestjs/bull';
import { ChatQueue } from '#root/modules/ai-girl/chat/chat.queue';
import { ChatProcessor } from '#root/modules/ai-girl/chat/chat.processor';

@Module({
	imports: [
		BunnyModule,
		BullModule.registerQueue({
			name: 'upload',
		}),
	],
	providers: [AiGirlService, VideoQueue, VideoProcessor, ChatQueue, ChatProcessor],
	exports: [AiGirlService, VideoQueue, ChatQueue],
})
export class AiGirlModule {}
