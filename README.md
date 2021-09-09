# mixto-lite
Lightweight language bindings without external dependencies to build integrations

The idea is to offer a subset of the Mixto API to make integration development easy and without any external dependencies. 

## Supported languages
- Python 2 and 3
- Typescript Node
- Javascript browser
- Go

## Environment variables
- **MIXTO_HOST** The host url for Mixto. Avoid using `/` at the end of the URL
- **MIXTO_API_KEY** The api key for mixto
- **MIXTO_ENTRY_ID** The entry id to interact and post data to

## Usage
All of the sdks needs three variables, the mixto host, mixto api key and entry id. If a constructor is initialized, that gets precedence. Otherwise the sdks also look for three environment variables before falling back to reading the config file. If envars are not present, or constructor options are not passed, then it will always try to read the `~/.mixto.json` file (platform agnostic).

Where possible, the lite sdk offers a MixtoLite class (depends on the language) with the following three methods:
  - **MakeRequest** Generic request builder for mixto
  - **AddCommit** Used to add commits to a Mixto entry
  - **GetEntryIDs** Get entry IDs for a specific workspace. If workspace is not specified, this method may return an entry array.
  - **GetWorkspaces** Used to get all workspaces, entries and commits
    - Provides workspace, entry_id, commit_id etc
