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
            if (fs_1.existsSync(confPath)) {
                throw new Error('Mixto config file not found');
            }
            var config = JSON.parse(fs_1.readFileSync(confPath, 'utf-8'));
            this.host = config.host;
            this.api_key = config.api_key;
        }
    }
    return MixtoLite;
}());
exports.MixtoLite = MixtoLite;
