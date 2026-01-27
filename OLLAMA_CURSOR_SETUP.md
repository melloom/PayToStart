# Setting Up Ollama DeepSeek Coder in Cursor

## Quick Setup Steps

### 1. Verify Ollama is Running
Ollama should be running automatically. If not, start it:
```bash
ollama serve
```

### 2. Configure Cursor to Use Ollama

**Option A: Via Cursor Settings UI**
1. Open Cursor Settings (Cmd+, on Mac)
2. Go to **Features** → **AI**
3. Scroll to **Custom Models** or **Model Settings**
4. Click **Add Model** or **Edit**
5. Add a new model with these settings:
   - **Model Name**: `deepseek-coder` (or any name you prefer)
   - **API Endpoint**: `http://localhost:11434/v1`
   - **Model ID**: `deepseek-coder`
   - **API Key**: Leave empty (Ollama doesn't require keys)

**Option B: Via Settings JSON**
1. Open Command Palette (Cmd+Shift+P)
2. Type "Preferences: Open User Settings (JSON)"
3. Add this configuration:

```json
{
  "cursor.aiModels": [
    {
      "name": "deepseek-coder",
      "provider": "openai",
      "model": "deepseek-coder",
      "apiEndpoint": "http://localhost:11434/v1",
      "apiKey": ""
    }
  ]
}
```

### 3. Select the Model
1. Open Cursor Chat (Cmd+L)
2. Click on the model selector (usually shows "Claude" or "GPT-4")
3. Select **deepseek-coder** from the dropdown

### 4. Test It Out
Try asking it to:
- Write code for you
- Fix errors
- Refactor code
- Explain code

## Alternative: Use Continue Extension

If the above doesn't work, install the **Continue** extension:
1. Open Extensions (Cmd+Shift+X)
2. Search for "Continue"
3. Install it
4. Configure it to use Ollama:
   - Open Continue settings
   - Add model: `deepseek-coder`
   - Set API endpoint: `http://localhost:11434`

## Troubleshooting

**Model not showing up?**
- Make sure Ollama is running: `curl http://localhost:11434/api/tags`
- Restart Cursor after adding the model

**Connection errors?**
- Check Ollama is running: `ollama list`
- Verify endpoint: `curl http://localhost:11434/v1/models`

**Slow responses?**
- DeepSeek Coder is a 6.7B model - it's fast but may be slower than cloud models
- Consider using a smaller model like `codellama:7b` for faster responses

## Available Commands

Once set up, you can use Cursor's AI features:
- **Cmd+L**: Open chat
- **Cmd+K**: Inline edit
- **Cmd+Shift+L**: Composer mode
- **Tab**: Accept suggestions

Your local DeepSeek Coder will work just like the cloud models!
