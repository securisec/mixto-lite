"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MixtoLite = void 0;
var fs_1 = require("fs");
var os_1 = require("os");
var path = __importStar(require("path"));
var http = __importStar(require("http"));
var MixtoLite = /** @class */ (function () {
    function MixtoLite(host, apiKey) {
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
            var confPath = path.join(os_1.homedir(), '.mixto.json');
            if (!fs_1.existsSync(confPath)) {
                throw new Error('Mixto config file not found');
            }
            var config = JSON.parse(fs_1.readFileSync(confPath, 'utf-8'));
            this.host = config.host;
            this.api_key = config.api_key;
        }
    }
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
            console.log(options);
            console.log(data);
            var req = http.request(url.toString(), options, function (res) {
                var body = [];
                if (res.statusCode) {
                    if (res.statusCode < 200 || res.statusCode >= 300) {
                        return reject(new Error("Bad response: " + res.statusCode));
                    }
                }
                res.on('data', function (c) { return body.push(c); });
                res.on('end', function () {
                    resolve(Buffer.concat(body).toString());
                });
                res.on('error', function () { return reject("Bad response: " + res.statusCode); });
            });
            if (data) {
                req.write(data);
            }
            req.end();
        });
    };
    MixtoLite.prototype.GetWorkspaces = function () {
        return this.MakeRequest('/api/misc/workspaces', { method: 'GET' }, null, {
            all: 'true',
        }).then(function (d) {
            return JSON.parse(d);
        });
    };
    MixtoLite.prototype.AddCommit = function (data, entry_id, title) {
        if (!entry_id && !process.env.MIXTO_ENTRY_ID) {
            throw new Error('Entry ID not specified');
        }
        var body = JSON.stringify({
            data: data,
            type: 'tool',
            title: title,
            meta: {},
        });
        return this.MakeRequest("/api/entry/" + entry_id + "/commit", { method: 'POST' }, body).then(function (d) {
            return JSON.parse(d);
        });
    };
    return MixtoLite;
}());
exports.MixtoLite = MixtoLite;
