# Mistral AI Chat Application

![version](https://img.shields.io/badge/version-2.0.0-brightgreen.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)

A comprehensive chat application showcasing Mistral AI's capabilities with an innovative **Interactive Artifacts System**. Built with Next.js, React, TypeScript, and modern web technologies.

---

## 🌟 Overview

This application demonstrates advanced Mistral AI integration featuring real-time streaming chat, multi-modal inputs (images & PDFs), and a groundbreaking **Artifacts System** that generates live, interactive code components directly in the interface.

### 🎯 Key Highlights

- 🚀 **Interactive Artifacts** - Generate React, HTML, Vue, and JavaScript components that render live in a side panel
- 💬 **Advanced Chat Interface** - Real-time streaming with conversation history and context management
- 🖼️ **Multi-Modal Support** - Image and PDF attachments for vision-enabled models
- 🎨 **Code Inspector** - Inspect and extract code from rendered artifacts
- 📊 **Multiple AI Models** - Support for 4 Mistral models with different capabilities
- 🔄 **Version Control** - Artifact versioning with edit history and revert functionality
- 🔐 **Authentication** - Secure user management with NextAuth
- 💾 **Persistent Storage** - MongoDB database for conversations and messages
- 🎨 **Modern UI** - Beautiful interface with Chakra UI and Mistral branding

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
| **Mistral Small** | 128K | 8K | Fast, cost-effective | ✅ | ✅ |
| **Mistral Large** | 128K | 16K | Most capable, advanced reasoning | ✅ | ✅ |
| **Magistral Small** | 128K | 8K | Step-by-step reasoning | ✅ | ❌ |
| **Magistral Medium** | 128K | 12K | Deep reasoning, complex analysis | ✅ | ❌ |

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

### 🎨 UI/UX

- **Mistral Branding** - Official colors and rainbow gradient
- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Dark/Light Mode** - Chakra UI theme support
- **Smooth Animations** - Framer Motion transitions
- **Loading States** - Beautiful artifact generation indicators
- **Error Boundaries** - Graceful error handling for artifacts

---

## 🚧 Current Status & Roadmap

### ✅ Completed Features
- [x] Real-time chat with streaming
- [x] Interactive artifact system (React, HTML, JS, Vue)
- [x] Multi-modal inputs (images & PDFs)
- [x] Conversation history & management
- [x] User authentication & profiles
- [x] Code inspector with element extraction
- [x] Artifact versioning & revert
- [x] Context window tracking
- [x] Model selection with detailed info
- [x] Security validation for artifacts
- [x] Cloudinary file uploads

### 🔨 In Progress / Mock
- [ ] **Stripe Integration** - API endpoints exist but need webhook implementation
- [ ] **Subscription Management** - UI exists but backend needs completion
- [ ] **Admin Panel** - Template management interface (planned)
- [ ] **Usage Analytics** - Usage page exists but needs implementation


### 🎯 Planned Features
- [ ] Artifact collaboration & sharing
- [ ] Export artifacts to CodePen/StackBlitz
- [ ] API rate limiting
- [ ] Enhanced admin dashboard
- [ ] My projects (TBC)


---

## 📋 Requirements

- **Node.js** 18+ LTS
- **MongoDB** database (local or Atlas)
- **Mistral API Key** - Get from [console.mistral.ai](https://console.mistral.ai/)
- **Cloudinary Account** - For file uploads (optional)
- **Modern Browser** - Chrome, Firefox, Safari, or Edge

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
- **Authentication**: NextAuth.js 4.24.5
- **File Storage**: Cloudinary 2.7.0
- **Payments**: Stripe 14.10.0 (partial)

### Code Editor
- **Editor**: CodeMirror (uiw/react-codemirror 4.19.11)
- **Theme**: Tokyo Night
- **Languages**: JavaScript, Python, Rust, HTML, CSS, SQL

### AI Integration
- **API**: Mistral AI Chat Completions
- **Streaming**: EventSource Parser
- **Markdown**: react-markdown 8.0.6
- **Math**: KaTeX 0.16.22

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/medfa12/MistralJobApp
cd mistral-ai-chat-app
```

### 2. Install Dependencies
```bash
npm install
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

# Stripe (Optional - in development)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_STRIPE_API_KEY=pk_test_your_stripe_publishable_key

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
│   └── auth/                 # Authentication pages
├── pages/                    # Pages Router (legacy API routes)
│   └── api/                  # API endpoints
│       ├── auth/             # Authentication APIs
│       ├── chat/             # Chat & conversation APIs
│       ├── stripe/           # Payment APIs (partial)
│       └── user/             # User management APIs
├── src/
│   ├── components/           # React components
│   │   ├── artifact/         # Artifact system components
│   │   ├── auth/             # Auth components
│   │   └── ...               # Various UI components
│   ├── config/               # Configuration files
│   │   └── models.ts         # Mistral model definitions
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   │   ├── artifactParser.ts # Artifact parsing logic
│   │   ├── artifactSystemPrompt.ts # AI system prompts
│   │   └── chatStream.ts     # Streaming utilities
│   └── hooks/                # Custom React hooks
├── lib/                      # Server-side libraries
│   ├── auth.ts               # NextAuth configuration
│   ├── db.ts                 # Prisma client
│   └── stripe.ts             # Stripe client (partial)
├── prisma/
│   └── schema.prisma         # Database schema
└── public/                   # Static assets
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

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Artifacts**:
   - Only 1 artifact active per conversation
   - No artifact persistence in database (memory only)
   - Svelte/Angular not yet supported
   - No artifact sharing or export

2. **Stripe Integration**:
   - Payment endpoints exist but incomplete
   - No webhook handlers for subscription updates
   - Subscription UI needs testing

3. **Performance**:
   - Large conversations may hit token limits
   - No pagination on conversation history
   - File uploads limited to Cloudinary

4. **Admin Panel**:
   - Mentioned in code but not fully implemented
   - No template management yet

### Recommended Improvements
- [ ] Add artifact database persistence
- [ ] Implement artifact sharing/export
- [ ] Complete Stripe webhook integration
- [ ] Add conversation pagination
- [ ] Implement rate limiting
- [ ] Add comprehensive testing
- [ ] Improve error handling
- [ ] Add admin dashboard

---

## 🤝 Contributing

This is a demonstration project showcasing Mistral AI capabilities. Contributions, issues, and feature requests are welcome!

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Mistral AI** - For the powerful AI models and API
- **Chakra UI** - For the beautiful component library
- **CodeMirror** - For the excellent code editor
- **Next.js Team** - For the amazing React framework

---

## 📞 Support

For issues related to:
- **Mistral API**: Visit [docs.mistral.ai](https://docs.mistral.ai)
- **This Application**: Open an issue on GitHub

---

**Built with ❤️ using Mistral AI**
