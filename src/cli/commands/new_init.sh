#!/bin/bash
#
# Author          : BEL Alexandre
# Script Name     : init.sh
# Description     : Init the project
# Creation Date   : 25/06/2025
# Last Modified   : 01/07/2025
# Version         : 0.4
# Contact         : RaptorTeam@gmail.com
#
# ----- SCRIPT BEGIN HERE -----

if [ -z "$1" ]; then
    echo "Error: Missing required argument. Please specify the framework directory as the first argument."
    exit 1
fi

FRAMEWORK_DIRECTORY=$1

echo "Welcome to the RaptorJs init script"

# ----- PROJECT NAME -----

read -p 'What is your project name ? ' PROJECT_NAME
mkdir -p "$PROJECT_NAME"
cd $PROJECT_NAME

# ----- TS OR JS -----

read -n 1 -p "Would you like to use Typescript (Recommended) ? y/n " TS
echo

# ----- DATABASE -----

read -n 1 -p "Would you like to use a sqlite database ? y/n " SQLITE
echo
        
# ----- COPPYING TEMPLATES -----

mkdir -p ./src/commands

cp $FRAMEWORK_DIRECTORY/templates/init/.env_sample .env
cp $FRAMEWORK_DIRECTORY/templates/init/README.md .
cp $FRAMEWORK_DIRECTORY/templates/init/package.json .
cp $FRAMEWORK_DIRECTORY/templates/init/.gitignore_sample .gitignore

MINI_PROJECT_NAME=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]')
sed -i "s/\"name\": *\"[^\"]*\"/\"name\": \"$MINI_PROJECT_NAME\"/" package.json

if [[ $SQLITE == "y" || $SQLITE == "Y" ]]; then
        mkdir -p ./src/models
fi

# ----- USER DIR ----

RAPTOR_CONF="./raptor.conf.json"

if [[ $TS == "y" || $TS == "Y" ]]; then
        cat <<EOF > $RAPTOR_CONF
{
        "ts": true
}
EOF

elif [[ $TS == "n" || $TS == "N" ]]; then
        cat <<EOF > $RAPTOR_CONF
{
        "ts": false
}
EOF

fi

# ----- INSTALLING DEPENDENCIES -----

npm install discord.js dotenv raptorjs-discord

if [[ $TS == "y" || $TS == "Y" ]]; then
        npm install --save-dev typescript ts-node @types/node 
        npx tsc --init
        cp $FRAMEWORK_DIRECTORY/templates/init/index.ts ./src
else
        cp $FRAMEWORK_DIRECTORY/templates/init/index.js ./src
fi

if [[ $SQLITE == "y" || $SQLITE == "Y" ]]; then
        npm install sqlite3 sqlite
fi

echo "Project '$PROJECT_NAME' created at '$(pwd)'"
