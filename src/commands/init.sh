#!/bin/bash
#
# Author          : BEL Alexandre
# Script Name     : init.sh
# Description     : Init the project
# Creation Date   : 25/06/2025
# Last Modified   : 26/06/2025
# Version         : 0.2
# Contact         : RaptorTeam@gmail.com
#
# Usage           :
#   ./init.sh
#
# Example         :
#   ./init_project.sh
#
# ----- SCRIPT BEGIN HERE -----

FRAMEWORK_DIRECTORY=~/.raptorjs

if [ ! -d $FRAMEWORK_DIRECTORY ]; then
        echo "Downloading framework..."
        git clone https://github.com/FLIzze/raptorjs.git $FRAMEWORK_DIRECTORY
fi

# ----- GIT CLONE FRAMEWORK -----

echo "Welcome to the RaptorJs init script"

USER=$(whoami)

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

mkdir -p ./src

cp $FRAMEWORK_DIRECTORY/templates/init/.env .
cp $FRAMEWORK_DIRECTORY/templates/init/README.md .
cp $FRAMEWORK_DIRECTORY/templates/init/package.json .
cp $FRAMEWORK_DIRECTORY/templates/init/.gitignore .
cp $FRAMEWORK_DIRECTORY/templates/init/index.js ./src

MINI_PROJECT_NAME=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]')
sed -i "s/\"name\": *\"[^\"]*\"/\"name\": \"$MINI_PROJECT_NAME\"/" package.json

if [[ $SQLITE == "y" || $SQLITE == "Y" ]]; then
        mkdir -p ./src/db
        cp $FRAMEWORK_DIRECTORY/templates/db/connection.js ./src/db
        cp $FRAMEWORK_DIRECTORY/templates/db/model.js ./src/db
        cp $FRAMEWORK_DIRECTORY/templates/db/migrate.js ./src/db
fi

# ----- RAPTOR CONF -----
# ----- FOR USER DIR ----

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

npm install discord.js dotenv

if [[ $TS == "y" || $TS == "Y" ]]; then
        npm install --save-dev typescript ts-node @types/node
        npx tsc --init
fi

if [[ $SQLITE == "y" || $SQLITE == "Y" ]]; then
        npm install sqlite3
fi

echo "Project '$PROJECT_NAME' created at '$(pwd)'"
