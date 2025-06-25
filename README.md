# RaptorJS

## Command Manager

*All commands start with `raptorjs`*

`init` Init the project.

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

All logs will be displayed in a .log file.

## Doc

Everything should be documented.
Every command should have a -h, --help flag.
