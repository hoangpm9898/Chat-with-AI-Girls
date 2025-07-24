import { Test, TestingModule } from '@nestjs/testing';
import { AiGirlService } from './ai-girl.service';

describe('AiGirlService', () => {
	let service: AiGirlService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [AiGirlService],
		}).compile();

		service = module.get<AiGirlService>(AiGirlService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
