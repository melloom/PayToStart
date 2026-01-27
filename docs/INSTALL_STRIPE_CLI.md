# Installing Stripe CLI (Without Homebrew)

If you don't have Homebrew installed, here are alternative ways to install Stripe CLI on macOS:

## Option 1: Direct Download (Easiest)

1. **Download the binary**:
   - Go to: https://github.com/stripe/stripe-cli/releases/latest
   - Download: `stripe_X.X.X_macOS_x86_64.tar.gz` (for Intel Macs)
   - Or: `stripe_X.X.X_macOS_arm64.tar.gz` (for Apple Silicon/M1/M2 Macs)

2. **Extract and install**:
   ```bash
   # Navigate to Downloads
   cd ~/Downloads
   
   # Extract the tar file (replace X.X.X with version number)
   tar -xzf stripe_X.X.X_macOS_x86_64.tar.gz
   
   # Move to a location in your PATH (like /usr/local/bin)
   sudo mv stripe /usr/local/bin/
   
   # Verify installation
   stripe --version
   ```

## Option 2: Using npm (If you have Node.js)

```bash
npm install -g stripe-cli
```

## Option 3: Install Homebrew First (Recommended for future)

If you want to install Homebrew (useful for many tools):

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install Stripe CLI
brew install stripe/stripe-cli/stripe
```

## Verify Installation

After installing, verify it works:

```bash
stripe --version
```

You should see something like: `stripe version X.X.X`

## Next Steps

Once Stripe CLI is installed:

1. **Login**:
   ```bash
   stripe login
   ```

2. **Forward webhooks to local server** (keep this running):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. **Copy the webhook secret** (starts with `whsec_`) to your `.env.local`:
   ```env
   STRIPE_TEST_WEBHOOK_SECRET=whsec_xxxxx
   ```

## Troubleshooting

### "Command not found: stripe"

- Make sure the `stripe` binary is in your PATH
- Try: `which stripe` to see if it's found
- If not, add it to your PATH or use the full path: `/usr/local/bin/stripe`

### Permission Denied

If you get permission errors:
```bash
sudo chmod +x /usr/local/bin/stripe
```
