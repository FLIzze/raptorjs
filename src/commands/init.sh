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

echo "Welcome to the RaptorJs init script"

USER=$(whoami)
FRAMEWORK_PATH="/home/$USER/.raptorjs"

# ----- PROJECT NAME -----

read -p 'What is your project name ? ' PROJECT_NAME

# ----- TS OR JS -----

read -n 1 -p "Would you like to use Typescript (Recommended) ? y/n " TS
echo

# ----- DATABASE -----

read -n 1 -p "Would you like to use a sqlite database ? y/n " SQLITE
echo

# ----- COPPYING TEMPLATES -----

PROJECT_PATH="$1$PROJECT_NAME"
mkdir -p "$PROJECT_PATH"
cd "$PROJECT_PATH"
mkdir src

cp $FRAMEWORK_PATH/templates/init/.env $PROJECT_PATH/
cp $FRAMEWORK_PATH/templates/init/README.md $PROJECT_PATH/
cp $FRAMEWORK_PATH/templates/init/package.json $PROJECT_PATH/
cp $FRAMEWORK_PATH/templates/init/.gitignore $PROJECT_PATH/
cp $FRAMEWORK_PATH/templates/init/index.js $PROJECT_PATH/src/

MINI_PROJECT_NAME=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]')
sed -i "s/\"name\": *\"[^\"]*\"/\"name\": \"$MINI_PROJECT_NAME\"/" package.json

if [[ $SQLITE == "y" || $SQLITE == "Y" ]]; then
        mkdir $PROJECT_PATH/src/db
        cp $FRAMEWORK_PATH/templates/db/connection.js $PROJECT_PATH/src/db
        cp $FRAMEWORK_PATH/templates/db/model.js $PROJECT_PATH/src/db
        cp $FRAMEWORK_PATH/templates/db/migrate.js $PROJECT_PATH/src/db
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

# ----- FOR FRAMEWORK -----

cat <<EOF > $HOME/.raptorjs/raptor.conf.json
{
        "projectPath": "$PROJECT_PATH"
}
EOF

# ----- INSTALLING DEPENDENCIES -----

cd "$PROJECT_PATH" || { echo "Failed to enter project directory."; exit 1; }
npm install discord.js dotenv

if [[ $TS == "y" || $TS == "Y" ]]; then
        npm install --save-dev typescript ts-node @types/node
        npx tsc --init
fi

if [[ $SQLITE == "y" || $SQLITE == "Y" ]]; then
        npm install sqlite3
fi

echo "Project '$PROJECT_NAME' created at '$PROJECT_PATH'"
