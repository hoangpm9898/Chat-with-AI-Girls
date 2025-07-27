import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { AiGirlModule } from '#root/modules/ai-girl/ai-girl.module';
import { ChatModule } from '#root/modules/chat/chat.module';
import { VideoModule } from '#root/modules/video/video.module';
import { ChatGPTModule } from '#root/modules/chatgpt/chatgpt.module';
import { KlingModule } from '#root/modules/kling/kling.module';

@Module({
	controllers: [ApiController],
	providers: [ApiController],
	imports: [AiGirlModule, ChatModule, VideoModule, KlingModule, ChatGPTModule, ],
})
export class ApiModule {}
