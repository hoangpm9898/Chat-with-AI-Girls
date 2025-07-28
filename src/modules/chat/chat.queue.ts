import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class ChatQueue {
	constructor(@InjectQueue('upload') private readonly chatQueue: Queue) {}

	async queueUpload(file: Express.Multer.File, body: any, folderPath: string) {
		const job = await this.chatQueue.add('upload-chat', {
			...body,
			filePath: `${folderPath}/${file.filename}`,
		});
		return {
			jobId: job.id,
			message: 'Chat upload queued',
		};
	}
}
