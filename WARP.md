# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Hugo Commands
```bash
# Start development server on port 8080 with live reload
npm run dev
# or
hugo serve --port 8080

# Start development server on port 3000
npm start

# Network-accessible development server (for testing on mobile devices)
npm run dev-network

# Build for production (creates /public directory with minified assets)
npm run build

# Clean build artifacts
npm run clean
```

### Development Workflow
```bash
# Test a single policy page during development
hugo serve --port 8080
# Then visit http://localhost:8080/policy/[policy-name]/

# Build and serve locally to test production build
npm run build && cd public && python3 -m http.server 8080
```

## Architecture Overview

### Static Site Generator
This is a **Hugo-based static site** for Jose Vega's 2024 Congressional campaign (NY-15, Bronx). Hugo was chosen for its lightning-fast builds (~30ms) and no runtime dependencies.

### Key Architecture Patterns

#### Template Hierarchy
- **Base Template**: `layouts/_default/baseof.html` - Contains `<head>`, SEO meta tags, Bootstrap/Font Awesome imports
- **Page Templates**: `layouts/index.html` (homepage), `layouts/policy/single.html` (policy pages)
- **Partials**: Reusable components in `layouts/partials/` (header, footer, email signup)

#### Content Management
- **Homepage Content**: Hardcoded in `layouts/index.html` template
- **Policy Content**: Markdown files in `content/policy/` with YAML frontmatter
- **Site Configuration**: `hugo.toml` handles navigation, social links, policy dropdown menus

#### Styling System
- **Bootstrap 5**: Primary responsive framework loaded from CDN
- **Custom CSS**: `static/css/style.css` with CSS custom properties for campaign colors
- **Font Strategy**: Custom Vanguardia font with Inter fallback, loaded via Google Fonts

### Directory Structure
```
├── content/                 # Markdown content files
│   ├── policy/             # Policy pages (economics, oasis-plan, space-ccc, preamble)
│   └── statements/         # Statements section
├── layouts/                # Hugo templates
│   ├── _default/baseof.html # Base HTML structure
│   ├── index.html          # Homepage template
│   ├── partials/           # Reusable template components
│   └── policy/single.html  # Policy page template
├── static/                 # Static assets (CSS, JS, images, fonts)
├── hugo.toml              # Site configuration and navigation
└── public/                # Generated site (after build)
```

## Content Management Patterns

### Adding New Policy Pages
1. Create markdown file in `content/policy/` with required frontmatter:
   ```yaml
   ---
   title: "Policy Title"
   subtitle: "Optional subtitle"
   description: "SEO description"
   date: 2024-12-01
   type: "policy"
   ---
   ```
2. Add to navigation in `hugo.toml` under `[[params.policyProposals]]`
3. Content supports HTML within Markdown for complex formatting (blockquotes, etc.)

### Campaign-Specific Content Types
- **Policy Proposals**: Long-form policy documents with quotes and structured content
- **Statements**: News and position statements (configured but not fully implemented)
- **Campaign Information**: Stored in `hugo.toml` params (social links, contact info, donate URLs)

## Key Configuration Files

### hugo.toml
- Site metadata and SEO settings
- Social media links array
- Policy proposals dropdown menu configuration
- Navigation menu structure
- Campaign contact information

### package.json Scripts
- Development and build commands
- Hugo server configurations with different ports
- Clean commands for build artifacts

## Development Considerations

### Design System
- **Color Palette**: Primary red (#dc3545), primary blue (#0d6efd), yellow background (#ffc107)
- **Typography**: Vanguardia custom font family with Inter fallback
- **Responsive**: Mobile-first Bootstrap 5 approach with custom mobile hero layouts

### Content Patterns
- **Blockquotes**: Heavily used for political quotes with custom styling
- **Hero Sections**: Dual desktop/mobile layouts with image overlays
- **Icon Usage**: Font Awesome icons for social media and issue representation

### SEO and Social
- Open Graph and Twitter Card meta tags in base template
- Automatic sitemap and RSS generation
- Structured data ready for campaign-specific schema

### Performance Characteristics
- **Build Speed**: ~30ms Hugo builds
- **Dependencies**: Minimal - Bootstrap and Font Awesome from CDN
- **Static Assets**: Optimized for static hosting (Netlify, GitHub Pages, etc.)

## Testing and Deployment

### Local Testing
- Use `npm run dev` for standard development
- Use `npm run dev-network` for mobile device testing
- Build with `npm run build` to test production output

### Deployment Targets
Designed for static hosting platforms:
- GitHub Pages, Netlify, Vercel
- Traditional web hosting via file upload
- CDN-based hosting

### Campaign-Specific Requirements
- Form handling integration needed for volunteer/email signup
- Analytics integration placeholders present
- Donation link integration via external secure platform
