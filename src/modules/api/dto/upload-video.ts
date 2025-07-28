// dto/upload-video.dto.ts
import { IsString } from 'class-validator';

export class UploadVideoDto {
	@IsString()
	profileId: string;

	@IsString()
	actionId: string;
}
