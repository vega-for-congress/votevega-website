# VoteVega Website

A custom website replacement for votevega.nyc, built with full customizability while maintaining the same look and feel as the original WordPress site.

## Project Overview

This project aims to replace the WordPress-based votevega.nyc website with a fully customizable static site that preserves the original design and user experience. The new site provides complete control over styling, functionality, and content management without the constraints of WordPress.

## Features

- **Responsive Design**: Mobile-first approach with Bootstrap 5
- **Performance Optimized**: Static HTML/CSS/JS for fast loading
- **SEO Friendly**: Proper meta tags, semantic HTML, and structured data
- **Accessibility**: WCAG compliance with proper ARIA labels and keyboard navigation
- **Modern Browser Support**: ES6+ JavaScript with graceful degradation
- **Email Signup Integration**: Ready for newsletter service integration
- **Social Media Integration**: Links to all campaign social platforms
- **Analytics Ready**: Placeholder for Google Analytics and other tracking services

## Technology Stack

- **HTML5**: Semantic markup and modern web standards
- **CSS3**: Custom styles with CSS Grid/Flexbox, Bootstrap 5 integration
- **JavaScript (ES6+)**: Vanilla JS for interactive functionality
- **Bootstrap 5**: Responsive framework and component library
- **Font Awesome**: Icon library for social media and UI elements
- **Google Fonts**: Inter font family for consistent typography

## Project Structure

```
votevega-website/
├── index.html              # Main homepage
├── package.json            # Project metadata and scripts
├── README.md              # Project documentation
├── css/
│   └── style.css          # Custom styles matching original design
├── js/
│   └── main.js            # Custom JavaScript functionality
├── images/
│   ├── hero-image.jpg     # Hero section image
│   ├── jose-vega-portrait.jpg  # About section portrait
│   ├── logo-alt.svg       # Campaign logo
│   ├── stop-genocide.png  # Issue icon
│   ├── peace-development.png  # Issue icon
│   └── rebuild-bronx.png  # Issue icon
└── assets/
    └── (additional assets as needed)
```

## Getting Started

### Prerequisites

- A modern web browser
- Python 3.x (for local development server) OR any static file server
- Git (for version control)
- Text editor or IDE

### Installation

1. **Clone or download the repository:**
   ```bash
   git clone <repository-url>
   cd votevega-website
   ```

2. **Start a local development server:**
   
   **Option A: Using Python (recommended):**
   ```bash
   # Python 3.x
   python -m http.server 8080
   
   # Or use the npm script
   npm run dev
   ```
   
   **Option B: Using Node.js (if you have live-server installed):**
   ```bash
   npm install -g live-server
   live-server --port=8080
   ```

3. **Open your browser:**
   - Navigate to `http://localhost:8080`
   - The website should load with the campaign homepage

### Development

#### Making Changes

1. **HTML**: Edit `index.html` for content and structure changes
2. **Styles**: Modify `css/style.css` for visual design updates
3. **JavaScript**: Update `js/main.js` for interactive functionality
4. **Images**: Add new images to the `images/` directory

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

### Content Management

#### Adding News Articles

To add new news articles, you'll need to:

1. Create HTML structure for each article in the news section
2. Follow the existing pattern:
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

#### Adding Statements

Similar to news articles, statements follow the same HTML pattern in the statements section.

#### Updating Campaign Information

- **Hero Section**: Edit the hero text and call-to-action buttons in `index.html`
- **About Section**: Update Jose Vega's bio and description
- **Contact Information**: Modify footer contact details
- **Social Media Links**: Update social media URLs in the footer

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
