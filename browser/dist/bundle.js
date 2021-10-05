(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mixto = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MixtoLite = void 0;
var MixtoLite = /** @class */ (function () {
    /**
     *Creates an instance of MixtoLite.
     * @param {string} host Mixto host URL
     * @param {string} apiKey A valid Mixto API key
     * @memberof MixtoLite
     */
    function MixtoLite(workspace, host, apiKey) {
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
    MixtoLite.prototype.MakeRequest = function (endpoint, options, data, query) {
        var url = new URL(endpoint, this.host);
        if (query) {
            Object.keys(query).map(function (k) { return url.searchParams.append(k, query[k]); });
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
    };
    /**
     *Get an array of all workspaces, entries and commits.
     Helpful when creating builders to select an entry.
     *
     * @returns {Promise<Workspace[]>} Thenable array of workspaces
     * @memberof MixtoLite
     */
    MixtoLite.prototype.GetWorkspaces = function () {
        return this.MakeRequest("/api/misc/workspaces/" + this.workspace, {
            method: 'GET',
        }).then(function (d) { return d.json(); });
    };
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
    MixtoLite.prototype.AddCommit = function (data, entry_id, title) {
        if (title === void 0) { title = ''; }
        var body = {
            data: data,
            type: 'tool',
            title: title,
            meta: {},
        };
        return this.MakeRequest("/api/entry/" + this.workspace + "/" + entry_id + "/commit", { method: 'POST' }, body).then(function (d) { return d.json(); });
    };
    return MixtoLite;
}());
exports.MixtoLite = MixtoLite;

},{}]},{},[1])(1)
});
