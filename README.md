# RaptorJS

Un framework CLI pour la gestion de bots Discord et d’outils associés, conçu pour la rapidité, la simplicité, et la scalabilité.

```
npx raptorjs-discord init
```

## Command Manager

*All commands start with `raptorjs`*

`init` Init the project.

`update` Updates the framework.

`addCommand <name>` Add a template file, and the related command in discord dashboard.

`addEvent <name>` Add a template file, and the related event in discord dashboard.

`deleteCommand <name>` Delete a template file, and the related command in discord dashboard.

`deleteEvent <name>` Add a template file, and the related event in discord dashboard.

`addDb` Add a sqlite db that should work with an ORM.

`addModel <name>` Add a model file that will be migrated later in db.

`migrate` Migrate models to db.

`list commands` List all commands

`list events` List all events

`build prod` Build for prod.

`run dev` Run for dev.

`-v, --version` Display the current version.

`-h, --help` Display the help menu.


## Logs

`/var/log/raptorjs.logs`

## Doc

Everything should be documented.
Every command should have a -h, --help flag.

## Hierarchy

For the users

```
<project_name>/
    .env
    README.md
    raptor.conf.json
    package.json
    src/
        -> models/
        -> table.js
        -> index.js
        // Commands related to the discord bot
        -> commands/
        -> events/
```

The framework itself

```
~/.raptorjs
    README.md
    src/
        -> main.js
        // Commands related to the framework
        -> commands/
    templates/
    install/
    package.json
    raptor.conf.json
```

## Conf 

raptor.conf.json
