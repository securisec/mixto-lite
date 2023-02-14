"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MixtoLite = void 0;
var fs_1 = require("fs");
var os_1 = require("os");
var path = __importStar(require("path"));
var http = __importStar(require("http"));
var https = __importStar(require("https"));
var MixtoLite = /** @class */ (function () {
    /**
     *Creates an instance of MixtoLite.
     * @param {string} [host] The host URL.
     * @param {string} [apiKey] A valid API key
     * @memberof MixtoLite
     */
    function MixtoLite(host, apiKey) {
        this.host = host;
        this.api_key = apiKey;
        this.workspace_id = undefined;
        if (!this.host) {
            this.host = process.env.MIXTO_HOST;
        }
        if (!this.api_key) {
            this.api_key = process.env.MIXTO_API_KEY;
        }
        // if host and api key is still empty, read config file
        if (!this.host || !this.api_key) {
            var confPath = path.join((0, os_1.homedir)(), '.mixto.json');
            if (!(0, fs_1.existsSync)(confPath)) {
                throw new Error('Mixto config file not found');
            }
            var config = JSON.parse((0, fs_1.readFileSync)(confPath, 'utf-8'));
            this.host = config.host;
            this.api_key = config.api_key;
            this.workspace_id = config.workspace_id;
        }
    }
    /**
     *A generic request handler that allows making requests
     to the Mixto API easy.
     *
     * @param {string} endpoint The URI. Example: /api/entry/...
     * @param {http.RequestOptions} options Request options. Needed
     * when building a custom request to the API
     * @param {*} [data] Data object to send as JSON
     * @param {*} [query] Query params as an object
     * @returns Thenable string
     * @memberof MixtoLite
     */
    MixtoLite.prototype.MakeRequest = function (endpoint, options, data, query) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var url = new URL(endpoint, _this.host);
            if (query) {
                Object.keys(query).map(function (k) { return url.searchParams.append(k, query[k]); });
            }
            options.headers = {
                'x-api-key': _this.api_key,
                'content-type': 'application/json',
                'user-agent': 'mixto-lite-node',
            };
            if (data) {
                options.headers['content-length'] = data.length;
            }
            var reqLib = url.protocol === 'https:' ? https : http;
            var req = reqLib.request(url.toString(), options, function (res) {
                var body = [];
                if (res.statusCode) {
                    if (res.statusCode < 200 || res.statusCode >= 300) {
                        return reject(new Error("Bad response: ".concat(res.statusCode)));
                    }
                }
                res.on('data', function (c) { return body.push(c); });
                res.on('end', function () {
                    resolve(Buffer.concat(body).toString());
                });
                res.on('error', function () { return reject("Bad response: ".concat(res.statusCode)); });
            });
            if (data) {
                req.write(data);
            }
            req.end();
        });
    };
    /**
     *Get an array of all workspaces, entries and commits.
     Helpful when creating builders to select an entry.
     *
     * @returns {Promise<Workspace[]>} Thenable array of workspaces
     * @memberof MixtoLite
     */
    MixtoLite.prototype.GetWorkspaces = function () {
        return this.MakeRequest("/api/v1/workspace", { method: 'GET' }, null).then(function (d) {
            return JSON.parse(d).data;
        });
    };
    /**
     *Get all entry ids filtered by current workspace.
     *
     * @param {boolean} [includeCommits] Include all commits in response
     * @returns {Promise<Entry[]>}
     * @memberof MixtoLite
     */
    MixtoLite.prototype.GetEntryIDs = function (includeCommits) {
        if (includeCommits === void 0) { includeCommits = false; }
        return __awaiter(this, void 0, void 0, function () {
            var body;
            return __generator(this, function (_a) {
                body = JSON.stringify({
                    workspace_id: this.workspace_id,
                    include_commits: includeCommits,
                });
                return [2 /*return*/, this.MakeRequest("/api/v1/workspace", { method: 'POST' }, body).then(function (res) {
                        return JSON.parse(res).data.entries;
                    })];
            });
        });
    };
    /**
     *Add a commit to an entry
     *
     * @param {*} data Data to commit
     * @param {string} [entry_id] A valid entry ID
     * @param {string} [title] Title for the entry. Optional. Defaults
     * to untitled
     * @returns {Promise<Commit>} Thenable Commit object
     * @memberof MixtoLite
     */
    MixtoLite.prototype.AddCommit = function (data, entry_id, title) {
        if (!entry_id && !process.env.MIXTO_ENTRY_ID) {
            throw new Error('Entry ID not specified');
        }
        var body = JSON.stringify({
            data: data,
            commit_type: 'tool',
            title: title,
            workspace_id: this.workspace_id,
            entry_id: entry_id,
            meta: {},
        });
        return this.MakeRequest("/api/v1/commit", { method: 'POST' }, body).then(function (d) {
            return JSON.parse(d);
        });
    };
    /**
     * Make a generic graphql request to the mixto server
     * @param query gql query
     * @param variables optional variables
     * @returns {Promise<GQLResponse>} Thenable GQLResponse object
     */
    MixtoLite.prototype.GraphQL = function (query, variables) {
        var body = { query: query };
        if (variables) {
            body['variables'] = variables;
        }
        return this.MakeRequest('/api/v1/gql', { method: 'POST' }, JSON.stringify(body)).then(function (d) {
            return JSON.parse(d);
        });
    };
    return MixtoLite;
}());
exports.MixtoLite = MixtoLite;
