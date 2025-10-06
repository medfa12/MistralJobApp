# Mistral AI Chat Application

![version](https://img.shields.io/badge/version-2.0.0-brightgreen.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Prisma_5.7.1-green)
![Stripe](https://img.shields.io/badge/Stripe-14.10.0-blueviolet)

A **production-ready**, full-stack chat application showcasing Mistral AI's capabilities with an innovative **Interactive Artifacts System**. Features complete authentication, subscription management, admin dashboard, usage analytics, and comprehensive API endpoints. Built with Next.js, React, TypeScript, MongoDB, and modern web technologies.

---

## 🌟 Overview

A **production-ready** chat application showcasing advanced Mistral AI integration with real-time streaming, multi-modal inputs (images & PDFs), and an innovative **Artifacts System** that generates live, interactive code components directly in the interface. This is a comprehensive platform with full authentication, subscription management, admin dashboard, and usage analytics.

### 🎯 Key Highlights

- 🚀 **Interactive Artifacts** - Generate React, HTML, Vue, and JavaScript components that render live in a side panel
- 💬 **Advanced Chat Interface** - Real-time streaming with conversation history and context management
- 🖼️ **Multi-Modal Support** - Image and PDF attachments for vision-enabled models
- 🎨 **Code Inspector** - Inspect and extract code from rendered artifacts
- 📊 **Multiple AI Models** - Support for 4 Mistral models with different capabilities
- 🔄 **Version Control** - Artifact versioning with edit history and revert functionality
- 🔐 **Authentication** - Secure user management with NextAuth
- 💾 **Persistent Storage** - MongoDB database for conversations and messages
- 💳 **Stripe Integration** - Complete subscription management with webhooks
- 🎨 **Modern UI** - Beautiful interface with Chakra UI and Mistral branding
- 👨‍💼 **Admin Dashboard** - Comprehensive user and usage management
- 📊 **Usage Analytics** - Detailed token tracking and visualization
- 🌓 **Theme Toggle** - Seamless dark/light mode switching

---

## ✨ Features

### 🎨 Artifact System (NEW!)

The flagship feature that sets this application apart:

#### Supported Artifact Types
- **React/JSX** - Interactive React components with hooks and inline styling
- **HTML/CSS** - Complete HTML pages with modern CSS
- **JavaScript** - Vanilla JS with DOM manipulation
- **Vue 3** - Vue components using Composition or Options API

#### Artifact Operations
- **Create** - Generate new interactive components
- **Edit** - Modify existing artifacts with full context awareness
- **Delete** - Remove artifacts when no longer needed
- **Revert** - Roll back to previous versions (version control system)

#### Advanced Capabilities
- **Live Preview** - Real-time rendering in secure sandboxed iframe
- **Code Inspection** - Click any element to inspect its code and styles
- **Element Extraction** - Extract code snippets to refine specific elements
- **Version History** - Track all changes with timestamps
- **Syntax Highlighting** - Beautiful code display with Tokyo Night theme
- **Code Export** - Copy artifact code with one click

### 💬 Chat Features

- **Real-time Streaming** - SSE-based streaming for instant responses
- **Conversation Management** - Save, load, and manage multiple conversations
- **Context Window Tracking** - Visual indicator of token usage per model
- **Multi-Modal Inputs**:
  - 📷 Images (PNG, JPEG, WEBP, GIF) - up to 8 images per message
  - 📄 PDFs - up to 50MB, 1,000 pages
- **Model Selection** - Choose from 4 Mistral models with hover cards showing specs
- **Smart Context** - Artifacts automatically included in conversation context
- **Markdown Rendering** - Full markdown support with math (KaTeX)
- **Code Snippets** - Syntax-highlighted code blocks for 10+ languages

### 🤖 Supported AI Models

| Model | Context Window | Output Tokens | Features | Vision | Documents |
|-------|---------------|---------------|----------|--------|-----------|
| **Mistral Small** (2506) | 128K | 8K | Fast, cost-effective | ✅ | ✅ |
| **Mistral Medium** (2508) | 128K | 16K | Most capable, advanced reasoning | ✅ | ✅ |
| **Magistral Small** (2509) | 128K | 8K | Step-by-step reasoning | ✅ | ❌ |
| **Magistral Medium** (2509) | 128K | 12K | Deep reasoning, complex analysis | ✅ | ❌ |

### 🔐 User Management

- **Authentication** - NextAuth with JWT sessions
- **User Registration** - Email/password with bcrypt hashing
- **Profile Management** - Update name, avatar, bio, job title
- **Password Reset** - Secure password change functionality
- **Account Deletion** - Full account removal with cascade deletion

### 💾 Data Persistence

- **MongoDB Database** - NoSQL database via Prisma ORM
- **Conversation History** - All chats saved with model information
- **Message Attachments** - Files stored on Cloudinary CDN
- **User Profiles** - Complete user data with settings

### 💳 Stripe Subscription Management

Complete payment and subscription system:

- **Checkout Integration** - Stripe Checkout for secure payments
- **Subscription Plans** - Multiple tiers with monthly/yearly billing
- **Webhook Events** - Real-time subscription status updates
- **Customer Portal** - Stripe-hosted billing management
- **Cancel/Reactivate** - Full subscription lifecycle management
- **Payment Status** - Track payment success/failure
- **Database Sync** - Automatic user subscription updates
- **API Endpoints** - RESTful APIs for all subscription operations

### 🎨 UI/UX

- **Mistral Branding** - Official colors and rainbow gradient
- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Dark/Light Mode** - Theme toggle in sidebar menu
- **Smooth Animations** - Framer Motion transitions
- **Loading States** - Beautiful artifact generation indicators with skeleton screens
- **Error Boundaries** - Graceful error handling for artifacts
- **Custom Scrollbars** - Styled scrollbars across the application
- **Toast Notifications** - Chakra UI toasts for user feedback

### 👨‍💼 Admin Features

- **Admin Dashboard** - Comprehensive overview with statistics
- **User Management** - View all users with conversation and usage metrics
- **Usage Analytics** - System-wide API usage and token consumption
- **Role-Based Access** - Admin-only routes and features
- **Real-time Stats** - Current user count, active subscriptions, total conversations
- **User Insights** - Per-user API calls, conversation history, and subscription status

### 🔌 API Features

Comprehensive RESTful API endpoints for all functionality:

**Chat APIs** (`/api/chat/`)
- Create and manage conversations
- Send messages with streaming support
- Delete conversations
- Retrieve conversation history

**User APIs** (`/api/user/`)
- Profile management (update name, bio, job, avatar)
- Password management
- Account deletion
- User data retrieval

**Stripe APIs** (`/api/stripe/`)
- Create checkout sessions
- Manage subscriptions (cancel, reactivate)
- Customer portal access
- Webhook handling for real-time updates
- Subscription status checking

**Admin APIs** (`/api/admin/`) - Role-based access
- User management
- System statistics
- Usage analytics

**Usage APIs** (`/api/usage/`)
- Token usage tracking
- Usage statistics by period
- Model-specific usage data

### 📚 Documentation Site

This project includes a comprehensive **Docusaurus documentation site** in the `/docs` directory:

- **Getting Started Guides** - Complete setup and onboarding documentation
- **Capabilities** - Detailed feature explanations
- **Agents Guide** - Information about AI agent capabilities
- **Deployment Guides** - Instructions for various deployment platforms
- **Cookbooks** - Practical examples and tutorials
- **API Reference** - OpenAPI specification included
- **Blog** - Latest updates and announcements

To run the documentation site locally:
```bash
cd docs
npm install
npm start
```

---

## 🚧 Current Status & Roadmap

### ✅ Completed Features

**Core Chat System**
- [x] Real-time chat with SSE streaming
- [x] Multi-modal inputs (images & PDFs)
- [x] Conversation history & management
- [x] Context window tracking per model
- [x] Model selection with detailed info cards
- [x] Markdown rendering with math support

**Artifact System**
- [x] Interactive artifacts (React, HTML, JS, Vue)
- [x] Code inspector with element extraction
- [x] Artifact versioning & revert
- [x] Security validation & sandboxing
- [x] Live preview with error boundaries
- [x] Syntax highlighting (Tokyo Night theme)

**Authentication & Users**
- [x] User authentication with NextAuth
- [x] User registration & login
- [x] Profile management (avatar, bio, job)
- [x] Password change functionality
- [x] Account deletion with cascade

**Payments & Subscriptions**
- [x] Stripe checkout integration
- [x] Webhook event handling (6+ event types)
- [x] Subscription management (cancel, reactivate)
- [x] Customer portal access
- [x] Payment status tracking
- [x] Database synchronization

**Admin & Analytics**
- [x] Admin dashboard with statistics
- [x] User management interface
- [x] Usage analytics with charts
- [x] Role-based access control
- [x] System-wide metrics
- [x] Per-user insights

**Infrastructure**
- [x] MongoDB with Prisma ORM
- [x] Cloudinary file uploads
- [x] API key management
- [x] Dark/light mode toggle
- [x] Responsive design
- [x] Docusaurus documentation site

### 🎯 Planned Features
- [ ] Artifact collaboration & sharing between users
- [ ] Export artifacts to CodePen/StackBlitz/JSFiddle
- [x] API rate limiting per user/plan ✅ (Implemented Oct 2025)
- [x] Artifact persistence in database ✅ (Implemented Oct 2025)
- [x] Conversation pagination ✅ (Implemented Oct 2025)
- [ ] Real-time collaboration
- [ ] My Projects functionality (page exists, needs artifact gallery)
- [ ] Email notifications
- [ ] Advanced admin analytics


---

## 📋 Requirements

### Required
- **Node.js** 18+ LTS
- **MongoDB** database (local or MongoDB Atlas)
- **Mistral API Key** - Get from [console.mistral.ai](https://console.mistral.ai/)

### Optional (for full functionality)
- **Cloudinary Account** - For file uploads (images, PDFs)
- **Stripe Account** - For subscription management
- **Modern Browser** - Chrome, Firefox, Safari, or Edge (latest version)

### Development Tools
- npm or yarn package manager
- Git for version control
- Code editor (VS Code recommended)

---

## 🛠️ Technology Stack

### Core
- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript 4.9.5
- **React**: 18.2.0 with Hooks

### UI/Styling
- **UI Library**: Chakra UI 2.8.2
- **Styling**: Tailwind CSS 3.4.0
- **Animations**: Framer Motion 4.1.17
- **Icons**: React Icons 4.9.0

### Backend
- **Database**: MongoDB via Prisma 5.7.1
- **Authentication**: NextAuth.js 4.24.5 with JWT
- **File Storage**: Cloudinary 2.7.0
- **Payments**: Stripe 14.10.0 (fully integrated)
- **Form Parsing**: Formidable 3.5.4 for multipart uploads

### Code Editor
- **Editor**: CodeMirror (uiw/react-codemirror 4.19.11)
- **Theme**: Tokyo Night
- **Languages**: JavaScript, Python, Rust, HTML, CSS, SQL

### AI Integration
- **API**: Mistral AI Chat Completions
- **Streaming**: EventSource Parser
- **Markdown**: react-markdown 8.0.6 with remark-gfm
- **Math**: KaTeX 0.16.22 with rehype-katex

### Documentation
- **Site Generator**: Docusaurus (in `/docs`)
- **API Spec**: OpenAPI YAML specification
- **Blog**: MDX support for rich content
- **Code Highlighting**: Prism with multiple language support

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/medfa12/MistralJobApp
cd mistral
```

### 2. Install Dependencies

Main application:
```bash
npm install
```

Documentation site (optional):
```bash
cd docs
npm install
cd ..
```

### 3. Environment Variables

Create a `.env.local` file:

```bash
# Application
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Mistral AI
MISTRAL_API_KEY=your-mistral-api-key

# Database (MongoDB)
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/mistral-chat

# Cloudinary (Optional - for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe (for subscription management)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Database

Initialize Prisma and create the database schema:

```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create an Account

1. Navigate to `/auth/register`
2. Create your account
3. Sign in at `/auth/login`

### 7. Get Your Mistral API Key

Users can provide their own API key:
1. Go to [console.mistral.ai](https://console.mistral.ai/)
2. Generate an API key
3. Enter it in the chat interface (stored in localStorage)

### 8. Configure Stripe (Optional)

For subscription management features:

1. **Create Stripe Account**
   - Sign up at [stripe.com](https://stripe.com)
   - Get your API keys from the Dashboard

2. **Create Products**
   - Go to Stripe Dashboard > Products
   - Create subscription products with prices
   - Note the product and price IDs

3. **Set Up Webhooks**
   - Go to Developers > Webhooks in Stripe Dashboard
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select these events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the webhook signing secret

4. **Test Locally**
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe
   
   # Forward webhooks to local endpoint
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

For detailed Stripe integration documentation, see [STRIPE_INTEGRATION.md](./STRIPE_INTEGRATION.md)

---

## 📖 Usage Guide

### Basic Chat
1. Type your message in the input box
2. Press Enter or click Submit
3. Responses stream in real-time

### Using Artifacts
Ask the AI to create interactive components:

```
"Create a React counter with increment and decrement buttons"
"Build an HTML color picker"
"Make a Vue todo list"
```

The artifact will render in the side panel with:
- **Code View** - Syntax-highlighted source code
- **Preview View** - Live rendered component
- **Inspector Mode** - Click elements to inspect

### Editing Artifacts
Once an artifact exists, you can modify it:

```
"Add a reset button"
"Change the color to blue"
"Make it responsive"
```

The AI will update the artifact while preserving existing functionality.

### Multi-Modal Chat
1. Click the attachment icon
2. Upload images (for vision models) or PDFs
3. Ask questions about the uploaded files

### Managing Conversations
- **New Chat** - Click "New Conversation" in sidebar
- **Load Chat** - Click any conversation in history
- **Delete Chat** - Right-click and delete (if implemented)

---

## 🏗️ Project Structure

```
mistral/
├── app/                      # Next.js App Router pages
│   ├── chat/                 # Main chat interface
│   ├── history/              # Conversation history
│   ├── settings/             # User settings
│   ├── usage/                # Usage analytics page
│   ├── my-plan/              # Subscription management
│   ├── admin/                # Admin dashboard (role-based)
│   │   └── overview/         # Admin statistics and user management
│   ├── checkout/             # Stripe checkout pages
│   ├── auth/                 # Authentication pages
│   │   └── register/         # User registration
│   └── layout.tsx            # Root layout with sidebar
├── pages/                    # Pages Router (API routes)
│   ├── api/                  # API endpoints
│   │   ├── auth/             # Authentication APIs
│   │   ├── chat/             # Chat & conversation APIs
│   │   ├── stripe/           # Payment & subscription APIs (complete)
│   │   │   ├── webhook.ts    # Stripe webhook handler
│   │   │   ├── subscribe.ts  # Create subscription
│   │   │   └── ...           # Cancel, reactivate, portal, etc.
│   │   ├── admin/            # Admin APIs
│   │   ├── usage/            # Usage tracking APIs
│   │   └── user/             # User management APIs
│   ├── auth/
│   │   └── login.tsx         # Login page
│   └── landing/              # Landing page
├── src/
│   ├── components/           # React components
│   │   ├── artifact/         # Artifact system components
│   │   ├── auth/             # Auth components
│   │   ├── chat/             # Chat interface components
│   │   ├── sidebar/          # Sidebar navigation
│   │   ├── settings/         # Settings components
│   │   ├── stripe/           # Payment UI components
│   │   ├── charts/           # Usage charts
│   │   └── ...               # Various UI components
│   ├── config/               # Configuration files
│   │   └── models.ts         # Mistral model definitions
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   │   ├── artifactParser.ts # Artifact parsing logic
│   │   ├── artifactSystemPrompt.ts # AI system prompts
│   │   ├── chatStream.ts     # Streaming utilities
│   │   └── ...               # Various helpers
│   ├── hooks/                # Custom React hooks
│   │   ├── useChatAPI.ts     # Chat API hook
│   │   ├── useSubscription.ts # Subscription hook
│   │   └── ...               # Various hooks
│   ├── features/             # Feature modules
│   │   └── stripe/           # Stripe feature components
│   └── theme/                # Chakra UI theme
├── lib/                      # Server-side libraries
│   ├── auth.ts               # NextAuth configuration
│   ├── db.ts                 # Prisma client
│   ├── stripe.ts             # Stripe client
│   ├── stripe-utils.ts       # Stripe helper functions
│   └── admin.ts              # Admin utilities
├── docs/                     # Docusaurus documentation site
│   ├── docs/                 # Documentation pages
│   ├── blog/                 # Blog posts
│   ├── src/                  # Custom React components
│   ├── docusaurus.config.js  # Docusaurus configuration
│   └── openapi.yaml          # API specification
├── prisma/
│   └── schema.prisma         # Database schema (MongoDB)
├── public/                   # Static assets
│   ├── img/                  # Images and logos
│   └── fonts/                # Custom fonts
└── middleware.ts             # Next.js middleware
```

---

## 🔒 Security

### Artifact Sandboxing
- Artifacts run in sandboxed iframes with strict CSP
- Code validation prevents dangerous patterns (eval, XSS, etc.)
- No external script execution allowed
- Limited API access (no file system, no network for some types)

### Authentication
- Passwords hashed with bcrypt (10 rounds)
- JWT sessions with secure cookies
- CSRF protection via NextAuth
- Email/password validation

### API Security
- API keys stored client-side only (localStorage)
- Server validates all inputs
- Rate limiting recommended for production
- Database queries use Prisma (SQL injection protected)

### Stripe Security
- Webhook signature verification
- Secure payment processing via Stripe Checkout
- No card details stored in database
- PCI compliance through Stripe

---

## 💾 Database Schema

The application uses **MongoDB** with **Prisma ORM**. Key models include:

### User Model
- Basic info: email, password (hashed), name, avatar
- Profile: bio, job title, role (admin/member)
- Stripe fields: customerId, subscriptionId, priceId, periodEnd
- Relations: conversations, usage logs

### ChatConversation Model
- Linked to user
- Stores: title, model used, timestamps
- Relations: messages array

### ChatMessage Model
- Linked to conversation
- Content: role, message text
- Special fields: artifact JSON, tool calls, inspected code
- Relations: file attachments

### MessageAttachment Model
- File metadata: name, size, MIME type
- Cloudinary: publicId, URL
- Linked to specific message

### UsageLog Model
- Token tracking: input, output, total
- Model and request type
- Timestamps for analytics
- Linked to user and optional conversation

All models include proper cascade deletion and indexing for performance.

---

## ⚡ Performance Considerations

### Optimization Features
- **Code Splitting** - Next.js automatic code splitting
- **Image Optimization** - Next.js Image component with Cloudinary
- **Server-Side Rendering** - SSR for faster initial page loads
- **API Route Optimization** - Efficient database queries with Prisma
- **Streaming Responses** - SSE for real-time AI responses without blocking

### Best Practices
- Use pagination for large conversation lists
- Implement API rate limiting for production
- Cache frequently accessed data
- Monitor database query performance
- Optimize images before uploading to Cloudinary

### Scaling Recommendations
- Use MongoDB Atlas auto-scaling
- Configure Vercel edge functions for global distribution
- Implement Redis caching for sessions (optional)
- Use CDN for static assets
- Monitor with application performance monitoring (APM) tools

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Import your repository in Vercel
   - Add environment variables
   - Deploy!

3. **Set up Stripe Webhooks**
   - Update webhook endpoint to your production URL
   - Add webhook secret to environment variables

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- **Netlify** - Use Next.js on Netlify plugin
- **Railway** - Direct deployment from GitHub
- **AWS** - Using Amplify or EC2
- **DigitalOcean** - App Platform
- **Render** - Native Next.js support

### Environment Variables for Production

Make sure to set these in your deployment platform:
- `DATABASE_URL` - MongoDB Atlas connection string
- `NEXTAUTH_URL` - Your production domain
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `MISTRAL_API_KEY` - Your Mistral API key (optional for server-side calls)
- `STRIPE_SECRET_KEY` - Production Stripe key
- `STRIPE_WEBHOOK_SECRET` - Production webhook secret
- `CLOUDINARY_*` - Cloudinary credentials

### Post-Deployment

1. Test all features in production
2. Set up monitoring (optional)
3. Configure custom domain (optional)
4. Set up backups for MongoDB
5. Monitor Stripe dashboard for payments

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Artifacts**:
   - Only 1 artifact active per conversation
   - ~~No artifact persistence in database~~ ✅ **FIXED - Oct 2025**
   - Svelte/Angular not yet supported
   - No artifact sharing or export to external platforms

2. **Performance**:
   - Large conversations may hit token limits
   - ~~No pagination on conversation history~~ ✅ **FIXED - Oct 2025**
   - File uploads limited to Cloudinary

3. **Features**:
   - My Projects page exists but functionality TBD (artifact gallery pending)
   - No real-time collaboration between users
   - ~~API rate limiting not implemented~~ ✅ **FIXED - Oct 2025**

### Recommended Improvements
- [x] Add artifact database persistence ✅ **COMPLETED - Oct 2025**
- [x] Add conversation pagination ✅ **COMPLETED - Oct 2025**
- [x] Implement API rate limiting ✅ **COMPLETED - Oct 2025**
- [ ] Add comprehensive testing suite
- [ ] Add real-time collaboration features
- [ ] Implement artifact export to external platforms
- [ ] Add comprehensive error logging
- [ ] Create artifact gallery page (/my-projects)

---

## 🔧 Troubleshooting

### Common Issues

**"Module not found" errors**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Prisma Client errors**
```bash
npx prisma generate
npx prisma db push
```

**Environment variable issues**
- Ensure `.env.local` exists and has all required variables
- Restart the development server after changing environment variables
- Check for typos in variable names

**Stripe webhook not working locally**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Database connection issues**
- Verify MongoDB is running
- Check `DATABASE_URL` format
- Ensure IP whitelist includes your IP (for MongoDB Atlas)

**Authentication issues**
- Clear browser cookies and localStorage
- Regenerate `NEXTAUTH_SECRET`
- Verify `NEXTAUTH_URL` matches your current URL

---

## 🤝 Contributing

This is a production-ready project showcasing Mistral AI capabilities. Contributions, issues, and feature requests are welcome!

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Update README for new features
- Test thoroughly before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## ⚡ Quick Start (TL;DR)

```bash
# 1. Clone and install
git clone https://github.com/medfa12/MistralJobApp
cd mistral
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your keys

# 3. Set up database
npx prisma generate
npx prisma db push

# 4. Run
npm run dev
```

Then visit `http://localhost:3000`, register an account, and add your Mistral API key in the chat interface.

---

## 🙏 Acknowledgments

- **Mistral AI** - For the powerful AI models and API
- **Chakra UI** - For the beautiful component library
- **CodeMirror** - For the excellent code editor
- **Next.js Team** - For the amazing React framework
- **Stripe** - For seamless payment processing
- **Prisma** - For the excellent ORM and database tooling
- **Docusaurus** - For the documentation site generator

---

## 📞 Support

For issues related to:
- **Mistral API**: Visit [docs.mistral.ai](https://docs.mistral.ai)
- **This Application**: Open an issue on GitHub

---

**Built with ❤️ using Mistral AI**

