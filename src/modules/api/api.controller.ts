import { Body, Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AiGirlService } from '#root/modules/ai-girl/ai-girl.service';
import { ApiResponse } from '#root/common/types';
import { UploadFileInterceptor } from '#root/common/interceptor/';
import { VideoQueue } from '#root/modules/video/video.queue';
import { ChatQueue } from '#root/modules/chat/chat.queue';
import { KlingQueue } from '#root/modules/kling/kling.queue';
import { ChatGPTQueue } from '#root/modules/chatgpt/chatgpt.queue';

@Controller('api')
export class ApiController {
	constructor(
		private readonly aiGirlService: AiGirlService,
		private readonly videoQueue: VideoQueue,
		private readonly chatQueue: ChatQueue,
		private readonly klingQueue: KlingQueue,
		private readonly chatGPTQueue: ChatGPTQueue,
	) {}

	@Get('profiles')
	async getProfiles(@Query('cursor') cursor?: string, @Query('limit') limit = 10) {
		const listProfiles = await this.aiGirlService.getListProfiles(cursor, limit);
		return ApiResponse.list(listProfiles);
	}

	@Get('chats')
	async getChats(@Query('cursor') cursor?: string, @Query('limit') limit = 10) {
		const listChats = await this.aiGirlService.getListChats(cursor, limit);
		return ApiResponse.list(listChats);
	}

	@Get('videos')
	async getVideos(@Query('cursor') cursor?: string, @Query('limit') limit = 10) {
		const listVideos = await this.aiGirlService.getListVideos(cursor, limit);
		return ApiResponse.list(listVideos);
	}

	@Post('videos/generate')
	async generateVideoAction(@Body() body: { profileId: number; actionIds: number[]; imageUrl: string }) {
		const { profileId, actionIds, imageUrl } = body;
		const result = await this.klingQueue.queueKling(profileId, actionIds, imageUrl);
		return ApiResponse.Success(result);
	}

	@Post('chats/generate')
	async generateChatAction(@Body() body: { profileId: number; toneId: number }) {
		const result = await this.chatGPTQueue.queueChatGPTTask(body.profileId, body.toneId);
		return ApiResponse.Success(result);
	}

	@Post('video/upload')
	@UploadFileInterceptor({
		path: 'data/media/videos',
		allowedExt: ['.mp4', '.mov'],
		maxSizeMB: 100,
	})
	async uploadVideo(
		@UploadedFile() file: Express.Multer.File,
		@Body() body: { profileId: string; toneId: string },
	) {
		const result = await this.videoQueue.queueUpload(file, body, file.destination);
		return ApiResponse.Success(result);
	}

	@Post('chats/upload')
	@UploadFileInterceptor({
		path: 'data/media/chats',
		allowedExt: ['.json'],
		maxSizeMB: 5,
	})
	async uploadChatJson(
		@UploadedFile() file: Express.Multer.File,
		@Body() body: { profileId: string; toneId: string },
	) {
		const result = await this.chatQueue.queueUpload(file, body, file.destination);
		return ApiResponse.Success(result);
	}
}
