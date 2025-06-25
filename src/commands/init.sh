#!/bin/bash
#
# Author          : BEL Alexandre
# Script Name     : init.sh
# Description     : Init the project
# Creation Date   : 25/06/2025
# Last Modified   : 25/06/2025
# Version         : 0.1
# Contact         : RaptorTeam@gmail.com
#
# Usage           :
#   ./init.sh
#
# Example         :
#   ./init_project.sh
#
# Notes           :
#   - Make sure to run with appropriate permissions (e.g., chmod +x).
#   - Ensure required environment variables are set (.env).
#
# ----- SCRIPT BEGIN HERE ----

echo "Welcome to the RaptorJs init script"

USER=$(whoami)
FRAMEWORK_PATH="/home/$USER/.raptor"
PROJECT_PATH=$1

read -p 'What is your project name ? ' PROJECT_NAME
read -n 1 -p "Would you like to use Typescript ? y/n " USE_TS
echo

cp $FRAMEWORK_PATH/templates/.env $PROJECT_PATH
cp $FRAMEWORK_PATH/templates/README.md $PROJECT_PATH
cp $FRAMEWORK_PATH/templates/index.js $PROJECT_PATH
cp $FRAMEWORK_PATH/templates/package.json $PROJECT_PATH

RAPTOR_CONF="./raptor.conf.json"

if [[ "$useTs" == "y" || "$USE_TS" == "Y" ]]; then
        cat <<EOF > "$RAPTOR_CONF"
{
  "ts": true
}
EOF

elif [[ "$USE_TS" == "n" || "$USE_TS" == "N" ]]; then
        cat <<EOF > "$RAPTOR_CONF"
{
  "ts": false
}
EOF

else 
        echo "Invalid input. Please use 'y' or 'n'."
        exit 1
fi

echo "Project '$PROJECT_NAME' created at '$PROJECT_PATH'"

cd "$PROJECT_PATH" || { echo "Failed to enter project directory."; exit 1; }
npm install discord.js dotenv

if [[ "$USE_TS" == "y" || "$USE_TS" == "Y" ]]; then
    npm install --save-dev typescript ts-node @types/node
    npx tsc --init
fi
