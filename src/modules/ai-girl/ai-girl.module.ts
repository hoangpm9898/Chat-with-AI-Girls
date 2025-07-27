import { Module } from '@nestjs/common';
import { AiGirlService } from './ai-girl.service';
import {CacheModule} from "#root/modules/cache/cache.module";

@Module({
	imports: [CacheModule],
	providers: [AiGirlService],
	exports: [AiGirlService],
})
export class AiGirlModule {}
