#!/usr/bin/env bash
LISTEN_ADDR=127.0.0.1
LISTEN_PORT=8000
python -m http.server -b $LISTEN_ADDR $LISTEN_PORT
xdg-open http://$LISTEN_ADDR:$LISTEN_PORT/