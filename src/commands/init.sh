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

read -p 'What is your project name ? ' projectName
read -n 1 -p "Would you like to use Typescript ? y/n " useTs
echo

cp /opt/raptorjs/templates/.env .
cp /opt/raptorjs/templates/README.md .
cp /opt/raptorjs/templates/index.js .
cp /opt/raptorjs/templates/package.json .

raptorConf="./raptor.conf.json"

if [[ "$useTs" == "y" || "$useTs" == "Y" ]]; then
        cat <<EOF > "$raptorConf"
{
  "ts": true
}
EOF

elif [[ "$useTs" == "n" || "$useTs" == "N" ]]; then
        cat <<EOF > "$raptorConf"
{
  "ts": false
}
EOF

else 
        echo "Invalid input. Please use 'y' or 'n'."
        exit 1
fi

echo "Project '$projectName' created at '$projectDir'"

cd "$projectDir" || { echo "Failed to enter project directory."; exit 1; }
npm install discord.js dotenv

if [[ "$useTs" == "y" || "$useTs" == "Y" ]]; then
    npm install --save-dev typescript ts-node @types/node
    npx tsc --init
fi
