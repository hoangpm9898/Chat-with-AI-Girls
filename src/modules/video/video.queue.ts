import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class VideoQueue {
	constructor(@InjectQueue('upload') private readonly videoQueue: Queue) {}

	async queueUpload(file: Express.Multer.File, body: any, folderPath: string) {
		try {
			const job = await this.videoQueue.add('upload-video', {
				...body,
				filePath: `${folderPath}/${file.filename}`,
			});
			return {
				jobId: job.id,
				message: 'Video upload queued',
			};
		} catch (error) {
			throw new Error(`Failed to queue video upload: ${error.message}`);
		}
	}
}
