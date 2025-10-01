# Mistral AI Demo Application

![version](https://img.shields.io/badge/version-1.8.0-brightgreen.svg)

A comprehensive demonstration application showcasing Mistral AI's capabilities through various AI-powered tools and features. Built with Next.js, React, and modern web technologies.

---

### Introduction

This demo application showcases the advanced capabilities of Mistral AI through a comprehensive suite of AI-powered tools and features. Built with React, Next.js, and Chakra UI, it demonstrates modern AI applications in content generation, language processing, and productivity enhancement.

**Key Features:**
- ✨ **Mistral AI Branding** - Complete rebrand with official Mistral colors and logos
- 🎨 **Modern UI/UX** - Clean interface with Mistral's rainbow gradient color scheme
- 🔧 **15+ AI Tools** - Content generation, translation, SEO optimization, and more
- 💬 **Interactive Chat** - Real-time AI conversation interface
- 📱 **Responsive Design** - Works seamlessly across all devices
- 🔐 **Authentication** - Secure user management with NextAuth
- 💳 **Payment Integration** - Stripe-powered subscription system

### Features

#### AI-Powered Tools
- **Content Generation**: Essay, article, and product description writers
- **Language Processing**: Translation, simplification, and grammar enhancement
- **Marketing Tools**: SEO keywords, hashtags, LinkedIn messages, and email enhancement
- **Business Tools**: Name generators, business idea generation, and review responses
- **Creative Tools**: Caption generators, FAQ creation, and plagiarism checking

#### Technical Features
- **Real-time Chat**: Interactive AI conversation interface
- **Authentication**: Secure user management with NextAuth
- **Payment Integration**: Stripe-powered subscription system
- **Responsive Design**: Works seamlessly across all devices
- **Admin Panel**: Template and user management interface

### Requirements

- **Mistral API Key**: Required for AI functionality
- **Node.js LTS**: For development and production
- **Modern Browser**: For best user experience

### Technology Stack

- **Framework**: Next.js 13 with App Router
- **UI Library**: Chakra UI + Tailwind CSS
- **Language**: TypeScript
- **Database**: Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **AI Integration**: Mistral Chat Completions API
- **Local Key Storage**: Keys persisted in browser `localStorage`

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mistral-ai-demo-application
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with (see `.env.example` for complete list):
   ```bash
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   MISTRAL_API_KEY=your-mistral-key

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   NEXT_STRIPE_API_KEY=pk_test_your_stripe_publishable_key

   # Database Configuration
   DATABASE_URL=your-database-connection-string

   # Application Configuration (optional)
   NEXT_PUBLIC_BASE_PATH=
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### License

This project is licensed under the MIT License - see the LICENSE file for details.
