import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from '#root/modules/app/app.controller';
import { AiGirlModule } from '#root/modules/ai-girl/ai-girl.module';
import { CacheModule } from '@nestjs/cache-manager';
import { config } from '#root/config';
import * as redisStore from 'cache-manager-redis-store';
import { BullModule } from '@nestjs/bull';
import { ApiModule } from '#root/modules/api/api.module';
import {VideoModule} from "#root/modules/video/video.module";
import {ChatModule} from "#root/modules/chat/chat.module";
import {ChatGPTModule} from "#root/modules/chatgpt/chatgpt.module";
import {KlingModule} from "#root/modules/kling/kling.module";

@Module({
	imports: [
		ScheduleModule.forRoot(),
		AiGirlModule,
		CacheModule.register({
			isGlobal: true,
			useFactory: async () => ({
				store: redisStore,
				host: config.REDIS_HOST,
				port: config.REDIS_PORT,
				ttl: 300,
			}),
		}),
		BullModule.forRoot({
			redis: {
				host: config.REDIS_HOST,
				port: config.REDIS_PORT,
			},
		}),
		ApiModule,
		VideoModule,
		ChatModule,
		ChatGPTModule,
		KlingModule
	],
	controllers: [AppController],
})
export class AppModule {}
