import { Body, Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AiGirlService } from '#root/modules/ai-girl/ai-girl.service';
import { ApiResponse } from '#root/common/types';
import { VideoQueue } from '#root/modules/ai-girl/video/video.queue';
import { ChatQueue } from '#root/modules/ai-girl/chat/chat.queue';
import { UploadFileInterceptor } from '#root/common/interceptor/';

@Controller('api')
export class ApiController {
	constructor(
		private readonly aiGirlService: AiGirlService,
		private readonly videoQueue: VideoQueue,
		private readonly chatQueue: ChatQueue,
	) {}

	@Get('profiles')
	async getProfile(@Query('cursor') cursor?: string, @Query('limit') limit = 10) {
		const profiles = await this.aiGirlService.getListProfiles(cursor, limit);
		return ApiResponse.list({
			data: profiles.data,
			meta: profiles.pagination,
		});
	}

	@Post('video/upload')
	@UploadFileInterceptor({
		path: 'data/media/videos',
		allowedExt: ['.mp4', '.mov'],
		maxSizeMB: 100,
	})
	async uploadVideo(
		@UploadedFile() file: Express.Multer.File,
		@Body() body: { profileId: string; actionId: string },
	) {
		return this.videoQueue.queueUpload(file, body, file.destination);
	}

	@Post('chats/upload')
	@UploadFileInterceptor({
		path: 'data/media/chats',
		allowedExt: ['.json'],
		maxSizeMB: 5,
	})
	async uploadChatJson(
		@UploadedFile() file: Express.Multer.File,
		@Body() body: { profileId: string; actionId: string },
	) {
		return this.chatQueue.queueUpload(file, body, file.destination);
	}
}
