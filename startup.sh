#!/bin/bash

nginx
pm2 --no-daemon start /gratefulchat/server/app.js
