import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class ChatGPTQueue {
	constructor(@InjectQueue('generate') private readonly chatGptQueue: Queue) {}

	async queueChatGPTTask(profileId: number, toneId: number) {
		const job = await this.chatGptQueue.add('chatgpt-generate-chat', { profileId, toneId });
		return {
			jobId: job.id,
			message: 'Chat generation queued',
		};
	}
}
