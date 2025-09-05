# VoteVega Website Deployment Guide

## Files Ready for Deployment ✅

Your website is production-ready with:
- `index.html` - Main homepage
- `index_alt.html` - Alternative homepage layout  
- `statements.html` - Campaign statements blog
- `css/style.css` - All styling
- `js/main.js` - JavaScript functionality
- `images/` - All image assets
- `fonts/` - Custom Vanguardia fonts

## Deployment Options

### 1. NETLIFY (RECOMMENDED) 🏆

**Drag & Drop Method:**
1. Go to [netlify.com](https://netlify.com)
2. Sign up for free account
3. Drag your entire `votevega-website` folder to the deploy area
4. Get instant URL like `https://amazing-site-123456.netlify.app`
5. Go to Site Settings > Domain Management
6. Add custom domain: `votevega.nyc`
7. Follow DNS instructions

**Why Netlify:**
- ✅ Free HTTPS
- ✅ Custom domain support
- ✅ Form handling for email signups
- ✅ Fast global CDN
- ✅ Easy updates (drag & drop new files)

### 2. SURGE.SH (FAST & SIMPLE) ⚡

**If you have Node.js installed:**
```bash
npm install -g surge
cd votevega-website
surge
```

**Manual steps:**
1. Install Node.js from nodejs.org
2. Run commands above
3. Choose domain: `votevega.surge.sh` or custom domain

### 3. VERCEL (MODERN) 🚄

**Drag & Drop Method:**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub or email
3. Click "Import Project"
4. Upload your folder
5. Auto-deploys with custom domain support

### 4. GITHUB PAGES (IF USING GIT) 📦

**If you want to use GitHub:**
1. Create repository on GitHub
2. Upload all files
3. Go to Settings > Pages
4. Enable GitHub Pages
5. Use custom domain option

## Custom Domain Setup (votevega.nyc)

### DNS Configuration:
Add these records to your domain provider:

**For Netlify:**
```
Type: CNAME
Name: www
Value: [your-netlify-site].netlify.app

Type: A
Name: @
Value: 75.2.60.5
```

**For Surge:**
```
Type: CNAME
Name: www
Value: na-west1.surge.sh

Type: A  
Name: @
Value: 45.55.110.124
```

## Pre-Deployment Checklist ✅

- [x] All images optimized and linked correctly
- [x] Custom fonts loaded properly
- [x] Responsive design tested
- [x] Professional button styling applied
- [x] Statements page created and linked
- [x] Navigation working across all pages
- [x] Mobile-friendly design confirmed
- [x] Professional color palette applied

## Post-Deployment

1. Test all links and buttons
2. Verify mobile responsiveness
3. Check form functionality
4. Test loading speed
5. Set up analytics (Google Analytics)
6. Submit to Google Search Console

## Recommended: NETLIFY

For a political campaign, Netlify is the best choice because:
- Professional appearance with custom domain
- Form handling for email signups
- Free SSL certificate
- Fast global delivery
- Easy to update content

## Quick Deploy Command (if Node.js available)

```bash
# Install and deploy with Surge
npm install -g surge
surge

# Or with Netlify CLI
npm install -g netlify-cli
netlify deploy --prod
```

Your site is ready to go live! 🚀
