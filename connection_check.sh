#!/bin/bash

echo -e "GET http://google.com HTTP/1.0\n\n" | nc google.com 80 > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "online"
    exit 0
else
    echo "offline"
    exit 1
fi
