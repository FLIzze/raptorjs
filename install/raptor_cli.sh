#!/bin/bash

# Author          : RaptorTeam
# Script Name     : raptor_cli.sh
# Description     : cli fo raptorjs
# Creation Date   : 25/06/2025
# Last Modified   : 25/06/2025
# Version         : 0.1
# Contact         : RaptorTeam@gmail.com
#
#
# ----- SCRIPT BEGIN HERE ----

APP_DIR="/opt/raptorjs"

CMD=$1

case "$CMD" in
    init)
        cd "$APP_DIR" || exit 1
        npm run init
        ;;
    *)
        echo "Unknown command: $CMD"
        echo "Usage: raptorjs <cmd>"
        exit 1
        ;;
esac