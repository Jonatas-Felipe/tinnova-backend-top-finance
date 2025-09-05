#!/bin/sh
set -e

echo "Running database migrations..."
yarn knex:migrate

echo "Starting the application..."
exec "$@"