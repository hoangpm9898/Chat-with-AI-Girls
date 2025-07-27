export interface KlingCallback {
	task_id: string;
	task_status: 'submitted' | 'processing' | 'succeed' | 'failed';
	task_status_msg: string;
	created_at: number;
	task_info: {
		parent_video: {
			id: string;
			url: string;
			duration: string;
		};
		external_task_id: string;
	};
	task_result: {
		images: [
			{
				index: number;
				url: string;
			},
		];
		videos: [
			{
				id: string;
				url: string;
				duration: string;
			},
		];
	};
}
