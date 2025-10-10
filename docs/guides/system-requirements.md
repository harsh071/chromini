# System Requirements

Complete hardware and software requirements for Chrome Built-in AI APIs.

## Hardware Requirements

All Chrome Built-in AI APIs share the following hardware requirements:

### Storage
- **Minimum**: 22 GB free disk space
- **Purpose**: AI model storage
- **Note**: Models are downloaded once and cached locally

### GPU
- **Minimum**: 4 GB VRAM
- **Recommended**: 6+ GB VRAM for better performance
- **Purpose**: Model inference acceleration

### CPU
- **Minimum**: 4+ cores
- **Recommended**: 8+ cores for optimal performance

### RAM
- **Minimum**: 16 GB
- **Recommended**: 32 GB for running multiple models

### Network
- **Initial Download**: Unmetered network connection required
- **After Download**: Works completely offline
- **Note**: Models are large (several GB) and download once

## Supported Operating Systems

### Windows
- **Minimum**: Windows 10
- **Recommended**: Windows 11
- **Architecture**: x64

### macOS
- **Minimum**: macOS 13 (Ventura)
- **Recommended**: macOS 14+ (Sonoma or later)
- **Architecture**: Intel and Apple Silicon supported

### Linux
- **Distributions**: Most modern distributions supported
- **Kernel**: Recent kernel versions
- **Note**: Check Chrome compatibility for specific distros

### ChromeOS
- **Minimum**: Platform 16389.0.0+
- **Device**: Chromebook Plus models
- **Note**: Regular Chromebooks may not meet hardware requirements

## Browser Requirements

### Chrome Version
Different APIs have different minimum versions:

| API | Minimum Chrome Version | Origin Trial |
|-----|----------------------|--------------|
| Writer API | 137+ | Required (137-142) |
| Rewriter API | 137+ | Required (137-142) |
| Proofreader API | 141+ | Required (141-145) |
| Translator API | 138+ | May be required |
| Language Detector | 138+ | May be required |
| Summarizer API | 138+ | Required |
| Prompt API | 137+ | Required |

### Origin Trial

Most APIs require origin trial registration:

