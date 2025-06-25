#!/bin/bash

# Author          : RaptorTeam
# Script Name     : helper.sh
# Description     : Display help and usage information for RaptorJS CLI
# Creation Date   : $(date +%d/%m/%Y)
# Last Modified   : $(date +%d/%m/%Y)
# Version         : 0.0.1
# Contact         : RaptorTeam@gmail.com
#
# Usage           :
#   raptorjs -h|--help
#   raptorjs helper
#
# Example         :
#   raptorjs --help
#   raptorjs helper
#
# Notes           :
#   - This helper displays all available commands and their usage
#   - Each command has its own detailed help with -h flag
#
# ----- SCRIPT BEGIN HERE ----

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Version du projet
VERSION="0.0.1"

# Fonction pour afficher le titre principal
print_header() {
    echo -e "${CYAN}"
    echo "╭─────────────────────────────────────────────────────────────╮"
    echo "│                        RaptorJS CLI                         │"
    echo "│                     Command Manager                         │"
    echo "│                      Version ${VERSION}                          │"
    echo "╰─────────────────────────────────────────────────────────────╯"
    echo -e "${NC}"
}

# Fonction pour afficher l'usage général
print_usage() {
    echo -e "${WHITE}USAGE:${NC}"
    echo -e "  ${GREEN}raptorjs${NC} ${YELLOW}<command>${NC} [options]"
    echo ""
}

# Fonction pour afficher les commandes disponibles
print_commands() {
    echo -e "${WHITE}COMMANDES DISPONIBLES:${NC}"
    echo ""
    
    echo -e "${PURPLE}Gestion du projet:${NC}"
    echo -e "  ${GREEN}init${NC}                     Initialise le projet"
    echo -e "  ${GREEN}build prod${NC}               Build pour la production"
    echo -e "  ${GREEN}run dev${NC}                  Lance en mode développement"
    echo ""
    
    echo -e "${PURPLE}Gestion des commandes:${NC}"
    echo -e "  ${GREEN}addCommand${NC} <name>        Ajoute un template de commande"
    echo -e "  ${GREEN}deleteCommand${NC} <name>     Supprime une commande"
    echo -e "  ${GREEN}list commands${NC}            Liste toutes les commandes"
    echo ""
    
    echo -e "${PURPLE}Gestion des événements:${NC}"
    echo -e "  ${GREEN}addEvent${NC} <name>          Ajoute un template d'événement"
    echo -e "  ${GREEN}deleteEvent${NC} <name>       Supprime un événement"
    echo -e "  ${GREEN}list events${NC}              Liste tous les événements"
    echo ""
    
    echo -e "${PURPLE}Base de données:${NC}"
    echo -e "  ${GREEN}addDb${NC}                    Ajoute une base SQLite avec ORM"
    echo -e "  ${GREEN}addModel${NC} <name>          Ajoute un modèle de données"
    echo -e "  ${GREEN}migrate${NC}                  Migre les modèles vers la DB"
    echo ""
    
    echo -e "${PURPLE}Aide et information:${NC}"
    echo -e "  ${GREEN}-h, --help${NC}               Affiche cette aide"
    echo -e "  ${GREEN}-v, --version${NC}            Affiche la version"
    echo ""
}

# Fonction pour afficher les exemples
print_examples() {
    echo -e "${WHITE}EXEMPLES:${NC}"
    echo -e "  ${CYAN}# Initialiser un nouveau projet${NC}"
    echo -e "  raptorjs init"
    echo ""
    echo -e "  ${CYAN}# Ajouter une nouvelle commande${NC}"
    echo -e "  raptorjs addCommand ping"
    echo ""
    echo -e "  ${CYAN}# Lister toutes les commandes${NC}"
    echo -e "  raptorjs list commands"
    echo ""
    echo -e "  ${CYAN}# Lancer en mode développement${NC}"
    echo -e "  raptorjs run dev"
    echo ""
    echo -e "  ${CYAN}# Obtenir l'aide pour une commande spécifique${NC}"
    echo -e "  raptorjs addCommand --help"
    echo ""
}

# Fonction pour afficher les notes importantes
print_notes() {
    echo -e "${WHITE}NOTES IMPORTANTES:${NC}"
    echo -e "  ${YELLOW}•${NC} Assurez-vous d'exécuter avec les permissions appropriées (chmod +x)"
    echo -e "  ${YELLOW}•${NC} Vérifiez que les variables d'environnement sont configurées (.env)"
    echo -e "  ${YELLOW}•${NC} Chaque commande dispose de sa propre aide avec le flag -h"
    echo -e "  ${YELLOW}•${NC} Les logs sont disponibles dans: ${CYAN}/var/log/raptorjs.logs${NC}"
    echo -e "  ${YELLOW}•${NC} Documentation complète requise pour chaque commande"
    echo ""
}

# Fonction pour afficher la hiérarchie du projet
print_hierarchy() {
    echo -e "${WHITE}HIÉRARCHIE DU PROJET:${NC}"
    echo -e "${BLUE}"
    echo "RaptorJS/"
    echo "├── src/"
    echo "│   ├── models/           # Modèles de données"
    echo "│   ├── commands/         # Commandes CLI"
    echo "│   ├── events/           # Gestionnaires d'événements"
    echo "│   ├── tests/            # Tests"
    echo "│   └── db/               # Base de données"
    echo "└── .env                  # Variables d'environnement"
    echo -e "${NC}"
}

# Fonction pour afficher les informations de contact et support
print_footer() {
    echo -e "${WHITE}SUPPORT:${NC}"
    echo -e "  ${YELLOW}Contact:${NC} RaptorTeam@gmail.com"
    echo -e "  ${YELLOW}GitHub:${NC}  https://github.com/FLIzze/raptorjs"
    echo -e "  ${YELLOW}Issues:${NC}  https://github.com/FLIzze/raptorjs/issues"
    echo ""
    echo -e "${CYAN}Pour plus d'aide sur une commande spécifique, utilisez:${NC}"
    echo -e "  raptorjs <commande> --help"
    echo ""
}

# Fonction principale
main() {
    print_header
    print_usage
    print_commands
    print_examples
    print_notes
    print_hierarchy
    print_footer
}

# Vérifier les arguments
case "${1:-}" in
    -h|--help|help|"")
        main
        ;;
    -v|--version|version)
        echo -e "${GREEN}RaptorJS CLI version ${VERSION}${NC}"
        ;;
    *)
        echo -e "${RED}Erreur: Option inconnue '${1}'${NC}"
        echo -e "Utilisez 'raptorjs --help' pour voir l'aide"
        exit 1
        ;;
esac
