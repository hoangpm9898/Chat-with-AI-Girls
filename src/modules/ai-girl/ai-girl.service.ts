import { Injectable } from '@nestjs/common';
import { AiGirlProfile, Chat, Video, Action, Tone } from '#root/modules/ai-girl/types';
import { readJsonFile } from '#root/common/helpers';
import { CursorHelper } from '#root/common/helpers';
import { Meta, Pagination } from '#root/common/types';
import { CacheService } from '#root/modules/cache/cache.service';

@Injectable()
export class AiGirlService {
	constructor(private readonly cacheService: CacheService) {}

	public async getProfiles(): Promise<AiGirlProfile[]> {
		return this.cacheService.remember<AiGirlProfile[]>('ai-girl-profiles', async () => {
			const result = await readJsonFile<{ profiles: AiGirlProfile[] }>('data/metadata/profiles.json');
			return result?.profiles ?? [];
		});
	}

	public async getChats(): Promise<Chat[]> {
		return this.cacheService.remember<Chat[]>('ai-girl-chats', async () => {
			const result = await readJsonFile<{ chats: Chat[] }>('data/metadata/chats.json');
			return result?.chats ?? [];
		});
	}

	public async getVideos(): Promise<Video[]> {
		return this.cacheService.remember<Video[]>('ai-girl-videos', async () => {
			const result = await readJsonFile<{ videos: Video[] }>('data/metadata/videos.json');
			return result?.videos ?? [];
		});
	}

	public async getActions(): Promise<Action[]> {
		return this.cacheService.remember<Action[]>('ai-girl-actions', async () => {
			const result = await readJsonFile<{ actions: Action[] }>('data/actions.json');
			return result?.actions ?? [];
		});
	}

	public async getTones(): Promise<Tone[]> {
		return this.cacheService.remember<Tone[]>('ai-girl-profiles', async () => {
			const result = await readJsonFile<{ tones: Tone[] }>('data/tones.json');
			return result?.tones ?? [];
		});
	}

	async getListProfiles(cursor?: string, limit = 10): Promise<Pagination<AiGirlProfile>> {
		const profiles: AiGirlProfile[] = await this.getProfiles();
		const decoded = CursorHelper.decodeCursor(cursor ?? '');
		const offset = decoded?.offset ?? 0;
		const data: AiGirlProfile[] = profiles.slice(offset, offset + limit);
		const meta: Meta = CursorHelper.createPaginationMeta(offset, limit, profiles.length);
		return { data, meta };
	}

	async getListChats(cursor?: string, limit = 10): Promise<Pagination<Chat>> {
		const chats: Chat[] = await this.getChats();
		const decoded = CursorHelper.decodeCursor(cursor ?? '');
		const offset = decoded?.offset ?? 0;
		const data: Chat[] = chats.slice(offset, offset + limit);
		const meta: Meta = CursorHelper.createPaginationMeta(offset, limit, chats.length);
		return { data, meta };
	}

	async getListVideos(cursor?: string, limit = 10): Promise<Pagination<Video>> {
		const videos: Video[] = await this.getVideos();
		const offset = CursorHelper.decodeCursor(cursor ?? '')?.offset ?? 0;
		const data: Video[] = videos.slice(offset, offset + limit);
		const meta: Meta = CursorHelper.createPaginationMeta(offset, limit, videos.length);
		return { data, meta };
	}
}
