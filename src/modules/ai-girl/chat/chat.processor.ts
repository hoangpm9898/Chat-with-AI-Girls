import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as fs from 'fs/promises';
import { BunnyService } from '#root/modules/bunny/bunny.service';
import * as path from 'path';
import { updateJsonFile } from '#root/common/helpers/file.helper';

@Processor('upload')
export class ChatProcessor {
	constructor(private readonly bunnyService: BunnyService) {}

	@Process('upload-chat')
	async handleUpload(job: Job) {
		const { profileId, actionId, filePath } = job.data;
		const uploadedUrl = await this.bunnyService.upload(filePath, filePath);

		const jobMetadata = {
			jobId: job.id,
			profileId,
			actionId,
			url: uploadedUrl,
		};
		const metadataPath = 'data/metadata/chats.json';
		await updateJsonFile<any[]>(
			metadataPath,
			(data) => {
				const array = Array.isArray(data) ? data : [];
				array.push(jobMetadata);
				return array;
			},
			[],
		);
		await fs.rm(path.dirname(filePath), { recursive: true, force: true });
	}
}
