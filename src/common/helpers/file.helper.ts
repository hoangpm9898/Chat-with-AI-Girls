import * as fs from 'fs/promises';

export async function readJsonFile<T>(path: string): Promise<T | null> {
	try {
		const data = await fs.readFile(path, 'utf-8');
		return JSON.parse(data) as T;
	} catch (error) {
		return null;
	}
}

export async function writeJsonFile<T>(path: string, data: T): Promise<void> {
	await fs.writeFile(path, JSON.stringify(data, null, 2));
}

export async function updateJsonFile<T>(path: string, updateFn: (data: T) => T, defaultData: T): Promise<void> {
	const data = (await readJsonFile<T>(path)) ?? defaultData;
	const updatedData = updateFn(data);
	await writeJsonFile(path, updatedData);
}
