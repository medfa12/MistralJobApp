# Mistral AI Chat Application

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black) ![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Prisma_5.7.1-green)

Production-ready chat application with Mistral AI's function calling, real-time streaming, and interactive artifacts.

## Assignment Coverage

- **Chatbot with LLM**: Next.js + React chat UI talking to Mistral (LLM of choice) with streaming and inline animations.
- **UX**: Clean, mobile-friendly interface, live typing stream, artifact previews, and smooth transitions.
- **Authentication + Database**: NextAuth backed by Prisma/MongoDB; users sign in and own their data.
- **Persistent Messages**: Conversations and messages (plus attachments and artifacts) are stored in the database via `pages/api/chat/conversations.ts` and `pages/api/chat/messages.ts`.
- **Token Metrics Bonus**: Live tokens-per-second, token count, and elapsed time stream from the backend and display beside messages; this comes from server-side token counting during the Mistral stream.
- **Metric Caveat**: Tokens/s varies by tokenizer/model, ignores time-to-first-token and network variance, and doesn’t fully represent perceived UX.

## Key Features

- Interactive artifacts (React, HTML, Vue, JS) via function calling
- Multi-modal chat: images/PDFs with real-time streaming
- Authenticated chat with stored history and attachments
- Versioned artifacts with edit/revert
- Dark/Light mode with Mistral branding

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

- Vercel: import repo, add env vars, deploy.

## License

MIT

**Built with Mistral AI**
