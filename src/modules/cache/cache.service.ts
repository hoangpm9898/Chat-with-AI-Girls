import {Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CacheService {
	constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

	async get<T>(cacheKey: string): Promise<T | undefined> {
		return this.cache.get<T>(cacheKey);
	}

	async set<T>(cacheKey: string, value: T, ttl?: number): Promise<void> {
		await this.cache.set(cacheKey, value, ttl);
	}

	async remember<T>(cacheKey: string, callback: () => Promise<T>, ttl?: number): Promise<T> {
		const cached = await this.get<T>(cacheKey);
		if (cached !== undefined && cached !== null) {
			return cached;
		}

		const value = await callback();
		if (value !== undefined && value !== null) {
			await this.set(cacheKey, value, ttl);
		}

		return value;
	}

	async del(cacheKey: string): Promise<void> {
		await this.cache.del(cacheKey);
	}
}
