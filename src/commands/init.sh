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

projectDir="$HOME/Documents/$projectName"
mkdir -p $projectDir
mkdir $projectDir/{src,commands,models,events,db}

# Will change src to /opt
cp $HOME/Documents/raptorjs/templates/.env $projectDir/
cp $HOME/Documents/raptorjs/templates/README.md $projectDir/

raptorConf="$projectDir/raptor.conf.json"
if [[ "$useTs" == "y" || "$useTs" == "Y" ]] then
        cat <<EOF > "$raptorConf"
{
        "ts": true
}
EOF
elif [[ "$useTs" == "n" || "$useTs" == "N" ]] then
        cat <<EOF > "$raptorConf"
{
        "ts": false
}
EOF
else 
        echo "Invalid input. Please use 'y' or 'n'."
        exit 1
fi

echo "Project $projectName created at $projectDir"
