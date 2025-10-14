#!/bin/bash

# Setup weekly cron job for news sync
# This script sets up a cron job to run every Sunday at 8 AM

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CRON_SCRIPT="$PROJECT_DIR/scripts/sync-news.js"

# Create a log file for cron output
mkdir -p "$PROJECT_DIR/logs"
LOG_FILE="$PROJECT_DIR/logs/news-sync.log"

# Cron job entry (runs every Sunday at 8:00 AM)
CRON_ENTRY="0 8 * * 0 cd $PROJECT_DIR && /usr/bin/node $CRON_SCRIPT >> $LOG_FILE 2>&1"

echo "Setting up weekly news sync cron job..."
echo "Project directory: $PROJECT_DIR"
echo "Log file: $LOG_FILE"
echo "Cron entry: $CRON_ENTRY"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "sync-news.js"; then
    echo "❌ Cron job already exists. Removing old entry..."
    crontab -l 2>/dev/null | grep -v "sync-news.js" | crontab -
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -

if [ $? -eq 0 ]; then
    echo "✅ Weekly news sync cron job installed successfully!"
    echo "📅 Will run every Sunday at 8:00 AM"
    echo "📄 Logs will be saved to: $LOG_FILE"
    echo ""
    echo "To view current cron jobs: crontab -l"
    echo "To remove this cron job: crontab -e (then delete the sync-news.js line)"
    echo "To test manually: npm run sync-news"
else
    echo "❌ Failed to install cron job"
    exit 1
fi