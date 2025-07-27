import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as fs from 'fs/promises';
import { BunnyService } from '#root/modules/bunny/bunny.service';
import * as path from 'path';
import { updateJsonFile } from '#root/common/helpers';
import { Logger } from '@nestjs/common';

@Processor('upload')
export class VideoProcessor {
	private readonly logger: Logger = new Logger(VideoProcessor.name);
	constructor(private readonly bunnyService: BunnyService) {}

	@Process('upload-video')
	async handleUpload(job: Job) {
		this.logger.log(`Processing job ${job.id} for video upload`);
		const { profileId, actionId, filePath } = job.data;
		const uploadedUrl = await this.bunnyService.upload(filePath, filePath);
		const newVideo = {
			jobId: job.id,
			profileId,
			actionId,
			url: uploadedUrl,
		};
		try {
			const metadataPath = 'data/metadata/videos.json';
			await updateJsonFile<{ videos: any[] }>(
				metadataPath,
				(data) => {
					const videos = Array.isArray(data?.videos) ? data.videos : [];
					videos.push(newVideo);
					return { videos };
				},
				{ videos: [] },
			);
			await fs.rm(path.dirname(filePath), { recursive: true, force: true });
		} catch (error) {
			this.logger.error('Error updating metadata or deleting file:', error);
			throw error;
		}
	}
}
