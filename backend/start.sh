#!/bin/bash

if [ -f .env ]; then
    set -a
    source .env
    set +a
    echo "env settings done"
else
    echo "env file not found"
    exit 1
fi

case "$1" in
    "migrate")
        echo "flyway go away"
        ./mvnw flyway:migrate
        ;;
    "run")
        echo "run hopefully"
        ./mvnw spring-boot:run
        ;;
    "all")
        echo "flyway migrate"
        ./mvnw flyway:migrate
        echo "run app"
        ./mvnw spring-boot:run
        ;;
    *)
        echo "how to use this script (pray first of all):"
        echo " ./start.sh migrate - runs migrations only and keeps me sane"
        echo " ./start.sh run - runs the app"
        echo " ./start.sh all - beeest of both worlds"
        ;;
esac
