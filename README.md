# Pipeline Dynamics Website

Marketing website for Pipeline Dynamics - Data Engineering Consulting.

## About

Solo data engineering consultancy helping companies build modern data infrastructure that actually works. Services include:

- Data pipeline architecture (ETL/ELT)
- Warehouse & lakehouse design (Snowflake, Databricks, BigQuery)
- Analytics engineering (dbt)
- Data migrations
- Greenfield data platform builds

## Tech Stack

- Pure HTML5, CSS3, JavaScript (no frameworks)
- Inter font (Google Fonts)
- Modern CSS with custom properties, gradients, glassmorphism
- Responsive design with mobile-first approach
- Intersection Observer for scroll animations

## Local Development

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx serve

# Using VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

Then open `http://localhost:8000`

## Deployment to Vercel

### Quick Deploy

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import the repository
4. Deploy (auto-detected as static site)

### Custom Domain Setup

1. Purchase domain (Namecheap, Porkbun, Cloudflare, etc.)
2. In Vercel project settings → Domains → Add
3. Follow DNS configuration instructions
4. SSL is automatic

### CI/CD

Vercel provides automatic CI/CD:
- **Production**: Auto-deploys on push to `main`
- **Preview**: Auto-deploys on PR creation
- No GitHub Actions needed for basic deployment

## Project Structure

```
website/
├── index.html          # Homepage
├── about.html          # About page
├── services.html       # Services page
├── contact.html        # Contact page
├── vercel.json         # Vercel configuration
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
