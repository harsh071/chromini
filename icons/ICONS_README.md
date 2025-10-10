# Icons for AI Writing Assistant

This directory contains the extension icons. The manifest requires icons in the following sizes:
- icon16.png (16x16)
- icon48.png (48x48)
- icon128.png (128x128)

## Creating Icons

A base SVG icon has been provided in `icon.svg`. To create the required PNG icons:

### Using ImageMagick (if installed):
```bash
# Install ImageMagick first if you haven't:
# brew install imagemagick (macOS)
# sudo apt-get install imagemagick (Linux)

# Convert SVG to different sizes
convert -background none icon.svg -resize 16x16 icon16.png
convert -background none icon.svg -resize 48x48 icon48.png
convert -background none icon.svg -resize 128x128 icon128.png
```

### Using Online Tools:
1. Open https://www.aconvert.com/image/svg-to-png/
2. Upload `icon.svg`
3. Set the target size and convert
4. Download and rename to the appropriate filename

### Using Inkscape (free design tool):
1. Install Inkscape from https://inkscape.org/
2. Open `icon.svg`
3. File → Export PNG Image
4. Set width/height and export each size

### Temporary Placeholder
For testing purposes, you can create simple colored squares:
```bash
# Create placeholder icons (requires ImageMagick)
convert -size 16x16 xc:'#667eea' icon16.png
convert -size 48x48 xc:'#667eea' icon48.png
convert -size 128x128 xc:'#667eea' icon128.png
```

The extension will work without icons, but Chrome will show a warning in the extensions page.
