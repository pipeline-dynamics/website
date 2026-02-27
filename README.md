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

## Contact Form Email Setup

The contact form uses a Supabase Edge Function to send emails via Resend.

### Prerequisites

1. **Supabase Account** - Free tier works fine
2. **Resend Account** - Free tier includes 3,000 emails/month

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project reference (found in Project Settings → General)
3. The Edge Function URL will be: `https://<project-ref>.supabase.co/functions/v1/send-contact-email`

### Step 2: Get a Resend API Key

1. Go to [resend.com](https://resend.com) and create an account
2. Navigate to API Keys and create a new key
3. Copy the key (starts with `re_`)

### Step 3: Configure Environment Variables

In Supabase Dashboard → Edge Functions → Settings → Environment Variables:

```
RESEND_API_KEY=re_your_api_key_here
CONTACT_TO_EMAIL=your-email@example.com
```

### Step 4: Deploy the Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (use your project reference)
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-contact-email
```

### Step 5: Update the Form Endpoint

The Edge Function URL is hardcoded in `js/main.js`. Update it with your project reference:

```javascript
const endpoint = 'https://your-project-ref.supabase.co/functions/v1/send-contact-email';
```

Or use a data attribute on the form in `contact.html`:

```html
<form id="contact-form" data-endpoint="https://your-project-ref.supabase.co/functions/v1/send-contact-email">
```

### Testing the Edge Function

```bash
# Run tests locally (requires Supabase CLI)
cd supabase/functions/send-contact-email
deno test index.test.ts

# Run integration tests (requires RESEND_API_KEY in environment)
RESEND_API_KEY=re_your_key deno test index.test.ts

# Skip integration tests
SKIP_INTEGRATION_TESTS=1 deno test index.test.ts
```

### Email Configuration

The Edge Function is configured to:
- **From**: `contact@pipelinedynamics.com` (configure in Resend)
- **To**: `info@pipelinedynamics.com`
- **Reply-To**: The submitter's email

**Important**: Verify your sending domain in Resend before going live.

### Troubleshooting

- **500 Server Error**: Check `RESEND_API_KEY` is set in Supabase
- **502 Bad Gateway**: Resend API may be unreachable or domain not verified
- **CORS Errors**: The function includes CORS headers for all origins

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
