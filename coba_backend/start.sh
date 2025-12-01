#!/bin/sh
set -e

wait_for_mongo() {
  hostport=$(echo "$MONGODB_URI" | sed -e 's|^mongodb://||' -e 's|/.*||')
  host=$(echo "$hostport" | cut -d: -f1)
  port=$(echo "$hostport" | cut -d: -f2)
  port=${port:-27017}
  echo "Waiting for Mongo at $host:$port..."
  for i in $(seq 1 30); do
    nc -z "$host" "$port" && return 0
    sleep 1
  done
  echo "Mongo did not become ready in time; continuing anyway."
}

if [ "${AUTO_IMPORT:-1}" = "1" ]; then
  wait_for_mongo
  echo "Seeding data (import:full)..."
  node scripts/import_geodipa_with_magnitude.js || echo "import:full skipped or failed"
  echo "Seeding data (import:picks)..."
  node scripts/import_pick_files.js || echo "import:picks skipped or failed"
fi

echo "Starting backend..."
exec npx tsx src/index.ts

