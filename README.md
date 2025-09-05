# Jose Vega for Congress 2024 - Hugo Website

**Power, Not Force.**

This campaign website has been built using **Hugo**, a fast static site generator, while preserving the original design and user experience from the WordPress site.

## 🚀 Quick Start

### Development Server
```bash
# Start development server on port 8080
npm run dev

# Or start on port 3000  
npm start

# Network accessible development server
npm run dev-network
```

Visit: http://localhost:8080

### Production Build
```bash
# Build for production (creates /public directory)
npm run build

# Clean build artifacts
npm run clean
```

## ✨ Features

- **⚡ Lightning Fast**: Hugo builds in ~30ms with live reload
- **📱 Responsive Design**: Mobile-first approach with Bootstrap 5
- **🔍 SEO Optimized**: Built-in meta tags, sitemaps, and structured data
- **♿ Accessible**: WCAG compliance with proper ARIA labels
- **📧 Email Integration**: Ready for newsletter service integration
- **📱 Social Media**: Links to all campaign social platforms
- **📊 Analytics Ready**: Placeholder for tracking services
- **🎨 Template System**: Reusable components, no code duplication

## 🛠️ Technology Stack

- **Hugo**: Fast static site generator (Go-based)
- **HTML5**: Semantic markup and modern web standards
- **CSS3**: Custom styles with Bootstrap 5 integration
- **JavaScript (ES6+)**: Vanilla JS for interactive functionality
- **Bootstrap 5**: Responsive framework and component library
- **Font Awesome**: Icon library for social media and UI elements
- **Google Fonts**: Inter font family for consistent typography

## 📁 Project Structure

```
votevega-website/
├── content/                    # Content files (Markdown)
│   ├── _index.md              # Homepage content
│   └── statements/
│       └── _index.md          # Statements section
├── layouts/                   # HTML templates
│   ├── _default/
│   │   └── baseof.html       # Base template
│   ├── partials/
│   │   ├── header.html       # Navigation
│   │   ├── footer.html       # Footer
│   │   └── footer-signup.html # Email signup
│   ├── index.html            # Homepage template
│   └── statements/
│       └── list.html         # Statements page
├── static/                   # Static assets (CSS, JS, images)
│   ├── css/style.css         # Custom styles
│   ├── js/main.js            # Custom JavaScript
│   ├── images/               # All images
│   └── fonts/                # Custom fonts
├── hugo.toml                 # Hugo configuration
├── package.json              # Project metadata and scripts
├── public/                   # Generated site (after build)
└── backup-before-hugo/       # Original HTML files
```

## 🎆 Migration Benefits

This website has been successfully migrated from static HTML to Hugo, providing:

### ✅ What You Gained
- **⚡ Faster builds**: Hugo builds in ~30ms vs seconds with other tools
- **🗓️ No dependencies**: Single Go binary, no Ruby/Node.js complexity
- **🎨 Template reuse**: No more duplicate header/footer code
- **🔍 Automatic SEO**: Built-in meta tags, sitemaps, and structured data
- **🔄 Development server**: Live reload during development
- **📋 Minification**: Built-in CSS/JS minification for production
- **🚀 Easy deployment**: Static files work on any hosting platform

### ✅ What Stayed the Same
- **🎨 All your original design** (CSS, images, fonts)
- **🔗 Same URLs and navigation**
- **⚙️ Same functionality** (forms, JavaScript)
- **🏠 Same hosting options** (static hosting)

Your original files are safely backed up in `backup-before-hugo/`.

## Getting Started

### Prerequisites

- A modern web browser
- Hugo installed (already installed on this system)
- Git (for version control)
- Text editor or IDE

### Installation

1. **Clone or download the repository:**
   ```bash
   git clone <repository-url>
   cd votevega-website
   ```

2. **Start the Hugo development server:**
   ```bash
   # Hugo development server with live reload
   npm run dev
   
   # Or directly with Hugo
   hugo serve --port 8080
   ```

3. **Open your browser:**
   - Navigate to `http://localhost:8080`
   - The website will automatically reload when you make changes

## ⚙️ Hugo Configuration

Site settings are configured in `hugo.toml`:
- Site title, description, URLs
- Social media links
- Navigation menu structure
- Policy proposals dropdown
- Contact information and email

## 🎨 Templates & Content

### Adding New Pages
1. Create content file: `content/new-page.md`
2. Add front matter:
   ```yaml
   ---
   title: "Page Title"
   description: "Page description for SEO"
   ---
   ```
3. Hugo automatically uses the appropriate template

### Modifying Templates
- **Header/Navigation**: `layouts/partials/header.html`
- **Footer**: `layouts/partials/footer.html`
- **Base HTML structure**: `layouts/_default/baseof.html`
- **Homepage**: `layouts/index.html`
- **Statements page**: `layouts/statements/list.html`

