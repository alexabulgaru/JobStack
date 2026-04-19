#!/bin/bash

if [ -f .env ]; then
    set -a
    source <(grep -Ev '^[[:space:]]*(//|#|$)' .env)
    set +a
    echo "env settings done"
else
    echo "env file not found"
    exit 1
fi

ensure_port_free() {
    local port="$1"
    local pids
    pids=$(lsof -ti :"$port")

    if [ -n "$pids" ]; then
        echo "port $port is in use by PID(s): $(echo "$pids" | tr '\n' ' '). stopping..."
        while IFS= read -r pid; do
            [ -n "$pid" ] && kill "$pid" 2>/dev/null || true
        done <<< "$pids"
        
        for _ in 1 2 3 4 5; do
            sleep 1
            if ! lsof -ti :"$port" >/dev/null; then
                break
            fi
        done

        if lsof -ti :"$port" >/dev/null; then
            echo "process on port $port did not stop gracefully. force killing..."
            local remaining
            remaining=$(lsof -ti :"$port")
            while IFS= read -r pid; do
                [ -n "$pid" ] && kill -9 "$pid" 2>/dev/null || true
            done <<< "$remaining"
            sleep 1
        fi

        if lsof -ti :"$port" >/dev/null; then
            echo "failed to free port $port"
            exit 1
        fi

        echo "port $port is now free"
    fi
}

case "$1" in
    "migrate")
        echo "flyway go away"
        ./mvnw flyway:migrate
        ;;
    "run")
        ensure_port_free 8080
        echo "run hopefully"
        ./mvnw spring-boot:run &
        sleep 5
        xdg-open http://localhost:8080/swagger-ui.html
        wait
        ;;
    "all")
        ensure_port_free 8080
        echo "flyway migrate"
        ./mvnw flyway:migrate
        echo "run app"
        ./mvnw spring-boot:run &
        sleep 5
        xdg-open http://localhost:8080/swagger-ui.html
        wait
        ;;
    *)
        echo "how to use this script (pray first of all):"
        echo " ./start.sh migrate - runs migrations only and keeps me sane"
        echo " ./start.sh run - runs the app"
        echo " ./start.sh all - beeest of both worlds"
        ;;
esac
