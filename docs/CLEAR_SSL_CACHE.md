# How to Fix SSL Errors in Safari

The SSL errors you're seeing are because Safari is trying to load resources over HTTPS when your dev server runs on HTTP.

## Quick Fix Steps:

### 1. Restart Your Dev Server
The config has been updated. Restart the server:
```bash
npm run dev
```

### 2. Clear Safari's HSTS Cache for localhost

**Option A: Using Safari Developer Menu**
1. Enable Developer menu: Safari → Settings → Advanced → Check "Show Develop menu"
2. Develop → Empty Caches (Cmd+Option+E)
3. Develop → Clear HSTS Cache

**Option B: Using Terminal (macOS)**
```bash
# Remove HSTS cache for localhost
rm ~/Library/Cookies/HSTS.plist
killall -HUP mDNSResponder
```

### 3. Make Sure You're Using HTTP (Not HTTPS)
- ✅ Use: `http://localhost:3000`
- ❌ Don't use: `https://localhost:3000`

### 4. Hard Refresh
- Press `Cmd+Shift+R` to do a hard refresh
- Or close and reopen the tab

### 5. If Still Having Issues
1. Close Safari completely
2. Clear all website data: Safari → Settings → Privacy → Manage Website Data → Remove All
3. Restart Safari
4. Navigate to `http://localhost:3000`

## What Was Fixed:
- Removed `upgrade-insecure-requests` from CSP header in development mode
- This prevents the browser from forcing HTTPS upgrades in local development



