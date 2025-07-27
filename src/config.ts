import 'dotenv/config';
import z from 'zod';
import { parseEnv, port } from 'znv';

const createConfigFromEnvironment = (environment: NodeJS.ProcessEnv) => {
	const config = parseEnv(environment, {
		NODE_ENV: z.enum(['development', 'production']).default('development'),
		LOG_LEVEL: z
			.enum(['fatal', 'error', 'warn', 'log', 'debug', 'verbose'])
			.array()
			.default(['fatal', 'error', 'warn', 'log', 'debug', 'verbose']),
		// Web server Configurations
		PORT: port().default(3000),
		// API Server Configurations
		SERVER_HOST: z.string().default('http://localhost:3000'),
		// Redis Configurations
		REDIS_HOST: z.string().default('localhost'),
		REDIS_PORT: port().default(6379),
		//Bunny Configurations
		BUNNY_API_KEY: z.string(),
		BUNNY_STORAGE_ZONE: z.string(),
		BUNNY_STORAGE_REGION: z.string(),
		// Kling Configurations
		KLING_API_KEY: z.string(),
		KLING_API_URL: z.string().default('https://api.klingai.com'),
		// ChatGPT Configurations
		CHATGPT_API_KEY: z.string(),
		CHATGPT_API_URL: z.string().default('https://api.openai.com/v1'),
	});

	return {
		...config,
		isDev: process.env.NODE_ENV === 'development',
		isProd: process.env.NODE_ENV === 'production',
	};
};

export type Config = ReturnType<typeof createConfigFromEnvironment>;

export const config: Config = createConfigFromEnvironment(process.env);
