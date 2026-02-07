# Pipeline Dynamics Website

Official static website for Pipeline Dynamics - a leading provider of infrastructure solutions.

## About

This is a modern, responsive static website built with pure HTML, CSS, and JavaScript. No frameworks or build tools required - just open `index.html` in a browser or deploy to any static hosting platform.

## Features

- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI** - Clean, professional design with smooth animations
- **SEO Optimized** - Proper meta tags and semantic HTML structure
- **Fast Loading** - No dependencies, minimal file sizes
- **Accessible** - Follows web accessibility best practices

## Pages

- `index.html` - Homepage with hero section and feature highlights
- `about.html` - About page with company information and values
- `services.html` - Comprehensive list of services offered
- `contact.html` - Contact form and information

## Local Development

To run the website locally:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js
npx serve
```

Then open `http://localhost:8000` in your browser.

## Deployment

This static website can be deployed to any hosting platform:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any web server (Apache, Nginx, etc.)

## Structure

```
website/
├── index.html          # Homepage
├── about.html          # About page
├── services.html       # Services page
├── contact.html        # Contact page
├── css/
│   └── style.css       # All styles
└── js/
    └── main.js         # Interactive features
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

© 2026 Pipeline Dynamics. All rights reserved.
