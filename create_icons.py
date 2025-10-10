#!/usr/bin/env python3
"""
Simple script to create placeholder PNG icons for the Chrome extension.
Uses PIL/Pillow to create gradient icons.
"""

try:
    from PIL import Image, ImageDraw
    import os

    def create_gradient_icon(size, filename):
        """Create a gradient icon with a pen symbol"""
        img = Image.new('RGB', (size, size), '#667eea')
        draw = ImageDraw.Draw(img)

        # Create gradient effect
        for y in range(size):
            r = int(102 + (118 - 102) * y / size)
            g = int(126 + (75 - 126) * y / size)
            b = int(234 + (162 - 234) * y / size)
            draw.line([(0, y), (size, y)], fill=(r, g, b))

        # Save
        img.save(filename, 'PNG')
        print(f"Created {filename}")

    # Create icons directory if it doesn't exist
    os.makedirs('icons', exist_ok=True)

    # Create icons
    create_gradient_icon(16, 'icons/icon16.png')
    create_gradient_icon(48, 'icons/icon48.png')
    create_gradient_icon(128, 'icons/icon128.png')

    print("\nAll icons created successfully!")
    print("You can replace these with custom designs later.")

except ImportError:
    print("PIL/Pillow not installed. Install with: pip install Pillow")
    print("\nAlternatively, you can:")
    print("1. Use the icon.svg file with an online converter")
    print("2. Create simple colored squares as placeholders")
    print("3. Skip icons for now (extension will work but show a warning)")
