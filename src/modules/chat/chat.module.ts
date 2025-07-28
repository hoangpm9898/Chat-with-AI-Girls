import { BunnyModule } from '#root/modules/bunny/bunny.module';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ChatQueue } from '#root/modules/chat/chat.queue';
import {ChatProcessor} from "#root/modules/chat/chat.processor";

@Module({
	imports: [
		BunnyModule,
		BullModule.registerQueue({
			name: 'upload',
		}),
	],
	controllers: [],
	providers: [ChatQueue, ChatProcessor],
	exports: [ChatQueue],
})
export class ChatModule {}
