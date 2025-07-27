import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { AiGirlProfile } from '#root/modules/ai-girl/types';
import { AiGirlService } from '#root/modules/ai-girl/ai-girl.service';
import { Logger } from '@nestjs/common';
import { Base64Helper, readTextFile } from '#root/common/helpers';
import { KlingService } from '#root/modules/kling/kling.service';
import { config } from '#root/config';
import { DataPostKling } from '#root/modules/kling/types';

@Processor('generate')
export class KlingProcessor {
	private readonly logger: Logger = new Logger(KlingProcessor.name);
	constructor(
		private readonly aiGirlService: AiGirlService,
		private readonly klingService: KlingService,
	) {}

	@Process('kling-generate-video')
	async generateVideoKling(job: Job) {
		const { profileId, actionIds, imageUrl } = job.data;
		try {
			const profile: AiGirlProfile | undefined = (await this.aiGirlService.getProfiles()).find(
				(p) => p.profileId === profileId,
			);
			if (!profile) throw new Error(`Profile with ID ${profileId} not found`);
			const actions = (await this.aiGirlService.getActions()).filter((action) => actionIds.includes(action.id));
			if (actions.length === 0)
				throw new Error(`No actions found for profile ID ${profileId} with action IDs ${actionIds.join(', ')}`);
			for (const action of actions) {
				const promptTmp: string = action.prompt_tmp;
				const prompPath: string = action.prompt_path;
				const valuePromptPath = await readTextFile(prompPath);
				const prompt = valuePromptPath ? valuePromptPath : promptTmp;
				if (prompt.length === 0) {
					this.logger.warn(
						`Prompt is empty for action ID ${action.id} in profile ID ${profileId}, job ${job.id} - skipping`,
					);
					continue;
				}
				const data: DataPostKling = {
					jobId: String(job.id),
					prompt,
					imageUrl,
				};
				await this.klingService.createKlingTask(
					data,
					this.generateCallbackUrl({ jobId: String(job.id), actionId: action.id }),
				);
				this.logger.log(
					`Generating video for profile ID ${profileId}, action ID ${action.id} in job ${job.id}`,
				);
			}
		} catch (error) {
			this.logger.error(`Error generating video for profile ID ${profileId}:`, error);
			throw error;
		}
	}

	private generateCallbackUrl(data: { jobId: string; actionId: number }): string {
		return `${config.SERVER_HOST}/v1/kling/callback?dataEncode=${Base64Helper.encode(data)}`;
	}
}
