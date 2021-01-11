# Workflow document that should be used by all libs

- Use only stdlibs
- Export a class if possible
- Order of getting variables:
  - Read data passed to constructors
  - Read from envar
  - Read from config json
- Try to read local .mixto.json file
  - File file read fails, have class or method arguments to pass host and apikey
- Read entry id with MIXTO_ENTRY_ID envar
  - Allow passing the entry ID to the above class

## Methods
- Read contents of config file
- Post commit
- Get workspaces
- Generic request builder