### Making Changes

1. **Content**: Edit Markdown files in `content/` directory
2. **Templates**: Modify HTML files in `layouts/` directory
3. **Styles**: Update `static/css/style.css` for visual changes
4. **JavaScript**: Edit `static/js/main.js` for functionality
5. **Images**: Add new images to `static/images/` directory
6. **Configuration**: Update `hugo.toml` for site settings

#### Color Scheme

The website uses a consistent color palette matching the original design:

- **Primary Red**: `#dc3545` (buttons, accents, quotes)
- **Primary Blue**: `#0d6efd` (secondary buttons, social icons)
- **Yellow Background**: `#ffc107` (issues section, contribute section)
- **Dark Navigation**: `#212529` (header, footer)
- **Text Colors**: `#212529` (dark), `#ffffff` (light)

#### Typography

- **Primary Font**: Inter (Google Fonts)
- **Fallbacks**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

## 🔧 Available Scripts

```bash
npm run dev          # Development server (port 8080)
npm start            # Development server (port 3000)
npm run dev-network  # Network-accessible server
npm run build        # Production build
npm run clean        # Remove build artifacts
npm run hugo         # Run Hugo directly
npm run hugo-server  # Start Hugo server
```

### Content Management

#### Adding News Articles
Edit the homepage template (`layouts/index.html`) to add news articles in the news section.

#### Adding New Statements
Create new files in `content/statements/` directory:
```bash
# Create a new statement
echo '---
title: "New Statement Title"
date: 2024-12-01
description: "Statement description"
---

Statement content here...' > content/statements/new-statement.md
```

#### Updating Campaign Information

- **Site Configuration**: Edit `hugo.toml` for titles, URLs, contact info
- **Hero Section**: Modify `layouts/index.html` for hero text
- **About Section**: Update biography text in `layouts/index.html` 
- **Navigation**: Edit policy proposals in `hugo.toml`
- **Social Media**: Update social links in `hugo.toml`

### Deployment

#### Static Hosting Options

This website can be deployed to any static hosting service:

1. **GitHub Pages**: Push to GitHub and enable Pages in repository settings
2. **Netlify**: Connect repository for automatic deployments
3. **Vercel**: Import project for instant deployment
4. **AWS S3**: Upload files to S3 bucket with static hosting enabled
5. **Traditional Web Hosting**: Upload files via FTP/SFTP

#### Pre-deployment Checklist

- [ ] Test all navigation links
- [ ] Verify responsive design on mobile devices
- [ ] Check form functionality
- [ ] Validate HTML and CSS
- [ ] Optimize images for web
- [ ] Test loading speed
- [ ] Verify SEO meta tags
- [ ] Test social media sharing

### Customization

#### Styling Changes

To modify the visual design:

1. Update CSS custom properties in `:root` section of `style.css`
2. Modify Bootstrap variables if using custom Bootstrap build
3. Add new CSS classes as needed

#### Functionality Changes

To add new interactive features:

1. Add JavaScript functions to `main.js`
2. Follow the existing pattern for event handling
3. Use the `VoteVega` namespace for global functions

#### Integration with Services

The website is prepared for integration with:

- **Email Services**: Mailchimp, ConvertKit, etc. (replace form handler)
- **Analytics**: Google Analytics, Facebook Pixel (replace tracking placeholders)
- **CRM**: Integrate with campaign management tools
- **Payment Processing**: Add donation functionality

### Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 60+, Safari 12+, Edge 79+
- **Mobile Browsers**: iOS Safari 12+, Chrome Mobile 60+
- **Graceful Degradation**: Basic functionality works on older browsers

### Performance

- **Optimized Loading**: Minimal external dependencies
- **Image Optimization**: Use WebP format where possible
- **Caching**: Implement proper cache headers on server
- **CDN**: Consider using CDN for static assets

### Security Considerations

- **Form Validation**: Client-side and server-side validation required
- **Content Security Policy**: Implement CSP headers
- **HTTPS**: Always serve over HTTPS in production
- **Input Sanitization**: Sanitize any user inputs

### Accessibility

The website follows WCAG 2.1 AA guidelines:

- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following the existing code style
4. Test thoroughly
5. Submit a pull request with detailed description

### Support

For questions or issues:

- **Technical Issues**: Create an issue in the repository
- **Campaign Content**: Contact the campaign team
- **Design Changes**: Consult with the design team

### License

This project is licensed under the MIT License - see the LICENSE file for details.

### Campaign Information

**Jose Vega for Congress 2024**
- **District**: New York's 15th Congressional District (Bronx)
- **Slogan**: "Power, Not Force"
- **Website**: votevega.nyc
- **Email**: info@votevega.nyc
- **Social Media**: @JosBtrigga

---

*Paid for by Vega for Congress*
