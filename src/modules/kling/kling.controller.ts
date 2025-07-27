import { Body, Controller, Post, Query } from '@nestjs/common';
import { KlingService } from '#root/modules/kling/kling.service';
import { KlingCallback } from '#root/modules/kling/types';

@Controller('kling')
export class KlingController {
	constructor(private readonly klingService: KlingService) {}

	@Post('callback')
	async handleCallback(@Body() body: KlingCallback, @Query('dataEncode') dataEncode: string) {
		await this.klingService.handleKlingCallback(body, dataEncode);
	}
}
