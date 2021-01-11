import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import * as path from 'path';
import * as http from 'http';

export class MixtoLite {
	host: string | undefined;
	api_key: string | undefined;

	constructor(host?: string, apiKey?: string) {
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
			if (!existsSync(confPath)) {
				throw new Error('Mixto config file not found');
			}
			const config = JSON.parse(readFileSync(confPath, 'utf-8'));
			this.host = config.host;
			this.api_key = config.api_key;
		}
	}

	MakeRequest(
		endpoint: string,
		options: http.RequestOptions,
		data?: any,
		query?: any
	) {
		return new Promise((resolve, reject) => {
			const url = new URL(endpoint, this.host);
			if (query) {
				Object.keys(query).map((k) => url.searchParams.append(k, query[k]));
			}
			options.headers = {
				'x-api-key': this.api_key,
				'content-type': 'application/json',
				'user-agent': 'mixto-lite-node',
			};
			if (data) {
				options.headers['content-length'] = data.length;
			}
			console.log(options);
			console.log(data);
			const req = http.request(url.toString(), options, (res) => {
				var body: any[] = [];
				if (res.statusCode) {
					if (res.statusCode < 200 || res.statusCode >= 300) {
						return reject(new Error(`Bad response: ${res.statusCode}`));
					}
				}
				res.on('data', (c) => body.push(c));
				res.on('end', () => {
					resolve(Buffer.concat(body).toString());
				});
				res.on('error', () => reject(`Bad response: ${res.statusCode}`));
			});
			if (data) {
				req.write(data);
			}
			req.end();
		});
	}

	GetWorkspaces() {
		return this.MakeRequest('/api/misc/workspaces', { method: 'GET' }, null, {
			all: 'true',
		}).then((d) => {
			return JSON.parse(d as any) as Workspace[];
		});
	}

	AddCommit(data: any, entry_id?: string, title?: string) {
		if (!entry_id && !process.env.MIXTO_ENTRY_ID) {
			throw new Error('Entry ID not specified');
		}
		let body = JSON.stringify({
			data: data,
			type: 'tool',
			title: title,
			meta: {},
		});
		return this.MakeRequest(
			`/api/entry/${entry_id}/commit`,
			{ method: 'POST' },
			body
		).then((d) => {
			return JSON.parse(d as any) as Commit;
		});
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
