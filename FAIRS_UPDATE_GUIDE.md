# Fairs Update Guide

## Quick Start

To update the fairs page with new fair data:

1. **Update CSV**: Edit `fairs.csv` with your fair information
2. **Add Images**: Place images in `images/fairs/[folder_name]/`
3. **Run Script**: Execute `python3 update_fairs.py`

## CSV File Format

The `fairs.csv` file should have these columns:

| Column | Description | Example |
|--------|-------------|---------|
| `Date` | Fair date | `3/29/2025` |
| `Location` | Venue name | `Renton Technical College` |
| `Time` | Time range | `12:00pm - 3:00pm` |
| `Title` | Fair title | `Mid Winter Fair` |
| `Description` | Full description of the fair | `"Our first fair was amazing..."` |
| `Folder Name` | Image folder name | `mar25` |

## Image Organization

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

## Using the Script

### Basic Usage
```bash
python3 update_fairs.py
```

### Example Output
```
🔄 Updating Fairs Page from CSV...
========================================
✅ Read 3 fairs from fairs.csv

📋 Fairs found in CSV:
1. Mid Winter Fair - 3/29/2025 at Renton Technical College
2. Summer Fair - 7/26/25 at Honey Dew Elementary
3. Pre-Holiday Market - 10/25/25 at Junior Achievement of Washington

========================================
📸 Found 1 images in mar25: ['Children.jpg']
📸 Found 2 images in jul25: ['macaron-hero-1.png', 'Vendor (2).png']
📸 Found 1 images in oct25: ['PST_3098.jpeg']
✅ Successfully updated fairs.html
✅ Fairs page updated successfully!
🌐 You can now view the updated fairs.html page
```

## What the Script Does

1. **Reads `fairs.csv`** - Loads all fair data from the CSV file
2. **Scans for images** - Checks each fair's folder for images
3. **Creates carousels** - Builds image carousels based on available photos:
   - **Single image**: Simple display with dot navigation
   - **Multiple images**: Full carousel with prev/next buttons
   - **No images**: Shows placeholder message with folder path
4. **Updates HTML** - Replaces the Past Fair Highlights section in `fairs.html`

## Image Handling

- **Supported formats**: JPG, JPEG, PNG, GIF, WebP
- **Automatic detection**: Script finds all images in each fair's folder
- **No images?** Shows helpful placeholder with folder path
- **Multiple images?** Creates full carousel with navigation
- **File names**: Any filename works (spaces and special characters OK)

## Adding a New Fair

1. **Add to CSV**: Add new row to `fairs.csv`:
   ```csv
   11/15/2025,Community Center,1:00pm - 4:00pm,Holiday Fair,"Description here",nov25
   ```

2. **Create folder**: Make `images/fairs/nov25/` directory

3. **Add images**: Copy photos to the folder

4. **Run script**: `python3 update_fairs.py`

5. **Done!** The fair appears on the website

## Troubleshooting

### Script Issues
- **"fairs.csv not found"**: Make sure CSV file exists in same directory
- **"No changes made"**: Check that `fairs.html` has the correct structure
- **Permission errors**: Ensure you have write access to `fairs.html`

### Image Issues
- **Images not showing**: Check file paths and supported formats
- **Carousel not working**: Verify JavaScript carousel module is loaded
- **Wrong folder**: Double-check "Folder Name" in CSV matches directory

## Tips

- **Long descriptions**: Script automatically splits into paragraphs
- **Image order**: Files are displayed in alphabetical order
- **Testing**: Always test locally before publishing
- **Backup**: Consider backing up `fairs.html` before running script

## Requirements

- Python 3 (built-in modules only, no additional packages needed)
- Write access to `fairs.html`
- CSV file with correct format
- Image files in supported formats

The script is simple, fast, and reliable - perfect for quick updates to your fairs page!