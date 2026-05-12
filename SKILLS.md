# SKILLS.md

This file contains development knowledge and architectural documentation for the Renton Children's Business Fair website.

## Architecture

### Modular JavaScript Application
The codebase uses a class-based modular architecture centered around `RentonCBFApp`:

- **Main App Class**: `js/main.js` contains `RentonCBFApp` which manages the entire application lifecycle
- **Module System**: Features are separated into modules (`js/modules/`) with clear interfaces
- **Configuration-Driven**: All site settings centralized in `js/config.js`
- **Component-Based**: Reusable components in `js/components/`

### Page Structure Pattern
All HTML pages follow this structure:
- **Header**: Contains logo, brand title (both clickable to return home), mobile navigation menu
- **Main Content**: Page-specific content with hero sections and body content
- **Footer**: Static footer with consistent styling
- **Scripts**: Required scripts loaded in correct order

### Navigation Structure
All pages include responsive navigation:
- **Desktop**: Logo and brand title in header (both clickable links to home)
- **Mobile**: Hamburger menu (`nav-toggle`) with slide-in navigation menu
- **Consistent Menu**: Home, Past Fairs, Sponsor Us across all pages

### Configuration System
`js/config.js` contains `window.SiteConfig` object with:
- Site information (name, logo, tagline)
- Navigation menu structure
- Animation settings
- UI configuration
- Contact/social media info

### CSS Architecture
- **Variables**: `styles/variables.css` contains all CSS custom properties
- **Main Styles**: `styles/main.css` contains primary styles with responsive design
- **Color System**: Branded color palette with semantic naming (trust-blue, growth-green, etc.)
- **Responsive Design**: Mobile-first approach with breakpoints at 480px, 768px, and 1024px
- **Consistent Hero Layout**: All pages use the same `.hero-content` styles for uniform behavior

### Key Architectural Decisions

**Header Component**: DRY principle implementation - all pages use `HeaderComponent` instead of duplicated HTML:
- Renders consistent header structure across all pages
- SEO-optimized: H1 on homepage, clickable links on other pages
- NavigationModule handles all interactions (hamburger menu, smooth scrolling)

**Module Initialization**: The main app initializes modules based on page type:
- Home page: Hero effects, stat counters
- Vendors page: Vendor filters
- All pages: Navigation, animations, forms, modals

**Error Handling**: Each module has try-catch blocks and graceful degradation - non-critical modules won't break the entire app.

**Performance**: Uses IntersectionObserver for scroll animations, throttled scroll handlers, and modular loading.

**Responsive Hero Sections**: All hero sections follow consistent responsive behavior:
- Desktop: Hero-text and hero-stats displayed side-by-side (`grid-template-columns: 1fr auto`)
- Mobile (≤768px): Hero-text and hero-stats stack vertically with center alignment
- No page-specific overrides to maintain consistency across all pages

**Mobile Navigation**: Hamburger menu with slide-in overlay, handled by navigation module with proper event listeners.

## Customization Patterns

**Site Information**: Edit `window.SiteConfig.site` in `js/config.js`
**Navigation Menu**: Edit `window.SiteConfig.navigation.primary` array
**Colors**: Modify CSS custom properties in `styles/variables.css`
**Animations**: Adjust `window.SiteConfig.animations` settings
**Logo**: Replace `images/RentonCBFLogo.png` (used automatically via config)

## Recent Updates

**DRY Implementation**: Applied DRY principles across the codebase:
- Eliminated hardcoded headers from all HTML pages (4 pages)  
- Centralized header rendering in `HeaderComponent`
- Removed duplicate navigation event listeners
- Fixed hamburger menu conflicts between HeaderComponent and NavigationModule

**Code Cleanup**: 
- Removed debug console.log statements
- Added comprehensive `.gitignore` file
- Cleaned up unused methods in HeaderComponent
- Separated concerns: HeaderComponent handles rendering, NavigationModule handles interactions

**Sponsor Logo Alignment**: Fixed all responsive alignment issues:
- Left-aligned sponsor logos across all screen sizes
- Fixed CSS Grid centering conflicts in `.fair-card` 
- Consistent alignment at container, grid, and individual logo levels

**Responsive Navigation**: Mobile hamburger menu works consistently across all pages.

## Development Guidelines

**Code Quality Standards**:
- Follow DRY (Don't Repeat Yourself) principles
- Use HeaderComponent for all pages instead of hardcoded HTML
- Separate concerns: Components handle rendering, Modules handle interactions
- Remove debug console.log statements before production
- Use semantic HTML and proper accessibility attributes

**File Organization**:
- Development utilities are excluded via `.gitignore`
- Components in `/js/components/` for reusable UI elements
- Modules in `/js/modules/` for feature-specific functionality  
- Configuration centralized in `/js/config.js`
- CSS variables in `/styles/variables.css`

**Performance**:
- Modular JavaScript loading prevents blocking
- CSS uses efficient selectors and avoids redundancy
- Images optimized for web delivery
- Intersection Observer for scroll animations

## Debugging

- **App Instance**: Available as `window.RentonCBFApp` in browser console
- **Module Access**: Use `app.getModule('moduleName')` to get module instances
- **Performance**: Console logs initialization and performance metrics
- **Error Boundaries**: Modules fail gracefully without breaking the whole app
- **Mobile Menu**: Requires elements with IDs `nav-toggle` and `nav-menu` for JavaScript functionality