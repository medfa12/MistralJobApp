# Mistral AI Chat Application

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black) ![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Prisma_5.7.1-green)

Production-ready chat application with Mistral AI's function calling and interactive artifacts system. Generate React, HTML, Vue, and JavaScript components that render live in-panel.

## Key Features

- **Interactive Artifacts** - Generate live code components (React, HTML, Vue, JS) via Mistral function calling
- **Multi-Modal Chat** - Images & PDF support with real-time streaming
- **Full Auth System** - NextAuth with user management
- **Stripe Integration** - Complete subscription management with webhooks
- **Admin Dashboard** - User management and usage analytics
- **Version Control** - Artifact history with edit/revert
- **Dark/Light Mode** - Theme toggle with Mistral branding

## Tech Stack

- Next.js 15.5.4 (App Router) + TypeScript
- MongoDB + Prisma ORM
- Chakra UI + Tailwind CSS
- NextAuth.js + Stripe
- CodeMirror + Cloudinary

## Quick Start

```bash
# Clone and install
git clone https://github.com/medfa12/MistralJobApp
cd mistral
npm install

# Setup database
npx prisma generate
npx prisma db push

# Configure environment
cp .env.example .env.local
# Add your keys to .env.local

# Run
npm run dev
```

Visit `http://localhost:3000`, register, and add your Mistral API key.

## Environment Variables

```bash
# Required
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
MISTRAL_API_KEY=your-key
DATABASE_URL=mongodb+srv://...

# Optional
USE_FUNCTION_CALLING_ARTIFACTS=true
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Requirements

- Node.js 18+
- MongoDB (Atlas or local)
- Mistral API key from [console.mistral.ai](https://console.mistral.ai/)

Optional: Cloudinary (file uploads), Stripe (subscriptions)

## Usage

**Create Artifacts**: Ask AI to generate interactive components
```
"Create a React counter"
"Build an HTML color picker"
```

**Edit Artifacts**: Modify existing components
```
"Add a reset button"
"Change theme to dark"
```

**Multi-Modal**: Upload images or PDFs and ask questions

## Project Structure

```
├── app/              # Next.js pages (chat, admin, settings)
├── pages/api/        # API routes (auth, chat, stripe, user)
├── src/
│   ├── components/   # React components (artifact, chat, sidebar)
│   ├── hooks/        # Custom hooks
│   ├── utils/        # Utilities (parsers, streaming)
│   └── config/       # Config (models, tools)
├── lib/              # Server utilities (auth, db, stripe)
├── prisma/           # Database schema
└── docs/             # Docusaurus documentation
```

## Deployment

**Vercel** (recommended):
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

**Other platforms**: Netlify, Railway, AWS, Render

## Documentation

Run the docs site:
```bash
cd docs
npm install
npm start
```

## License

MIT

**Built with Mistral AI**

