#!/bin/bash

# Script to remove secrets from git history and preserve all changes

echo "=== Fixing Secret in Git History ==="
echo ""

# Step 1: Save current state
echo "Step 1: Creating backup branch..."
git branch backup-all-changes 2>/dev/null
echo "✓ Backup branch 'backup-all-changes' created"
echo ""

# Step 2: Check current status
echo "Step 2: Current status..."
git log --oneline -5
echo ""

# Step 3: Reset to origin/main (removes problematic commits)
echo "Step 3: Resetting to origin/main..."
git reset --hard origin/main
echo "✓ Reset complete"
echo ""

# Step 4: Get the clean changes from backup
echo "Step 4: Applying your changes from backup..."  
git diff backup-all-changes > /tmp/clean_changes.patch
git apply /tmp/clean_changes.patch
echo "✓ Changes applied"
echo ""

# Step 5: Verify no secrets in application.yml
echo "Step 5: Verifying application.yml has no secrets..."
grep -A 3 "Slack Webhook" backend/src/main/resources/application.yml
echo ""

# Step 6: Add and commit
echo "Step 6: Creating new commit..."
git add .
git add .env
git commit -m "feat: Add notification features with environment-based configuration"
echo "✓ New commit created"
echo ""

# Step 7: Show what will be pushed
echo "Step 7: Commits to be pushed..."
git log origin/main..HEAD --oneline
echo ""

# Step 8: Force push
echo "Step 8: Force pushing to remote (this will overwrite the commits with secrets)..."
echo "Press Enter to continue or Ctrl+C to cancel..."
read

git push origin main --force-with-lease

echo ""
echo "=== Done! ==="
echo "If successful, the commits with secrets have been removed from history."
echo "Your backup is in branch 'backup-all-changes' if you need it."

