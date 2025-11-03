# Stream Deck Setup for CIV7 Tracker

This project includes Stream Deck shortcuts for quick development workflow.

## Available Actions

### Start Server & Open Chrome

**File:** `start-server-streamdeck.bat`

**What it does:**
1. Closes any existing server on port 8080
2. Starts a new server in the background (minimized window)
3. Waits 3 seconds for server to start
4. Opens Chrome in a new window to `http://localhost:8080/`

**Stream Deck Setup:**
1. Add "System" → "Open" action
2. Set path to: `C:\Users\s_jon\OneDrive\Desktop\Civ 7 Tracker\civ7-tracker\start-server-streamdeck.bat`
3. (Optional) Add an icon or custom image
4. Press the button - server starts and Chrome opens automatically!

**Alternative:** You can also create a PowerShell action pointing to `start-server-launcher.ps1`

## Notes

- The server runs in a minimized console window
- To stop the server, look for the minimized `cmd.exe` window or use Task Manager
- Port 8080 is used by default (can be changed in the .bat file)
- Chrome opens automatically after 3 seconds (gives server time to start)

## Troubleshooting

**Server doesn't start:**
- Check if Node.js is installed: `npx --version`
- Check if port 8080 is free: `netstat -aon | findstr ":8080"`

**Chrome doesn't open:**
- Check if Chrome is installed
- Try changing `chrome.exe` to full path: `"C:\Program Files\Google\Chrome\Application\chrome.exe"`

**Stream Deck action doesn't work:**
- Make sure path uses backslashes: `C:\Users\...`
- Try running the .bat file manually first to test
- Check Stream Deck logs for errors

