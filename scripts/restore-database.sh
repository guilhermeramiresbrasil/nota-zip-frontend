#!/bin/bash
# NotaZip — Database Restore Script
# Usage: ./scripts/restore-database.sh <backup_file>

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup_file.sql.gz>"
  echo ""
  echo "Available backups:"
  ls -lh backups/notazip_backup_*.sql.gz 2>/dev/null || echo "  No backups found in ./backups/"
  exit 1
fi

BACKUP_FILE="$1"
DB_USER="${POSTGRES_USER:-nota_zip}"
DB_NAME="${POSTGRES_DB:-nota_zip}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "WARNING: This will overwrite the database '$DB_NAME'."
echo "Backup file: $BACKUP_FILE"
read -p "Are you sure? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Restore cancelled."
  exit 0
fi

echo "[$(date)] Starting database restore..."

if command -v docker &>/dev/null && docker compose ps postgres &>/dev/null 2>&1; then
  echo "  Stopping dependent services..."
  docker compose stop auth-ms user-ms note-guard-ms message-control-ms 2>/dev/null || true

  echo "  Restoring database..."
  gunzip -c "$BACKUP_FILE" | docker compose exec -T postgres psql -U "$DB_USER" "$DB_NAME"

  echo "  Restarting services..."
  docker compose start auth-ms user-ms note-guard-ms message-control-ms
else
  echo "  Restoring database..."
  gunzip -c "$BACKUP_FILE" | PGPASSWORD="${POSTGRES_PASSWORD:-changeme}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
fi

echo "[$(date)] Restore complete!"
