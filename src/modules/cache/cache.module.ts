import { Module } from '@nestjs/common';
import { CacheService } from '#root/modules/cache/cache.service';
@Module({
	imports: [],
	providers: [CacheService],
	exports: [CacheService],
})
export class CacheModule {}
