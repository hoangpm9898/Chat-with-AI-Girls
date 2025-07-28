import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as fs from 'fs/promises';
import { BunnyService } from '#root/modules/bunny/bunny.service';
import * as path from 'path';
import { updateJsonFile } from '#root/common/helpers';
import { Logger } from '@nestjs/common';

@Processor('upload')
export class ChatProcessor {
	private readonly logger: Logger = new Logger(ChatProcessor.name);
	constructor(private readonly bunnyService: BunnyService) {}

	@Process('upload-chat')
	async handleUpload(job: Job) {
		this.logger.log(`Processing job ${job.id} for chat upload`);
		const { profileId, toneId, filePath } = job.data;
		const uploadedUrl = await this.bunnyService.upload(filePath, filePath);
		const newChat = {
			jobId: job.id,
			profileId,
			toneId,
			url: uploadedUrl,
		};
		const metadataPath = 'data/metadata/chats.json';
		await updateJsonFile<{ chats: any[] }>(
			metadataPath,
			(data) => {
				const chats = Array.isArray(data?.chats) ? data.chats : [];
				chats.push(newChat);
				return { chats };
			},
			{ chats: [] },
		);
		await fs.rm(path.dirname(filePath), { recursive: true, force: true });
		this.logger.log(`Chat uploaded successfully for job ${job.id}, profile ID ${profileId}, tone ID ${toneId}`);
	}
}
