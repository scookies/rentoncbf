# Renton Children's Business Fair Website

A static HTML/CSS/JavaScript website showcasing youth entrepreneurship through clean, modern design and Renton municipal-inspired colors.

## 🚀 Quick Start

### Viewing the Website
```bash
# Open any HTML file directly in a web browser, or
# Use a simple HTTP server for local development
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

### No Build Process
- **Static site** - All assets loaded via CDN
- **No compilation** required
- **Immediate changes** - Edit files and refresh browser

## 📋 Managing Fair Data

### Updating Fairs Page

The website uses a simple script to update the Past Fair Highlights section from CSV data:

**Quick Update Process:**
1. Edit `fairs.csv` with new fair information
2. Add images to `images/fairs/[folder_name]/`
3. Run the update script:
   ```bash
   python3 update_fairs.py
   ```

### CSV Format
```csv
Date,Location,Time,Title,Description,Folder Name
3/29/2025,Renton Technical College,12:00pm - 3:00pm,Mid Winter Fair,"Fair description here",mar25
```

### Image Organization
```
images/fairs/
├── mar25/              # Folder name from CSV
│   └── Children.jpg    # Any JPG, PNG, GIF, WebP files
├── jul25/
│   ├── macaron-hero-1.png
│   └── Vendor (2).png
└── oct25/
    └── PST_3098.jpeg
```

### Script Features
- ✅ **Auto-detects images** in each fair folder
- 🎠 **Creates smart carousels** (single image = simple, multiple = full navigation)
- 📝 **Splits long descriptions** into readable paragraphs
- ⚡ **No external dependencies** - uses built-in Python only
- 🔧 **Shows helpful messages** for missing images

**Example Output:**
```
🔄 Updating Fairs Page from CSV...
✅ Read 3 fairs from fairs.csv
📸 Found 2 images in jul25: ['macaron-hero-1.png', 'Vendor (2).png']
✅ Successfully updated fairs.html
```

📖 **Detailed Guide:** See `FAIRS_UPDATE_GUIDE.md` for complete instructions

## 🖼️ Fair Images Auto-Update

### Adding New Fair Images

The website now includes an automated script to update fair carousel images:

**Quick Process:**
1. **Add images** to the appropriate fair folder:
   ```
   images/
   ├── midWinterFair/     # Mid Winter Fair images  
   ├── summerFair/        # Summer Fair images
   └── preHolidayMarket/  # Pre-Holiday Market images
   ```

2. **Run the auto-update script:**
   ```bash
   node update-fair-images.js
   ```

### Script Features
- ✅ **Auto-scans** all fair image folders
- 🔄 **Updates 3 data files** automatically:
  - `data/fair-images.json` (primary data source)
  - `js/data/fair-images-data.js` (fallback for file:// protocol)
  - `js/modules/fair-carousel.js` (hardcoded fallback)
- 📸 **Supports all formats:** JPG, JPEG, PNG, WebP, GIF
- 🚫 **Ignores hidden files** (like .DS_Store)
- 📋 **Shows summary** of found images

**Example Output:**
```
🔄 Scanning fair image directories...

✅ Found 4 images in Summer Fair:
   - images/summerFair/CBF_3966.jpeg
   - images/summerFair/CBF_3967.jpeg
   - images/summerFair/CBF_3970.jpeg
   - images/summerFair/CBF_3989.jpeg

📝 Updating data files...
✅ Updated data/fair-images.json
✅ Updated js/data/fair-images-data.js  
✅ Updated js/modules/fair-carousel.js

🎉 Fair image update complete!
```

### Manual Alternative
If Node.js isn't available, manually edit these files with new image paths:
- `data/fair-images.json`
- `js/data/fair-images-data.js`  
- `js/modules/fair-carousel.js`

## 🎨 Customization

### Colors
All colors centralized in `styles/variables.css`:
```css
--color-trust-blue: #2B5A9E;     /* Municipal Navy Blue */
--color-growth-green: #4A7C59;   /* Forest Green */
--color-energy-orange: #D67E37;  /* Warm Copper */
```

### Site Configuration
Edit `js/config.js` for:
- Site name and branding
- Animation settings
- UI configuration

### Social Media Links
Current footer links:
- **Facebook:** `https://www.facebook.com/profile.php?id=61571426811079`
- **Instagram:** `https://www.instagram.com/rentoncbf`
- **Website:** `https://www.childrensbusinessfair.org/wa-renton`

## 🏗️ Architecture

### Modular JavaScript
- **Class-based architecture** with `RentonCBFApp` main controller
- **Separate modules** for features (navigation, carousel, etc.)
- **Component system** for reusable elements
- **Configuration-driven** design

### File Structure
```
rentoncbf/
├── index.html              # Homepage
├── fairs.html              # Past fairs page
├── fairs.csv               # Fair data source
├── update_fairs.py         # Fairs update script
├── FAIRS_UPDATE_GUIDE.md   # Detailed script guide
├── js/
│   ├── config.js           # Site configuration
│   ├── main.js             # Main application
│   ├── modules/            # Feature modules
│   ├── components/         # Reusable components
│   └── utils/              # Helper functions
├── styles/
│   ├── variables.css       # Color & design system
│   └── main.css           # Main stylesheet
└── images/
    ├── fairs/              # Fair-specific images
    └── [other images]      # General site images
```

### Script Loading Order
Scripts must load in this order (already configured in HTML):
1. `js/config.js` - Site configuration
2. `js/utils/helpers.js` - Utility functions
3. `js/modules/navigation.js` - Navigation module
4. `js/modules/carousel.js` - Carousel functionality
5. `js/components/header.js` - Header component
6. `js/main.js` - Main application

## 🛠️ Development

### Local Development
```bash
# Simple HTTP server
python3 -m http.server 8000

# Or use VS Code Live Server extension
# Or any local development server
```

### Making Changes
1. **Fair Data:** Update `fairs.csv` → Run `python3 update_fairs.py`
2. **Styling:** Edit `styles/variables.css` for colors, `styles/main.css` for layout
3. **Content:** Edit HTML files directly
4. **Functionality:** Modify JavaScript modules in `js/`

### Code Quality
- ✅ **Clean architecture** with single responsibility principle
- 📚 **Comprehensive documentation** in all modules
- 🛡️ **Error handling** with graceful degradation
- ⚡ **Performance optimized** with modern web practices

## 📞 Support

- **Website Issues:** Check browser console for JavaScript errors
- **Fair Updates:** Refer to `FAIRS_UPDATE_GUIDE.md`
- **Development:** See `CLAUDE.md` for detailed architecture notes

---

**🎉 Ready to use!** Edit `fairs.csv`, add images, run `python3 update_fairs.py`, and your website is updated!