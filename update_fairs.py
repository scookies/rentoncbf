#!/usr/bin/env python3
"""
Simple Fairs Page Updater
Updates fairs.html Past Fair Highlights section with data from fairs.csv

Usage: python3 update_fairs.py
"""

import csv
import os
import re
from pathlib import Path

def read_fairs_csv(csv_path="fairs.csv"):
    """Read fair data from CSV file."""
    fairs = []
    try:
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                fairs.append(row)
        print(f"✅ Read {len(fairs)} fairs from {csv_path}")
        return fairs
    except FileNotFoundError:
        print(f"❌ Error: {csv_path} not found")
        return []
    except Exception as e:
        print(f"❌ Error reading CSV: {e}")
        return []

def find_images_in_folder(folder_name, base_path="images/fairs"):
    """Find all images in a fair's folder."""
    folder_path = Path(base_path) / folder_name
    if not folder_path.exists():
        print(f"📁 Folder not found: {folder_path}")
        return []
    
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    images = []
    
    for file_path in folder_path.iterdir():
        if file_path.is_file() and file_path.suffix.lower() in image_extensions:
            images.append(file_path.name)
    
    print(f"📸 Found {len(images)} images in {folder_name}: {images}")
    return images

def create_fair_html(fair, images):
    """Create HTML for a single fair."""
    folder_name = fair['Folder Name']
    
    # Format description into paragraphs
    description = fair['Description'].strip()
    if len(description) > 200:
        # Split long descriptions at sentence boundaries
        sentences = description.split('. ')
        mid_point = len(sentences) // 2
        para1 = '. '.join(sentences[:mid_point])
        para2 = '. '.join(sentences[mid_point:])
        
        # Ensure proper ending punctuation
        if not para1.endswith('.'):
            para1 += '.'
        if not para2.endswith('.'):
            para2 += '.'
            
        description_html = f"<p>{para1}</p>\n                            <p>{para2}</p>"
    else:
        description_html = f"<p>{description}</p>"
    
    # Create carousel HTML
    if images:
        # Multiple images - create full carousel
        slides_html = ""
        for i, image in enumerate(images):
            active_class = " active" if i == 0 else ""
            slides_html += f'''
                                    <div class="carousel-slide{active_class}">
                                        <img src="images/fairs/{folder_name}/{image}" alt="{fair['Title']} - Image {i + 1}" class="carousel-image">
                                    </div>'''
        
        # Navigation buttons (only if more than 1 image)
        nav_buttons = ""
        if len(images) > 1:
            nav_buttons = f'''
                                <button class="carousel-btn prev" data-carousel="{folder_name}">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <button class="carousel-btn next" data-carousel="{folder_name}">
                                    <i class="fas fa-chevron-right"></i>
                                </button>'''
        
        # Dots navigation
        dots_html = ""
        for i in range(len(images)):
            active_class = " active" if i == 0 else ""
            dots_html += f'''
                                    <button class="dot{active_class}" data-slide="{i}"></button>'''
        
        carousel_html = f'''                        <div class="fair-carousel">
                            <div class="carousel-container">
                                <div class="carousel-track" data-carousel="{folder_name}">{slides_html}
                                </div>{nav_buttons}
                                <div class="carousel-dots" data-carousel="{folder_name}">{dots_html}
                                </div>
                            </div>
                        </div>'''
    else:
        # No images - create placeholder message
        carousel_html = f'''                        <div class="fair-carousel">
                            <div class="carousel-container">
                                <div class="no-images-placeholder">
                                    <i class="fas fa-images" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                                    <p style="color: #666; text-align: center;">Images coming soon!<br>Add photos to: <code>images/fairs/{folder_name}/</code></p>
                                </div>
                            </div>
                        </div>'''
    
    # Create complete fair item HTML
    fair_html = f'''                    
                    <!-- Fair: {fair['Title']} -->
                    <div class="fair-item">
                        <div class="fair-header">
                            <h3>{fair['Title']}</h3>
                            <div class="fair-meta">
                                <span class="fair-date"><i class="far fa-calendar"></i> {fair['Date']}</span>
                                <span class="fair-location"><i class="fas fa-map-marker-alt"></i> {fair['Location']}</span>
                                <span class="fair-time"><i class="far fa-clock"></i> {fair['Time']}</span>
                            </div>
                        </div>
                        <div class="fair-content">
                            <div class="fair-description">
                                {description_html}
                            </div>{carousel_html}
                        </div>
                    </div>'''
    
    return fair_html

def update_fairs_page(fairs_data, html_file="fairs.html"):
    """Update the fairs.html file with new fair data."""
    try:
        # Read current HTML file
        with open(html_file, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Build new fairs section
        new_fairs_html = '''                <div class="fairs-grid">
'''
        
        for fair in fairs_data:
            folder_name = fair['Folder Name']
            images = find_images_in_folder(folder_name)
            fair_html = create_fair_html(fair, images)
            new_fairs_html += fair_html + "\n"
        
        new_fairs_html += '''                </div>'''
        
        # Find and replace the fairs-grid section using regex
        pattern = r'<div class="fairs-grid">.*?</div>(?=\s*</div>\s*</section>)'
        
        new_content = re.sub(
            pattern, 
            new_fairs_html, 
            content, 
            flags=re.DOTALL
        )
        
        # Verify the replacement worked
        if new_content == content:
            print("⚠️  Warning: No changes made. Could not find fairs-grid section.")
            return False
        
        # Write updated content
        with open(html_file, 'w', encoding='utf-8') as file:
            file.write(new_content)
        
        print(f"✅ Successfully updated {html_file}")
        return True
        
    except Exception as e:
        print(f"❌ Error updating HTML: {e}")
        return False

def main():
    """Main function."""
    print("🔄 Updating Fairs Page from CSV...")
    print("=" * 40)
    
    # Read fairs from CSV
    fairs = read_fairs_csv()
    if not fairs:
        print("❌ No fair data found. Exiting.")
        return
    
    print(f"\n📋 Fairs found in CSV:")
    for i, fair in enumerate(fairs, 1):
        print(f"{i}. {fair['Title']} - {fair['Date']} at {fair['Location']}")
    
    print("\n" + "=" * 40)
    
    # Update the HTML file
    success = update_fairs_page(fairs)
    
    if success:
        print("✅ Fairs page updated successfully!")
        print("🌐 You can now view the updated fairs.html page")
    else:
        print("❌ Failed to update fairs page")

if __name__ == "__main__":
    main()