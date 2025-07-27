import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { config } from '#root/config';
import { firstValueFrom } from 'rxjs';
import { DataPostKling, KlingCallback } from '#root/modules/kling/types';
import { Base64Helper, updateJsonFile } from '#root/common/helpers';
import { Video } from '#root/modules/ai-girl/types';
import { BunnyService } from '#root/modules/bunny/bunny.service';
import * as path from 'path';
import axios from 'axios';
import * as fs from 'fs/promises';
import { randomUUID } from 'crypto';

@Injectable()
export class KlingService {
	private readonly logger: Logger = new Logger(KlingService.name);
	constructor(
		private readonly httpService: HttpService,
		private readonly bunnyService: BunnyService,
	) {}

	async createKlingTask(data: DataPostKling, callbackUrl: string): Promise<any> {
		try {
			const response = await firstValueFrom(
				this.httpService.post(
					`${config.KLING_API_URL}/v1/videos/image2video`,
					{
						prompt: data.prompt,
						image_url: data.imageUrl,
						callback_url: callbackUrl,
						external_task_id: data.jobId,
					},
					{
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${config.KLING_API_KEY}`,
						},
					},
				),
			);
			if (response.status !== 200) {
				this.logger.log(`Kling generate video success with status: ${response.status}`);
				return response;
			}
		} catch (error) {
			this.logger.error('Error creating Kling task:', error);
			throw new Error(`Failed to create Kling task: ${error.message}`);
		}
	}

	async handleKlingCallback(klingCallbackData: KlingCallback, dataEncode: string): Promise<void> {
		switch (klingCallbackData.task_status) {
			case 'succeed':
				const decodedData = Base64Helper.decode<{ jobId: string; actionId: number; profileId: number }>(
					dataEncode,
				);
				if (typeof decodedData === 'string') {
					this.logger.error(`Invalid data format received: ${decodedData}`);
					throw new Error('Invalid data format received from Kling callback');
				}
				const localVideoPath = await this.downloadVideoToLocal(klingCallbackData.task_result.videos[0].url);
				const url = await this.bunnyService.upload(localVideoPath, localVideoPath);
				fs.rm(path.dirname(localVideoPath), { recursive: true, force: true });
				const newVideo = {
					jobId: klingCallbackData.task_info.external_task_id,
					actionId: decodedData.actionId,
					profileId: decodedData.profileId,
					url,
				};
				await updateJsonFile<{ videos: Video[] }>(
					'data/metadata/videos.json',
					(data) => {
						const videos = Array.isArray(data?.videos) ? data.videos : [];
						videos.push(newVideo);
						return { videos };
					},
					{ videos: [] },
				);
				break;
			case 'failed':
				this.logger.error(`Kling task failed: ${klingCallbackData.task_status_msg}`);
		}
	}

	private async downloadVideoToLocal(url: string): Promise<string> {
		const videoDir = path.join('data', 'media', 'videos', randomUUID());
		await fs.mkdir(videoDir, { recursive: true });
		const extMatch = url.match(/\.(mp4|mov|webm|mkv|avi)(\?.*)?$/i);
		const ext = extMatch ? extMatch[1].toLowerCase() : 'mp4'; // mặc định mp4 nếu không tìm được
		const fileName = `file.${ext}`;
		const fullPath = path.join(videoDir, fileName);
		const response = await axios.get(url, { responseType: 'arraybuffer' });
		await fs.writeFile(fullPath, response.data);
		return fullPath;
	}
}