1. Visit [Chrome Origin Trials](https://developer.chrome.com/origintrials/)
2. Register your origin/domain
3. Obtain trial token
4. Add token to your HTML:

```html
<meta http-equiv="origin-trial" content="YOUR_TOKEN_HERE">
```

Or via HTTP header:
```
Origin-Trial: YOUR_TOKEN_HERE
```

### Feature Flags

Some APIs may require enabling experimental flags during development:

1. Navigate to `chrome://flags`
2. Search for "AI" or specific API name
3. Enable relevant flags
4. Restart Chrome

**Note**: Origin trial tokens work in production without flags.

## Platform Support

### Desktop
✅ **Fully Supported**
- Windows 10/11
- macOS 13+
- Linux
- ChromeOS (Chromebook Plus)

### Mobile
❌ **Not Supported**
- Android
- iOS
- Mobile Chrome
- Mobile ChromeOS

**Note**: All Built-in AI APIs are desktop-only.

### Web Workers
❌ **Generally Not Supported**
- Most APIs do not work in Web Workers
- Check individual API documentation for exceptions

### Service Workers
❌ **Not Supported**
- Built-in AI APIs require main thread execution

### Cross-Origin Iframes
⚠️ **Limited Support**
- Requires explicit permission via Permissions Policy
- Example:

```html
<iframe
  src="https://example.com"
  allow="ai-prompt-api *; ai-writer-api *;"
></iframe>
```

## Checking Requirements in Code

### Feature Detection

```javascript
function checkAISupport() {
  const support = {
    writer: 'Writer' in self,
    rewriter: 'Rewriter' in self,
    proofreader: 'Proofreader' in self,
    translator: 'Translator' in self,
    languageDetector: 'LanguageDetector' in self,
    summarizer: 'Summarizer' in self,
    promptAPI: 'ai' in self && 'languageModel' in self.ai
  };

  return support;
}

const support = checkAISupport();
console.log('AI Support:', support);
```

### Check Availability

```javascript
async function checkAllAvailability() {
  const availability = {};

  if ('Writer' in self) {
    availability.writer = await Writer.availability();
  }

  if ('Rewriter' in self) {
    availability.rewriter = await Rewriter.availability();
  }

  if ('Translator' in self) {
    availability.translator = await Translator.availability({
      sourceLanguage: 'en',
      targetLanguage: 'es'
    });
  }

  if ('Summarizer' in self) {
    availability.summarizer = await Summarizer.availability();
  }

  if ('ai' in self && 'languageModel' in self.ai) {
    availability.promptAPI = await ai.languageModel.availability();
  }

  return availability;
}

const availability = await checkAllAvailability();
console.log('Availability:', availability);
```

### System Information

```javascript
function getSystemInfo() {
  return {
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    language: navigator.language,
    hardwareConcurrency: navigator.hardwareConcurrency, // CPU cores
    deviceMemory: navigator.deviceMemory, // RAM in GB (if available)
    connection: navigator.connection?.effectiveType
  };
}

console.log('System Info:', getSystemInfo());
```

## Storage Considerations

### Model Storage Locations

Models are stored in Chrome's profile directory:

- **Windows**: `%LOCALAPPDATA%\Google\Chrome\User Data\Default\`
- **macOS**: `~/Library/Application Support/Google/Chrome/Default/`
- **Linux**: `~/.config/google-chrome/Default/`

### Clearing Model Cache

Models can be cleared via Chrome settings:
1. Settings → Privacy and security
2. Clear browsing data
3. Advanced → Cached images and files
4. Clear data

**Note**: Models will re-download on next use.

## Performance Considerations

### First-Time Use
- Model download required (several GB)
- Download time depends on connection speed
- Model compilation on first run
- Subsequent uses are much faster

### Concurrent Usage
- Multiple APIs can run simultaneously
- Each API instance uses GPU/CPU resources
- Monitor system resources in production

### Memory Usage
- Each session consumes RAM
- Destroy sessions when done
- Avoid creating too many concurrent sessions

## Troubleshooting

### Model Download Fails

**Possible Causes:**
- Insufficient disk space (need 22+ GB)
- Network connection interrupted
- Firewall blocking download

**Solutions:**
- Free up disk space
- Use stable network connection
- Check firewall settings

### API Not Available

**Possible Causes:**
- Browser version too old
- Platform not supported (mobile)
- Origin trial expired

**Solutions:**
- Update Chrome to latest version
- Use desktop Chrome
- Renew origin trial token

### Performance Issues

**Possible Causes:**
- Insufficient RAM/VRAM
- Too many concurrent sessions
- Background processes consuming resources

**Solutions:**
- Close unnecessary applications
- Destroy unused AI sessions
- Upgrade hardware if consistently slow

### GPU Acceleration Issues

**Check GPU Status:**
1. Visit `chrome://gpu`
2. Check "Graphics Feature Status"
3. Ensure WebGL and GPU acceleration enabled

## Production Checklist

Before deploying to production:

- [ ] Verified Chrome version requirements
- [ ] Obtained and tested origin trial token
- [ ] Tested on target operating systems
- [ ] Measured actual storage requirements
- [ ] Tested model download on slow connections
- [ ] Implemented progress indicators for downloads
- [ ] Added fallbacks for unsupported platforms
- [ ] Tested on minimum hardware specifications
- [ ] Monitored memory usage under load
- [ ] Documented system requirements for users

## User Requirements Communication

Example user-facing requirements notice:

```markdown
## System Requirements

To use AI features, your system must meet:

**Minimum Requirements:**
- Chrome 138 or later (desktop)
- 22 GB free disk space
- 16 GB RAM
- 4 GB GPU memory
- Stable internet connection (first use only)

**Supported Platforms:**
- Windows 10/11
- macOS 13+
- Linux
- ChromeOS (Chromebook Plus)

**Not Supported:**
- Mobile devices
- Older Chrome versions
- Systems with less than specified hardware

**First Use:**
AI models will download automatically (several GB).
This may take several minutes depending on your connection.
After download, features work offline.
```

## Related Resources

- [Chrome Release Schedule](https://chromiumdash.appspot.com/schedule)
- [Chrome Origin Trials](https://developer.chrome.com/origintrials/)
- [Chrome GPU Status](chrome://gpu)
- [Chrome Flags](chrome://flags)
