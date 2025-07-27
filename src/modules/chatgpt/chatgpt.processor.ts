import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ChatgptConfig } from '#root/modules/chatgpt/chatgpt.config';
import OpenAI from 'openai';
import { Logger } from '@nestjs/common';
import { AiGirlService } from '#root/modules/ai-girl/ai-girl.service';
import { readTextFile } from '#root/common/helpers';
import * as path from 'node:path';
import * as fs from 'fs/promises';
import { BunnyService } from '#root/modules/bunny/bunny.service';
import { randomUUID } from 'crypto';

@Processor('generate')
export class ChatGPTProcessor {
	private readonly logger: Logger = new Logger(ChatGPTProcessor.name);

	constructor(
		private readonly aiGirlService: AiGirlService,
		private readonly bunnyService: BunnyService,
	) {}

	@Process('chatgpt-generate-chat')
	async handleChatGPTGenerateVideo(job: Job): Promise<void> {
		const { profileId, toneId } = job.data;
		const tones = await this.aiGirlService.getTones();
		const tone = tones.find((t) => t.id === toneId);
		if (!tone) {
			this.logger.error(`Tone with ID ${toneId} not found for profile ID ${profileId}`);
			throw new Error(`Tone with ID ${toneId} not found`);
		}
		const profiles = await this.aiGirlService.getProfiles();
		const profile = profiles.find((p) => p.profileId === profileId);
		if (!profile) {
			this.logger.error(`Profile with ID ${profileId} not found`);
			throw new Error(`Profile with ID ${profileId} not found`);
		}
		const promptInPath = await readTextFile(tone.prompt_path);
		const prompt = promptInPath || tone.prompt_tmp;
		if (!prompt || prompt.length === 0) {
			this.logger.warn(
				`Prompt is empty for tone ID ${toneId} in profile ID ${profileId}, job ${job.id} - skipping`,
			);
			return;
		}
		try {
			const openAiClient: OpenAI = ChatgptConfig.getClient();
			const response = await openAiClient.responses.create({
				model: 'gpt-4o',
				instructions: 'You are a coding assistant that talks like a pirate',
				input: prompt,
			});
			const output = response.output_text;
			if (!output || output.length === 0) {
				this.logger.warn(`No output generated for profile ID ${profileId}, tone ID ${toneId}, job ${job.id}`);
				return;
			}
			this.logger.log(
				`Generated output for profile ID ${profileId}, tone ID ${toneId}, job ${job.id}: ${output}`,
			);
			const fileName = 'chat.json';
			const dir = `data/media/chats/${randomUUID()}`;
			const fullPath = path.join(dir, fileName);
			await fs.mkdir(dir, { recursive: true });
			await fs.writeFile(fullPath, JSON.stringify({ profileId, toneId, output }, null, 2), 'utf-8');
			const uploadedUrl = await this.bunnyService.upload(fullPath, fullPath);
			this.logger.log(`Uploaded JSON result to Bunny: ${uploadedUrl}`);
			await fs.unlink(fullPath);
		} catch (error) {
			this.logger.error(`Error processing job ${job.id}:`, error);
			throw error;
		}
	}
}
