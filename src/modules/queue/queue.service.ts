import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
	private readonly logger = new Logger(QueueService.name);
	constructor(@InjectQueue('task') private taskQueue: Queue) {}

	async addTask(data: any) {
		await this.taskQueue.add('process-task', data, {
			attempts: 3,
			backoff: 5000,
		});
		this.logger.log('Task added to queue:', data);
	}
}
