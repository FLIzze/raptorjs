#!/bin/bash

# Author          : RaptorTeam
# Description     : install RaptorJs on your pc
# Creation Date   : 25/06/2025
# Last Modified   : 25/06/2025
# Version         : 1.0.0
# Contact         : RaptorTeam@gmail.com
#
# ----- SCRIPT BEGIN HERE ----

set -e

echo "Starting cloning of the RaptorJS repository"

USER=$(whoami)

RAPTORJS_DIR="/home/$USER/.raptorjs"

if [ -d $RAPTORJS_DIR ] then;
        echo "Directory $RAPTORJS_DIR already exists."
        exit 0
fi

CLI_DIR="/home/$USER/.local/bin"

rm -rf "$RAPTORJS_DIR" 2>/dev/null

git clone https://github.com/FLIzze/raptorjs.git "$RAPTORJS_DIR"

rm "$CLI_DIR/raptorjs" 2>/dev/null

mkdir -p "$CLI_DIR"

echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc

source ~/.bashrc

ln -sf "$RAPTORJS_DIR/install/raptor_cli.sh" "$CLI_DIR/raptorjs"

chmod +x "$CLI_DIR/raptorjs"

echo "[+] Installation completed."
