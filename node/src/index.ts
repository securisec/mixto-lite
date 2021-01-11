import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import * as path from 'path';
import * as http from 'http'

export class MixtoLite {
	host: string | undefined;
	api_key: string | undefined;

	constructor(host: string | undefined, apiKey: string | undefined) {
		this.host = host;
		this.api_key = apiKey;
		if (!this.host) {
			this.host = process.env.MIXTO_HOST;
		}
		if (!this.api_key) {
			this.api_key = process.env.MIXTO_API_KEY;
		}
		// if host and api key is still empty, read config file
		if (!this.host || !this.api_key) {
			const confPath = path.join(homedir(), '.mixto.json');
			if (existsSync(confPath)) {
				throw new Error('Mixto config file not found');
			}
			const config = JSON.parse(readFileSync(confPath, 'utf-8'));
			this.host = config.host;
			this.api_key = config.api_key;
		}
	}
}

export interface Workspace {
	workspace: string;
	title: string;
	category: string;
	entry_id: string;
	commit_count: number;
	priority: string;
	time_updated: number;
	commits: Commit[];
}

export interface Commit {
	commit_it: string;
	title: string;
	type: string;
	time_updated: number;
}
