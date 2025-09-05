# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

VoteVega Website is a custom static website replacement for votevega.nyc, built to replace the original WordPress-based site with full customizability while maintaining the same look and feel. This is a political campaign website for Jose Vega for Congress 2024 (NY-15th Congressional District, Bronx).

**Campaign Details:**
- Candidate: Jose Vega, 26-year-old political organizer
- District: New York's 15th Congressional District (Bronx)
- Slogan: "Power, Not Force"
- Key Issues: Stop Genocide, Peace Through Development, Rebuild the Bronx

## Development Commands

### Local Development Server
```bash
# Primary method using Python
npm run dev
# or
python -m http.server 8080

# Alternative using npm start
npm start

# Using live-server (if installed)
npm install -g live-server
live-server --port=8080
```

### Build and Deployment
```bash
# Build command (currently placeholder)
npm run build

# Lint command (currently placeholder)  
npm run lint
```

## Architecture and Code Structure

### Technology Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Framework**: Bootstrap 5 for responsive design
- **External Dependencies**: Font Awesome, Google Fonts (Inter), Bootstrap CDN
- **Development**: Static site with Python HTTP server for local development

### File Organization
```
votevega-website/
├── index.html              # Single-page application main file
├── css/style.css           # All custom styles with CSS custom properties
├── js/main.js             # All JavaScript functionality in IIFE pattern
├── images/                # Campaign images and assets
├── assets/                # Additional static assets
└── package.json           # Project metadata and npm scripts
```

### Design System
The website uses a consistent design system defined in CSS custom properties in `style.css`:

- **Colors**: Primary Red (#dc3545), Primary Blue (#0d6efd), Yellow Background (#ffc107), Dark Navigation (#212529)
- **Typography**: Inter font family with system font fallbacks
- **Components**: Bootstrap 5 components with custom styling overrides

### JavaScript Architecture
The main JavaScript file (`js/main.js`) uses an IIFE (Immediately Invoked Function Expression) pattern and includes:

- **VoteVega Global Namespace**: Exposes `trackEvent()` and `showFormMessage()` functions
- **Modular Initialization**: Separate init functions for different features
- **Event Handling**: Smooth scrolling, email form validation, navbar behavior
- **Analytics Placeholder**: Ready for Google Analytics integration

### Key Components

#### Hero Section
- Responsive hero with image and call-to-action buttons
- Custom gradient background and responsive typography

#### Email Signup Form
- Client-side email validation with regex
- Form message display system with auto-removal
- Ready for integration with email services (Mailchimp, ConvertKit)

#### Responsive Navigation
- Bootstrap navbar with custom styling
- Mobile-friendly collapsible menu with auto-close functionality
- Smooth scrolling anchor links

#### Content Sections
- Modular sections: Hero, Quote, Issues, About, News, Statements
- Yellow and blue background utility classes
- Consistent typography and spacing system

## Content Management

### Adding News Articles
Add new articles by copying the existing pattern in the news section:
```html
<div class="col-lg-6">
    <h3 class="pt-2 pb-0 mb-0">
        <a href="article-url">Article Title</a>
    </h3>
    <p class="post-meta mb-2">Date</p>
    <p class="mb-2">Article excerpt...</p>
    <p><strong><a class="text-uppercase mt-3" href="article-url">Keep Reading</a></strong></p>
</div>
```

### Updating Campaign Information
- **Hero Content**: Edit hero text and CTA buttons in `index.html`
- **About Section**: Update candidate bio and campaign description
- **Social Media**: Modify footer social media links
- **Contact Info**: Update email and address in footer

### Color Scheme Customization
Modify the CSS custom properties in `:root` section of `style.css`:
```css
:root {
    --primary-red: #dc3545;
    --primary-blue: #0d6efd; 
    --yellow-bg: #ffc107;
    --dark-nav: #212529;
}
```

## Integration Points

### Email Service Integration
Replace the form handler in `js/main.js` `initEmailForm()` function to integrate with:
- Mailchimp
- ConvertKit
- Campaign management tools

### Analytics Integration
Replace the placeholder `trackEvent()` function to integrate with:
- Google Analytics
- Facebook Pixel
- Campaign tracking services

### Donation Processing
Add donation functionality by integrating with payment processors and updating the donate buttons.

## Deployment

### Static Hosting Options
The site can be deployed to any static hosting service:
- GitHub Pages
- Netlify 
- Vercel
- AWS S3 with static hosting
- Traditional web hosting via FTP/SFTP

### Pre-deployment Requirements
- Test responsive design on mobile devices
- Verify all navigation links work
- Validate HTML and CSS
- Check form functionality
- Test loading speed
- Verify SEO meta tags

## Browser Support and Performance

- **Target Browsers**: Chrome 60+, Firefox 60+, Safari 12+, Edge 79+
- **Mobile Support**: iOS Safari 12+, Chrome Mobile 60+
- **Performance**: Optimized for fast loading with minimal external dependencies
- **Accessibility**: WCAG 2.1 AA compliance with semantic HTML, proper ARIA labels, and keyboard navigation

## Development Guidelines

### CSS Organization
- Use CSS custom properties for consistent theming
- Follow the existing BEM-like naming patterns
- Mobile-first responsive design approach
- Maintain Bootstrap 5 compatibility

### JavaScript Patterns
- Keep all functionality within the IIFE pattern
- Use the VoteVega global namespace for exposed functions
- Implement proper error handling for form submissions
- Use event delegation and debouncing for performance

### Content Updates
- All content updates should be made directly in `index.html`
- Follow the existing semantic HTML structure
- Maintain consistent typography and spacing patterns
- Use utility classes for common styling needs
