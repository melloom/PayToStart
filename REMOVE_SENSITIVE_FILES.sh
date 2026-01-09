#!/bin/bash
# Script to remove sensitive files from git history (if already committed)

echo "⚠️  This will remove sensitive files from git tracking"
echo "Files to remove:"
echo "  - VERCEL_ENV_VARS.txt"
echo "  - env.local.formatted"
echo "  - LOCAL_DEVELOPMENT.txt"
echo "  - SUPABASE_ENV_VARS.txt"
echo "  - ENV_KEYS.txt"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git rm --cached VERCEL_ENV_VARS.txt env.local.formatted LOCAL_DEVELOPMENT.txt SUPABASE_ENV_VARS.txt ENV_KEYS.txt 2>/dev/null || true
  echo "✅ Files removed from git tracking (they remain locally)"
  echo "📝 Commit with: git commit -m 'Remove sensitive files from git'"
else
  echo "❌ Cancelled"
fi
