import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { config } from '#root/config';

@Module({
	imports: [
		BullModule.forRoot({
			redis: { host: config.REDIS_HOST, port: config.REDIS_PORT },
		}),
		BullModule.registerQueue({ name: 'task' }),
	],
	providers: [QueueService],
	exports: [QueueService],
})
export class QueueModule {}
