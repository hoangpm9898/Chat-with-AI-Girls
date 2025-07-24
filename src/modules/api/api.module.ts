import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { AiGirlModule } from '#root/modules/ai-girl/ai-girl.module';

@Module({
	controllers: [ApiController],
	providers: [ApiController],
	imports: [AiGirlModule],
})
export class ApiModule {}
