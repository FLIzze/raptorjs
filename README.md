![Logo raptorjs](./img/raptorlogo.webp)

## Dependencies

[bun](https://bun.sh/)

## How to use ?

### First init the project

```npx raptorjs-discord init```

### Setup .env

First go to the [developers applications](https://discord.com/developers/applications)
```
In general information: Copy your application ID
In Bot                : Copy your token
```

Then paste in .env

```
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
```

### You're ready to go!

*All commands start with `bun x raptorjs`*

```
Available commands:
  help            - Display this help message.
  init            - Initialize the project structure.
  addCommand      - Add Command
  rmCommand       - Remove command
  addOpt          - Add Option to one command
  rmOpt           - Remove Option to one command
  addModel        - Add a new model. Usage: addModel <name>
  migrate         - Run database migrations.
  renameModel     - Rename a model and its DB table. Usage: renameModel <oldName> <newName>
  deleteModel     - Delete a model and its DB table. Usage: deleteModel <name>
  rollback        - Rollbacks
```

(ps :merci le bro ayoub)
