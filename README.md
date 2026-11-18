# Style Spy — Project 13

Style Spy is a Chrome Extension that inspects the visible styling of the current website and creates reusable design kits.

## Features
- Scans visible page elements and ranks common text/background colours by estimated visible element area.
- Displays font family, weight and size with frequency counts.
- Copy individual colour values or font names.
- Save named style kits in Chrome local extension storage.
- Load or delete saved kits.
- Export the selected scan as CSS custom properties (variables).
- Runs locally in the browser; no website data is sent to a server.

## Install
1. Extract this ZIP file.
2. Open Chrome and visit `chrome://extensions`.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select the extracted `Style_Spy_Project13` folder.
6. Open a normal website, click the Style Spy extension icon and choose Scan this website.

## Test plan
Try five different websites with different layouts and themes. Compare the displayed colours and fonts against the browser's computed styles using Inspect. Save a kit, close and reopen Chrome, then confirm the kit remains available. Export CSS and paste the variables into a simple HTML/CSS page to verify they are valid.

## Limitations
- The scan samples visible DOM elements and ranks colours using approximate element area; it is not a pixel-perfect screenshot colour histogram.
- Some sites use canvas, shadow DOM, cross-origin frames or dynamically loaded content that may not be fully represented.
- The extension scans only the active tab after the user clicks the button.
- Saved kits remain in the current Chrome profile; they are not synced to other devices.
