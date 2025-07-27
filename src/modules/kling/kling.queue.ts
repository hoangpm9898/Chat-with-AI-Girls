import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class KlingQueue {
	constructor(@InjectQueue('generate') private readonly chatQueue: Queue) {}

	async queueKling(profileId: number, actionIds: number[], imageUrl: string) {
		const job = await this.chatQueue.add(
			'kling-generate-video',
			{
				profileId,
				actionIds,
				imageUrl,
			},
			{
				attempts: 3,
				backoff: {
					type: 'exponential',
					delay: 1000,
				},
				removeOnComplete: true,
				removeOnFail: true,
			},
		);
		return {
			jobId: job.id,
			message: 'Video generation queued',
		};
	}
}
