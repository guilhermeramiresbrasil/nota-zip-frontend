#!/bin/bash
# NotaZip — Database Backup Script
# Usage: ./scripts/backup-database.sh [backup_dir]

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_USER="${POSTGRES_USER:-nota_zip}"
DB_NAME="${POSTGRES_DB:-nota_zip}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/notazip_backup_${TIMESTAMP}.sql.gz"

echo "[$(date)] Starting database backup..."
echo "  Database: $DB_NAME@$DB_HOST:$DB_PORT"
echo "  Output: $BACKUP_FILE"

if command -v docker &>/dev/null && docker compose ps postgres &>/dev/null 2>&1; then
  docker compose exec -T postgres pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"
else
  PGPASSWORD="${POSTGRES_PASSWORD:-changeme}" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"
fi

FILESIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "[$(date)] Backup complete: $BACKUP_FILE ($FILESIZE)"

# Cleanup: keep last 30 backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/notazip_backup_*.sql.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 30 ]; then
  ls -1t "$BACKUP_DIR"/notazip_backup_*.sql.gz | tail -n +31 | xargs rm -f
  echo "[$(date)] Cleaned up old backups (kept last 30)"
fi
