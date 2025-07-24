import { Inject, Injectable } from '@nestjs/common';
import { AiGirlProfile } from '#root/modules/ai-girl/types/profile';
import { readJsonFile } from '#root/common/helpers/file.helper';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CursorHelper } from '#root/common/helpers/cursor.helper';

@Injectable()
export class AiGirlService {
	private readonly cacheKey = 'ai-girl-profiles';

	constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

	private async getProfiles(): Promise<AiGirlProfile[]> {
		const cached = await this.cache.get<AiGirlProfile[]>(this.cacheKey);
		if (cached) return cached;
		const result = await readJsonFile<{ profiles: AiGirlProfile[] }>('data/metadata/profiles.json');
		const profiles = result?.profiles ?? [];
		if (profiles.length > 0) await this.cache.set(this.cacheKey, profiles);
		return profiles;
	}

	async getListProfiles(
		cursor?: string,
		limit = 10,
	): Promise<{
		data: AiGirlProfile[];
		pagination: ReturnType<typeof CursorHelper.createPaginationMeta>;
	}> {
		const profiles = await this.getProfiles();
		const decoded = CursorHelper.decodeCursor(cursor ?? '');
		const offset = decoded?.offset ?? 0;
		const data = profiles.slice(offset, offset + limit);
		const pagination = CursorHelper.createPaginationMeta(offset, limit, profiles.length);

		return {
			data,
			pagination,
		};
	}
}
