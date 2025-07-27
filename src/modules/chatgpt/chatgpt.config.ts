import OpenAI from 'openai';
import { config } from '#root/config';

export class ChatgptConfig {
	constructor() {}

	static getClient(): OpenAI {
		return new OpenAI({
			apiKey: config.CHATGPT_API_KEY,
		});
	}
}
