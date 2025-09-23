# Image Guide for Renton Children's Business Fair Website

## 📸 Image Structure

Your website now has complete image support with placeholder dummy images that you can easily replace with your real photos.

## 🎯 Current Image Setup

### **Hero Images** (1920x1080px - 16:9 ratio)
- `hero-homepage.jpg` - Main homepage hero background
- `hero-about.jpg` - About page hero background  
- `hero-fairs.jpg` - Fairs page hero background
- `hero-vendors.jpg` - Vendors page hero background

### **Fair Carousel Images** (800x600px - 4:3 ratio)

**Winter 2024 Fair:**
- `winter-2024-1.jpg` - Solar charger innovation showcase
- `winter-2024-2.jpg` - Sustainable fashion presentation  
- `winter-2024-3.jpg` - Community engagement activities
- `winter-2024-4.jpg` - Award ceremony celebration

**Fall 2024 Fair:**
- `fall-2024-1.jpg` - Harvest-themed business fair
- `fall-2024-2.jpg` - Pumpkin carving competition
- `fall-2024-3.jpg` - Mentorship sessions

**Summer 2024 Fair:**
- `summer-2024-1.jpg` - Business workshop sessions
- `summer-2024-2.jpg` - Digital marketing training
- `summer-2024-3.jpg` - Final day presentations
- `summer-2024-4.jpg` - Graduation ceremony

**Spring 2024 Fair:**
- `spring-2024-1.jpg` - Tech showcase presentations
- `spring-2024-2.jpg` - Social impact businesses
- `spring-2024-3.jpg` - International cuisine corner

### **Vendor Profile Images** (800x600px - 4:3 ratio)
- `vendor-techfix.jpg` - Alex's TechFix Solutions (Age 14)
- `vendor-jewelry.jpg` - Maya's Eco Jewelry (Age 12)
- `vendor-cookies.jpg` - Zara's Cultural Cookies (Age 13)
- `vendor-petcare.jpg` - Emma's Pet Care Plus (Age 15)
- `vendor-books.jpg` - Jordan's Books for All (Age 11)
- `vendor-apps.jpg` - Sam's YouthCode Apps (Age 16)

### **Additional Images**
- `success-story-video.jpg` - Success story documentary thumbnail (800x450px)
- `gallery-1.jpg` to `gallery-4.jpg` - Homepage gallery images (600x450px)

## 🔄 How to Replace Images

### **Method 1: Direct Replacement (Recommended)**
1. Save your real photos with the exact same filenames
2. Replace the dummy images in the `/images/` folder
3. The website will automatically use your new images

### **Method 2: Generate New Dummy Images**
```bash
# If you have Python and Pillow installed
python3 generate-images.py
```

### **Method 3: Use the HTML Generator**
1. Open `create-dummy-images.html` in your browser
2. Download the generated dummy images
3. Replace them with your real photos

## 📏 Image Specifications

### **Technical Requirements:**
- **Hero Images**: 1920x1080px minimum (16:9 aspect ratio)
- **Carousel Images**: 800x600px (4:3 aspect ratio)  
- **Gallery Images**: 600x450px (4:3 aspect ratio)
- **Format**: JPG preferred (PNG for images with transparency)
- **File Size**: Optimize to under 500KB for web performance
- **Quality**: 85% JPEG compression is recommended

### **Content Guidelines:**
- **Bright, energetic** scenes showing youth entrepreneurship
- **Diverse representation** of children and backgrounds
- **Action shots** rather than posed photos
- **Good lighting** and clear subjects
- **Professional quality** but approachable feel

## 🎨 Image Optimization Tips

### **Before Uploading:**
1. **Resize** to exact specifications above
2. **Compress** to reduce file size (use tools like TinyPNG)
3. **Check quality** - ensure images are sharp and well-lit
4. **Test loading** - make sure images load quickly

### **Recommended Tools:**
- **Photoshop/GIMP**: Professional editing
- **Canva**: Easy resizing and basic editing
- **TinyPNG**: Online compression
- **ImageOptim**: Mac optimization tool
- **Squoosh**: Google's web-based optimizer

## 📱 Responsive Behavior

All images are responsive and will:
- **Scale properly** on mobile devices
- **Maintain aspect ratios** across screen sizes
- **Load optimized versions** based on device capabilities
- **Include fallback** gradient backgrounds if images fail to load

## 🔧 Technical Implementation

### **Hero Images with Text Overlay:**
```html
<section class="hero hero-with-image" style="background-image: url('images/hero-homepage.jpg');">
```

### **Gallery Images:**
```html
<img src="images/gallery-1.jpg" alt="Description" class="gallery-image">
```

### **Carousel Images:**
```html
<img src="images/winter-2024-1.jpg" alt="Description" class="carousel-image">
```

### **Video Thumbnails:**
```html
<div class="video-placeholder" style="background-image: url('images/vendor-techfix.jpg');">
```

## 🆘 Troubleshooting

### **Images Not Showing:**
1. Check file paths are correct
2. Verify image files exist in `/images/` folder
3. Ensure filenames match exactly (case-sensitive)
4. Check file permissions

### **Images Loading Slowly:**
1. Compress images to under 500KB
2. Use JPG format for photos
3. Consider using WebP format for modern browsers

### **Images Look Blurry:**
1. Use higher resolution source images
2. Avoid over-compression
3. Ensure images match specified dimensions

## 📞 Need Help?

If you need assistance with images:
1. Check that dummy images are generating correctly
2. Verify your real images match the specifications
3. Test the website locally before deploying
4. Ensure all image paths are working correctly

---

**Ready to go!** Simply replace the dummy images with your real photos using the same filenames, and your website will come to life with authentic content! 🚀