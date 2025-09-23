#!/usr/bin/env python3
"""
Simple script to generate dummy images for the Renton Children's Business Fair website
Requires: pip install Pillow
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_dummy_image(filename, width, height, text, color_hex):
    """Create a dummy image with text and gradient background"""
    
    # Create image
    img = Image.new('RGB', (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Convert hex color to RGB
    color_rgb = tuple(int(color_hex[i:i+2], 16) for i in (1, 3, 5))
    
    # Create gradient background
    for y in range(height):
        # Create gradient from color to lighter version
        ratio = y / height
        r = int(color_rgb[0] * (1 - ratio * 0.3))
        g = int(color_rgb[1] * (1 - ratio * 0.3))
        b = int(color_rgb[2] * (1 - ratio * 0.3))
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    # Add overlay pattern
    for x in range(0, width, 50):
        for y in range(0, height, 50):
            draw.rectangle([x, y, x+25, y+25], fill=(255, 255, 255, 30))
    
    # Add text
    try:
        # Try to use a better font
        font_size = min(width // 15, height // 8)
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        # Fallback to default font
        font_size = min(width // 20, height // 10)
        font = ImageFont.load_default()
    
    # Split text into lines
    lines = text.split('\n')
    
    # Calculate text position
    total_height = len(lines) * font_size * 1.2
    start_y = (height - total_height) / 2
    
    for i, line in enumerate(lines):
        # Get text dimensions
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        x = (width - text_width) / 2
        y = start_y + i * font_size * 1.2
        
        # Add text shadow
        draw.text((x+2, y+2), line, font=font, fill=(0, 0, 0, 128))
        # Add main text
        draw.text((x, y), line, font=font, fill=(255, 255, 255))
    
    return img

def main():
    # Ensure images directory exists
    os.makedirs('images', exist_ok=True)
    
    # Image specifications
    images = [
        # Hero Images
        ('hero-homepage.jpg', 1920, 1080, 'Youth Entrepreneurs\nBusiness Fair', '#1E90FF'),
        ('hero-about.jpg', 1920, 1080, 'Our Story\nEmpowering Youth', '#00C853'),
        ('hero-fairs.jpg', 1920, 1080, 'Past Fairs\nSuccess Stories', '#FFA500'),
        ('hero-vendors.jpg', 1920, 1080, 'Young Entrepreneurs\nMeet Our Vendors', '#8B5CF6'),
        
        # Fair Carousel Images - Winter 2024
        ('winter-2024-1.jpg', 800, 600, 'Solar Charger\nInnovation', '#FFD700'),
        ('winter-2024-2.jpg', 800, 600, 'Sustainable Fashion\nShowcase', '#00C853'),
        ('winter-2024-3.jpg', 800, 600, 'Community\nEngagement', '#1E90FF'),
        ('winter-2024-4.jpg', 800, 600, 'Award Ceremony\nCelebration', '#FFA500'),
        
        # Fair Carousel Images - Fall 2024
        ('fall-2024-1.jpg', 800, 600, 'Harvest Market\nBusiness Fair', '#FF8C00'),
        ('fall-2024-2.jpg', 800, 600, 'Pumpkin Carving\nCompetition', '#FFD700'),
        ('fall-2024-3.jpg', 800, 600, 'Mentorship\nSessions', '#00C853'),
        
        # Fair Carousel Images - Summer 2024
        ('summer-2024-1.jpg', 800, 600, 'Business Workshop\nSessions', '#1E90FF'),
        ('summer-2024-2.jpg', 800, 600, 'Digital Marketing\nTraining', '#8B5CF6'),
        ('summer-2024-3.jpg', 800, 600, 'Final Day\nPresentations', '#FFA500'),
        ('summer-2024-4.jpg', 800, 600, 'Graduation\nCeremony', '#00C853'),
        
        # Fair Carousel Images - Spring 2024
        ('spring-2024-1.jpg', 800, 600, 'Tech Showcase\nPresentations', '#1E90FF'),
        ('spring-2024-2.jpg', 800, 600, 'Social Impact\nBusinesses', '#00C853'),
        ('spring-2024-3.jpg', 800, 600, 'International\nCuisine Corner', '#FFA500'),
        
        # Vendor Profile Images
        ('vendor-techfix.jpg', 800, 600, 'TechFix Solutions\nAlex, Age 14', '#1E90FF'),
        ('vendor-jewelry.jpg', 800, 600, 'Eco Jewelry\nMaya, Age 12', '#00C853'),
        ('vendor-cookies.jpg', 800, 600, 'Cultural Cookies\nZara, Age 13', '#FFA500'),
        ('vendor-petcare.jpg', 800, 600, 'Pet Care Plus\nEmma, Age 15', '#8B5CF6'),
        ('vendor-books.jpg', 800, 600, 'Books for All\nJordan, Age 11', '#FFD700'),
        ('vendor-apps.jpg', 800, 600, 'YouthCode Apps\nSam, Age 16', '#1E90FF'),
        
        # Success Story Video
        ('success-story-video.jpg', 800, 450, 'Success Story\nDocumentary', '#8B5CF6'),
        
        # Gallery Images for Homepage
        ('gallery-1.jpg', 600, 450, 'Young Entrepreneur\nat Work', '#1E90FF'),
        ('gallery-2.jpg', 600, 450, 'First Customer\nInteraction', '#00C853'),
        ('gallery-3.jpg', 600, 450, 'Achievement\nCelebration', '#FFA500'),
        ('gallery-4.jpg', 600, 450, 'Team\nCollaboration', '#8B5CF6'),
    ]
    
    print("Generating dummy images...")
    
    for filename, width, height, text, color in images:
        filepath = os.path.join('images', filename)
        
        # Create dummy image
        img = create_dummy_image(filename, width, height, text, color)
        
        # Save image
        img.save(filepath, 'JPEG', quality=85, optimize=True)
        print(f"Created: {filepath}")
    
    print(f"\nGenerated {len(images)} dummy images successfully!")
    print("\nTo replace with your own images:")
    print("1. Keep the same filenames")
    print("2. Maintain similar aspect ratios")
    print("3. Optimize for web (keep file sizes under 500KB)")
    
if __name__ == "__main__":
    main()