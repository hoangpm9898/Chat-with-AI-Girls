import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ChatGPTQueue } from '#root/modules/chatgpt/chatgpt.queue';
import { ChatGPTProcessor } from '#root/modules/chatgpt/chatgpt.processor';
import { ChatGPTService } from '#root/modules/chatgpt/chatgpt.service';
import {AiGirlModule} from "#root/modules/ai-girl/ai-girl.module";
import {BunnyModule} from "#root/modules/bunny/bunny.module";

@Module({
	imports: [
		BullModule.registerQueue({
			name: 'generate',
		}),
		AiGirlModule,
		BunnyModule
	],
	providers: [ChatGPTQueue, ChatGPTProcessor, ChatGPTService],
	exports: [ChatGPTQueue, ChatGPTService]
})
export class ChatGPTModule {}
