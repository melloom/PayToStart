# Manual Continue Extension Installation

The Continue extension has been downloaded to: `/tmp/continue.vsix`

## Installation Steps:

1. **Open Command Palette in Cursor:**
   - Press `Cmd+Shift+P` (or `F1`)

2. **Install from VSIX:**
   - Type: `Extensions: Install from VSIX...`
   - Select it from the dropdown

3. **Select the downloaded file:**
   - Navigate to: `/tmp/continue.vsix`
   - Click "Install"

4. **Restart Cursor:**
   - After installation, restart Cursor completely

5. **Verify Installation:**
   - Press `Cmd+Shift+X` to open Extensions
   - Search for "Continue"
   - It should show as "Installed"

## After Installation:

The Continue extension should automatically detect your Ollama model (`deepseek-coder`) since we've already configured it in `~/.continue/config.json`.

If it doesn't work:
- Check that Ollama is running: `ollama list`
- Verify the config file exists: `cat ~/.continue/config.json`
