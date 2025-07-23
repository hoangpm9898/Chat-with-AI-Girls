import 'dotenv/config';
import z from 'zod';
import { parseEnv, port } from 'znv';

const createConfigFromEnvironment = (environment: NodeJS.ProcessEnv) => {
	const config = parseEnv(environment, {
		NODE_ENV: z.enum(['development', 'production']).default('development'),
		LOG_LEVEL: z
			.enum(['fatal', 'error', 'warn', 'log', 'debug', 'verbose'])
			.array()
			.default(['fatal', 'error', 'warn', 'log', 'debug']),

		// Web server Configurations
		PORT: port().default(3000),
		// Redis Configurations
		REDIS_HOST: z.string().default('localhost'),
		REDIS_PORT: port().default(6379),
	});

	return {
		...config,
		isDev: process.env.NODE_ENV === 'development',
		isProd: process.env.NODE_ENV === 'production',
	};
};

export type Config = ReturnType<typeof createConfigFromEnvironment>;

export const config = createConfigFromEnvironment(process.env);
