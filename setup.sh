#!/bin/bash

./node_modules/.bin/sequelize db:migrate --env production --config server/config/config.json --migrations-path server/migrations
node server/create_admin_user.js admin@example.com password 'AdminUser'
