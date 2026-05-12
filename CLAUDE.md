# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This is a static HTML/CSS/JavaScript website with no build process:

- **Open in browser**: Open any `.html` file directly in a web browser
- **Local development**: Use a simple HTTP server (e.g., `python -m http.server 8000` or VS Code Live Server)
- **No build commands**: All assets are included via CDN, no compilation needed

### Script Loading Order (Critical)
Scripts must be loaded in this exact order for proper functionality:
1. `js/config.js` - Site configuration
2. `js/utils/helpers.js` - Utility functions  
3. `js/modules/navigation.js` - Navigation module
4. `js/modules/carousel.js` - Carousel module
5. `js/components/header.js` - Header component
6. `js/main.js` - Main application

## Key Files

- `js/config.js` - Central configuration (change site name, navigation, settings here)
- `js/main.js` - Main application class and initialization
- `js/modules/navigation.js` - Mobile menu, smooth scrolling, active states
- `js/modules/carousel.js` - All carousel/slider functionality with touch support
- `js/components/header.js` - Reusable header component
- `js/utils/helpers.js` - Utility functions
- `styles/variables.css` - All CSS custom properties and color system
- `styles/main.css` - Primary styles with responsive design