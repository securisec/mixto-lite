export class MixtoLite {
	host: string;
	apiKey: string;
	workspace: string;

	/**
	 *Creates an instance of MixtoLite.
	 * @param {string} host Mixto host URL
	 * @param {string} apiKey A valid Mixto API key
	 * @memberof MixtoLite
	 */
	constructor(workspace: string, host: string, apiKey: string) {
		this.host = host;
		this.apiKey = apiKey;
		this.workspace = workspace;

		if (!this.host || !this.apiKey) {
			throw new Error('Host or API key not provided');
		}
	}

	/**
	 *A generic request handler that allows making requests 
	 to the Mixto API easy.
	 *
	 * @param {string} endpoint API Endpoint
	 * @param {RequestInit} options Fetch request options
	 * @param {*} [data] Body data
	 * @param {*} [query] Query Params
	 * @returns {Promise<Response>} Fetch Response
	 * @memberof MixtoLite
	 */
	MakeRequest(
		endpoint: string,
		options: RequestInit,
		data?: any,
		query?: any
	): Promise<Response> {
		const url = new URL(endpoint, this.host);
		if (query) {
			Object.keys(query).map((k) => url.searchParams.append(k, query[k]));
		}
		options.headers = {
			'x-api-key': this.apiKey,
			'user-agent': 'mixto-lite-browser',
		};
		if (data) {
			options.headers['content-type'] = 'application/json';
			options.headers['content-length'] = data.length;
			options.body = JSON.stringify(data);
		}

		return fetch(url.toString(), options);
	}

	/**
	 *Get an array of all workspaces, entries and commits. 
	 Helpful when creating builders to select an entry.
	 *
	 * @returns {Promise<Workspace[]>} Thenable array of workspaces
	 * @memberof MixtoLite
	 */
	GetWorkspaces(): Promise<Workspace[]> {
		return this.MakeRequest(`/api/misc/workspaces/${this.workspace}`, {
			method: 'GET',
		}).then((d) => d.json());
	}

	/**
	 *Add a commit to an entry
	 *
	 * @param {*} data Data to commit
	 * @param {string} [entry_id] A valid entry ID
	 * @param {string} [title] Title for the entry. Optional. Defaults
	 * to Untitled
	 * @returns {Promise<Commit>} Thenable Commit object
	 * @memberof MixtoLite
	 */
	AddCommit(data: any, entry_id: string, title: string = ''): Promise<Commit> {
		let body = {
			data: data,
			type: 'tool',
			title: title,
			meta: {},
		};
		return this.MakeRequest(
			`/api/entry/${this.workspace}/${entry_id}/commit`,
			{ method: 'POST' },
			body
		).then((d) => d.json());
	}
}

export interface Workspace {
	workspace: string;
	title: string;
	category: string;
	entry_id: string;
	commit_count: number;
	flags_count: number;
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
